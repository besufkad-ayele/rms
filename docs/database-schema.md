# Database Schema & Storage Specifications

This document defines the complete PostgreSQL / Supabase schema for the Restaurant Management System, including enums, tables, foreign keys, constraints, Row Level Security (RLS) policies, and automated triggers.

---

## 1. Custom PostgreSQL Enums

```sql
-- Staff employment status
CREATE TYPE employment_status_enum AS ENUM ('active', 'on_leave', 'terminated');

-- Staff operational role
CREATE TYPE staff_role_enum AS ENUM ('waiter', 'cook', 'cleaner', 'host', 'manager', 'admin');

-- Shift attendance status
CREATE TYPE shift_status_enum AS ENUM ('scheduled', 'checked_in', 'completed', 'missed', 'late');


-- Table floor status
CREATE TYPE table_status_enum AS ENUM ('free', 'occupied', 'reserved');

-- Ingredient unit of measurement
CREATE TYPE ingredient_unit_enum AS ENUM ('gram', 'ml', 'piece');

-- Menu item category
CREATE TYPE menu_category_enum AS ENUM ('starter', 'main', 'drink', 'dessert', 'side');

-- Order sales channel
CREATE TYPE order_channel_enum AS ENUM ('dine_in', 'takeout', 'delivery');

-- Order fulfillment lifecycle status
CREATE TYPE order_status_enum AS ENUM ('placed', 'preparing', 'ready', 'served', 'paid', 'disputed', 'cancelled');

-- Payment methods accepted
CREATE TYPE payment_method_enum AS ENUM ('cbe_transfer', 'telegram', 'cash');

-- Payment verification status
CREATE TYPE payment_status_enum AS ENUM ('pending', 'confirmed', 'rejected');

-- Operational expense categories
CREATE TYPE expense_category_enum AS ENUM ('rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'misc');
```

---

## 2. Relational Tables

### 2.1 `restaurants` (Multi-tenant Root)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique restaurant ID |
| `name` | `TEXT` | `NOT NULL` | Restaurant business name |
| `address` | `TEXT` | `NOT NULL` | Physical address |
| `phone` | `TEXT` | `NOT NULL` | Contact telephone |
| `opening_hours` | `JSONB` | `DEFAULT '{}'` | Day-wise schedule `{"mon": {"open": "08:00", "close": "22:00"}}` |
| `google_business_url`| `TEXT` | `NULL` | Target URL for review redirect workflow |
| `currency` | `TEXT` | `DEFAULT 'ETB'` | Currency code (default Ethiopian Birr) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Record creation timestamp |

---

### 2.2 `staff` (HR & Legal Personnel Records)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique staff member ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Associated restaurant |
| `auth_user_id` | `UUID` | `NULL UNIQUE REFERENCES auth.users(id)` | Linked Supabase auth user (if portal login enabled) |
| `full_name` | `TEXT` | `NOT NULL` | Legal full name |
| `personal_id_number`| `TEXT` | `NOT NULL` | National ID / Fayda number |
| `personal_id_doc_url`| `TEXT` | `NULL` | Scanned National ID in Supabase Storage |
| `profile_photo_url` | `TEXT` | `NULL` | Staff avatar photo |
| `phone_number` | `TEXT` | `NOT NULL` | Primary contact number |
| `email` | `TEXT` | `NULL` | Contact email |
| `emergency_contact_name` | `TEXT` | `NOT NULL` | Emergency contact person |
| `emergency_contact_phone`| `TEXT` | `NOT NULL` | Emergency contact telephone |
| `address` | `TEXT` | `NOT NULL` | Residential home address |
| `date_of_birth` | `DATE` | `NOT NULL` | Date of birth for legal verification |
| `date_hired` | `DATE` | `DEFAULT CURRENT_DATE` | Date employee commenced work |
| `employment_status` | `employment_status_enum` | `DEFAULT 'active'` | active, on_leave, terminated |
| `role` | `staff_role_enum` | `DEFAULT 'waiter'` | Operational role |
| `pin_code_hash` | `TEXT` | `NOT NULL` | Hashed 4-6 digit PIN for shift clock-in |
| `base_salary` | `NUMERIC(12,2)` | `DEFAULT 0.00` | Monthly base salary for finance analytics |
| `permissions` | `JSONB` | `DEFAULT '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false}'` | Granular scoped access rights |
| `performance_score` | `NUMERIC(3,2)` | `DEFAULT 5.00` | Rolling weighted average from feedback (1.00-5.00) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Record creation timestamp |

