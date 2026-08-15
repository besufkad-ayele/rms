# Restaurant Management System (RMS) - System Architecture & Overview

## 1. Executive Summary
The **Restaurant Management System (RMS)** is an end-to-end, real-time operating system engineered for modern restaurants. It streamlines five core operational pillars:
1. **Staff & Shift Management (HR & Operations)**: Complete legal compliance, automated shift scheduling, dispute-proof clock-in system, training checklists, and automated performance tracking.
2. **Real-time Inventory & Recipe Management**: Automatic ingredient deduction upon order placement, recipe-based cost calculation, low-stock threshold triggers, and weekly discrepancy reconciliation.
3. **QR Table Digital Ordering**: Dynamic table-assigned QR ordering `/order/[tableCode]`, instant floor status updates, cart management, and attendant assignment.
4. **Payments & Customer Feedback**: Multi-rail payments (CBE Transfer, Telegram/Telebirr, Cash validation), multi-question weighted staff & food ratings, and Google Business Review redirection engine.
5. **Financial Analytics & P&L Intelligence**: True net profit reporting by combining real-time recipe COGS (Cost of Goods Sold), channel revenue splits (Dine-in, Takeout, Delivery), and fixed/operational expenses (Rent, Salaries, Utilities).

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components, Route Groups, Server Actions, API Handlers |
| **Language** | TypeScript (Strict) | End-to-end type safety across DB, API, and UI |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive modern design, mobile-first floor views & dashboards |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Row Level Security (RLS), Supabase Auth (JWT/Sessions), Storage |
| **Realtime Engine** | Supabase Realtime (WebSockets) | Instant floor status, live kitchen ticket updates, inventory alerts |
| **Storage** | Supabase Storage Buckets | Staff National ID documents, menu item photos, payment slips |

---

## 3. Directory Structure & App Routing

```
├── docs/                                # Technical specifications & module docs
│   ├── README.md                        # Master Architecture (this file)
│   ├── database-schema.md               # Supabase DDL, Tables, Triggers & RLS
│   └── modules/
│       ├── 01-staff-and-shifts.md       # Staff HR, shifts, clock-in, training
│       ├── 02-inventory-and-recipes.md  # Ingredients, recipes, auto-deductions
│       ├── 03-ordering-and-tables.md    # QR code menu, cart, floor status
│       ├── 04-payments-and-feedback.md  # Payments, ratings & Google redirect
│       ├── 05-finance-and-analytics.md  # COGS, expenses, net profit analytics
│       └── 06-frontend-and-routing.md   # App router, middleware, layouts & UI
├── src/
│   ├── app/
│   │   ├── (marketing)/                 # Public marketing landing site
│   │   │   ├── page.tsx                 # Restaurant brand homepage
│   │   │   ├── about/page.tsx           # Story & chef profile
│   │   │   └── contact/page.tsx         # Reservation & location
│   │   ├── order/[tableCode]/           # Customer ordering flow (No login needed)
│   │   │   ├── page.tsx                 # Menu & interactive cart
│   │   │   ├── payment/page.tsx         # Payment method selection & submission
│   │   │   └── feedback/page.tsx        # Multi-factor review & Google redirect
│   │   ├── staff/                       # Staff portal (Staff role required)
│   │   │   ├── login/page.tsx           # Staff credential login
│   │   │   ├── dashboard/page.tsx       # Assigned tables, clock-in code validation
│   │   │   └── training/page.tsx        # Personal training checklist progress
│   │   ├── admin/                       # Manager / Owner portal (Admin role required)
│   │   │   ├── login/page.tsx           # Admin authentication
│   │   │   ├── dashboard/page.tsx       # Live floor, revenue metrics, urgent alerts
│   │   │   ├── inventory/page.tsx       # Stock levels, recipe builder, alerts
│   │   │   ├── staff/page.tsx           # Personnel files, shift scheduler, attendance
│   │   │   ├── orders/page.tsx          # Realtime order pipeline & table states
│   │   │   ├── finance/page.tsx         # Revenue splits, COGS vs OPEX, Net Profit
│   │   │   └── reviews/page.tsx         # Staff review breakdown & customer feedback
│   ├── components/                      # Shared UI components (Modals, Tables, Forms)
│   ├── lib/                             # Supabase clients, utils, validators
│   ├── types/                           # Database & TypeScript entity types
│   └── middleware.ts                    # Session check & Role-based routing
```

---

## 4. Middleware & Role-Based Access Control (RBAC)

```mermaid
graph TD
    Request([Incoming Request]) --> PathCheck{Target Route}

    PathCheck -->|/(marketing)/*| AllowPublic[Allow Public Access]
    PathCheck -->|/order/[tableCode]/*| AllowCustomer[Allow Customer Flow]
    
    PathCheck -->|/staff/*| CheckStaffSession{Has Staff/Admin Session?}
    CheckStaffSession -->|No| RedirectStaffLogin[Redirect to /staff/login]
    CheckStaffSession -->|Yes| AllowStaff[Allow Staff Access]

    PathCheck -->|/admin/*| CheckAdminSession{Has Admin Role?}
    CheckAdminSession -->|No| RedirectAdminLogin[Redirect to /admin/login]
    CheckAdminSession -->|Yes| AllowAdmin[Allow Admin Access]
```

---

## 5. Realtime Subscription Matrix

| Event / Topic | Trigger Table | Subscriber | UI Action |
|---|---|---|---|
| `stock_level_drop` | `ingredients` | Admin `/admin/inventory` | Visual badge & toast for low inventory |
| `order_created` | `orders` | Staff `/staff/dashboard`, Kitchen | Audible alert, adds card to active orders list |
| `order_status_update`| `orders` | Customer `/order/[tableCode]` | Progress tracker (Placed → Preparing → Served) |
| `table_status_change`| `tables` | Admin `/admin/dashboard`, Floor View | Instant table color update (Free, Occupied, Reserved) |
| `shift_clock_event` | `shifts` | Admin `/admin/staff` | Live update on staff attendance list |

---

## 6. Implementation Roadmap
1. **Phase 1: Architecture & Specs** (Completed in `docs/`)
2. **Phase 2: Project Scaffolding & Supabase Setup** (Next.js 14, Tailwind, Supabase Client & Types)
3. **Phase 3: Database Migrations & DDL Setup** (All 12 tables, relations, triggers, and RLS policies)
4. **Phase 4: Module-by-Module Implementation**:
   - Staff HR & Shift Clock-In System
   - Inventory & Recipe Deduction Engine
   - QR Ordering & Live Floor Table Management
   - Payments & Customer Rating / Google Review Workflow
   - Financial P&L Analytics Engine
5. **Phase 5: End-to-End Verification & Realtime Testing**
