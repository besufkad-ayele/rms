-- Add dedicated cashier staff role (Postgres enum values are additive-only).
DO $$ BEGIN
  ALTER TYPE staff_role_enum ADD VALUE IF NOT EXISTS 'cashier';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Seed demo cashier for /staff-login (PIN: 123456 — hashed on first login)
INSERT INTO public.staff (
  id,
  restaurant_id,
  full_name,
  personal_id_number,
  phone_number,
  email,
  emergency_contact_name,
  emergency_contact_phone,
  address,
  date_of_birth,
  date_hired,
  employment_status,
  role,
  pin_code_hash,
  base_salary,
  permissions,
  performance_score,
  created_at
) VALUES (
  'b0000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Hanna Getachew (Cashier)',
  'ETH-FAYDA-88410275',
  '+251966778899',
  'cashier@tibebrms.com',
  'Getachew Alemu (Father)',
  '+251966112233',
  'Bole Atlas, Addis Ababa',
  '1995-09-07',
  '2024-04-01',
  'active',
  'cashier',
  '123456',
  11000.00,
  '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}',
  4.90,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  pin_code_hash = EXCLUDED.pin_code_hash,
  role = EXCLUDED.role,
  employment_status = EXCLUDED.employment_status;
