# Ginny - Personal Finance App Design Guidelines

## Brand Identity

**Purpose**: Ginny eliminates financial chaos for Dominicans by automatically consolidating bank transactions from Gmail into one intelligent dashboard.

**Aesthetic Direction**: Clean, polished fintech app inspired by Fintonic and Revolut. Minimal, card-based interface with clear hierarchy and native iOS feel.

## Design Principles

1. **Clean Cards** - Subtle elevation, generous padding, rounded corners
2. **Bold Numbers** - Large, prominent balance/amount displays
3. **Clear Hierarchy** - Section headers, spacing creates visual groups
4. **Native iOS Feel** - SF Pro fonts, system blur, subtle shadows
5. **Minimal Color** - Strategic use of accent colors for emphasis

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Inicio** (tab icon: home) - Dashboard with financial snapshot
- **Movimientos** (tab icon: list) - Transaction history
- **Análisis** (tab icon: bar-chart-2) - Charts and insights
- **Perfil** (tab icon: user) - Settings and account

## Color Palette

### Light Mode
- **Background**: `#F5F5F7` (iOS system gray 6)
- **Card Background**: `#FFFFFF`
- **Primary Text**: `#1C1C1E`
- **Secondary Text**: `#8E8E93`
- **Accent**: `#00D09C` (Teal/Cyan - like Fintonic)
- **Primary Blue**: `#1A2B4B` (Dark navy for headers)
- **Success/Income**: `#34C759` (iOS green)
- **Expense**: `#FF3B30` (iOS red)
- **Card Shadow**: 0 2px 8px rgba(0,0,0,0.08)

### Dark Mode
- **Background**: `#000000` (Pure black like Revolut)
- **Card Background**: `#1C1C1E` (iOS dark gray)
- **Primary Text**: `#FFFFFF`
- **Secondary Text**: `#8E8E93`
- **Accent**: `#00D09C`
- **Success/Income**: `#30D158`
- **Expense**: `#FF453A`

## Typography

Using SF Pro (system font) for maximum iOS native feel:

- **Large Title**: 34px, Bold (Balance displays)
- **Title 1**: 28px, Bold (Screen titles)
- **Title 2**: 22px, Bold (Section headers)
- **Title 3**: 20px, Semibold (Card titles)
- **Body**: 17px, Regular (Standard text)
- **Callout**: 16px, Regular
- **Subhead**: 15px, Regular
- **Footnote**: 13px, Regular (Secondary info)
- **Caption**: 12px, Regular (Meta text)

## Spacing

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **4xl**: 40px

## Component Specifications

### Cards
- Border radius: 16px
- Padding: 20px
- Shadow (light): 0 2px 8px rgba(0,0,0,0.08)
- No border

### Balance Card (Hero)
- Full width
- Large balance number (34-40px, Bold)
- Subtle gradient or solid white background
- Month/period indicator with icon

### Quick Stats Row
- Horizontal layout, equal width cards
- Icon + Label + Amount stacked
- Circular progress indicators optional

### Transaction Items
- Category icon (44px circle with colored background)
- Description + Bank name
- Amount aligned right
- Date/time below amount
- Subtle separator or spacing between items

### Segmented Control
- Pill-shaped buttons
- Active: Filled with accent color
- Inactive: Light gray background

### Tab Bar
- Standard iOS tab bar
- Active: Accent color
- Inactive: Gray
- Labels below icons

## Screen Layouts

### Home/Overview
1. Greeting header ("Hola, [Name]")
2. Period selector (Segmented: "Último mes" / "Año en curso")
3. Balance card with month indicator
4. Financial summary section with circular charts
5. Income/Expenses quick stats
6. Top categories preview

### Transactions
1. Search bar
2. Filter tabs (Todas / Ingresos / Gastos)
3. Transaction list grouped by date
4. Each item: Icon, description, category, amount

### Insights
1. Month selector (horizontal scroll)
2. Summary card (Income vs Expenses)
3. Spending trend chart
4. Category breakdown with progress bars

### Profile
1. User card with avatar
2. Settings list items with icons
3. Sync status card
4. Logout option
