# Design System & UI/UX Specifications

## 1. Design Philosophy & Aesthetic Vision
The **Restaurant Management System (RMS)** interface is built with an editorial, calm, and data-centric aesthetic. The primary objective is to make complex operational data (live floor maps, financial P&L matrices, inventory metrics, kitchen pipelines) effortless to read and interact with without visual clutter or fatigue.

### Core Visual Principles:
- **Calm & Professional (Soft Neutral Mauve-Grey)**: Rather than loud, saturated neon tones, we utilize a tailored palette of warm greys, soft mauve undertones, and crisp contrast.
- **Data-First Visual Hierarchy**: Cards, tables, and metrics stand out through crisp typography and subtle background contrast (`#E4DEE4` on `#FFFFFF`), not heavy borders.
- **Context-Specific Portals**:
  - **Admin / Manager Portal**: Clean, high-density, analytical layout designed for fast decision-making.
  - **Customer QR Ordering**: Warm, appetizing, frictionless mobile-first card flow with sticky checkout drawers.
  - **Kitchen & Staff Portal**: High-contrast, large-touch-target cards optimized for quick glance and one-tap status advancement.

---

## 2. Color Palette & Token System

### 2.1 Core Brand & Neutral Tokens (Palette 1: Soft Neutral Mauve-Grey)

| Token Name | Hex Code | Purpose & Application | Tailwind Class Mapping |
|---|---|---|---|
| `--color-bg-main` | `#FFFFFF` | Main canvas background across portals | `bg-white` / `bg-main` |
| `--color-bg-card` | `#E4DEE4` | Card containers, surface panels, subtle section dividers | `bg-surface-card` / `border-divider` |
| `--color-bg-active` | `#EDE3E4` | Active sidebar item highlight, selected pills & tabs | `bg-surface-active` |
| `--color-hover` | `#AF9FA5` | Hover states, inactive sidebar icons, border accents | `hover:bg-surface-hover` / `text-hover` |
| `--color-text-secondary` | `#92898A` | Subtitles, helper text, table column headers, metadata icons | `text-secondary` |
| `--color-text-primary` | `#231F20` | High-contrast body text, primary values, headings | `text-primary` |
| `--color-text-heading` | `#161314` | Page titles, key KPI numbers, modal headers | `text-heading` |

---

### 2.2 Semantic & Operational Status Colors

To maintain harmony with the soft neutral base, status colors are calibrated for high legibility and pleasant contrast:

| Status Token | Hex Code | Background Tint | Usage Example |
|---|---|---|---|
| **Free / Success** | `#16A34A` (Emerald) | `#F0FDF4` | Table Free, Payment Confirmed, Stock Healthy |
| **Occupied / Warning** | `#D97706` (Warm Amber) | `#FFFBEB` | Table Occupied, Shift Pending, Stock Warning |
| **Reserved / Info** | `#4F46E5` (Indigo) | `#EEF2FF` | Table Reserved, Scheduled Shift |
| **Danger / Out-of-Stock** | `#E11D48` (Crimson Rose) | `#FFF1F2` | Out of Stock, Overdue Orders, Dispute Flag |
| **Kitchen In-Progress** | `#0284C7` (Sky Blue) | `#F0F9FF` | Kitchen Preparing, Ticket In Oven |

---

