import { db } from "./db";
import { 
  profiles, 
  userAddresses, 
  sellers, 
  sellerPincodes, 
  products, 
  orders, 
  orderStateHistory, 
  payments,
  InsertProfile,
  InsertUserAddress,
  InsertSeller,
  InsertSellerPincode,
  InsertProduct,
  InsertOrder,
  InsertOrderStateHistory,
  InsertPayment,
  Profile,
  UserAddress,
  Seller,
  SellerPincode,
  Product,
  Order,
  OrderStateHistory,
  Payment
} from "@shared/schema";
import { eq, inArray, and, desc } from "drizzle-orm";

export interface IStorage {
  createProfile(data: InsertProfile): Promise<Profile>;
  getProfileById(id: string): Promise<Profile | null>;
  updateProfile(id: string, data: Partial<InsertProfile>): Promise<void>;
  
  getUserAddresses(userId: string): Promise<UserAddress[]>;
  createUserAddress(data: InsertUserAddress): Promise<UserAddress>;
  updateUserAddress(id: string, data: Partial<InsertUserAddress>): Promise<void>;
  deleteUserAddress(id: string): Promise<void>;
  
  getSellerByUserId(userId: string): Promise<Seller | null>;
  createSeller(data: InsertSeller): Promise<Seller>;
  updateSeller(id: string, data: Partial<InsertSeller>): Promise<void>;
  
  getSellerPincodes(sellerId: string): Promise<SellerPincode[]>;
  createSellerPincode(data: InsertSellerPincode): Promise<SellerPincode>;
  deleteSellerPincode(id: string): Promise<void>;
  
  getActiveProducts(): Promise<Product[]>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getProductsBySellerId(sellerId: string): Promise<Product[]>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<void>;
  
  getOrdersByCustomerId(customerId: string): Promise<Order[]>;
  getOrdersBySellerId(sellerId: string): Promise<Order[]>;
  getOrdersByStatus(statuses: string[]): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<void>;
  
  getOrderHistory(orderId: string): Promise<OrderStateHistory[]>;
  
  getPaymentsByOrderId(orderId: string): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
}

export class MemStorage implements IStorage {
  async createProfile(data: InsertProfile): Promise<Profile> {
    const [result] = await db.insert(profiles).values(data).returning();
    return result;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const [result] = await db.select().from(profiles).where(eq(profiles.id, id));
    return result || null;
  }

  async updateProfile(id: string, data: Partial<InsertProfile>): Promise<void> {
    await db.update(profiles).set(data).where(eq(profiles.id, id));
  }

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return await db.select().from(userAddresses).where(eq(userAddresses.userId, userId));
  }

  async createUserAddress(data: InsertUserAddress): Promise<UserAddress> {
    const [result] = await db.insert(userAddresses).values(data).returning();
    return result;
  }

  async updateUserAddress(id: string, data: Partial<InsertUserAddress>): Promise<void> {
    await db.update(userAddresses).set(data).where(eq(userAddresses.id, id));
  }

  async deleteUserAddress(id: string): Promise<void> {
    await db.delete(userAddresses).where(eq(userAddresses.id, id));
  }

  async getSellerByUserId(userId: string): Promise<Seller | null> {
    const [result] = await db.select().from(sellers).where(eq(sellers.userId, userId));
    return result || null;
  }

  async createSeller(data: InsertSeller): Promise<Seller> {
    const [result] = await db.insert(sellers).values(data).returning();
    return result;
  }

  async updateSeller(id: string, data: Partial<InsertSeller>): Promise<void> {
    await db.update(sellers).set(data).where(eq(sellers.id, id));
  }

  async getSellerPincodes(sellerId: string): Promise<SellerPincode[]> {
    return await db.select().from(sellerPincodes).where(eq(sellerPincodes.sellerId, sellerId));
  }

  async createSellerPincode(data: InsertSellerPincode): Promise<SellerPincode> {
    const [result] = await db.insert(sellerPincodes).values(data).returning();
    return result;
  }

  async deleteSellerPincode(id: string): Promise<void> {
    await db.delete(sellerPincodes).where(eq(sellerPincodes.id, id));
  }

  async getActiveProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return await db.select().from(products).where(inArray(products.id, ids));
  }

  async getProductsBySellerId(sellerId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(data).returning();
    return result;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<void> {
    await db.update(products).set(data).where(eq(products.id, id));
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersBySellerId(sellerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(statuses: string[]): Promise<Order[]> {
    if (statuses.length === 0) return [];
    return await db.select().from(orders)
      .where(inArray(orders.status, statuses))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | null> {
    const [result] = await db.select().from(orders).where(eq(orders.id, id));
    return result || null;
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(data).returning();
    return result;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<void> {
    await db.update(orders).set(data).where(eq(orders.id, id));
  }

  async getOrderHistory(orderId: string): Promise<OrderStateHistory[]> {
    return await db.select().from(orderStateHistory)
      .where(eq(orderStateHistory.orderId, orderId))
      .orderBy(desc(orderStateHistory.createdAt));
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.orderId, orderId));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(data).returning();
    return result;
  }
}

export const storage = new MemStorage();
