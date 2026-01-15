import { 
  users, 
  transactions, 
  emailSyncStatus,
  type User, 
  type InsertUser, 
  type Transaction,
  type InsertTransaction,
  type EmailSyncStatus 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface BankSummary {
  bankName: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionByEmailId(emailId: string): Promise<Transaction | undefined>;
  
  getEmailSyncStatus(userId: string): Promise<EmailSyncStatus | undefined>;
  updateEmailSyncStatus(userId: string, syncedCount: number): Promise<void>;
  
  getMonthlyStats(userId: string, year: number, month: number): Promise<{ income: number; expenses: number }>;
  getCategoryBreakdown(userId: string, year: number, month: number): Promise<{ category: string; total: number }[]>;
  
  getBanksSummary(userId: string): Promise<BankSummary[]>;
  getStatsByBank(userId: string, bankName: string, year: number, month: number): Promise<{ income: number; expenses: number; categories: { category: string; total: number }[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate));
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .orderBy(desc(transactions.transactionDate));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getTransactionByEmailId(emailId: string): Promise<Transaction | undefined> {
    const [txn] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.emailId, emailId));
    return txn || undefined;
  }

  async getEmailSyncStatus(userId: string): Promise<EmailSyncStatus | undefined> {
    const [status] = await db
      .select()
      .from(emailSyncStatus)
      .where(eq(emailSyncStatus.userId, userId));
    return status || undefined;
  }

  async updateEmailSyncStatus(userId: string, syncedCount: number): Promise<void> {
    const existing = await this.getEmailSyncStatus(userId);
    if (existing) {
      await db
        .update(emailSyncStatus)
        .set({ lastSyncAt: new Date(), syncedEmailCount: syncedCount })
        .where(eq(emailSyncStatus.userId, userId));
    } else {
      await db.insert(emailSyncStatus).values({
        userId,
        lastSyncAt: new Date(),
        syncedEmailCount: syncedCount,
      });
    }
  }

  async getMonthlyStats(userId: string, year: number, month: number): Promise<{ income: number; expenses: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const txns = await this.getTransactionsByDateRange(userId, startDate, endDate);
    
    let income = 0;
    let expenses = 0;
    
    for (const txn of txns) {
      const amount = parseFloat(txn.amount);
      if (txn.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
      }
    }
    
    return { income, expenses };
  }

  async getCategoryBreakdown(userId: string, year: number, month: number): Promise<{ category: string; total: number }[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const txns = await this.getTransactionsByDateRange(userId, startDate, endDate);
    
    const categoryTotals: Record<string, number> = {};
    
    for (const txn of txns) {
      if (txn.type === 'expense') {
        const amount = parseFloat(txn.amount);
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + amount;
      }
    }
    
    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }

  async getBanksSummary(userId: string): Promise<BankSummary[]> {
    const allTransactions = await this.getTransactions(userId);
    
    const bankData: Record<string, { income: number; expenses: number; count: number }> = {};
    
    for (const txn of allTransactions) {
      const bankName = txn.bankName || "Otro";
      if (!bankData[bankName]) {
        bankData[bankName] = { income: 0, expenses: 0, count: 0 };
      }
      
      const amount = parseFloat(txn.amount);
      bankData[bankName].count++;
      
      if (txn.type === 'income') {
        bankData[bankName].income += amount;
      } else {
        bankData[bankName].expenses += amount;
      }
    }
    
    return Object.entries(bankData)
      .map(([bankName, data]) => ({
        bankName,
        transactionCount: data.count,
        totalIncome: data.income,
        totalExpenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount);
  }

  async getStatsByBank(
    userId: string, 
    bankName: string, 
    year: number, 
    month: number
  ): Promise<{ income: number; expenses: number; categories: { category: string; total: number }[] }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const txns = await this.getTransactionsByDateRange(userId, startDate, endDate);
    const bankTxns = txns.filter(t => t.bankName === bankName);
    
    let income = 0;
    let expenses = 0;
    const categoryTotals: Record<string, number> = {};
    
    for (const txn of bankTxns) {
      const amount = parseFloat(txn.amount);
      if (txn.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + amount;
      }
    }
    
    const categories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
    
    return { income, expenses, categories };
  }
}

export const storage = new DatabaseStorage();