---

### 2.3 `shifts` (Roster & Clock-In Tracking)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique shift ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `staff_id` | `UUID` | `REFERENCES staff(id) ON DELETE CASCADE` | Assigned staff member |
| `shift_date` | `DATE` | `NOT NULL` | Scheduled date of the shift |
| `scheduled_start` | `TIMESTAMPTZ` | `NOT NULL` | Scheduled start time |
| `scheduled_end` | `TIMESTAMPTZ` | `NOT NULL` | Scheduled end time |
| `actual_clock_in` | `TIMESTAMPTZ` | `NULL` | Timestamp verified via clock-in code + PIN |
| `actual_clock_out` | `TIMESTAMPTZ` | `NULL` | Timestamp recorded on clock-out |
| `clock_in_code` | `TEXT` | `NOT NULL` | Daily 6-digit random code generated by manager |
| `status` | `shift_status_enum` | `DEFAULT 'scheduled'` | scheduled, checked_in, completed, missed, late |
| `assigned_tables` | `UUID[]` | `DEFAULT '{}'` | Array of `tables(id)` assigned for this shift |
| `created_by` | `UUID` | `REFERENCES staff(id)` | Manager who scheduled the shift |
| `notes` | `TEXT` | `NULL` | Shift special instructions or notes |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Timestamp |

---

### 2.4 `training_checklist` (Staff Onboarding & Skills)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Item ID |
| `staff_id` | `UUID` | `REFERENCES staff(id) ON DELETE CASCADE` | Associated staff member |
| `item_name` | `TEXT` | `NOT NULL` | E.g., "Food Safety Standards", "POS System Usage" |
| `category` | `TEXT` | `DEFAULT 'General'` | E.g., "Hygiene", "Customer Service", "Kitchen" |
| `completed` | `BOOLEAN` | `DEFAULT false` | Completion flag |
| `completed_at` | `TIMESTAMPTZ` | `NULL` | Completion timestamp |
| `verified_by` | `UUID` | `REFERENCES staff(id)` | Supervisor/Manager who validated the checklist item |

---

### 2.5 `tables` (Floor Management & QR Codes)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique table ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `table_number` | `INT` | `NOT NULL` | Visual table number (e.g., Table 1, 2, 3) |
| `capacity` | `INT` | `DEFAULT 4` | Seating capacity |
| `unique_code` | `TEXT` | `UNIQUE NOT NULL` | Alpha-numeric token used in URL `/order/[code]` |
| `assigned_staff_id`| `UUID` | `REFERENCES staff(id) ON DELETE SET NULL` | Current active waiter responsible |
| `status` | `table_status_enum` | `DEFAULT 'free'` | free, occupied, reserved |
| `current_order_id` | `UUID` | `NULL` | Active unpaid/unserved order ID |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

---

### 2.6 `ingredients` (Raw Stock Tracking)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Ingredient ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `name` | `TEXT` | `NOT NULL` | E.g., "Beef Patty", "Cooking Oil", "Tomatoes" |
| `unit` | `ingredient_unit_enum` | `NOT NULL` | gram, ml, piece |
| `stock_qty` | `NUMERIC(12,3)` | `DEFAULT 0.000` | Real-time available stock balance |
| `low_stock_threshold`| `NUMERIC(12,3)` | `NOT NULL DEFAULT 10.000` | Triggers alert when `stock_qty <= threshold` |
| `cost_per_unit` | `NUMERIC(10,4)` | `NOT NULL DEFAULT 0.0000` | Cost per gram/ml/piece for COGS calculation |
| `last_restocked_at` | `TIMESTAMPTZ` | `NULL` | Timestamp of last replenishment |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Last update timestamp |

