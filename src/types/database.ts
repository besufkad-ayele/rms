export type EmploymentStatus = "active" | "on_leave" | "terminated";
export type StaffRole = "waiter" | "cook" | "cleaner" | "host" | "manager" | "admin";
export type ShiftStatus = "scheduled" | "checked_in" | "completed" | "missed" | "late";
export type TableStatus = "free" | "occupied" | "reserved";
export type IngredientUnit = "gram" | "ml" | "piece";
export type MenuCategory = "starter" | "main" | "drink" | "dessert" | "side";
export type OrderChannel = "dine_in" | "takeout" | "delivery";
export type OrderStatus = "placed" | "preparing" | "ready" | "served" | "paid" | "disputed" | "cancelled";
export type PaymentMethod = "cbe_transfer" | "telegram" | "cash";
export type PaymentStatus = "pending" | "confirmed" | "rejected";
export type ExpenseCategory = "rent" | "utilities" | "salaries" | "supplies" | "maintenance" | "misc";

export interface StaffPermissions {
  can_manage_inventory: boolean;
  can_view_finance: boolean;
  can_manage_shifts: boolean;
  can_manage_staff: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_hours?: Record<string, { open: string; close: string }>;
  google_business_url?: string | null;
  currency: string;
  created_at: string;
}

export interface Staff {
  id: string;
  restaurant_id: string;
  auth_user_id?: string | null;
  full_name: string;
  personal_id_number: string;
  personal_id_doc_url?: string | null;
  profile_photo_url?: string | null;
  phone_number: string;
  email?: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  date_of_birth: string;
  date_hired: string;
  employment_status: EmploymentStatus;
  role: StaffRole;
  pin_code_hash: string;
  base_salary: number;
  permissions: StaffPermissions;
  performance_score: number;
  created_at: string;
}

export interface Shift {
  id: string;
  restaurant_id: string;
  staff_id: string;
  shift_date: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_clock_in?: string | null;
  actual_clock_out?: string | null;
  clock_in_code: string;
  status: ShiftStatus;
  assigned_tables: string[];
  created_by?: string | null;
  notes?: string | null;
  created_at: string;
  staff?: Staff;
}

export interface TrainingChecklistItem {
  id: string;
  staff_id: string;
  item_name: string;
  category: string;
  completed: boolean;
  completed_at?: string | null;
  verified_by?: string | null;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  unique_code: string;
  assigned_staff_id?: string | null;
  status: TableStatus;
  current_order_id?: string | null;
  created_at: string;
  assigned_staff?: Staff | null;
}

export interface Ingredient {
  id: string;
  restaurant_id: string;
  name: string;
  unit: IngredientUnit;
  stock_qty: number;
  low_stock_threshold: number;
  cost_per_unit: number;
  last_restocked_at?: string | null;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string | null;
  price: number;
  category: MenuCategory;
  photo_url?: string | null;
  is_available: boolean;
  preparation_time_minutes: number;
  created_at: string;
}

export interface RecipeItem {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity_required: number;
  ingredient?: Ingredient;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string | null;
  staff_id?: string | null;
  channel: OrderChannel;
  status: OrderStatus;
  total_amount: number;
  calculated_cogs: number;
  customer_notes?: string | null;
  created_at: string;
  table?: RestaurantTable | null;
  staff?: Staff | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_cancelled: boolean;
  created_at: string;
  menu_item?: MenuItem;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  transaction_reference?: string | null;
  receipt_image_url?: string | null;
  status: PaymentStatus;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  created_at: string;
}

export interface CustomerFeedback {
  id: string;
  order_id: string;
  staff_id?: string | null;
  staff_rating_q1: number;
  staff_rating_q2: number;
  experience_rating_food: number;
  experience_rating_speed: number;
  experience_rating_ambience: number;
  weighted_score: number;
  customer_comment?: string | null;
  redirected_to_google: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  restaurant_id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expense_date: string;
  logged_by?: string | null;
  receipt_url?: string | null;
  created_at: string;
}
