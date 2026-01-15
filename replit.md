# Ginny - Personal Finance App

## Overview
Ginny is a personal finance app for the Dominican market. It connects to users' Gmail accounts to automatically parse bank transaction emails and consolidate financial data in one place.

## Current State
- MVP with Gmail integration
- Transaction parsing from Dominican banks (Banreservas, Popular, BHD León, etc.)
- Dashboard with balance, income, expenses
- Transaction history with search and filtering
- Insights with category breakdown and weekly trends
- Profile screen with settings

## Architecture

### Frontend (Expo React Native)
- **client/App.tsx** - Root component with providers
- **client/navigation/** - React Navigation setup with 4 tabs (Overview, Transactions, Insights, Profile)
- **client/screens/** - Screen components
- **client/components/** - Reusable UI components
- **client/lib/** - Utilities (formatters, API client)
- **client/constants/theme.ts** - Design tokens (colors, spacing, typography)

### Backend (Express.js)
- **server/routes.ts** - API endpoints
- **server/storage.ts** - Database operations
- **server/gmail.ts** - Gmail integration for parsing bank emails
- **server/db.ts** - Database connection

### Database (PostgreSQL)
- **users** - User accounts (synced from Gmail)
- **transactions** - Parsed transactions from bank emails
- **email_sync_status** - Tracks last sync time

## Key Features
1. **Gmail Integration** - Fetches bank emails and parses transaction data
2. **Transaction Categorization** - Automatic categorization (food, transport, utilities, etc.)
3. **Monthly Stats** - Income vs expenses breakdown
4. **Category Insights** - Visual breakdown by spending category
5. **Pull-to-Refresh** - Sync new emails on demand

## Design
- Primary color: #0A7EA4 (Deep Cyan)
- Accent color: #FF6B35 (Coral)
- Dominican Peso (DOP) currency formatting
- Spanish language UI
- iOS-focused design with liquid glass aesthetics

## Commands
- `npm run server:dev` - Start backend
- `npm run expo:dev` - Start Expo dev server
- `npm run db:push` - Push database schema changes

## Next Steps (Future)
- Gemini AI integration for financial tips
- Custom budget setting and alerts
- Bill payment reminders
- Biometric authentication