---

### 2.7 `menu_items` (Digital Catalog)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Item ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `name` | `TEXT` | `NOT NULL` | Dish name (e.g. "Special Tibs", "Injera Kitfo") |
| `description` | `TEXT` | `NULL` | Ingredients and culinary description |
| `price` | `NUMERIC(10,2)` | `NOT NULL` | Selling price |
| `category` | `menu_category_enum` | `NOT NULL` | starter, main, drink, dessert, side |
| `photo_url` | `TEXT` | `NULL` | Public image URL in Supabase Storage |
| `is_available` | `BOOLEAN` | `DEFAULT true` | Manual toggle or automatic out-of-stock toggle |
| `preparation_time_minutes` | `INT` | `DEFAULT 15` | Estimated kitchen prep time |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

---

### 2.8 `recipes` (Bill of Materials per Menu Item)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Recipe entry ID |
| `menu_item_id` | `UUID` | `REFERENCES menu_items(id) ON DELETE CASCADE` | Dish reference |
| `ingredient_id` | `UUID` | `REFERENCES ingredients(id) ON DELETE CASCADE` | Ingredient reference |
| `quantity_required`| `NUMERIC(12,3)` | `NOT NULL` | Quantity deducted per dish sold (in base unit) |

---

### 2.9 `orders` (Order Lifecycle & Headers)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Order ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `table_id` | `UUID` | `NULL REFERENCES tables(id) ON DELETE SET NULL` | Associated table (NULL for takeout/delivery) |
| `staff_id` | `UUID` | `NULL REFERENCES staff(id) ON DELETE SET NULL` | Attendant responsible |
| `channel` | `order_channel_enum` | `DEFAULT 'dine_in'` | dine_in, takeout, delivery |
| `status` | `order_status_enum` | `DEFAULT 'placed'` | placed, preparing, served, paid, cancelled |
| `total_amount` | `NUMERIC(10,2)` | `NOT NULL DEFAULT 0.00` | Gross order total |
| `calculated_cogs`| `NUMERIC(10,2)` | `DEFAULT 0.00` | Automated recipe cost snapshot for this order |
| `customer_notes` | `TEXT` | `NULL` | Special food instructions |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

---

### 2.10 `order_items` (Order Line Items)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Line item ID |
| `order_id` | `UUID` | `REFERENCES orders(id) ON DELETE CASCADE` | Parent order reference |
| `menu_item_id` | `UUID` | `REFERENCES menu_items(id)` | Menu dish reference |
| `quantity` | `INT` | `NOT NULL CHECK (quantity > 0)` | Quantity ordered |
| `unit_price` | `NUMERIC(10,2)` | `NOT NULL` | Price snapshot at time of purchase |
| `subtotal` | `NUMERIC(10,2)` | `NOT NULL` | `quantity * unit_price` |

---

### 2.11 `payments` (Settlement & Verification)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Payment ID |
| `order_id` | `UUID` | `REFERENCES orders(id) ON DELETE CASCADE` | Order reference |
| `method` | `payment_method_enum` | `NOT NULL` | cbe_transfer, telegram, cash |
| `amount` | `NUMERIC(10,2)` | `NOT NULL` | Amount paid |
| `transaction_reference`| `TEXT` | `NULL` | Bank confirmation code or Telegram TX ID |
| `receipt_image_url` | `TEXT` | `NULL` | Uploaded transfer screenshot in Storage |
| `status` | `payment_status_enum` | `DEFAULT 'pending'` | pending, confirmed, rejected |
| `confirmed_by` | `UUID` | `NULL REFERENCES staff(id)` | Staff member who verified physical cash/transfer |
| `confirmed_at` | `TIMESTAMPTZ` | `NULL` | Verification timestamp |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Submission timestamp |

---

