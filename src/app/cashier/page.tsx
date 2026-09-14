"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentSessionAction } from "@/app/rms-login/actions";
import {
  getStaffLiveTablesAction,
  settleTableBillAction,
  getOrderTicketAction,
  StaffStationTable,
  OrderTicketDetail,
} from "@/app/staff/dashboard/actions";
import { PrintableReceipt } from "@/components/order/PrintableReceipt";
import { ReceiptData } from "@/lib/receipts";

export default function CashierPortalPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [tables, setTables] = useState<StaffStationTable[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settleTable, setSettleTable] = useState<StaffStationTable | null>(null);
  const [settleMethod, setSettleMethod] = useState<"cbe_birr" | "telebirr" | "cash" | "card">("cash");
  const [settleTxRef, setSettleTxRef] = useState("");
  const [printedReceipt, setPrintedReceipt] = useState<ReceiptData | null>(null);

  // "Check order" popup — item customization detail
  const [checkOrderTable, setCheckOrderTable] = useState<StaffStationTable | null>(null);
  const [orderTicket, setOrderTicket] = useState<OrderTicketDetail | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const openCheckOrder = async (table: StaffStationTable) => {
    if (!table.activeOrderId) return;
    setCheckOrderTable(table);
    setOrderTicket(null);
    setLoadingTicket(true);
    const ticket = await getOrderTicketAction(table.activeOrderId);
    setOrderTicket(ticket);
    setLoadingTicket(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTables = async () => {
    const res = await getStaffLiveTablesAction(sessionUser?.id, false);
    setTables((res.tables || []).filter((t) => t.status === "occupied" && t.activeOrderId));
  };

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const session = await getCurrentSessionAction();
      if (!cancelled) setSessionUser(session);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionUser?.id) return;
    loadTables();
    const interval = setInterval(loadTables, 3000);
    return () => clearInterval(interval);
  }, [sessionUser]);

  const handleConfirmSettlement = async () => {
    if (!settleTable) return;
    const dbMethod = settleMethod === "card" ? "cbe_birr" : settleMethod;
    const res = await settleTableBillAction(
      settleTable.code,
      settleTable.activeOrderId,
      dbMethod as "cash" | "cbe_birr" | "telebirr",
      settleTable.billTotal || 0,
      settleTxRef.trim() || undefined
    );
    if (!res.success) {
      showToast(res.message || "Could not settle this table.");
      return;
    }
    showToast(`Table ${settleTable.code} settled and cleared.`);
    setSettleTable(null);
    setSettleTxRef("");
    if (res.receipt) setPrintedReceipt(res.receipt);
    await loadTables();
  };

  return (
    <div className="space-y-6 pb-16">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      <div className="rounded-card bg-white p-6 border border-divider shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-header text-xl font-bold text-brand-heading">Open bills</h2>
            <p className="text-xs text-brand-secondary">
              Confirm guest payments (CBE / Telebirr / cash), print receipts, then clear the table.
            </p>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="rounded-card border border-dashed border-divider bg-white p-8 text-center">
          <Receipt className="mx-auto h-8 w-8 text-brand-secondary opacity-60" />
          <p className="font-header font-bold text-sm text-brand-primary mt-3">No open bills</p>
          <p className="text-xs text-brand-secondary mt-1">
            Occupied tables with unpaid orders appear here after guests notify payment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.code}
              className="rounded-card bg-white p-5 border border-status-occupied/40 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-header text-lg font-bold">Table {table.code}</h3>
                  <p className="text-[10px] text-brand-secondary">{table.section}</p>
                </div>
                <span className="rounded-pill bg-status-occupied text-white px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  {table.foodStatus || "open"}
                </span>
              </div>
              <p className="text-xs text-brand-secondary line-clamp-2">{table.activeOrder}</p>
              <button
                type="button"
                onClick={() => openCheckOrder(table)}
                className="w-full py-1.5 rounded-button bg-bg-subtle border border-divider text-brand-primary font-bold text-[11px] hover:bg-bg-card transition flex items-center justify-center gap-1"
              >
                <Receipt className="h-3.5 w-3.5 text-brand-accent" />
                <span>Check order &amp; customizations</span>
              </button>
              <div className="flex items-center justify-between pt-2 border-t border-divider">
                <div>
                  <p className="text-[10px] uppercase text-brand-secondary">Amount due</p>
                  <p className="font-header text-base font-bold">
                    ETB {(table.billTotal || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSettleTable(table);
                    if (table.pendingPayMethod === "cbe_birr" || table.pendingPayMethod === "telebirr") {
                      setSettleMethod(table.pendingPayMethod);
                    }
                    setSettleTxRef(table.pendingPayAccount || "");
                  }}
                  className="rounded-button bg-status-free px-3.5 py-1.5 text-xs font-bold text-white"
                >
                  Confirm & print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {checkOrderTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-lg w-full p-5 space-y-4 border border-divider shadow-elevated relative">
            <button
              type="button"
              onClick={() => {
                setCheckOrderTable(null);
                setOrderTicket(null);
              }}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Order — Table {checkOrderTable.code}
                </h3>
                <p className="text-xs text-brand-secondary">
                  Ingredients, extras &amp; chef notes for this bill
                </p>
              </div>
            </div>

            {loadingTicket ? (
              <div className="py-10 text-center text-xs text-brand-secondary">
                Loading order…
              </div>
            ) : !orderTicket || orderTicket.items.length === 0 ? (
              <div className="py-10 text-center text-xs text-brand-secondary">
                No items found for this order.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {orderTicket.customerNote && (
                  <div className="rounded-button bg-status-occupied/10 border border-status-occupied/30 p-2.5 text-xs text-status-occupied font-semibold">
                    Table note: &ldquo;{orderTicket.customerNote}&rdquo;
                  </div>
                )}

                {orderTicket.items.map((item, idx) => {
                  const hasCustomization =
                    item.omittedIngredients.length > 0 ||
                    item.extras.length > 0 ||
                    !!item.chefNote;
                  return (
                    <div
                      key={idx}
                      className="rounded-card border border-divider bg-bg-subtle p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-pill bg-brand-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {item.qty}x
                        </span>
                        <span className="font-bold text-sm text-brand-heading">
                          {item.name}
                        </span>
                      </div>

                      {item.omittedIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.omittedIngredients.map((ing, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-pill bg-status-danger-bg border border-status-danger/40 px-2 py-0.5 text-[10px] font-bold text-status-danger uppercase"
                            >
                              No {ing}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.extras.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.extras.map((ex, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-pill bg-status-free-bg border border-status-free/40 px-2 py-0.5 text-[10px] font-bold text-status-free uppercase"
                            >
                              + {ex.name}
                              {ex.price > 0 && ` (ETB ${ex.price})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.chefNote && (
                        <p className="text-xs text-brand-primary italic">
                          Note: &ldquo;{item.chefNote}&rdquo;
                        </p>
                      )}

                      {!hasCustomization && (
                        <p className="text-[11px] text-brand-secondary">
                          Standard preparation — no customization.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCheckOrderTable(null);
                setOrderTicket(null);
              }}
              className="w-full py-2.5 rounded-button bg-brand-primary text-white font-bold text-xs hover:bg-brand-heading transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {settleTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 space-y-5 border border-divider shadow-elevated relative">
            <button
              type="button"
              onClick={() => setSettleTable(null)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h3 className="font-header text-base font-bold">Settle Table {settleTable.code}</h3>
              <p className="text-xs text-brand-secondary">
                Manual confirmation · ETB {(settleTable.billTotal || 0).toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "cash", label: "Cash" },
                { key: "cbe_birr", label: "CBE Birr / Bank" },
                { key: "telebirr", label: "Telebirr" },
                { key: "card", label: "POS Card" },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSettleMethod(m.key as typeof settleMethod)}
                  className={cn(
                    "py-2 px-3 rounded-button text-xs font-bold border",
                    settleMethod === m.key
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-bg-subtle border-divider text-brand-primary"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {settleTable.pendingPayAccount ? (
              <div className="rounded-button bg-bg-subtle border border-divider p-3 text-xs">
                <p className="text-[10px] font-bold uppercase text-brand-secondary">
                  Guest paid to
                </p>
                <p className="font-mono font-bold text-brand-primary mt-1">
                  {settleTable.pendingPayAccount}
                </p>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Account / till (optional)
                </label>
                <input
                  type="text"
                  placeholder="CBE account or Telebirr till"
                  value={settleTxRef}
                  onChange={(e) => setSettleTxRef(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs font-mono"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleConfirmSettlement}
              className="w-full py-2.5 rounded-button bg-status-free text-white font-bold text-xs"
            >
              Confirm payment & print receipt
            </button>
          </div>
        </div>
      )}

      {printedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3 border border-divider shadow-elevated">
            <PrintableReceipt
              receipt={printedReceipt}
              continueLabel="Close"
              onContinue={() => setPrintedReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
