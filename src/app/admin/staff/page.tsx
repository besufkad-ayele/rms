"use client";

import { useState, useEffect, useTransition } from "react";
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
  Eye,
  EyeOff,
  Lock,
  Clock,
  CalendarDays,
  Palmtree,
  GraduationCap,
  CheckSquare,
  Square,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Staff, StaffRole, EmploymentStatus } from "@/types/database";
import {
  createStaffMember,
  updateStaffPermissions,
  getStaffList,
  getAttendanceLogsAction,
  getLeaveRequestsAction,
  updateLeaveRequestAction,
  getTrainingChecklistAction,
  toggleTrainingChecklistAction,
  addTrainingChecklistItemAction,
} from "./actions";

type HRSubTab = "profiles" | "attendance" | "roster" | "leave" | "training";

export default function StaffPage() {
  const [hrSubTab, setHrSubTab] = useState<HRSubTab>("profiles");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [trainingItems, setTrainingItems] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [selectedTrainingStaffId, setSelectedTrainingStaffId] = useState<string>("all");
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Load live HR data from Supabase on mount
  useEffect(() => {
    async function fetchAllHRData() {
      const [staffData, attData, leaveData, trainData] = await Promise.all([
        getStaffList(),
        getAttendanceLogsAction(),
        getLeaveRequestsAction(),
        getTrainingChecklistAction(),
      ]);
      setStaffList(staffData);
      setAttendanceLogs(attData);
      setLeaveRequests(leaveData);
      setTrainingItems(trainData);
    }
    fetchAllHRData();
  }, []);

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
    staffList.reduce((acc, curr) => acc + (curr.performance_score || 5), 0) / (totalStaff || 1)
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

  // Handle permission & PIN update submission
  const handlePermissionSave = async () => {
    if (!selectedStaff) return;
    startTransition(async () => {
      await updateStaffPermissions(
        selectedStaff.id,
        selectedStaff.role,
        selectedStaff.permissions,
        selectedStaff.employment_status,
        selectedStaff.pin_code_hash
      );
      setStaffList((prev) =>
        prev.map((s) => (s.id === selectedStaff.id ? { ...selectedStaff } : s))
      );
      setSelectedStaff(null);
    });
  };

  const handleApproveLeave = async (id: string, newStatus: string) => {
    startTransition(async () => {
      await updateLeaveRequestAction(id, newStatus);
      setLeaveRequests((prev) =>
        prev.map((lv) => (lv.id === id ? { ...lv, status: newStatus } : lv))
      );
    });
  };

  const toggleTraining = async (id: string, currentCompleted: boolean) => {
    const nextState = !currentCompleted;
    startTransition(async () => {
      await toggleTrainingChecklistAction(id, nextState);
      setTrainingItems((prev) =>
        prev.map((tr) => (tr.id === id ? { ...tr, completed: nextState } : tr))
      );
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-pill bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
            <Users className="h-3.5 w-3.5" />
            Human Resources Management
          </div>
          <h1 className="font-header text-3xl font-bold tracking-tight text-brand-heading mt-2">
            Staff &amp; Operational Personnel
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Legal Fayda ID records, attendance logs, shift rosters, leave requests, and training checklists.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-accentHover active:scale-95 cursor-pointer"
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
          <p className="font-header text-2xl font-bold text-brand-heading mt-2">
            {totalStaff} Active Personnel
          </p>
          <p className="text-[11px] text-status-free mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> All legal Fayda IDs registered
          </p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Admin &amp; Managers</span>
            <Shield className="h-4 w-4 text-status-reserved" />
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading mt-2">
            {totalManagers} Managers
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Scoped operational rights</p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Staff Rating</span>
            <Star className="h-4 w-4 text-status-occupied" />
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading mt-2">
            {avgPerformance} / 5.0
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">From guest reviews</p>
        </div>

        <div className="rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Payroll</span>
            <DollarSign className="h-4 w-4 text-status-free" />
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading mt-2">
            {staffList
              .reduce((acc, curr) => acc + (Number(curr.base_salary) || 0), 0)
              .toLocaleString()}{" "}
            ETB
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Automated P&amp;L OPEX</p>
        </div>
      </div>

      {/* HR Module Sub-Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-2 overflow-x-auto">
        <button
          onClick={() => setHrSubTab("profiles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold transition cursor-pointer ${
            hrSubTab === "profiles"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Personnel &amp; Profiles ({staffList.length})</span>
        </button>

        <button
          onClick={() => setHrSubTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold transition cursor-pointer ${
            hrSubTab === "attendance"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Attendance &amp; Clock-In Log</span>
        </button>

        <button
          onClick={() => setHrSubTab("roster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold transition cursor-pointer ${
            hrSubTab === "roster"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Roster &amp; Shifts</span>
        </button>

        <button
          onClick={() => setHrSubTab("leave")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold transition cursor-pointer ${
            hrSubTab === "leave"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          <Palmtree className="h-4 w-4" />
          <span>Leave Management</span>
        </button>

        <button
          onClick={() => setHrSubTab("training")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold transition cursor-pointer ${
            hrSubTab === "training"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Training Checklist</span>
        </button>
      </div>

      {/* SUB-SECTION 1: Personnel & Profiles */}
      {hrSubTab === "profiles" && (
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
                  <th className="py-3 px-5">Role &amp; Status</th>
                  <th className="py-3 px-5">National ID (Fayda)</th>
                  <th className="py-3 px-5">Contact &amp; Emergency</th>
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
                        {staff.permissions?.can_manage_inventory && (
                          <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                            Inventory
                          </span>
                        )}
                        {staff.permissions?.can_view_finance && (
                          <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                            Finance
                          </span>
                        )}
                        {staff.permissions?.can_manage_shifts && (
                          <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                            Shifts
                          </span>
                        )}
                        {staff.permissions?.can_manage_staff && (
                          <span className="rounded-button bg-bg-subtle border border-divider px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                            HR Admin
                          </span>
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
                        className="inline-flex items-center gap-1 rounded-button border border-divider bg-white px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-bg-subtle hover:text-brand-accent transition shadow-xs cursor-pointer"
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
      )}

      {/* SUB-SECTION 2: Attendance & Clock-In Log */}
      {hrSubTab === "attendance" && (
        <div className="rounded-card border border-divider bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-accent" />
                Live Attendance &amp; Clock-In Ledger
              </h3>
              <p className="text-xs text-brand-secondary">
                Real-time terminal clock-in records, punctuality tracking, and shift entry times.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-divider bg-bg-subtle/40 text-[11px] font-bold uppercase text-brand-secondary">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Clock-In Time</th>
                  <th className="py-3 px-4">Clock-Out Time</th>
                  <th className="py-3 px-4">Punctuality</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {attendanceLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{row.staffName}</td>
                    <td className="py-3 px-4 text-brand-secondary">{row.role}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{row.clockIn}</td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">{row.clockOut}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase ${
                          row.status === "on_time"
                            ? "bg-status-free-bg text-status-free"
                            : "bg-status-danger-bg text-status-danger"
                        }`}
                      >
                        {row.status === "on_time" ? "On Time" : "Late Arrival"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-secondary">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: Roster & Shifts */}
      {hrSubTab === "roster" && (
        <div className="rounded-card border border-divider bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand-accent" />
                Shift Roster &amp; Station Allocation
              </h3>
              <p className="text-xs text-brand-secondary">
                Weekly shift rosters and station assignments across floor sections.
              </p>
            </div>

            <a
              href="/admin/shifts"
              className="px-3.5 py-2 rounded-button bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition"
            >
              Open Full Shift Roster Module →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-card border border-divider bg-bg-subtle space-y-2">
              <p className="font-bold text-xs text-brand-primary uppercase">Morning Shift (07:00 - 15:00)</p>
              <p className="text-xs text-brand-secondary">• Michael Tadesse (Lead Waiter - Main Hall)</p>
              <p className="text-xs text-brand-secondary">• Chef Kassahun Lemma (Kitchen Hearth)</p>
            </div>
            <div className="p-4 rounded-card border border-divider bg-bg-subtle space-y-2">
              <p className="font-bold text-xs text-brand-primary uppercase">Evening Shift (15:00 - 23:00)</p>
              <p className="text-xs text-brand-secondary">• Tigist Haile (Floor Manager)</p>
              <p className="text-xs text-brand-secondary">• Sara Mengistu (Terrace Station)</p>
            </div>
            <div className="p-4 rounded-card border border-divider bg-bg-subtle space-y-2">
              <p className="font-bold text-xs text-brand-primary uppercase">Night &amp; Closing (23:00 - 02:00)</p>
              <p className="text-xs text-brand-secondary">• Alemayehu Tura (Stock Reconciliation)</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: Leave Management */}
      {hrSubTab === "leave" && (
        <div className="rounded-card border border-divider bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
                <Palmtree className="h-5 w-5 text-brand-accent" />
                Leave &amp; Absence Requests
              </h3>
              <p className="text-xs text-brand-secondary">
                Review annual leave, sick leave requests, and approval workflow.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-divider bg-bg-subtle/40 text-[11px] font-bold uppercase text-brand-secondary">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {leaveRequests.map((lv) => (
                  <tr key={lv.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{lv.staffName}</td>
                    <td className="py-3 px-4 font-semibold text-brand-accent">{lv.type}</td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">
                      {lv.startDate} to {lv.endDate}
                    </td>
                    <td className="py-3 px-4 text-brand-secondary max-w-xs truncate">{lv.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase ${
                          lv.status === "approved"
                            ? "bg-status-free-bg text-status-free"
                            : lv.status === "rejected"
                            ? "bg-status-danger-bg text-status-danger"
                            : "bg-status-reserved-bg text-status-reserved"
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lv.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveLeave(lv.id, "approved")}
                            className="p-1 rounded-button bg-status-free-bg text-status-free hover:bg-status-free hover:text-white transition"
                            title="Approve Leave"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleApproveLeave(lv.id, "rejected")}
                            className="p-1 rounded-button bg-status-danger-bg text-status-danger hover:bg-status-danger hover:text-white transition"
                            title="Reject Leave"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-brand-secondary italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-SECTION 5: Training Checklist */}
      {hrSubTab === "training" && (
        <div className="rounded-card border border-divider bg-white p-6 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-divider pb-4 gap-4">
            <div>
              <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-accent" />
                Individual Staff Training &amp; Qualification Checklists
              </h3>
              <p className="text-xs text-brand-secondary">
                Track compliance certifications, food safety training, and operational qualifications assigned per employee.
              </p>
            </div>

            <button
              onClick={() => setIsAddTrainingOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-button bg-brand-accent px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-accentHover transition cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Assign Task to Staff
            </button>
          </div>

          {/* Staff Member Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-divider/60">
            <button
              onClick={() => setSelectedTrainingStaffId("all")}
              className={`px-3 py-1.5 rounded-button text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedTrainingStaffId === "all"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
              }`}
            >
              All Personnel ({trainingItems.length} Tasks)
            </button>
            {staffList.map((s) => {
              const staffTasks = trainingItems.filter((t) => t.staffId === s.id);
              const completedCount = staffTasks.filter((t) => t.completed).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedTrainingStaffId(s.id)}
                  className={`px-3 py-1.5 rounded-button text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                    selectedTrainingStaffId === s.id
                      ? "bg-brand-primary text-white shadow-xs"
                      : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                  }`}
                >
                  <span>{s.full_name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-pill text-[10px] ${
                      selectedTrainingStaffId === s.id
                        ? "bg-white/20 text-white"
                        : "bg-brand-accent/10 text-brand-accent"
                    }`}
                  >
                    {completedCount}/{staffTasks.length} Done
                  </span>
                </button>
              );
            })}
          </div>

          {/* Checklist Items Grouped or Filtered */}
          <div className="space-y-3">
            {trainingItems
              .filter(
                (item) =>
                  selectedTrainingStaffId === "all" || item.staffId === selectedTrainingStaffId
              )
              .map((item) => {
                const isDone = item.completed;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTraining(item.id, isDone)}
                    className={`p-4 rounded-card border transition cursor-pointer flex items-center justify-between ${
                      isDone
                        ? "border-status-free/40 bg-status-free-bg/30"
                        : "border-divider bg-white hover:bg-bg-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckSquare className="h-5 w-5 text-status-free shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-brand-secondary shrink-0" />
                      )}
                      <div>
                        <p
                          className={`font-bold text-xs ${
                            isDone ? "line-through text-brand-secondary" : "text-brand-primary"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-brand-secondary flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-brand-accent">
                            Assigned To: {item.staffName} ({item.staffRole})
                          </span>
                          <span>•</span>
                          <span>Category: {item.category}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${
                        isDone ? "bg-status-free text-white" : "bg-bg-active text-brand-primary"
                      }`}
                    >
                      {isDone ? "Completed" : "Pending Task"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
                    placeholder="staff@tibebrms.com"
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
                  className="px-5 py-2 rounded-button bg-brand-accent text-xs font-semibold text-white hover:bg-brand-accentHover transition"
                >
                  {isPending ? "Registering..." : "Save Personnel Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission & PIN Management Modal */}
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

              <div>
                <label className="block font-bold text-brand-primary mb-1">
                  Secret PIN Code / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
                  <input
                    type={showPasswordInModal ? "text" : "password"}
                    value={selectedStaff.pin_code_hash || ""}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        pin_code_hash: e.target.value,
                      })
                    }
                    placeholder="Enter new PIN or Password"
                    className="w-full pl-9 pr-10 py-2 rounded-button bg-bg-subtle border border-divider text-xs font-mono text-brand-primary focus:ring-1 focus:ring-brand-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-primary"
                    title={showPasswordInModal ? "Hide PIN" : "Show PIN"}
                  >
                    {showPasswordInModal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                  className="px-5 py-2 rounded-button bg-brand-accent text-xs font-semibold text-white hover:bg-brand-accentHover transition"
                >
                  {isPending ? "Saving..." : "Update Permissions & PIN"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Training Task Modal */}
      {isAddTrainingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-card border border-divider bg-white p-6 shadow-elevated">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-primary">
                  Assign Training Task to Staff
                </h2>
                <p className="text-xs text-brand-secondary">
                  Add qualification certification item for a specific employee.
                </p>
              </div>
              <button
                onClick={() => setIsAddTrainingOpen(false)}
                className="rounded-button p-1 text-brand-secondary hover:bg-bg-subtle hover:text-brand-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const staffId = formData.get("staff_id") as string;
                const title = formData.get("title") as string;
                const category = formData.get("category") as string;

                if (!staffId || !title) return;

                startTransition(async () => {
                  const res = await addTrainingChecklistItemAction(staffId, title, category);
                  if (res.success && res.item) {
                    const matchedStaff = staffList.find((s) => s.id === staffId);
                    setTrainingItems((prev) => [
                      ...prev,
                      {
                        id: res.item.id,
                        staffId: res.item.staff_id,
                        staffName: matchedStaff?.full_name || "Staff Member",
                        staffRole: matchedStaff?.role || "Staff",
                        title: res.item.item_name,
                        category: res.item.category,
                        completed: false,
                      },
                    ]);
                    setIsAddTrainingOpen(false);
                  }
                });
              }}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-brand-primary mb-1">Select Staff Member *</label>
                <select
                  name="staff_id"
                  required
                  className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-primary mb-1">Task Title / Qualification *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Food Safety & Temperature Control"
                  className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-primary mb-1">Category *</label>
                <select
                  name="category"
                  className="w-full px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary"
                >
                  <option value="General">General Hospitality</option>
                  <option value="Kitchen">Kitchen & Food Safety</option>
                  <option value="Operations">POS & Service Operations</option>
                  <option value="Safety">Fire Safety & First Aid</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddTrainingOpen(false)}
                  className="px-4 py-2 rounded-button border border-divider bg-white text-xs font-semibold text-brand-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-button bg-brand-accent text-xs font-semibold text-white hover:bg-brand-accentHover transition"
                >
                  {isPending ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