### 2.12 `feedback` (Internal Rating & Reputation Engine)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Feedback ID |
| `order_id` | `UUID` | `UNIQUE REFERENCES orders(id) ON DELETE CASCADE`| One feedback per order |
| `staff_id` | `UUID` | `NULL REFERENCES staff(id) ON DELETE SET NULL` | Attendant rated |
| `staff_rating_q1` | `INT` | `CHECK (staff_rating_q1 BETWEEN 1 AND 5)` | Staff Friendliness & Courteousness (1-5) |
| `staff_rating_q2` | `INT` | `CHECK (staff_rating_q2 BETWEEN 1 AND 5)` | Staff Speed & Accuracy (1-5) |
| `experience_rating_food`| `INT`| `CHECK (experience_rating_food BETWEEN 1 AND 5)` | Taste & Temperature (1-5) |
| `experience_rating_speed`| `INT`| `CHECK (experience_rating_speed BETWEEN 1 AND 5)` | Order Delivery Speed (1-5) |
| `experience_rating_ambience`|`INT`|`CHECK (experience_rating_ambience BETWEEN 1 AND 5)`| Cleanliness & Music/Atmosphere (1-5) |
| `weighted_score` | `NUMERIC(3,2)` | `NOT NULL` | Calculated composite score (1.00-5.00) |
| `customer_comment` | `TEXT` | `NULL` | Optional private feedback text |
| `redirected_to_google`| `BOOLEAN`| `DEFAULT false` | Flag if score >= 4.0 and routed to Google Review |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Feedback submission timestamp |

---

### 2.13 `expenses` (Operational Expenditure for Net Profit)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Expense ID |
| `restaurant_id` | `UUID` | `REFERENCES restaurants(id) ON DELETE CASCADE` | Restaurant reference |
| `category` | `expense_category_enum` | `NOT NULL` | rent, utilities, salaries, supplies, misc |
| `title` | `TEXT` | `NOT NULL` | Description of expenditure |
| `amount` | `NUMERIC(12,2)` | `NOT NULL CHECK (amount > 0)` | Expense amount |
| `expense_date` | `DATE` | `DEFAULT CURRENT_DATE` | Accounting date |
| `logged_by` | `UUID` | `REFERENCES staff(id)` | Manager who entered the record |
| `receipt_url` | `TEXT` | `NULL` | Invoice/receipt image |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Timestamp |

---

## 3. Automated Triggers & Functions

### 3.1 Automatic Recipe Stock Deduction & COGS Calculation
When an order item is inserted into `order_items`:
1. Find all ingredients in `recipes` for the ordered `menu_item_id`.
2. Deduct `quantity_required * order_items.quantity` from `ingredients.stock_qty`.
3. Compute total cost: `SUM(recipes.quantity_required * ingredients.cost_per_unit * order_items.quantity)`.
4. Update `orders.calculated_cogs`.

### 3.2 Rolling Staff Performance Score Update
When a row is inserted in `feedback`:
1. Calculate `weighted_score = (staff_rating_q1 * 0.25) + (staff_rating_q2 * 0.25) + (experience_rating_food * 0.20) + (experience_rating_speed * 0.15) + (experience_rating_ambience * 0.15)`.
2. Re-calculate rolling average for `staff_id`: `SELECT AVG(weighted_score) FROM feedback WHERE staff_id = NEW.staff_id`.
3. Update `staff.performance_score`.

### 3.3 Table Status Auto-Transition
1. When `orders` is placed with `table_id`, set `tables.status = 'occupied'` and `tables.current_order_id = orders.id`.
2. When payment status becomes `confirmed`, set `tables.status = 'free'` and `tables.current_order_id = NULL`.

### 3.4 Order Item Dispute & Cancellation Inventory Reversal
When `orders.status` changes to `'cancelled'` or `'disputed'`, or an item in `order_items` is flagged:
1. Lookup the BOM recipe for the affected `menu_item_id`.
2. Restore deducted quantities: `ingredients.stock_qty = ingredients.stock_qty + (recipes.quantity_required * order_items.quantity)`.
3. Subtract the cost from `orders.calculated_cogs`.
