import { users, User, InsertUser, beverages, Beverage, InsertBeverage, stockistInventory, StockistInventory, InsertStockistInventory, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, vatReceipts, VatReceipt, InsertVatReceipt } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByType(type: string): Promise<User[]>;
  
  // Beverage operations
  getBeverage(id: number): Promise<Beverage | undefined>;
  getBeverages(): Promise<Beverage[]>;
  getBeveragesByCategory(category: string): Promise<Beverage[]>;
  createBeverage(beverage: InsertBeverage): Promise<Beverage>;
  
  // Inventory operations
  getStockistInventory(stockistId: number): Promise<(StockistInventory & { beverage: Beverage })[]>;
  getStockistInventoryItem(stockistId: number, beverageId: number): Promise<StockistInventory | undefined>;
  updateStockistInventory(item: InsertStockistInventory): Promise<StockistInventory>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getCustomerOrders(customerId: number): Promise<Order[]>;
  getStockistOrders(stockistId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: number, status: string, stockistId?: number): Promise<Order>;
  
  // Order Items operations
  getOrderItems(orderId: number): Promise<(OrderItem & { beverage: Beverage })[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // VAT Receipt operations
  getVatReceipt(orderId: number): Promise<VatReceipt | undefined>;
  createVatReceipt(receipt: InsertVatReceipt): Promise<VatReceipt>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Memory Storage Implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private beverages: Map<number, Beverage>;
  private stockistInventory: Map<number, StockistInventory>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private vatReceipts: Map<number, VatReceipt>;
  private currentIds: {
    user: number;
    beverage: number;
    inventory: number;
    order: number;
    orderItem: number;
    vatReceipt: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.beverages = new Map();
    this.stockistInventory = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.vatReceipts = new Map();
    this.currentIds = {
      user: 1,
      beverage: 1,
      inventory: 1,
      order: 1,
      orderItem: 1,
      vatReceipt: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUsersByType(type: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === type,
    );
  }

  // Beverage operations
  async getBeverage(id: number): Promise<Beverage | undefined> {
    return this.beverages.get(id);
  }

  async getBeverages(): Promise<Beverage[]> {
    return Array.from(this.beverages.values());
  }

  async getBeveragesByCategory(category: string): Promise<Beverage[]> {
    if (category === 'all') {
      return this.getBeverages();
    }
    return Array.from(this.beverages.values()).filter(
      (beverage) => beverage.category.toLowerCase() === category.toLowerCase(),
    );
  }

  async createBeverage(insertBeverage: InsertBeverage): Promise<Beverage> {
    const id = this.currentIds.beverage++;
    const beverage: Beverage = { ...insertBeverage, id, createdAt: new Date() };
    this.beverages.set(id, beverage);
    return beverage;
  }

  // Inventory operations
  async getStockistInventory(stockistId: number): Promise<(StockistInventory & { beverage: Beverage })[]> {
    const inventory = Array.from(this.stockistInventory.values()).filter(
      (item) => item.stockistId === stockistId,
    );
    
    return inventory.map(item => {
      const beverage = this.beverages.get(item.beverageId)!;
      return { ...item, beverage };
    });
  }

  async getStockistInventoryItem(stockistId: number, beverageId: number): Promise<StockistInventory | undefined> {
    return Array.from(this.stockistInventory.values()).find(
      (item) => item.stockistId === stockistId && item.beverageId === beverageId,
    );
  }

  async updateStockistInventory(item: InsertStockistInventory): Promise<StockistInventory> {
    const existingItem = await this.getStockistInventoryItem(item.stockistId, item.beverageId);
    
    if (existingItem) {
      const updatedItem: StockistInventory = { 
        ...existingItem, 
        quantity: item.quantity, 
        updatedAt: new Date() 
      };
      this.stockistInventory.set(existingItem.id, updatedItem);
      return updatedItem;
    } else {
      const id = this.currentIds.inventory++;
      const newItem: StockistInventory = { 
        ...item, 
        id, 
        updatedAt: new Date() 
      };
      this.stockistInventory.set(id, newItem);
      return newItem;
    }
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }

  async getCustomerOrders(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getStockistOrders(stockistId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.stockistId === stockistId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentIds.order++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(orderId: number, status: string, stockistId?: number): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const updatedOrder: Order = { 
      ...order, 
      status, 
      updatedAt: new Date(),
      stockistId: stockistId !== undefined ? stockistId : order.stockistId 
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Order Items operations
  async getOrderItems(orderId: number): Promise<(OrderItem & { beverage: Beverage })[]> {
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
    
    return items.map(item => {
      const beverage = this.beverages.get(item.beverageId)!;
      return { ...item, beverage };
    });
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentIds.orderItem++;
    const item: OrderItem = { ...insertItem, id };
    this.orderItems.set(id, item);
    return item;
  }

  // VAT Receipt operations
  async getVatReceipt(orderId: number): Promise<VatReceipt | undefined> {
    return Array.from(this.vatReceipts.values()).find(
      (receipt) => receipt.orderId === orderId,
    );
  }

  async createVatReceipt(insertReceipt: InsertVatReceipt): Promise<VatReceipt> {
    const id = this.currentIds.vatReceipt++;
    const receipt: VatReceipt = { ...insertReceipt, id, issuedAt: new Date() };
    this.vatReceipts.set(id, receipt);
    return receipt;
  }

  // Seed initial data for demonstration
  private async seedData() {
    // Seed beverages
    const beverageData: InsertBeverage[] = [
      { 
        name: 'Heineken Beer', 
        description: '330ml × 24 bottles per crate', 
        category: 'beer', 
        unitPrice: 265, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 24
      },
      { 
        name: 'Coca-Cola Crate', 
        description: '500ml × 24 bottles per crate', 
        category: 'soft-drinks', 
        unitPrice: 350, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1629203432180-71e9b18d855a?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 24
      },
      { 
        name: 'St. George Beer', 
        description: '330ml × 24 bottles per crate', 
        category: 'beer', 
        unitPrice: 240, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 24
      },
      { 
        name: 'Ambo Water', 
        description: '500ml × 20 bottles per crate', 
        category: 'water', 
        unitPrice: 180, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 20
      },
      { 
        name: 'Dashen Beer', 
        description: '330ml × 24 bottles per crate', 
        category: 'beer', 
        unitPrice: 230, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 24
      },
      { 
        name: 'Sprite Crate', 
        description: '500ml × 24 bottles per crate', 
        category: 'soft-drinks', 
        unitPrice: 350, 
        vatIncluded: true, 
        imageUrl: 'https://images.unsplash.com/photo-1553136122-a3bbf3e2c483?q=80&w=200&h=150&auto=format&fit=crop',
        quantityPerCrate: 24
      }
    ];

    for (const beverage of beverageData) {
      await this.createBeverage(beverage);
    }
  }
}

export const storage = new MemStorage();
