import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  category: text("category").notNull(),
  description: text("description").notNull(),
  bankName: text("bank_name"),
  emailId: text("email_id"), // Gmail message ID to prevent duplicates
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailSyncStatus = pgTable("email_sync_status", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  lastSyncAt: timestamp("last_sync_at"),
  syncedEmailCount: integer("synced_email_count").default(0),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  emailSyncStatus: one(emailSyncStatus),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const emailSyncStatusRelations = relations(emailSyncStatus, ({ one }) => ({
  user: one(users, {
    fields: [emailSyncStatus.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  avatarUrl: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type EmailSyncStatus = typeof emailSyncStatus.$inferSelect;

export const CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "education",
  "salary",
  "transfer",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];
