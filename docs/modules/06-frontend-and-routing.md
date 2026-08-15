# Module 06: Frontend Architecture, Routing & User Experience

## 1. Overview & Operational Goals
The Frontend Architecture is built with Next.js 14 (App Router) and Tailwind CSS. It is split into four distinct user portals:
1. **Public Marketing Experience `/(marketing)`**: Modern brand landing page, story, menu preview, and location/hours.
2. **Customer QR Ordering Flow `/order/[tableCode]`**: Frictionless, mobile-optimized ordering, real-time status tracker, multi-rail checkout, and review redirection.
3. **Staff Shift & Table Portal `/staff`**: Mobile-first attendant console for shift clock-in, table assignments, and training checklists.
4. **Admin & Management Hub `/admin`**: Comprehensive desktop/tablet management dashboard for live floor monitoring, inventory controls, staff roster, and P&L financial analytics.

---

## 2. Route Layouts & Route Groups

```
src/app/
│
├── layout.tsx                     # Root layout (Fonts, Theme Provider, Toast System)
├── globals.css                    # Tailwind CSS tokens, CSS variables & animations
├── middleware.ts                  # Edge session & RBAC role router
│
├── (marketing)/                   # Route Group: Public Marketing Portal
│   ├── layout.tsx                 # Public header, navigation & footer
│   ├── page.tsx                   # Landing page (Hero, features, ambiance, CTA)
│   ├── about/page.tsx             # Restaurant story & chef philosophy
│   └── contact/page.tsx           # Map, opening hours, reservations
│
├── order/[tableCode]/             # Dynamic Route: Customer Digital Ordering
│   ├── layout.tsx                 # Clean mobile layout (No distracting navbars)
│   ├── page.tsx                   # Interactive menu, category filter, drawer cart
│   ├── payment/page.tsx           # CBE / Telegram / Cash checkout flow
│   └── feedback/page.tsx          # 5-factor weighted review + Google redirect
│
├── staff/                         # Route Group: Staff Operating Portal
│   ├── layout.tsx                 # Staff header with active shift status badge
│   ├── login/page.tsx             # Staff PIN & Credential login
│   ├── dashboard/page.tsx         # Active shift clock-in, assigned tables & orders
│   └── training/page.tsx          # Role-specific onboarding checklist
│
└── admin/                         # Route Group: Executive & Management Portal
    ├── layout.tsx                 # Collapsible sidebar, stats ribbon & alert bell
    ├── login/page.tsx             # Owner / Manager authentication
    ├── dashboard/page.tsx         # Executive KPI summary & live floor plan
    ├── inventory/page.tsx         # Stock levels, recipe builder & restock alerts
    ├── staff/page.tsx             # HR personnel records, shift planner & roster
    ├── orders/page.tsx            # Live order board & table assignments
    ├── finance/page.tsx           # Revenue vs COGS vs OPEX, Net Profit analysis
    └── reviews/page.tsx           # Staff performance rankings & customer ratings
```

---

## 3. Middleware RBAC Specification (`middleware.ts`)

```mermaid
flowchart TD
    Req([HTTP Request]) --> URLCheck{URL Route}
    
    URLCheck -->|/admin/*| AdminCheck{Supabase Session & Role == 'admin'?}
    AdminCheck -->|No| ToAdminLogin[Redirect to /admin/login]
    AdminCheck -->|Yes| NextResponseAdmin[Proceed to Admin Dashboard]
    
    URLCheck -->|/staff/*| StaffCheck{Supabase Session & Role in ('staff','manager','admin')?}
    StaffCheck -->|No| ToStaffLogin[Redirect to /staff/login]
    StaffCheck -->|Yes| NextResponseStaff[Proceed to Staff Portal]
    
    URLCheck -->|/order/* or /(marketing)/*| NextResponsePublic[Proceed Directly (No Auth Required)]
```

---

## 4. UI/UX Design System & Theme Tokens

### 4.1 Color Palette & Tokens (Soft Neutral Mauve-Grey - Palette 1)
- **Main Canvas Background**: White (`#FFFFFF` / `bg-white`)
- **Card Backgrounds & Section Dividers**: `#E4DEE4` (`bg-surface-card` / `border-divider`)
- **Active Sidebar & Tab Highlight**: `#EDE3E4` (`bg-surface-active`)
- **Hover States & Inactive Icons**: `#AF9FA5` (`hover:bg-surface-hover` / `text-hover`)
- **Secondary Text & Captions**: `#92898A` (`text-secondary`)
- **Primary Text & Headings**: `#231F20` / `#161314` (High contrast crisp typography)
- **Brand Accent CTA**: Deep Rose-Burgundy (`#8B4254` / hover `#733344`)

### 4.2 Typography Hierarchy
- **Headers & Display Titles**: **Lato** (`var(--font-lato)`, bold 700 / semi-bold 600)
- **Body Text, Data Tables & UI Details**: **Montserrat** (`var(--font-montserrat)`, regular 400 / medium 500 / semi-bold 600)

### 4.3 Functional State Colors
- `Free / Success`: Emerald Green (`#16A34A` / tint `#F0FDF4`)
- `Occupied / In-Progress`: Warm Amber (`#D97706` / tint `#FFFBEB`)
- `Reserved / Info`: Indigo Blue (`#4F46E5` / tint `#EEF2FF`)
- `Danger / Alert / Low Stock`: Crimson Rose (`#E11D48` / tint `#FFF1F2`)
- `Kitchen Preparing`: Sky Blue (`#0284C7` / tint `#F0F9FF`)

### 4.4 Micro-Interactions & Responsive Rules
1. **Mobile Ordering**: Drawer bottom-sheet cart with swipe-to-close, sticky order total button, vibration haptic feedback on add-to-cart.
2. **Admin Floor View**: Interactive live grid table arrangement with visual status badges and occupancy timer.
3. **Live Inventory Alerts**: Non-intrusive slide-in toast notifications when ingredient drops below threshold.
