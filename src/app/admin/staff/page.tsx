"use client";

import { useState, useTransition } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  FileBadge,
  Phone,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Staff, StaffRole, EmploymentStatus } from "@/types/database";
import { createStaffMember, updateStaffPermissions } from "./actions";

// Default initial records for high-fidelity interactive experience
const initialStaffList: Staff[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Abebe Kebede",
    personal_id_number: "ETH-FAYDA-98234120",
    phone_number: "+251911001122",
    email: "owner@admasrms.com",
    emergency_contact_name: "Sara Kebede (Spouse)",
    emergency_contact_phone: "+251911998877",
    address: "Bole, House 412, Addis Ababa",
    date_of_birth: "1985-04-12",
    date_hired: "2024-01-01",
    employment_status: "active",
    role: "admin",
    pin_code_hash: "123456",
    base_salary: 0.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: true,
      can_manage_shifts: true,
      can_manage_staff: true,
    },
    performance_score: 5.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Tigist Haile",
    personal_id_number: "ETH-FAYDA-48192031",
    phone_number: "+251922334455",
    email: "manager@admasrms.com",
    emergency_contact_name: "Haile Wolde (Father)",
    emergency_contact_phone: "+251922887766",
    address: "Gerji, Condominium Blk 14, Addis Ababa",
    date_of_birth: "1991-08-20",
    date_hired: "2024-02-15",
    employment_status: "active",
    role: "manager",
    pin_code_hash: "123456",
    base_salary: 25000.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: true,
      can_manage_shifts: true,
      can_manage_staff: true,
    },
    performance_score: 4.95,
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Dawit Yohannes",
    personal_id_number: "ETH-FAYDA-67291048",
    phone_number: "+251933445566",
    email: "dawit.y@admasrms.com",
    emergency_contact_name: "Almaz Tadesse (Mother)",
    emergency_contact_phone: "+251933009988",
    address: "Megenaña, Kebele 08, Addis Ababa",
    date_of_birth: "1997-11-05",
    date_hired: "2024-03-01",
    employment_status: "active",
    role: "waiter",
    pin_code_hash: "123456",
    base_salary: 8500.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.82,
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Kalkidan Bekele",
    personal_id_number: "ETH-FAYDA-23847192",
    phone_number: "+251944556677",
    email: "kalkidan.b@admasrms.com",
    emergency_contact_name: "Bekele Megersa (Father)",
    emergency_contact_phone: "+251944112233",
    address: "Sarbet, House 102, Addis Ababa",
    date_of_birth: "1995-03-14",
    date_hired: "2024-03-10",
    employment_status: "active",
    role: "cook",
    pin_code_hash: "123456",
    base_salary: 14000.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.9,
    created_at: new Date().toISOString(),
  },
];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaffList);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesFilter = activeFilter === "all" || s.role === activeFilter;
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.personal_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // KPI Calculations
  const totalStaff = staffList.length;
  const totalManagers = staffList.filter((s) => s.role === "manager" || s.role === "admin").length;
  const avgPerformance = (
    staffList.reduce((acc, curr) => acc + (curr.performance_score || 5), 0) / totalStaff
  ).toFixed(2);

  // Handle staff registration submission
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success && res.staff) {
        setStaffList((prev) => [res.staff, ...prev]);
        setIsRegisterOpen(false);
        form.reset();
      }
    });
  };

  // Handle permission update submission
  const handlePermissionSave = async () => {
    if (!selectedStaff) return;
    startTransition(async () => {
      await updateStaffPermissions(
        selectedStaff.id,
        selectedStaff.role,
        selectedStaff.permissions,
        selectedStaff.employment_status
      );
      setStaffList((prev) =>
        prev.map((s) => (s.id === selectedStaff.id ? { ...selectedStaff } : s))
      );
      setSelectedStaff(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-pill bg-bg-active px-3 py-1 text-xs font-semibold text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Phase 1: Owner, Manager & Staff HR
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-primary mt-2">
            Staff & Operational Personnel
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Manage legal records, Fayda national IDs, scoped permissions, and clock-in PINs.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          Register New Staff
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Total Headcount</span>
            <Users className="h-4 w-4 text-brand-accent" />
          </div>
          <p className="font-display text-2xl font-bold text-brand-primary mt-2">
            {totalStaff} Active Staff
          </p>
          <p className="text-[11px] text-status-free mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> All legal Fayda IDs registered
          </p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Admin & Delegated</span>
            <Shield className="h-4 w-4 text-status-reserved" />
          </div>
          <p className="font-display text-2xl font-bold text-brand-primary mt-2">
            {totalManagers} Managers
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Scoped operational rights</p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Staff Rating</span>
            <Star className="h-4 w-4 text-status-occupied" />
          </div>
          <p className="font-display text-2xl font-bold text-brand-primary mt-2">
            {avgPerformance} / 5.0
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">From live guest feedback</p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Base Payroll</span>
            <DollarSign className="h-4 w-4 text-status-free" />
          </div>
          <p className="font-display text-2xl font-bold text-brand-primary mt-2">
            {staffList
              .reduce((acc, curr) => acc + (Number(curr.base_salary) || 0), 0)
              .toLocaleString()}{" "}
            ETB
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Automated OPEX integration</p>
        </div>
      </div>

      {/* Main Staff Registry Panel */}
      <div className="rounded-card border border-divider bg-white shadow-card overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-subtle/60">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["all", "admin", "manager", "waiter", "cook", "cleaner"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveFilter(role)}
                className={`px-3 py-1.5 rounded-button text-xs font-bold capitalize transition ${
                  activeFilter === role
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search name, phone, Fayda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-button bg-white border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-bg-subtle/30 text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Role & Status</th>
                <th className="py-3 px-5">National ID (Fayda)</th>
                <th className="py-3 px-5">Contact & Emergency</th>
                <th className="py-3 px-5">Scoped Permissions</th>
                <th className="py-3 px-5">Base Salary</th>
                <th className="py-3 px-5">Score</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-xs font-sans">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-bg-subtle/50 transition">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-pill bg-bg-active border border-divider text-brand-primary font-bold text-xs flex items-center justify-center">
                        {staff.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-brand-primary text-sm">{staff.full_name}</p>
                        <p className="text-[11px] text-brand-secondary">{staff.email || "No email"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-pill text-[11px] font-bold capitalize ${
                          staff.role === "admin"
                            ? "bg-brand-primary text-white"
                            : staff.role === "manager"
                            ? "bg-status-reserved-bg text-status-reserved"
                            : staff.role === "waiter"
                            ? "bg-status-occupied-bg text-status-occupied"
                            : staff.role === "cook"
                            ? "bg-status-prep-bg text-status-prep"
                            : "bg-bg-active text-brand-primary"
                        }`}
                      >
                        {staff.role}
                      </span>
                      <p className="text-[10px] text-status-free font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-free" />
                        {staff.employment_status}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-brand-primary">
                      <FileBadge className="h-3.5 w-3.5 text-brand-accent" />
                      <span>{staff.personal_id_number}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <p className="font-medium text-brand-primary">{staff.phone_number}</p>
                    <p className="text-[11px] text-brand-secondary">
                      ICE: {staff.emergency_contact_name} ({staff.emergency_contact_phone})
                    </p>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {staff.permissions.can_manage_inventory && (
                        <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                          Inventory
                        </span>
                      )}
                      {staff.permissions.can_view_finance && (
                        <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                          Finance
                        </span>
                      )}
                      {staff.permissions.can_manage_shifts && (
                        <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                          Shifts
                        </span>
                      )}
                      {staff.permissions.can_manage_staff && (
                        <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                          HR Admin
                        </span>
                      )}
                      {!Object.values(staff.permissions).some(Boolean) && (
                        <span className="text-[11px] text-brand-secondary italic">Standard</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold text-brand-primary">
                    {staff.base_salary ? `${Number(staff.base_salary).toLocaleString()} ETB` : "—"}
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary">
                      <Star className="h-3.5 w-3.5 fill-status-occupied text-status-occupied" />
                      <span>{staff.performance_score || "5.0"}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setSelectedStaff(staff)}
                      className="inline-flex items-center gap-1 rounded-button border border-divider bg-white px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-bg-subtle hover:text-brand-accent transition shadow-xs"
                    >
                      <Sliders className="h-3 w-3" />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-card border border-divider bg-white p-6 shadow-elevated my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-primary">
                  Register New Personnel Record
                </h2>
                <p className="text-xs text-brand-secondary">
                  Legal compliance, Fayda ID, emergency contact and role delegation.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="rounded-button p-1 text-brand-secondary hover:bg-bg-subtle hover:text-brand-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Legal Full Name *
                  </label>
                  <input
                    name="full_name"
                    required
                    placeholder="e.g. Almaz Bekele"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    National ID / Fayda Number *
                  </label>
                  <input
                    name="personal_id_number"
                    required
                    placeholder="ETH-FAYDA-XXXXXX"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Phone Number *
                  </label>
                  <input
                    name="phone_number"
                    required
                    placeholder="+2519XXXXXXXX"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="staff@admasrms.com"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    name="emergency_contact_name"
                    required
                    placeholder="Parent / Spouse name"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    name="emergency_contact_phone"
                    required
                    placeholder="+2519XXXXXXXX"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    defaultValue="1998-01-01"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Residential Address *
                  </label>
                  <input
                    name="address"
                    required
                    placeholder="Sub-city, House number, City"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Operational Role *
                  </label>
                  <select
                    name="role"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent capitalize"
                  >
                    <option value="waiter">Waiter / Attendant</option>
                    <option value="cook">Kitchen Cook / Chef</option>
                    <option value="manager">Operational Manager</option>
                    <option value="cleaner">Facility Cleaner</option>
                    <option value="host">Host / Reception</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Monthly Base Salary (ETB)
                  </label>
                  <input
                    type="number"
                    name="base_salary"
                    placeholder="e.g. 12000"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-primary mb-1">
                    Clock-In Secret PIN (4-6 digits) *
                  </label>
                  <input
                    type="password"
                    name="pin_code"
                    maxLength={6}
                    defaultValue="123456"
                    placeholder="123456"
                    className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Granular Scoped Permissions */}
              <div className="rounded-card border border-divider bg-bg-subtle p-4 space-y-2 mt-4">
                <p className="font-bold text-brand-primary text-xs flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-brand-accent" />
                  Granular Scoped Permissions
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="can_manage_inventory" className="rounded" />
                    <span>Manage Inventory & BOM</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="can_view_finance" className="rounded" />
                    <span>View Financial P&L</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="can_manage_shifts" className="rounded" />
                    <span>Schedule Roster & Shifts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="can_manage_staff" className="rounded" />
                    <span>Register / Edit Staff</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-button border border-divider bg-white text-xs font-semibold text-brand-secondary hover:text-brand-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-button bg-brand-accent text-xs font-semibold text-white hover:bg-brand-accent-hover transition"
                >
                  {isPending ? "Registering..." : "Save Personnel Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission & Role Delegation Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-card border border-divider bg-white p-6 shadow-elevated">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-primary">
                  Manage Access: {selectedStaff.full_name}
                </h2>
                <p className="text-xs text-brand-secondary">
                  Fayda: {selectedStaff.personal_id_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="rounded-button p-1 text-brand-secondary hover:bg-bg-subtle hover:text-brand-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-primary mb-1">Operational Role</label>
                <select
                  value={selectedStaff.role}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      role: e.target.value as StaffRole,
                    })
                  }
                  className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary capitalize"
                >
                  <option value="waiter">Waiter</option>
                  <option value="cook">Cook</option>
                  <option value="manager">Manager</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="host">Host</option>
                  <option value="admin">Admin (Owner level)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-primary mb-1">Employment Status</label>
                <select
                  value={selectedStaff.employment_status}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      employment_status: e.target.value as EmploymentStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary capitalize"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="rounded-card border border-divider bg-bg-subtle p-4 space-y-2">
                <p className="font-bold text-brand-primary text-xs">Scoped Module Access Rights</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaff.permissions.can_manage_inventory}
                      onChange={(e) =>
                        setSelectedStaff({
                          ...selectedStaff,
                          permissions: {
                            ...selectedStaff.permissions,
                            can_manage_inventory: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span>Can Manage Inventory & BOM</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaff.permissions.can_view_finance}
                      onChange={(e) =>
                        setSelectedStaff({
                          ...selectedStaff,
                          permissions: {
                            ...selectedStaff.permissions,
                            can_view_finance: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span>Can View Financial P&L & Revenue</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaff.permissions.can_manage_shifts}
                      onChange={(e) =>
                        setSelectedStaff({
                          ...selectedStaff,
                          permissions: {
                            ...selectedStaff.permissions,
                            can_manage_shifts: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span>Can Schedule Shifts & Clock-in Codes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStaff.permissions.can_manage_staff}
                      onChange={(e) =>
                        setSelectedStaff({
                          ...selectedStaff,
                          permissions: {
                            ...selectedStaff.permissions,
                            can_manage_staff: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span>Can Register & Edit Staff HR</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="px-4 py-2 rounded-button border border-divider bg-white text-xs font-semibold text-brand-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePermissionSave}
                  disabled={isPending}
                  className="px-5 py-2 rounded-button bg-brand-accent text-xs font-semibold text-white hover:bg-brand-accent-hover transition"
                >
                  {isPending ? "Saving..." : "Update Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