## 3. Tailwind CSS Configuration Snippet (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FFFFFF",
          card: "#E4DEE4",
          active: "#EDE3E4",
          subtle: "#F9F8F9",
        },
        brand: {
          primary: "#231F20",
          secondary: "#92898A",
          muted: "#AF9FA5",
          accent: "#8B4254", // Deep rose-burgundy accent for primary CTA buttons
          accentHover: "#733344",
        },
        divider: "#E4DEE4",
        status: {
          free: "#16A34A",
          freeBg: "#F0FDF4",
          occupied: "#D97706",
          occupiedBg: "#FFFBEB",
          reserved: "#4F46E5",
          reservedBg: "#EEF2FF",
          danger: "#E11D48",
          dangerBg: "#FFF1F2",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        header: ["var(--font-lato)", "Lato", "system-ui", "sans-serif"],
        display: ["var(--font-lato)", "Lato", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(35, 31, 32, 0.05), 0 1px 2px -1px rgba(35, 31, 32, 0.05)",
        elevated: "0 10px 15px -3px rgba(35, 31, 32, 0.08), 0 4px 6px -4px rgba(35, 31, 32, 0.04)",
        drawer: "0 -10px 25px -5px rgba(35, 31, 32, 0.12)",
      },
      borderRadius: {
        card: "14px",
        pill: "9999px",
        button: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 4. Typography System

We use a modern typography stack that pairs **Lato** (for headers, display titles & section titles) with **Montserrat** (for body text, metrics, tables & other details):

| Element | Font Family | Size / Leading | Weight | Color |
|---|---|---|---|---|
| **Display / Page Title** | Lato | `2rem` (32px) / 1.2 | Bold (700) | `#161314` |
| **Card Header / Section** | Lato | `1.25rem` (20px) / 1.3 | Semi-Bold (600) | `#231F20` |
| **KPI Big Numbers** | Montserrat | `1.75rem` (28px) / 1.1 | Bold (700) | `#161314` |
| **Body Primary** | Montserrat | `0.9375rem` (15px) / 1.5 | Regular (400) / Medium (500) | `#231F20` |
| **Secondary & Captions** | Montserrat | `0.8125rem` (13px) / 1.4 | Medium (500) | `#92898A` |
| **Table Column Headers** | Montserrat | `0.75rem` (12px) / 1.0 | Semi-Bold (600) Uppercase | `#92898A` |
| **Badges & Pills** | Montserrat | `0.75rem` (12px) / 1.0 | Semi-Bold (600) | Contextual |

---

## 5. Portal Component Specifications

### 5.1 Admin / Manager Dashboard Layout

```
┌─────────────────┬────────────────────────────────────────────────────────┐
│  [RMS Logo]     │  [Search Tables / Orders...]      [Alert Bell] [Avatar]│
├─────────────────┼────────────────────────────────────────────────────────┤
│  Navigation     │  [KPI 1: Today Rev]  [KPI 2: Active Floor]  [KPI 3]    │
│  ──────────     │  ┌──────────────────────────────────────────────────┐  │
│  • Dashboard    │  │  Live Floor Plan (Grid of 25 Tables)             │  │
│  • Live Floor   │  │  [T-1: Free]  [T-2: Occupied]  [T-3: Reserved]   │  │
│  • Inventory    │  │  [T-4: Prep]  [T-5: Ready]     [T-6: Free]       │  │
│  • Staff / HR   │  └──────────────────────────────────────────────────┘  │
│  • Orders       │  ┌────────────────────────┐ ┌───────────────────────┐  │
│  • Finance P&L  │  │ Realtime Order Pipeline│ │ Low-Stock Alerts      │  │
│  • Reviews      │  └────────────────────────┘ └───────────────────────┘  │
└─────────────────┴────────────────────────────────────────────────────────┘
```

- **Sidebar Items**:
  - Inactive: Text `#92898A`, Hover background `#AF9FA5` (with 15% opacity or soft tint), Icon `#92898A`.
  - Active: Background `#EDE3E4`, Text `#231F20`, Bold weight, Left border accent indicator.
- **Card Containers**: Background `#E4DEE4` (or subtle card white with `#E4DEE4` border), 14px border radius, subtle box shadow.

---

### 5.2 Customer QR Mobile Flow (`/order/[tableCode]`)
- **Header**: Compact sticky bar showing Table Number badge (e.g. `Table 04`), search bar, and cart item counter.
- **Category Tabs**: Horizontal scrollable pill buttons (`All`, `Starters`, `Mains`, `Beverages`, `Desserts`).
- **Dish Cards**: Clean vertical cards with dish image, dietary tags (Veg, Spicy), clear ETB price, and intuitive `+ Add` button.
- **Bottom Drawer Cart**: Sticky bottom drawer showing item count and total Birr amount, expanding into full order review with special instruction textareas upon tap.

---

### 5.3 Staff & Kitchen Order Board (KDS)
- **Ticket Cards**: High-density order cards showing Table Number, Waiter Name, Elapsed Minutes timer, and bulleted items.
- **One-Tap Actions**:
  - `[Mark Preparing]` (Yellow)
  - `[Mark Ready]` (Blue)
  - `[Mark Served]` (Green)
  - `[Dispute / Cancel]` (Red with confirmation modal)

---

## 6. Micro-Interactions & Animation Guidelines

1. **Card Hover States**: Smooth 150ms ease-in-out transition with a subtle 2px vertical lift and shadow elevation (`transition-all duration-150 ease-out hover:-translate-y-0.5`).
2. **Order Alert Pulsing**: New incoming orders on the kitchen and floor view pulse with a gentle border glow for the first 10 seconds.
3. **Drawer Transitions**: Cart bottom sheet slides up with spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
4. **Haptic & Toast Notifications**: Non-disruptive floating toasts positioned bottom-right (desktop) or top-center (mobile) with dismiss swiping.

---

## 7. Accessibility & Touch Targets
- **Minimum Touch Target Size**: All interactive buttons, chips, and table icons have a minimum clickable area of `44px x 44px` on mobile.
- **Contrast Ratios**: All primary text on `#FFFFFF` and `#E4DEE4` cards meets or exceeds **WCAG 2.1 AA** contrast ratio standards ($\ge 4.5:1$).
- **Color-Independent Status Indicators**: Status badges combine color with distinct icons (e.g., Checkmark for Free, Clock for Occupied, Calendar for Reserved) for universal accessibility.
