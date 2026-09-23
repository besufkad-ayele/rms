"use client";

import { useState } from "react";
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Shield,
} from "lucide-react";
import type {
  Staff,
  StaffRole,
  EmploymentStatus,
  ModuleAccessFlags,
} from "@/types/database";
import { ADMIN_MODULES, type ModuleId } from "@/lib/modules/registry";

type ManageDraft = {
  full_name: string;
  personal_id_number: string;
  phone_number: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  date_of_birth: string;
  role: StaffRole;
  employment_status: EmploymentStatus;
  base_salary: number;
  newPin: string;
  modules: Required<ModuleAccessFlags>;
};

function modulesFromStaff(staff: Staff): Required<ModuleAccessFlags> {
  const m = staff.permissions?.modules || {};
  return {
    live: m.live ?? true,
    hr: m.hr ?? !!(staff.permissions?.can_manage_staff || staff.permissions?.can_manage_shifts),
    delivery: m.delivery ?? true,
    operations: m.operations ?? !!staff.permissions?.can_manage_inventory,
    sales: m.sales ?? !!staff.permissions?.can_view_finance,
    products: m.products ?? true,
    marketing: m.marketing ?? true,
  };
}

function toDraft(staff: Staff): ManageDraft {
  return {
    full_name: staff.full_name,
    personal_id_number: staff.personal_id_number,
    phone_number: staff.phone_number,
    email: staff.email || "",
    emergency_contact_name: staff.emergency_contact_name,
    emergency_contact_phone: staff.emergency_contact_phone,
    address: staff.address,
    date_of_birth: staff.date_of_birth,
    role: staff.role,
    employment_status: staff.employment_status,
    base_salary: Number(staff.base_salary) || 0,
    newPin: "",
    modules: modulesFromStaff(staff),
  };
}

export default function ManageStaffModal({
  staff,
  isPending,
  onClose,
  onSave,
  onDelete,
}: {
  staff: Staff;
  isPending: boolean;
  onClose: () => void;
  onSave: (draft: ManageDraft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<ManageDraft>(() => toDraft(staff));
  const [showPin, setShowPin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setField = <K extends keyof ManageDraft>(key: K, value: ManageDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleModule = (id: ModuleId) => {
    setDraft((prev) => ({
      ...prev,
      modules: { ...prev.modules, [id]: !prev.modules[id] },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-card border border-divider bg-white shadow-elevated sm:my-4 sm:max-h-[92vh] sm:rounded-card">
        <div className="flex shrink-0 items-start justify-between border-b border-divider p-4 sm:p-6">
          <div className="min-w-0 pr-2">
            <h2 className="font-display text-lg font-bold text-brand-primary sm:text-xl">
              Manage Personnel · {staff.full_name}
            </h2>
            <p className="text-xs text-brand-secondary">
              Full profile, module access, PIN reset, and employment controls.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-button p-1 text-brand-secondary hover:bg-bg-subtle hover:text-brand-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          {(
            [
              ["full_name", "Legal Full Name", "text"],
              ["personal_id_number", "Fayda / National ID", "text"],
              ["phone_number", "Phone", "text"],
              ["email", "Email", "email"],
              ["emergency_contact_name", "Emergency Contact", "text"],
              ["emergency_contact_phone", "Emergency Phone", "text"],
              ["address", "Address", "text"],
              ["date_of_birth", "Date of Birth", "date"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <label className="mb-1 block font-bold text-brand-primary">{label}</label>
              <input
                type={type}
                value={draft[key] as string}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full rounded-button border border-divider bg-bg-subtle px-3 py-2 text-xs text-brand-primary focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          ))}

          <div>
            <label className="mb-1 block font-bold text-brand-primary">Role</label>
            <select
              value={draft.role}
              onChange={(e) => setField("role", e.target.value as StaffRole)}
              className="w-full rounded-button border border-divider bg-bg-subtle px-3 py-2 capitalize"
            >
              {["waiter", "cashier", "cook", "manager", "cleaner", "host", "admin"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-bold text-brand-primary">Employment Status</label>
            <select
              value={draft.employment_status}
              onChange={(e) => setField("employment_status", e.target.value as EmploymentStatus)}
              className="w-full rounded-button border border-divider bg-bg-subtle px-3 py-2 capitalize"
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-bold text-brand-primary">Base Salary (ETB)</label>
            <input
              type="number"
              value={draft.base_salary}
              onChange={(e) => setField("base_salary", Number(e.target.value) || 0)}
              className="w-full rounded-button border border-divider bg-bg-subtle px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-brand-primary">Reset PIN / Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-secondary" />
              <input
                type={showPin ? "text" : "password"}
                value={draft.newPin}
                onChange={(e) => setField("newPin", e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full rounded-button border border-divider bg-bg-subtle py-2 pl-9 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-card border border-divider bg-bg-subtle/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Module Access
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ADMIN_MODULES.map((mod) => (
              <label
                key={mod.id}
                className="flex cursor-pointer items-center gap-2 rounded-button border border-divider bg-white px-3 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={!!draft.modules[mod.id]}
                  onChange={() => toggleModule(mod.id)}
                  className="accent-brand-accent"
                />
                <span className="font-semibold text-brand-primary">{mod.shortName}</span>
              </label>
            ))}
          </div>
        </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-divider bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-button border border-status-danger/30 bg-status-danger-bg px-3 py-2 text-xs font-bold text-status-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Terminate Record
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-status-danger">Confirm terminate?</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={onDelete}
                  className="rounded-button bg-status-danger px-3 py-1.5 text-xs font-bold text-white"
                >
                  Yes, terminate
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-button border border-divider px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-button border border-divider bg-white px-4 py-2 text-xs font-semibold text-brand-secondary sm:flex-none"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSave(draft)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-button bg-brand-accent px-5 py-2 text-xs font-semibold text-white hover:bg-brand-accentHover sm:flex-none"
            >
              <Save className="h-3.5 w-3.5" />
              {isPending ? "Saving…" : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { ManageDraft };
