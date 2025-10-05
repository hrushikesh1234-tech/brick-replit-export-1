import { Express } from "express";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertProfileSchema,
  insertSellerSchema,
  insertUserAddressSchema 
} from "@shared/schema";

export function registerRoutes(app: Express) {
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, phone, name, role } = req.body;
      
      const userId = crypto.randomUUID();
      const profile = await storage.createProfile({
        id: userId,
        phone,
        name,
        email,
        role: role || "customer",
      });

      req.session.userId = profile.id;
      req.session.role = profile.role;
      
      res.json({ user: profile });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const profile = await storage.getProfileById(email);
      
      if (!profile) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = profile.id;
      req.session.role = profile.role;
      
      res.json({ user: profile });
    } catch (error: any) {
      console.error("Signin error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to sign out" });
      }
      res.json({ message: "Signed out successfully" });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    try {
      const profile = await storage.getProfileById(req.session.userId);
      res.json({ user: profile });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getActiveProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/by-ids", async (req, res) => {
    try {
      const { ids } = req.body;
      const products = await storage.getProductsByIds(ids);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/seller/:sellerId", async (req, res) => {
    try {
      const products = await storage.getProductsBySellerId(req.params.sellerId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      await storage.updateProduct(req.params.id, req.body);
      res.json({ message: "Product updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders/customer/:customerId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomerId(req.params.customerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/seller/:sellerId", async (req, res) => {
    try {
      const orders = await storage.getOrdersBySellerId(req.params.sellerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders/by-status", async (req, res) => {
    try {
      const { statuses } = req.body;
      const orders = await storage.getOrdersByStatus(statuses);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validated);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      await storage.updateOrder(req.params.id, req.body);
      res.json({ message: "Order updated" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/sellers/user/:userId", async (req, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.params.userId);
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sellers", async (req, res) => {
    try {
      const validated = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(validated);
      res.json(seller);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/order-history/:orderId", async (req, res) => {
    try {
      const history = await storage.getOrderHistory(req.params.orderId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
