import { pgTable, uuid, text, timestamp, integer, boolean, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appRoleEnum = pgEnum("app_role", ["customer", "seller", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "pending_verification",
  "seller_contacted",
  "seller_accepted",
  "seller_rejected",
  "buyer_contacted",
  "buyer_confirmed",
  "buyer_rejected",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "completed",
  "rejected",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "partial_pending",
  "partial_paid",
  "paid",
  "failed",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["online", "cod"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  role: appRoleEnum("role").notNull().default("customer"),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userAddresses = pgTable("user_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sellers = pgTable("sellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => profiles.id, { onDelete: "cascade" }),
  shopName: text("shop_name").notNull(),
  status: text("status").notNull().default("active"),
  deliveryRadiusKm: integer("delivery_radius_km").default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sellerPincodes = pgTable("seller_pincodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
  pinCode: text("pin_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("piece"),
  stock: integer("stock").notNull().default(0),
  minQty: integer("min_qty").notNull().default(1),
  description: text("description"),
  images: text("images").array().default([]),
  deliveryEstimate: text("delivery_estimate").default("2-3 days"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  sellerId: uuid("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
  items: jsonb("items").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryCharges: decimal("delivery_charges", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  prepaymentAmount: decimal("prepayment_amount", { precision: 10, scale: 2 }),
  status: orderStatusEnum("status").notNull().default("created"),
  deliveryAddress: jsonb("delivery_address").notNull(),
  verifiedByAdminId: uuid("verified_by_admin_id").references(() => profiles.id),
  sellerResponse: text("seller_response"),
  buyerResponse: text("buyer_response"),
  rejectReason: text("reject_reason"),
  contactAttempts: integer("contact_attempts").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStateHistory = pgTable("order_state_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  changedBy: uuid("changed_by").references(() => profiles.id),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  providerId: text("provider_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAddressSchema = createInsertSchema(userAddresses).omit({ id: true, createdAt: true });
export const insertSellerSchema = createInsertSchema(sellers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSellerPincodeSchema = createInsertSchema(sellerPincodes).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderStateHistorySchema = createInsertSchema(orderStateHistory).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type InsertSellerPincode = z.infer<typeof insertSellerPincodeSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderStateHistory = z.infer<typeof insertOrderStateHistorySchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Profile = typeof profiles.$inferSelect;
export type UserAddress = typeof userAddresses.$inferSelect;
export type Seller = typeof sellers.$inferSelect;
export type SellerPincode = typeof sellerPincodes.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderStateHistory = typeof orderStateHistory.$inferSelect;
export type Payment = typeof payments.$inferSelect;
