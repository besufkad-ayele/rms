"use client";

import React, { useState } from "react";
import { Building2, Send, Banknote, Copy, Check, Info, ShieldCheck, ArrowRight } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { formatETB, cn } from "@/lib/utils";

export type PaymentMethod = "cbe_transfer" | "telegram" | "cash";

interface PaymentMethodCardProps {
  totalAmount: number;
  tableCode: string;
  onPaymentConfirmed: (method: PaymentMethod, reference?: string) => void;
  isProcessing?: boolean;
}

export function PaymentMethodCard({
  totalAmount,
  tableCode,
  onPaymentConfirmed,
  isProcessing = false,
}: PaymentMethodCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cbe_transfer");
  const [copied, setCopied] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(RESTAURANT_INFO.cbeAccount.accountNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onPaymentConfirmed(selectedMethod, referenceNumber);
  };

  return (
    <div className="rounded-card border border-divider bg-white p-5 sm:p-6 shadow-card space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-header text-xl font-bold text-brand-primary">
            Settle Bill for Table {tableCode.replace("T-", "")}
          </h3>
          <span className="font-sans text-xl font-bold text-brand-accent">
            {formatETB(totalAmount)}
          </span>
        </div>
        <p className="text-xs text-brand-secondary mt-1">
          Select your preferred payment channel. No service surcharge.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. CBE Transfer */}
        <button
          type="button"
          onClick={() => setSelectedMethod("cbe_transfer")}
          className={cn(
            "min-h-[56px] flex flex-col items-start p-4 rounded-card border text-left transition-all duration-150 ease-out hover:-translate-y-0.5",
            selectedMethod === "cbe_transfer"
              ? "border-brand-accent bg-background-active ring-2 ring-brand-accent/20 shadow-sm"
              : "border-divider bg-white hover:bg-background-subtle"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary text-white">
              <Building2 className="h-5 w-5" />
            </div>
            {selectedMethod === "cbe_transfer" && (
              <span className="h-5 w-5 rounded-full bg-brand-accent text-white flex items-center justify-center">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          <span className="mt-3 font-header text-sm font-bold text-brand-primary">
            CBE Transfer
          </span>
          <span className="text-[11px] text-brand-secondary">Commercial Bank of Ethiopia</span>
        </button>

        {/* 2. Telegram / Telebirr */}
        <button
          type="button"
          onClick={() => setSelectedMethod("telegram")}
          className={cn(
            "min-h-[56px] flex flex-col items-start p-4 rounded-card border text-left transition-all duration-150 ease-out hover:-translate-y-0.5",
            selectedMethod === "telegram"
              ? "border-brand-accent bg-background-active ring-2 ring-brand-accent/20 shadow-sm"
              : "border-divider bg-white hover:bg-background-subtle"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center rounded-button bg-[#229ED9] text-white">
              <Send className="h-5 w-5" />
            </div>
            {selectedMethod === "telegram" && (
              <span className="h-5 w-5 rounded-full bg-brand-accent text-white flex items-center justify-center">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          <span className="mt-3 font-header text-sm font-bold text-brand-primary">
            Telegram / Telebirr
          </span>
          <span className="text-[11px] text-brand-secondary">Instant digital checkout</span>
        </button>

        {/* 3. Cash */}
        <button
          type="button"
          onClick={() => setSelectedMethod("cash")}
          className={cn(
            "min-h-[56px] flex flex-col items-start p-4 rounded-card border text-left transition-all duration-150 ease-out hover:-translate-y-0.5",
            selectedMethod === "cash"
              ? "border-brand-accent bg-background-active ring-2 ring-brand-accent/20 shadow-sm"
              : "border-divider bg-white hover:bg-background-subtle"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center rounded-button bg-status-available text-white">
              <Banknote className="h-5 w-5" />
            </div>
            {selectedMethod === "cash" && (
              <span className="h-5 w-5 rounded-full bg-brand-accent text-white flex items-center justify-center">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          <span className="mt-3 font-header text-sm font-bold text-brand-primary">
            Cash to Server
          </span>
          <span className="text-[11px] text-brand-secondary">Table attendant settles bill</span>
        </button>
      </div>

      {/* Detail Panel based on Selected Method */}
      <div className="rounded-card bg-background-subtle p-4 border border-divider">
        {selectedMethod === "cbe_transfer" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                Official CBE Account
              </span>
              <span className="text-xs font-semibold text-brand-primary">
                {RESTAURANT_INFO.cbeAccount.accountName}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white rounded-button p-3 border border-divider">
              <div>
                <p className="text-[11px] text-brand-secondary font-medium">Account Number</p>
                <p className="font-mono text-base font-bold text-brand-primary tracking-wider">
                  {RESTAURANT_INFO.cbeAccount.accountNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 rounded-button bg-background-active px-3 py-2 text-xs font-semibold text-brand-accent hover:bg-brand-accent hover:text-white transition"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-primary mb-1">
                Transaction Reference or Slip Number (Optional)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. FT260814987..."
                className="w-full rounded-button border border-divider bg-white px-3.5 py-2 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
              />
            </div>
          </div>
        )}

        {selectedMethod === "telegram" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-brand-primary">
              <Info className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <p>
                You can pay seamlessly via Telebirr or our Telegram Bot. Click confirm to receive the payment link or display the merchant QR.
              </p>
            </div>
            <div className="p-3 bg-white rounded-button border border-divider text-xs">
              <p className="text-brand-secondary">Merchant Name: <strong className="text-brand-primary">Keren Addis Dining</strong></p>
              <p className="text-brand-secondary">Telebirr Till: <strong className="font-mono text-brand-primary">849201</strong></p>
            </div>
          </div>
        )}

        {selectedMethod === "cash" && (
          <div className="flex items-start gap-3 p-2 text-xs text-brand-primary">
            <ShieldCheck className="h-5 w-5 text-status-available shrink-0" />
            <div>
              <p className="font-semibold text-brand-primary">
                Your server will confirm this payment.
              </p>
              <p className="text-brand-secondary mt-0.5">
                Please hand the exact amount of {formatETB(totalAmount)} to your table attendant. They will verify and print your receipt.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Payment CTA */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={handleConfirm}
        className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-[0.99] disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Confirming Payment...
          </span>
        ) : (
          <>
            <span>
              Confirm {selectedMethod === "cash" ? "Cash Settlement" : "Payment"} ({formatETB(totalAmount)})
            </span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
