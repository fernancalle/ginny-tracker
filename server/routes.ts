import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { fetchBankEmails, parseEmailForTransaction, getUserProfile } from "./gmail";

const DEFAULT_USER_ID = "demo-user";
const DEFAULT_USER_EMAIL = "demo@ginny.app";

async function getOrCreateUser() {
  try {
    const profile = await getUserProfile();
    let user = await storage.getUserByEmail(profile.email!);
    
    if (!user) {
      user = await storage.createUser({
        email: profile.email!,
        name: profile.email!.split('@')[0],
      });
    }
    
    return user;
  } catch (error: any) {
    console.log("Gmail not available, using demo user:", error.message);
    
    let user = await storage.getUserByEmail(DEFAULT_USER_EMAIL);
    if (!user) {
      user = await storage.createUser({
        email: DEFAULT_USER_EMAIL,
        name: "Usuario Demo",
      });
    }
    return user;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/user", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      res.json(user);
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: error.message || "Failed to get user" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      const transactions = await storage.getTransactions(user.id);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ error: error.message || "Failed to get transactions" });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      const profile = await getUserProfile();
      let user = await storage.getUserByEmail(profile.email!);
      
      if (!user) {
        user = await storage.createUser({
          email: profile.email!,
          name: profile.email!.split('@')[0],
        });
      }
      
      const emails = await fetchBankEmails(100);
      let syncedCount = 0;
      
      for (const email of emails) {
        const existing = await storage.getTransactionByEmailId(email.id!);
        if (existing) continue;
        
        const parsed = parseEmailForTransaction(email);
        if (parsed) {
          await storage.createTransaction({
            userId: user.id,
            amount: parsed.amount.toString(),
            type: parsed.type,
            category: parsed.category,
            description: parsed.description,
            bankName: parsed.bankName,
            emailId: parsed.emailId,
            transactionDate: parsed.transactionDate,
          });
          syncedCount++;
        }
      }
      
      await storage.updateEmailSyncStatus(user.id, syncedCount);
      
      res.json({ synced: syncedCount, total: emails.length });
    } catch (error: any) {
      console.error("Error syncing emails:", error);
      res.status(500).json({ error: error.message || "Failed to sync emails. Please reconnect your Gmail account." });
    }
  });

  app.get("/api/stats/monthly", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      
      const stats = await storage.getMonthlyStats(user.id, year, month);
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting monthly stats:", error);
      res.status(500).json({ error: error.message || "Failed to get stats" });
    }
  });

  app.get("/api/stats/categories", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      
      const breakdown = await storage.getCategoryBreakdown(user.id, year, month);
      res.json(breakdown);
    } catch (error: any) {
      console.error("Error getting category breakdown:", error);
      res.status(500).json({ error: error.message || "Failed to get categories" });
    }
  });

  app.get("/api/sync/status", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      const status = await storage.getEmailSyncStatus(user.id);
      res.json(status || { lastSyncAt: null, syncedEmailCount: 0 });
    } catch (error: any) {
      console.error("Error getting sync status:", error);
      res.status(500).json({ error: error.message || "Failed to get sync status" });
    }
  });

  app.post("/api/transactions/demo", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      
      const demoTransactions = [
        { amount: "45000", type: "income", category: "salary", description: "Nómina Quincenal", bankName: "Banreservas", daysAgo: 2 },
        { amount: "1500", type: "expense", category: "food", description: "Supermercado Nacional", bankName: "Banco Popular", daysAgo: 1 },
        { amount: "850", type: "expense", category: "transport", description: "Uber viaje al trabajo", bankName: "BHD León", daysAgo: 1 },
        { amount: "2500", type: "expense", category: "utilities", description: "Pago EDENORTE", bankName: "Banreservas", daysAgo: 3 },
        { amount: "3200", type: "expense", category: "shopping", description: "Compra en Plaza Las Américas", bankName: "Banco Popular", daysAgo: 4 },
        { amount: "1200", type: "expense", category: "entertainment", description: "Netflix y Spotify", bankName: "BHD León", daysAgo: 5 },
        { amount: "5000", type: "income", category: "transfer", description: "Transferencia recibida", bankName: "Banreservas", daysAgo: 6 },
        { amount: "800", type: "expense", category: "health", description: "Farmacia Carol", bankName: "Banco Popular", daysAgo: 7 },
      ];

      let created = 0;
      for (const tx of demoTransactions) {
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - tx.daysAgo);
        
        await storage.createTransaction({
          userId: user.id,
          amount: tx.amount,
          type: tx.type as "income" | "expense",
          category: tx.category,
          description: tx.description,
          bankName: tx.bankName,
          emailId: `demo-${Date.now()}-${created}`,
          transactionDate,
        });
        created++;
      }
      
      res.json({ created });
    } catch (error: any) {
      console.error("Error creating demo transactions:", error);
      res.status(500).json({ error: error.message || "Failed to create demo transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
