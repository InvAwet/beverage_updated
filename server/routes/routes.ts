import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { insertOrderSchema, insertOrderItemSchema, insertVatReceiptSchema, insertStockistInventorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // API Routes
  // Get beverages
  app.get("/api/beverages", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string || 'all';
      const beverages = await storage.getBeveragesByCategory(category);
      res.json(beverages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beverages" });
    }
  });

  // Get specific beverage
  app.get("/api/beverages/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const beverage = await storage.getBeverage(id);
      
      if (!beverage) {
        return res.status(404).json({ message: "Beverage not found" });
      }
      
      res.json(beverage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beverage" });
    }
  });

  // Get stockist inventory
  app.get("/api/stockists/:id/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const stockistId = parseInt(req.params.id);
      const inventory = await storage.getStockistInventory(stockistId);
      
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Update stockist inventory
  app.post("/api/stockists/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || req.user?.userType !== 'stockist') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertStockistInventorySchema.parse(req.body);
      const updatedInventory = await storage.updateStockistInventory(validatedData);
      
      res.json(updatedInventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  // Create order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Generate order number
      const orderNumber = `ET${nanoid(6).toUpperCase()}`;
      
      // Validate order data
      const orderData = { ...req.body, orderNumber, customerId: req.user!.id, status: 'placed' };
      const validatedOrderData = insertOrderSchema.parse(orderData);
      
      // Create order
      const order = await storage.createOrder(validatedOrderData);
      
      // Create order items
      const orderItems = req.body.items;
      for (const item of orderItems) {
        const orderItemData = {
          ...item,
          orderId: order.id
        };
        const validatedItemData = insertOrderItemSchema.parse(orderItemData);
        await storage.createOrderItem(validatedItemData);
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get customer orders
  app.get("/api/orders/customer", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const orders = await storage.getCustomerOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get stockist orders
  app.get("/api/orders/stockist", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || req.user?.userType !== 'stockist') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const orders = await storage.getStockistOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify that the user is associated with this order
      if (req.user!.id !== order.customerId && req.user!.id !== order.stockistId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const orderId = parseInt(req.params.id);
      const { status, stockistId } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify permissions based on status change
      const isCustomer = req.user!.id === order.customerId;
      const isStockist = req.user!.id === order.stockistId;
      
      if (!isCustomer && !isStockist && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status, stockistId);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Create VAT receipt
  app.post("/api/receipts", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Generate receipt number
      const receiptNumber = `VAT-${nanoid(8).toUpperCase()}`;
      
      // Validate receipt data
      const receiptData = { ...req.body, receiptNumber };
      const validatedData = insertVatReceiptSchema.parse(receiptData);
      
      // Create receipt
      const receipt = await storage.createVatReceipt(validatedData);
      
      // Update order status to completed
      await storage.updateOrderStatus(receipt.orderId, 'completed');
      
      res.status(201).json(receipt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid receipt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create receipt" });
    }
  });

  // Get VAT receipt for an order
  app.get("/api/receipts/order/:orderId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const orderId = parseInt(req.params.orderId);
      const receipt = await storage.getVatReceipt(orderId);
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify permissions
      if (req.user!.id !== order.customerId && req.user!.id !== order.stockistId && req.user?.userType !== 'vansales' && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  // Get nearby stockists
  app.get("/api/stockists/nearby", async (req: Request, res: Response) => {
    try {
      // Get stockists (in real app, would filter by location)
      const stockists = await storage.getUsersByType('stockist');
      
      // Return simplified stockist data
      const simplifiedStockists = stockists.map(stockist => ({
        id: stockist.id,
        name: stockist.name,
        businessName: stockist.businessName,
        isVatRegistered: stockist.isVatRegistered,
        address: stockist.address,
        distance: Math.random() * 2, // Mock distance in km
        rating: (3.5 + Math.random() * 1.5).toFixed(1), // Mock rating between 3.5-5.0
        deliveryFee: Math.floor(40 + Math.random() * 60), // Mock fee between 40-100 ETB
        estimatedTime: `${Math.floor(15 + Math.random() * 25)}-${Math.floor(30 + Math.random() * 15)} min`, // Mock time
      }));
      
      res.json(simplifiedStockists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby stockists" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
