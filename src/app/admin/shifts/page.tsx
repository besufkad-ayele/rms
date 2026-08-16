"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  UtensilsCrossed,
  ShieldCheck,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getShiftsData,
  createShiftAction,
  updateShiftStatusAction,
  regenerateShiftCodeAction,
  MockShiftItem,
} from "./actions";

export default function ShiftsRosterPage() {
  const [isPending, startTransition] = useTransition();

  const [shifts, setShifts] = useState<MockShiftItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>("Sara Mengistu");
  const [newStaffRole, setNewStaffRole] = useState<string>("waiter");
  const [newShiftDate, setNewShiftDate] = useState<string>("2026-08-15");
  const [newStartTime, setNewStartTime] = useState<string>("11:00 AM");
  const [newEndTime, setNewEndTime] = useState<string>("07:00 PM");
  const [newAssignedTables, setNewAssignedTables] = useState<string>("T-01, T-02, T-03");
  const [newNotes, setNewNotes] = useState<string>("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getShiftsData();
    setShifts(data.shifts);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered shifts
  const filteredShifts = shifts.filter((shf) => {
    const matchRole = selectedRole === "all" || shf.staffRole === selectedRole;
    const matchStatus = selectedStatus === "all" || shf.status === selectedStatus;
    const matchSearch =
      searchQuery === "" ||
      shf.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shf.clockInCode.includes(searchQuery) ||
      shf.assignedTables.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchStatus && matchSearch;
  });

  const checkedInCount = shifts.filter((s) => s.status === "checked_in").length;
  const lateCount = shifts.filter((s) => s.status === "late").length;
  const scheduledCount = shifts.filter((s) => s.status === "scheduled").length;
  const completedCount = shifts.filter((s) => s.status === "completed").length;

  const handleStatusChange = (
    shiftId: string,
    status: "scheduled" | "checked_in" | "late" | "completed" | "missed"
  ) => {
    startTransition(async () => {
      const res = await updateShiftStatusAction(shiftId, status);
      if (res.success) {
        setShifts(res.shifts);
        showToast(`Shift status updated to ${status.toUpperCase()}`);
      }
    });
  };

  const handleRegenerateCode = (shiftId: string) => {
    startTransition(async () => {
      const res = await regenerateShiftCodeAction(shiftId);
      if (res.success) {
        showToast(`New Clock-In Code: ${res.newCode}`);
        loadData();
      }
    });
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const tablesArray = newAssignedTables
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      const res = await createShiftAction({
        staffId: `stf-${Date.now()}`,
        staffName: newStaffName,
        staffRole: newStaffRole,
        shiftDate: newShiftDate,
        scheduledStart: newStartTime,
        scheduledEnd: newEndTime,
        assignedTables: tablesArray,
        notes: newNotes,
      });

      if (res.success) {
        setShowScheduleModal(false);
        showToast(`Shift scheduled for ${newStaffName} (Code: ${res.shift.clockInCode})`);
        loadData();
      }
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <CalendarDays className="h-3 w-3" />
              Module 01: Operations &amp; HR
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Dispute-Proof Attendance &amp; PIN Verification
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Shift Scheduler &amp; Live Attendance Roster
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Auto-generate 6-digit shift clock-in codes, assign tables, detect schedule conflicts, and track actual hours worked.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Shift</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Roster"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Shift Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Currently On Shift
            </p>
            <p className="font-header text-2xl font-bold text-status-free mt-1">
              {checkedInCount} Staff
            </p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Late Arrivals
            </p>
            <p className="font-header text-2xl font-bold text-status-occupied mt-1">
              {lateCount} Late
            </p>
          </div>
          <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Upcoming Scheduled
            </p>
            <p className="font-header text-2xl font-bold text-brand-primary mt-1">
              {scheduledCount} Shifts
            </p>
          </div>
          <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary">
            <CalendarDays className="h-5 w-5 text-brand-accent" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Completed Today
            </p>
            <p className="font-header text-2xl font-bold text-brand-secondary mt-1">
              {completedCount} Shifts
            </p>
          </div>
          <div className="rounded-xl bg-bg-subtle p-2.5 text-brand-secondary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Active Floor Code Notice Banner */}
      <div className="rounded-card bg-brand-primary text-white p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-accent shrink-0">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-header text-sm font-bold text-white">
              Floor Terminal 2-Factor Clock-In Active
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Staff enter their assigned 6-digit shift code + their secret 4-digit PIN on the terminal to clock in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-button px-3.5 py-2 text-xs font-mono">
          <span className="text-white/70">Today:</span>
          <span className="font-bold text-white tracking-wider">
            Saturday, August 15, 2026
          </span>
        </div>
      </div>

      {/* Roster Table Container */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-divider">
          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Roles" },
              { id: "waiter", label: "Waiters" },
              { id: "cook", label: "Kitchen Cooks" },
              { id: "cleaner", label: "Cleaners" },
              { id: "host", label: "Hosts" },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold transition",
                  selectedRole === role.id
                    ? "bg-brand-primary text-white"
                    : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                )}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
            <input
              type="text"
              placeholder="Search staff, code, or tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* Shifts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Staff Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Scheduled Window</th>
                <th className="pb-3">Clock-In / Out</th>
                <th className="pb-3">Shift Code</th>
                <th className="pb-3">Assigned Tables</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60">
              {filteredShifts.map((shf) => {
                const isCheckedIn = shf.status === "checked_in";
                const isLate = shf.status === "late";
                const isScheduled = shf.status === "scheduled";
                const isCompleted = shf.status === "completed";

                return (
                  <tr key={shf.id} className="hover:bg-bg-subtle/50 transition">
                    {/* Staff Name */}
                    <td className="py-3.5 pl-2 font-bold text-brand-primary">
                      <div>
                        <p>{shf.staffName}</p>
                        {shf.notes && (
                          <p className="text-[10px] text-brand-secondary font-normal italic">
                            {shf.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 capitalize font-medium text-brand-secondary">
                      {shf.staffRole}
                    </td>

                    {/* Scheduled Times */}
                    <td className="py-3.5 font-semibold text-brand-primary">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-secondary" />
                        <span>
                          {shf.scheduledStart} – {shf.scheduledEnd}
                        </span>
                      </div>
                    </td>

                    {/* Actual Clock in / out */}
                    <td className="py-3.5">
                      {shf.actualClockIn ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-brand-primary">
                            In: {shf.actualClockIn}
                          </p>
                          {shf.actualClockOut && (
                            <p className="text-[10px] text-brand-secondary">
                              Out: {shf.actualClockOut}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-brand-secondary italic">Awaiting Check-in</span>
                      )}
                    </td>

                    {/* Shift Code */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="rounded-button bg-bg-card px-2 py-0.5 font-bold text-brand-primary border border-divider">
                          {shf.clockInCode}
                        </span>
                        <button
                          onClick={() => handleRegenerateCode(shf.id)}
                          title="Generate New Code"
                          className="text-brand-secondary hover:text-brand-accent p-0.5"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Assigned Tables */}
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {shf.assignedTables.length === 0 ? (
                          <span className="text-brand-secondary text-[11px]">—</span>
                        ) : (
                          shf.assignedTables.map((tbl) => (
                            <span
                              key={tbl}
                              className="rounded-pill bg-bg-card px-1.5 py-0.5 text-[10px] font-bold text-brand-primary border border-divider"
                            >
                              {tbl}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5">
                      <span
                        className={cn(
                          "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          isCheckedIn && "bg-status-free-bg text-status-free border border-status-free/20",
                          isLate && "bg-status-occupied-bg text-status-occupied border border-status-occupied/30",
                          isScheduled && "bg-bg-card text-brand-secondary border border-divider",
                          isCompleted && "bg-bg-subtle text-brand-primary"
                        )}
                      >
                        {shf.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isScheduled && (
                          <button
                            onClick={() => handleStatusChange(shf.id, "checked_in")}
                            className="rounded-button bg-status-free px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 transition"
                          >
                            Check In
                          </button>
                        )}
                        {isCheckedIn && (
                          <button
                            onClick={() => handleStatusChange(shf.id, "completed")}
                            className="rounded-button bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 transition"
                          >
                            Clock Out
                          </button>
                        )}
                        {isLate && (
                          <button
                            onClick={() => handleStatusChange(shf.id, "completed")}
                            className="rounded-button bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 transition"
                          >
                            Clock Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Shift Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Schedule New Shift
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Staff Member:
                </label>
                <select
                  value={newStaffName}
                  onChange={(e) => {
                    setNewStaffName(e.target.value);
                    if (e.target.value.includes("Lemma") || e.target.value.includes("Tesfaye")) {
                      setNewStaffRole("cook");
                    } else if (e.target.value.includes("Gebre")) {
                      setNewStaffRole("cleaner");
                    } else if (e.target.value.includes("Bekele")) {
                      setNewStaffRole("host");
                    } else {
                      setNewStaffRole("waiter");
                    }
                  }}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs font-semibold text-brand-primary"
                >
                  <option value="Sara Mengistu">Sara Mengistu (Waiter)</option>
                  <option value="Michael Tadesse">Michael Tadesse (Waiter)</option>
                  <option value="Eden Haile">Eden Haile (Waiter)</option>
                  <option value="Dawit Bekele">Dawit Bekele (Host)</option>
                  <option value="Kassahun Lemma">Kassahun Lemma (Cook)</option>
                  <option value="Marta Tesfaye">Marta Tesfaye (Cook)</option>
                  <option value="Yared Gebre">Yared Gebre (Cleaner)</option>
                  <option value="Senait Alemu">Senait Alemu (Waiter)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Start Time:
                  </label>
                  <input
                    type="text"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    End Time:
                  </label>
                  <input
                    type="text"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 07:00 PM"
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Assigned Tables (Comma separated):
                </label>
                <input
                  type="text"
                  value={newAssignedTables}
                  onChange={(e) => setNewAssignedTables(e.target.value)}
                  placeholder="e.g. T-01, T-02, T-03"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Shift Notes / Duty Section:
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Terrace Garden Afternoon Lead"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
                >
                  Confirm &amp; Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
