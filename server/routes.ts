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

  app.get("/api/banks", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      const banks = await storage.getBanksSummary(user.id);
      res.json(banks);
    } catch (error: any) {
      console.error("Error getting banks:", error);
      res.status(500).json({ error: error.message || "Failed to get banks" });
    }
  });

  app.get("/api/stats/by-bank", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      const bankName = req.query.bank as string;
      
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      
      const stats = await storage.getStatsByBank(user.id, bankName, year, month);
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting bank stats:", error);
      res.status(500).json({ error: error.message || "Failed to get bank stats" });
    }
  });

  app.post("/api/transactions/demo", async (req, res) => {
    try {
      const user = await getOrCreateUser();
      
      // Realistic demo data from popular Dominican banks
      const demoTransactions = [
        // Banreservas - largest state bank
        { amount: "65000", type: "income", category: "salary", description: "Nómina Quincenal - Empresa XYZ", bankName: "Banreservas", daysAgo: 1 },
        { amount: "3500", type: "expense", category: "utilities", description: "Pago EDENORTE Luz", bankName: "Banreservas", daysAgo: 2 },
        { amount: "1800", type: "expense", category: "utilities", description: "Pago CAASD Agua", bankName: "Banreservas", daysAgo: 3 },
        { amount: "2200", type: "expense", category: "food", description: "Supermercado Bravo", bankName: "Banreservas", daysAgo: 5 },
        
        // Banco Popular - largest private bank
        { amount: "4500", type: "expense", category: "shopping", description: "Compra Blue Mall", bankName: "Banco Popular", daysAgo: 1 },
        { amount: "1200", type: "expense", category: "food", description: "Jumbo Supermercados", bankName: "Banco Popular", daysAgo: 2 },
        { amount: "15000", type: "income", category: "transfer", description: "Transferencia recibida", bankName: "Banco Popular", daysAgo: 4 },
        { amount: "890", type: "expense", category: "transport", description: "Parqueo Ágora Mall", bankName: "Banco Popular", daysAgo: 6 },
        
        // BHD León - major commercial bank
        { amount: "2800", type: "expense", category: "entertainment", description: "Caribbean Cinemas", bankName: "BHD León", daysAgo: 1 },
        { amount: "1500", type: "expense", category: "food", description: "Restaurante Mesón D'Bari", bankName: "BHD León", daysAgo: 3 },
        { amount: "950", type: "expense", category: "transport", description: "Uber RD", bankName: "BHD León", daysAgo: 4 },
        { amount: "5200", type: "expense", category: "shopping", description: "La Sirena Megacentro", bankName: "BHD León", daysAgo: 7 },
        
        // Scotiabank RD
        { amount: "1100", type: "expense", category: "entertainment", description: "Netflix + HBO Max", bankName: "Scotiabank", daysAgo: 2 },
        { amount: "2500", type: "expense", category: "utilities", description: "Claro Internet + Cable", bankName: "Scotiabank", daysAgo: 5 },
        { amount: "8000", type: "income", category: "transfer", description: "Pago freelance", bankName: "Scotiabank", daysAgo: 8 },
        
        // Banco Santa Cruz
        { amount: "750", type: "expense", category: "health", description: "Farmacia Carol", bankName: "Banco Santa Cruz", daysAgo: 1 },
        { amount: "3200", type: "expense", category: "health", description: "Consulta médica HOMS", bankName: "Banco Santa Cruz", daysAgo: 6 },
        
        // Asociación Popular
        { amount: "25000", type: "income", category: "salary", description: "Bono navideño", bankName: "Asociación Popular", daysAgo: 3 },
        { amount: "1800", type: "expense", category: "food", description: "Nacional Supermercados", bankName: "Asociación Popular", daysAgo: 4 },
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
