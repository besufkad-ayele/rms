"use client";

import Link from "next/link";
import { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Shield,
  FileBadge,
  Star,
  CheckCircle2,
  X,
  Sliders,
  Clock,
  CalendarDays,
  Palmtree,
  GraduationCap,
  CheckSquare,
  Square,
  ThumbsUp,
  ThumbsDown,
  ScrollText,
  DollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Staff } from "@/types/database";
import ManageStaffModal, { ManageDraft } from "@/components/admin/ManageStaffModal";
import {
  createStaffMember,
  updateStaffMemberAction,
  deleteStaffMemberAction,
  getStaffList,
  getAttendanceLogsAction,
  getLeaveRequestsAction,
  updateLeaveRequestAction,
  getTrainingChecklistAction,
  toggleTrainingChecklistAction,
  addTrainingChecklistItemAction,
  reviewClockInAction,
  getActivityLogsAction,
} from "./actions";
import { getShiftsData, MockShiftItem } from "@/app/admin/shifts/actions";

type HRSubTab = "overview" | "profiles" | "attendance" | "roster" | "leave" | "training" | "audit";

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-brand-secondary">Loading HR module…</div>
      }
    >
      <StaffPageClient />
    </Suspense>
  );
}

function StaffPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as HRSubTab | null;
  const [hrSubTab, setHrSubTab] = useState<HRSubTab>(tabParam || "overview");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [trainingItems, setTrainingItems] = useState<any[]>([]);
  const [rosterShifts, setRosterShifts] = useState<MockShiftItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedTrainingStaffId, setSelectedTrainingStaffId] = useState<string>("all");
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (tabParam) setHrSubTab(tabParam);
    else setHrSubTab("overview");
  }, [tabParam]);

  const refreshHR = async () => {
    const [staffData, attData, leaveData, trainData, shiftsData, auditData] = await Promise.all([
      getStaffList(),
      getAttendanceLogsAction(),
      getLeaveRequestsAction(),
      getTrainingChecklistAction(),
      getShiftsData(),
      getActivityLogsAction(),
    ]);
    setStaffList(staffData);
    setAttendanceLogs(attData);
    setLeaveRequests(leaveData);
    setTrainingItems(trainData);
    setRosterShifts(shiftsData.shifts || []);
    setActivityLogs(auditData);
  };

  useEffect(() => {
    refreshHR();
  }, []);

  const filteredStaff = staffList.filter((s) => {
    const matchesFilter = activeFilter === "all" || s.role === activeFilter;
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.personal_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const totalStaff = staffList.length;
  const totalManagers = staffList.filter((s) => s.role === "manager" || s.role === "admin").length;
  const avgPerformance = (
    staffList.reduce((acc, curr) => acc + (curr.performance_score || 5), 0) / (totalStaff || 1)
  ).toFixed(2);

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success && res.staff) {
        setStaffList((prev) => [res.staff as Staff, ...prev]);
        setIsRegisterOpen(false);
        form.reset();
        await refreshHR();
      }
    });
  };

  const handleManageSave = (draft: ManageDraft) => {
    if (!selectedStaff) return;
    startTransition(async () => {
      const res = await updateStaffMemberAction(selectedStaff.id, {
        full_name: draft.full_name,
        personal_id_number: draft.personal_id_number,
        phone_number: draft.phone_number,
        email: draft.email,
        emergency_contact_name: draft.emergency_contact_name,
        emergency_contact_phone: draft.emergency_contact_phone,
        address: draft.address,
        date_of_birth: draft.date_of_birth,
        role: draft.role,
        employment_status: draft.employment_status,
        base_salary: draft.base_salary,
        newPinCode: draft.newPin,
        permissions: {
          can_manage_inventory: !!draft.modules.operations,
          can_view_finance: !!draft.modules.sales,
          can_manage_shifts: !!draft.modules.hr,
          can_manage_staff: !!draft.modules.hr,
          modules: draft.modules,
        },
      });
      if (res.success) {
        setSelectedStaff(null);
        await refreshHR();
      }
    });
  };

  const handleManageDelete = () => {
    if (!selectedStaff) return;
    startTransition(async () => {
      await deleteStaffMemberAction(selectedStaff.id);
      setSelectedStaff(null);
      await refreshHR();
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

  const handleReviewClock = (id: string, decision: "approved" | "rejected") => {
    startTransition(async () => {
      await reviewClockInAction(id, decision);
      await refreshHR();
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

  const pendingClockIns = attendanceLogs.filter((r) => r.approvalStatus === "pending");
  const pendingLeave = leaveRequests.filter((r) => r.status === "pending");
  const trainingDone = trainingItems.filter((t) => t.completed).length;
  const trainingPct = trainingItems.length
    ? Math.round((trainingDone / trainingItems.length) * 100)
    : 0;
  const scheduledShifts = rosterShifts.filter((s) => s.status === "scheduled" || s.status === "checked_in").length;

  const sectionTitle: Record<HRSubTab, { title: string; subtitle: string }> = {
    overview: {
      title: "HR Dashboard",
      subtitle: "Workforce pulse — attendance, leave, roster, and training at a glance.",
    },
    profiles: {
      title: "Personnel Profiles",
      subtitle: "Legal Fayda records, roles, module access, and employment status.",
    },
    attendance: {
      title: "Attendance & Clocking",
      subtitle: "Approve “I’m on my job” requests and review punctuality.",
    },
    roster: {
      title: "Roster Preview",
      subtitle: "Live shifts from the database — open full roster to schedule.",
    },
    leave: {
      title: "Leave Management",
      subtitle: "Approve or reject staff leave requests.",
    },
    training: {
      title: "Training Checklist",
      subtitle: "Onboarding tasks and qualification progress.",
    },
    audit: {
      title: "Activity Audit Log",
      subtitle: "Who did what across HR and related modules.",
    },
  };

  return (
    <div className="space-y-6 pb-10 sm:space-y-8 sm:pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-divider pb-4 sm:gap-4 sm:pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-pill bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
            <Users className="h-3.5 w-3.5" />
            Human Resources Management
          </div>
          <h1 className="mt-2 font-header text-2xl font-bold tracking-tight text-brand-heading sm:text-3xl">
            {sectionTitle[hrSubTab].title}
          </h1>
          <p className="mt-1 text-xs text-brand-secondary">
            {sectionTitle[hrSubTab].subtitle}
          </p>
        </div>

        {(hrSubTab === "overview" || hrSubTab === "profiles") && (
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-accentHover active:scale-95 cursor-pointer sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            Register New Staff
          </button>
        )}
      </div>

      {hrSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-card border border-divider bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-brand-secondary">
                <span className="text-xs font-bold uppercase tracking-wider">Headcount</span>
                <Users className="h-4 w-4 text-brand-accent" />
              </div>
              <p className="font-header text-2xl font-bold text-brand-heading mt-2">{totalStaff}</p>
              <p className="text-[11px] text-brand-secondary mt-1">{totalManagers} managers / admins</p>
            </div>
            <div className="rounded-card border border-divider bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-brand-secondary">
                <span className="text-xs font-bold uppercase tracking-wider">Clock-ins pending</span>
                <Clock className="h-4 w-4 text-status-occupied" />
              </div>
              <p className="font-header text-2xl font-bold text-brand-heading mt-2">{pendingClockIns.length}</p>
              <p className="text-[11px] text-brand-secondary mt-1">Awaiting admin approval</p>
            </div>
            <div className="rounded-card border border-divider bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-brand-secondary">
                <span className="text-xs font-bold uppercase tracking-wider">Leave pending</span>
                <Palmtree className="h-4 w-4 text-status-prep" />
              </div>
              <p className="font-header text-2xl font-bold text-brand-heading mt-2">{pendingLeave.length}</p>
              <p className="text-[11px] text-brand-secondary mt-1">Staff leave requests</p>
            </div>
            <div className="rounded-card border border-divider bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-brand-secondary">
                <span className="text-xs font-bold uppercase tracking-wider">Training</span>
                <GraduationCap className="h-4 w-4 text-status-free" />
              </div>
              <p className="font-header text-2xl font-bold text-brand-heading mt-2">{trainingPct}%</p>
              <p className="text-[11px] text-brand-secondary mt-1">
                {trainingDone}/{trainingItems.length || 0} tasks complete · {scheduledShifts} shifts live
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { href: "/admin/staff?tab=profiles", label: "Personnel Profiles", desc: `${totalStaff} records`, icon: Users },
              { href: "/admin/staff?tab=attendance", label: "Attendance & Clocking", desc: `${pendingClockIns.length} to approve`, icon: Clock },
              { href: "/admin/shifts", label: "Roster & Shifts", desc: `${rosterShifts.length} shifts`, icon: CalendarDays },
              { href: "/admin/staff?tab=leave", label: "Leave Management", desc: `${pendingLeave.length} pending`, icon: Palmtree },
              { href: "/admin/staff?tab=training", label: "Training Checklist", desc: `${trainingPct}% complete`, icon: GraduationCap },
              { href: "/admin/staff?tab=audit", label: "Activity Audit Log", desc: `${activityLogs.length} events`, icon: ScrollText },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-card border border-divider bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-secondary transition group-hover:translate-x-1 group-hover:text-brand-accent" />
                  </div>
                  <h3 className="mt-4 font-header text-base font-bold text-brand-heading">{card.label}</h3>
                  <p className="mt-1 text-xs text-brand-secondary">{card.desc}</p>
                </Link>
              );
            })}
          </div>

          {(pendingClockIns.length > 0 || pendingLeave.length > 0) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-card border border-divider bg-white p-5 shadow-card space-y-3">
                <h3 className="font-header text-sm font-bold text-brand-heading">Needs approval — clock-in</h3>
                {pendingClockIns.slice(0, 5).map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-2 rounded-button border border-divider bg-bg-subtle px-3 py-2 text-xs">
                    <div>
                      <p className="font-bold text-brand-primary">{row.staffName}</p>
                      <p className="text-brand-secondary">{row.clockIn} · {row.date}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReviewClock(row.id, "approved")}
                        className="rounded-button bg-status-free px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReviewClock(row.id, "rejected")}
                        className="rounded-button bg-status-danger px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-card border border-divider bg-white p-5 shadow-card space-y-3">
                <h3 className="font-header text-sm font-bold text-brand-heading">Needs approval — leave</h3>
                {pendingLeave.slice(0, 5).map((lv) => (
                  <div key={lv.id} className="flex items-center justify-between gap-2 rounded-button border border-divider bg-bg-subtle px-3 py-2 text-xs">
                    <div>
                      <p className="font-bold text-brand-primary">{lv.staffName}</p>
                      <p className="text-brand-secondary">
                        {lv.type}: {lv.startDate} → {lv.endDate}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleApproveLeave(lv.id, "approved")}
                        className="rounded-button bg-status-free px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleApproveLeave(lv.id, "rejected")}
                        className="rounded-button bg-status-danger px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingLeave.length === 0 && (
                  <p className="text-xs text-brand-secondary">No leave waiting.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards — only on profiles for context */}
      {hrSubTab === "profiles" && (
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
      )}

      {/* Content driven by sidebar (?tab=) — no duplicate in-page tabs */}
      {hrSubTab === "profiles" && (
        <div className="rounded-card border border-divider bg-white shadow-card overflow-hidden">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 border-b border-divider bg-bg-subtle/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
            <div className="no-scrollbar flex items-center gap-1 admin-scroll-x pb-0.5">
              {["all", "admin", "manager", "waiter", "cashier", "cook", "cleaner", "host"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveFilter(role)}
                  className={`shrink-0 rounded-button px-3 py-1.5 text-xs font-bold capitalize transition ${
                    activeFilter === role
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 sm:shrink-0">
              <input
                type="text"
                placeholder="Search name, phone, Fayda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-button border border-divider bg-white px-3 py-1.5 text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Mobile staff cards */}
          <div className="space-y-3 p-3 md:hidden">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="rounded-card border border-divider bg-bg-subtle/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-divider bg-bg-active text-xs font-bold text-brand-primary">
                      {staff.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand-primary">{staff.full_name}</p>
                      <p className="truncate text-[11px] text-brand-secondary">{staff.email || staff.phone_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStaff(staff)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-button border border-divider bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-primary"
                  >
                    <Sliders className="h-3 w-3" />
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-pill bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold capitalize text-brand-primary">
                    {staff.role}
                  </span>
                  <span className="text-[10px] font-medium capitalize text-status-free">
                    {staff.employment_status}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold">
                    <Star className="h-3 w-3 fill-status-occupied text-status-occupied" />
                    {staff.performance_score || "5.0"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-secondary">
                  <p className="font-mono text-brand-primary">{staff.personal_id_number}</p>
                  <p className="text-right font-bold text-brand-primary">
                    {staff.base_salary ? `${Number(staff.base_salary).toLocaleString()} ETB` : "—"}
                  </p>
                </div>
              </div>
            ))}
            {filteredStaff.length === 0 && (
              <p className="py-8 text-center text-xs text-brand-secondary">No staff match this filter.</p>
            )}
          </div>

          {/* Desktop staff table */}
          <div className="admin-scroll-x admin-hide-mobile hidden md:block">
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
                              : staff.role === "cashier"
                              ? "bg-status-free-bg text-status-free"
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
        <div className="rounded-card border border-divider bg-white p-4 shadow-card space-y-4 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-divider pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-header text-base font-bold text-brand-heading flex items-center gap-2 sm:text-lg">
                <Clock className="h-5 w-5 shrink-0 text-brand-accent" />
                Live Attendance &amp; Clock-In Approval
              </h3>
              <p className="text-xs text-brand-secondary">
                Staff submit &quot;I&apos;m on my job&quot; from their dashboard. Approve or reject here.
              </p>
            </div>
            {pendingClockIns.length > 0 && (
              <span className="w-fit rounded-pill bg-status-occupied-bg px-3 py-1 text-[11px] font-bold text-status-occupied">
                {pendingClockIns.length} awaiting approval
              </span>
            )}
          </div>

          <div className="admin-scroll-x">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-divider bg-bg-subtle/40 text-[11px] font-bold uppercase text-brand-secondary">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Clock-In Time</th>
                  <th className="py-3 px-4">Clock-Out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {attendanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-brand-secondary">
                      No clock-in records yet.
                    </td>
                  </tr>
                )}
                {attendanceLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{row.staffName}</td>
                    <td className="py-3 px-4 text-brand-secondary capitalize">{row.role}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{row.clockIn}</td>
                    <td className="py-3 px-4 font-mono text-brand-secondary">{row.clockOut}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase ${
                          row.approvalStatus === "pending"
                            ? "bg-status-occupied-bg text-status-occupied"
                            : row.approvalStatus === "rejected"
                            ? "bg-status-danger-bg text-status-danger"
                            : row.status === "on_time"
                            ? "bg-status-free-bg text-status-free"
                            : "bg-status-danger-bg text-status-danger"
                        }`}
                      >
                        {row.approvalStatus === "pending"
                          ? "Pending Approval"
                          : row.approvalStatus === "rejected"
                          ? "Rejected"
                          : row.status === "on_time"
                          ? "On Time"
                          : row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-secondary">{row.date}</td>
                    <td className="py-3 px-4 text-right">
                      {row.approvalStatus === "pending" && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleReviewClock(row.id, "approved")}
                            className="inline-flex items-center gap-1 rounded-button bg-status-free px-2.5 py-1 text-[10px] font-bold text-white"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleReviewClock(row.id, "rejected")}
                            className="inline-flex items-center gap-1 rounded-button bg-status-danger px-2.5 py-1 text-[10px] font-bold text-white"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
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
                Live roster from the database. Schedule new shifts in the full roster workspace.
              </p>
            </div>

            <a
              href="/admin/shifts"
              className="px-3.5 py-2 rounded-button bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition"
            >
              Open Full Shift Roster →
            </a>
          </div>

          {rosterShifts.length === 0 ? (
            <div className="rounded-card border border-dashed border-divider bg-bg-subtle p-8 text-center">
              <p className="font-header text-sm font-bold text-brand-heading">No shifts scheduled yet</p>
              <p className="mt-1 text-xs text-brand-secondary">
                Create shifts with real staff members in the Shift Roster module.
              </p>
            </div>
          ) : (
            <div className="admin-scroll-x">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-divider bg-bg-subtle/40 text-[11px] font-bold uppercase text-brand-secondary">
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Window</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Tables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {rosterShifts.slice(0, 20).map((sh) => (
                    <tr key={sh.id} className="hover:bg-bg-subtle/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-brand-primary">{sh.staffName}</p>
                        <p className="text-[10px] capitalize text-brand-secondary">{sh.staffRole}</p>
                      </td>
                      <td className="py-3 px-4 text-brand-secondary">{sh.shiftDate}</td>
                      <td className="py-3 px-4 font-mono">
                        {sh.scheduledStart} – {sh.scheduledEnd}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-accent">{sh.clockInCode}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{sh.status.replace("_", " ")}</td>
                      <td className="py-3 px-4 text-brand-secondary">
                        {(sh.assignedTables || []).join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

          <div className="admin-scroll-x">
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
          <div className="flex items-center gap-2 admin-scroll-x pb-2 border-b border-divider/60">
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

      {/* SUB-SECTION: Activity Audit Log */}
      {hrSubTab === "audit" && (
        <div className="rounded-card border border-divider bg-white p-6 shadow-card space-y-4">
          <div className="border-b border-divider pb-4">
            <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-brand-accent" />
              Activity Audit Log
            </h3>
            <p className="text-xs text-brand-secondary">
              Who logged actions across modules — clock-ins, staff edits, leave decisions, and more.
            </p>
          </div>
          {activityLogs.length === 0 ? (
            <div className="rounded-card border border-dashed border-divider bg-bg-subtle p-8 text-center text-xs text-brand-secondary">
              No audit entries yet. Actions will appear here after the{" "}
              <code className="font-mono text-[10px]">activity_logs</code> migration is applied.
              HR actions still succeed without it.
            </div>
          ) : (
            <div className="admin-scroll-x">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-divider bg-bg-subtle/40 text-[11px] font-bold uppercase text-brand-secondary">
                    <th className="py-3 px-4">When</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-bg-subtle/50">
                      <td className="py-3 px-4 text-brand-secondary">{log.createdAt}</td>
                      <td className="py-3 px-4 font-bold text-brand-primary">{log.actorName}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-brand-accent">
                        {log.moduleId}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">{log.action}</td>
                      <td className="py-3 px-4 text-brand-secondary">
                        {log.entityType || "—"}
                        {log.entityId ? ` · ${String(log.entityId).slice(0, 8)}…` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal Dialog */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="relative my-0 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-card border border-divider bg-white p-4 shadow-elevated sm:my-8 sm:max-h-[90vh] sm:rounded-card sm:p-6">
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
                    <option value="cashier">Cashier</option>
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

      {/* Full Manage Personnel Modal */}
      {selectedStaff && (
        <ManageStaffModal
          staff={selectedStaff}
          isPending={isPending}
          onClose={() => setSelectedStaff(null)}
          onSave={handleManageSave}
          onDelete={handleManageDelete}
        />
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
