# Ginny - Personal Finance App Design Guidelines

## Brand Identity

**Purpose**: Ginny eliminates financial chaos for Dominicans by automatically consolidating bank transactions from Gmail into one intelligent dashboard. It transforms scattered email notifications into actionable financial clarity.

**Aesthetic Direction**: **Bold/Editorial** - Think financial confidence meets magazine sophistication. High-contrast interface with purposeful data visualization. Clean but information-dense. Every number tells a story.

**Memorable Element**: Dynamic gradient cards that shift based on financial health (cool tones for savings mode, warm when spending high). The app FEELS alive and responsive to user behavior.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Overview** (tab icon: pie-chart) - Dashboard with financial snapshot
- **Transactions** (tab icon: list) - Detailed transaction history
- **Insights** (tab icon: trending-up) - Charts and spending patterns
- **Profile** (tab icon: user) - Settings and account management

**Modals**:
- Transaction detail view (slides up from transaction tap)
- Category filter sheet (bottom sheet)
- Gmail connection flow (full-screen modal during onboarding)

## Screen-by-Screen Specifications

### 1. Onboarding (Stack-Only Flow)
**Purpose**: Explain value and connect Gmail account.

**Screens**:
- Welcome screen with hero illustration (welcome-hero.png)
- Benefits screen (3 cards: "Auto-sync", "Smart categorization", "Clear insights")
- Gmail connection screen with "Connect Gmail" button
- Permission explanation with privacy assurance

**Layout**: Centered content, large illustrations, bottom CTA button with safe area inset (bottom: insets.bottom + Spacing.xl)

### 2. Overview Tab (Home)
**Purpose**: At-a-glance financial health.

**Header**: Transparent, custom greeting ("Hola, [Name]"), right button: notification bell

**Content** (Scrollable):
- Balance card (gradient background, large balance number)
- Quick stats row (3 small cards: This month income, expenses, difference)
- Recent transactions list (5 items max, "See all" link to Transactions tab)
- Spending by category chart (horizontal bar chart)

**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

**Empty State**: Show onboarding illustration with "Connect Gmail to get started"

### 3. Transactions Tab
**Purpose**: Complete transaction history with search/filter.

**Header**: Default navigation, title "Transactions", right button: filter icon

**Content**: 
- Search bar (sticky below header)
- Segmented control (All / Income / Expenses)
- List of transactions grouped by date
  - Each item: Bank logo (placeholder circle), description, category tag, amount (green for income, red for expenses)

**Safe Area**: Top: Spacing.xl (non-transparent header), Bottom: tabBarHeight + Spacing.xl

**Empty State**: Illustration (empty-transactions.png) with "No transactions yet. Pull to refresh after connecting Gmail."

### 4. Insights Tab
**Purpose**: Visual spending analysis.

**Header**: Transparent, title "Insights", right button: date range picker icon

**Content** (Scrollable):
- Month selector (horizontal scroll of month chips)
- Spending trend line chart (7-day or 30-day)
- Category breakdown (donut chart with legend)
- Top spending categories (ranked list with progress bars)

**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

**Empty State**: Illustration (empty-insights.png) with "Not enough data yet. Check back after a few transactions."

### 5. Profile Tab
**Purpose**: Account management and settings.

**Header**: Default, title "Profile"

**Content** (Scrollable):
- User info card (avatar, name, email)
- Settings list:
  - Connected Accounts (shows Gmail status)
  - Notifications
  - Currency (DOP default)
  - About Ginny
  - Log Out (red text)

**Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 6. Transaction Detail Modal
**Purpose**: Full transaction details.

**Layout**: Modal sheet (not full screen), rounded top corners, drag handle
- Bank name and logo
- Full description
- Amount (large, colored)
- Category (editable via dropdown)
- Date and time
- Close button (header left)

## Color Palette

**Primary**: `#0A7EA4` (Deep Cyan) - Trust with energy, evokes Caribbean waters
**Primary Dark**: `#065A7A`
**Accent**: `#FF6B35` (Coral) - Warmth, attention for important actions

**Background**: `#F8F9FA` (Off-white)
**Surface**: `#FFFFFF`
**Surface Elevated**: `#FFFFFF` with shadowOpacity 0.08

**Text Primary**: `#1A1A1A`
**Text Secondary**: `#6B7280`

**Semantic**:
- Success/Income: `#10B981` (Green)
- Expense: `#EF4444` (Red)
- Warning: `#F59E0B` (Amber)

**Gradient (for balance card)**: `#0A7EA4` to `#065A7A` (vertical)

## Typography

**Font**: SF Pro (iOS system font) for data clarity and performance.

**Type Scale**:
- Display (Balance numbers): 48px, Bold
- H1 (Screen titles): 28px, Bold
- H2 (Section headers): 20px, Semibold
- Body: 16px, Regular
- Caption (Meta info): 14px, Regular
- Small (Tags): 12px, Medium

## Visual Design

**Touchable Feedback**:
- Cards: Slight scale down (0.98) on press
- List items: Background flash to `#F3F4F6`
- Buttons: Opacity 0.8 on press

**Floating Button** (if added later for manual entry):
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

**Icons**: Use Feather icons from @expo/vector-icons throughout.

**Cards**: 16px border radius, subtle shadow (shadowOpacity: 0.05, shadowRadius: 4, height: 2)

## Assets to Generate

1. **icon.png** - App icon featuring stylized "G" with gradient (Primary to Accent)
2. **splash-icon.png** - Same as icon, centered on Primary color background
3. **welcome-hero.png** - Illustration of organized financial documents flowing into phone, Primary + Accent colors
4. **empty-transactions.png** - Minimal illustration of inbox with checkmark, Primary color
5. **empty-insights.png** - Minimal chart/graph illustration, light gray with Primary accent
6. **avatar-preset.png** - Generic user avatar (circular, Primary background, white "G" initial)

**Asset Style**: Flat, modern illustrations with 2-3 colors max (Primary, Accent, off-white). Clean lines, geometric shapes, no gradients in illustrations (except app icon).