# Restaurant Management System - Implementation Priority Flow

This document outlines the end-to-end operational flow in exact chronological order, from restaurant setup to daily operations, kitchen fulfillment, real-time deductions, payments, and owner analytics.

---

## Phase 1: Owner and Manager Setup
1. **Owner Account Creation**: Restaurant owner receives super-admin access with full system visibility and master configurations.
2. **Manager Delegation**: Owner creates or promotes manager accounts with delegated operational permissions.
3. **Staff HR Registration**: Detailed staff member registration:
   - Full legal name, National ID / Fayda number, scanned ID document.
   - Contact info, emergency contact details, residential address, date of birth, date hired.
   - Operational role (`waiter`, `cook`, `cleaner`, `host`, `manager`, `inventory_clerk`, `cashier`).
   - Base salary and profile photo.
4. **Granular Role Permissions**: Specific staff members can be granted scoped permissions (e.g., giving an `inventory_clerk` or chef direct access to the `/admin/inventory` dashboard without exposing financial P&L or HR records).

---

## Phase 2: Inventory & Recipe Setup
5. **Raw Ingredient Ingestion**: Manager or assigned inventory staff registers all raw ingredients:
   - Name, measurement unit (`gram`, `ml`, `piece`).
   - Current starting stock and `low_stock_threshold`.
   - Cost per unit (for real-time COGS calculations).
6. **Recipe Bill-of-Materials (BOM)**: Exact ingredient quantities per serving are mapped to every menu item (e.g., 1 cup of tea = 3 spoons of sugar converted to grams, 5g tea leaves, 250ml water).

---

## Phase 3: Table & QR Floor Setup
7. **Table Registry**: All physical tables (~20-30 tables) registered with unique alphanumeric codes.
8. **QR Generation**: Printable QR codes generated for each table linking directly to `/order/[tableCode]`.
9. **Attendant Pre-assignment**: Tables assigned to default on-duty staff members, dynamically reassignable per shift or based on waiter load.

---

## Phase 4: Customer Digital Ordering & Kitchen Pipeline
10. **Direct QR Landing**: Customer scans table QR and lands directly on `/order/[tableCode]` with zero app download or login friction.
11. **Instant Table Occupancy**: Scanning or placing an order flags table status as `occupied` in real time on the live floor plan.
12. **Digital Menu & Cart**: Customer filters by category, adjusts quantities, adds special notes, and submits order.
13. **Real-time Kitchen Order Ticket (KOT)**:
    - Order appears instantly on Kitchen Display System (KDS) in `placed` status with audio chime.
    - Kitchen moves status: `placed` $\rightarrow$ `preparing` $\rightarrow$ `ready` $\rightarrow$ `served`.
    - Both customer and assigned waiter see live status updates.
14. **Automatic Stock Deduction**: Confirmed order items atomically deduct exact recipe quantities from ingredient stock in real time.
15. **Order Item Dispute & Cancellation**:
    - If an item is prepared incorrectly or cancelled by the kitchen/customer, staff flags it as `disputed` or `cancelled`.
    - System automatically triggers **reverse inventory restoration**, adding back the deducted ingredient quantities.
16. **Manual Floor Controls**: Staff can manually toggle tables between `free`, `occupied` (for walk-ins without QR scan), and `reserved`.

---

## Phase 5: Inventory Audit & Reconciliation
17. **Physical Stock Count (Every 2–3 Days / Weekly)**: Assigned staff inputs physical counts of key inventory items.
18. **Variance & Discrepancy Analysis**: System compares physical count against theoretical recipe remaining stock:
    - Flags discrepancies exceeding configurable tolerance threshold.
    - Identifies root causes: over-portioning, kitchen waste, unrecorded spoilage, or shrinkage.

---

## Phase 6: Payment Settlement
19. **Payment Options**: Customer selects preferred payment method:
    - **CBE Transfer**: Account info shown, customer inputs transaction reference and optional receipt screenshot.
    - **Telegram / Telebirr**: Direct digital payment flow.
    - **Cash**: Customer requests physical cash settlement at table.
20. **Attendant Verification**: Waiter/cashier collects cash or verifies transfer on staff dashboard, marking payment `confirmed`.
21. **Table Clearance**: Once confirmed, table status automatically resets to `free` (or marked clean by staff).

---

## Phase 7: Feedback & Reputation Funnel
22. **Immediate Post-Payment Rating**: Customer is prompted with a 30-second weighted review:
    - Server friendliness & speed (25% + 25%).
    - Food quality & taste (20%).
    - Delivery speed & atmosphere (15% + 15%).
23. **Google Business Review Redirection**:
    - **High Ratings ($\ge 4.0$)**: Redirects customer to public Google Business Review page with 5-star prompt.
    - **Constructive / Low Ratings ($< 4.0$)**: Sent privately to Manager review queue for immediate service recovery.

---

## Phase 8: Executive & Manager Real-Time Dashboard
24. **Live Floor View**: Real-time visual map of all tables, active orders, occupancy timer, and assigned staff.
25. **Inventory Control**: Live stock levels, low-stock threshold alerts, restock history, and discrepancy variance.
26. **Staff Scorecards**: Shift attendance, clock-in punctuality, checklist progress, and rolling customer rating averages.
27. **Menu Performance (Engineering)**: High-margin "Stars", volume "Plowhorses", and underperforming dishes.
28. **P&L Financial Intelligence**:
    - Channel revenues (`dine_in`, `takeout`, `delivery`).
    - Recipe-derived Cost of Goods Sold (COGS).
    - Logged OPEX (Rent, Utilities, Staff Salaries, Supplies, Maintenance).
    - Real-time Gross Profit and True Net Profit.
29. **Pending Payments & Cash Reconciliation**: Live tracker for unconfirmed cash collections or outstanding bills.
