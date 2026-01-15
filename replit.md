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
6. **Bank Visualization** - View data by bank with "Mis Cuentas" section showing income/expenses per bank
7. **Bank Filtering** - Filter transactions by specific Dominican bank (Banreservas, Popular, BHD León, etc.)

## Supported Dominican Banks
- Banreservas (green)
- Banco Popular (blue)
- BHD León (red)
- Scotiabank
- Banco Santa Cruz
- Asociación Popular

## Design
Inspired by fintech apps like Fintonic and Revolut with a clean, polished iOS-native aesthetic.

### Colors
- Background: #F5F5F7 (iOS system gray)
- Cards: #FFFFFF with subtle shadows
- Accent: #00D09C (Teal/Cyan)
- Primary Text: #1C1C1E
- Secondary Text: #8E8E93
- Success/Income: #34C759 (iOS green)
- Expense: #FF3B30 (iOS red)

### Typography
- SF Pro system font
- Large Title: 34px Bold (balance displays)
- Section Headers: 17px Semibold
- Body: 17px Regular

### Components
- Card-based layout with 16px border radius
- Subtle shadows on light mode
- Segmented controls with pill-shaped buttons
- Circular progress indicators for financial summary
- Category bars with progress fill
- Transaction items with colored category icons

### UI Labels (Spanish)
- Tabs: Inicio, Movimientos, Análisis, Perfil
- Sections: Resumen de tus finanzas, Ingresos y Gastos, Top 3 Categorías
- Dominican Peso (DOP) currency formatting

## Commands
- `npm run server:dev` - Start backend
- `npm run expo:dev` - Start Expo dev server
- `npm run db:push` - Push database schema changes

## Next Steps (Future)
- Gemini AI integration for financial tips
- Custom budget setting and alerts
- Bill payment reminders
- Biometric authentication
