import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types: business, stockist, vansales, admin
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  businessName: text("business_name"),
  tin: text("tin"),
  address: text("address"),
  userType: text("user_type").notNull(),
  isVatRegistered: boolean("is_vat_registered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const beverages = pgTable("beverages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  vatIncluded: boolean("vat_included").default(true),
  imageUrl: text("image_url"),
  quantityPerCrate: integer("quantity_per_crate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBeverageSchema = createInsertSchema(beverages).omit({
  id: true,
  createdAt: true,
});

export const stockistInventory = pgTable("stockist_inventory", {
  id: serial("id").primaryKey(),
  stockistId: integer("stockist_id").notNull(),
  beverageId: integer("beverage_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStockistInventorySchema = createInsertSchema(stockistInventory).omit({
  id: true,
  updatedAt: true,
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  stockistId: integer("stockist_id"),
  status: text("status").notNull(), // placed, matched, accepted, delivering, delivered, completed
  deliveryAddress: text("delivery_address").notNull(),
  deliveryFee: doublePrecision("delivery_fee"),
  subtotal: doublePrecision("subtotal").notNull(),
  vatAmount: doublePrecision("vat_amount").notNull(),
  total: doublePrecision("total").notNull(),
  customerTin: text("customer_tin"),
  deliveryTime: text("delivery_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  beverageId: integer("beverage_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const vatReceipts = pgTable("vat_receipts", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  receiptNumber: text("receipt_number").notNull().unique(),
  sellerName: text("seller_name").notNull(),
  sellerTin: text("seller_tin").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerTin: text("buyer_tin").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  vatAmount: doublePrecision("vat_amount").notNull(),
  total: doublePrecision("total").notNull(),
  receiptData: jsonb("receipt_data"),
  issuedAt: timestamp("issued_at").defaultNow(),
});

export const insertVatReceiptSchema = createInsertSchema(vatReceipts).omit({
  id: true,
  issuedAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Beverage = typeof beverages.$inferSelect;
export type InsertBeverage = z.infer<typeof insertBeverageSchema>;

export type StockistInventory = typeof stockistInventory.$inferSelect;
export type InsertStockistInventory = z.infer<typeof insertStockistInventorySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type VatReceipt = typeof vatReceipts.$inferSelect;
export type InsertVatReceipt = z.infer<typeof insertVatReceiptSchema>;
