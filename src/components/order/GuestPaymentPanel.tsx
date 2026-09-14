"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Building2, HeartHandshake, Send, Check, Copy, Phone } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { computeBill, formatETB, cn } from "@/lib/utils";
import { useRememberedGuest } from "@/lib/useRememberedGuest";

export type GuestPayMethod = "cbe_birr" | "telebirr";

interface GuestPaymentPanelProps {
  foodSubtotal: number;
  tableCode: string;
  serverName: string;
  onSubmit: (
    method: GuestPayMethod,
    payAccount: string,
    tipAmount: number,
    phone: string,
    name: string
  ) => void;
  isProcessing?: boolean;
}

const TIP_PRESETS = [0, 50, 100, 200];

function payAccountForMethod(method: GuestPayMethod) {
  return method === "cbe_birr"
    ? RESTAURANT_INFO.cbeAccount.accountNumber.replace(/\s/g, "")
    : "849201";
}

export function GuestPaymentPanel({
  foodSubtotal,
  tableCode,
  serverName,
  onSubmit,
  isProcessing = false,
}: GuestPaymentPanelProps) {
  const [method, setMethod] = useState<GuestPayMethod>("cbe_birr");
  const [tipAmount, setTipAmount] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const { phone: savedPhone, name: savedName, isReturning, remember } = useRememberedGuest();
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (savedPhone) setPhone(savedPhone);
  }, [savedPhone]);

  const payAccount = payAccountForMethod(method);

  const bill = useMemo(() => computeBill(foodSubtotal), [foodSubtotal]);
  const totalWithTip = bill.total + tipAmount;

  const qrPayload =
    method === "cbe_birr"
      ? `CBE|${RESTAURANT_INFO.cbeAccount.accountNumber.replace(/\s/g, "")}|${totalWithTip}|Table ${tableCode}`
      : `TELEBIRR|849201|${totalWithTip}|Table ${tableCode}`;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayload, { width: 220, margin: 1 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [qrPayload]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payAccount);
    setCopied(true);
    setAccountCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMethodChange = (next: GuestPayMethod) => {
    setMethod(next);
    setAccountCopied(false);
    setCopied(false);
  };

  return (
    <div className="rounded-card border border-divider bg-white p-5 shadow-card space-y-5">
      <div>
        <h3 className="font-header text-lg font-bold text-brand-primary">Pay your bill</h3>
        <p className="text-xs text-brand-secondary mt-1">
          Table {tableCode.replace("T-", "")} · Server {serverName}. Choose CBE or Telebirr, copy the account, pay in your app, then notify the cashier.
        </p>
      </div>

      <div className="rounded-button bg-background-subtle border border-divider p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-brand-secondary">
          <span>Food subtotal</span>
          <span>{formatETB(bill.subtotal)}</span>
        </div>
        <div className="flex justify-between text-brand-secondary">
          <span>Service 10%</span>
          <span>{formatETB(bill.serviceCharge)}</span>
        </div>
        <div className="flex justify-between text-brand-secondary">
          <span>VAT 15%</span>
          <span>{formatETB(bill.vat)}</span>
        </div>
        {tipAmount > 0 ? (
          <div className="flex justify-between text-brand-accent">
            <span>Tip for {serverName}</span>
            <span>{formatETB(tipAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-sm text-brand-primary border-t border-divider pt-1.5">
          <span>Total due</span>
          <span>{formatETB(totalWithTip)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleMethodChange("cbe_birr")}
          className={cn(
            "rounded-button border p-3 text-left text-xs font-bold transition",
            method === "cbe_birr"
              ? "border-brand-accent bg-brand-accent/10 text-brand-primary"
              : "border-divider"
          )}
        >
          <Building2 className="h-4 w-4 mb-1" />
          CBE Birr / Bank
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("telebirr")}
          className={cn(
            "rounded-button border p-3 text-left text-xs font-bold transition",
            method === "telebirr"
              ? "border-brand-accent bg-brand-accent/10 text-brand-primary"
              : "border-divider"
          )}
        >
          <Send className="h-4 w-4 mb-1" />
          Telebirr
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center rounded-card border border-divider p-4 bg-bg-subtle">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`${method} payment QR`} className="h-[220px] w-[220px] rounded-button bg-white p-2 border border-divider" />
        ) : (
          <div className="h-[220px] w-[220px] rounded-button bg-white border border-divider animate-pulse" />
        )}
        <div className="flex-1 space-y-2 text-xs w-full">
          {method === "cbe_birr" ? (
            <>
              <p className="font-semibold text-brand-primary">{RESTAURANT_INFO.cbeAccount.accountName}</p>
              <p className="font-mono text-sm font-bold">{RESTAURANT_INFO.cbeAccount.accountNumber}</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-brand-primary">Keren Addis Telebirr Till</p>
              <p className="font-mono text-sm font-bold">849201</p>
            </>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-button border border-divider bg-white px-3 py-1.5 font-semibold text-brand-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Copy {method === "cbe_birr" ? "account" : "till"}
          </button>
          <p className="text-brand-secondary">
            Scan QR or copy the {method === "cbe_birr" ? "account" : "till"} and pay{" "}
            {formatETB(totalWithTip)} in {method === "cbe_birr" ? "CBE Birr" : "Telebirr"}.
          </p>
          {accountCopied ? (
            <p className="text-[11px] font-semibold text-status-available">
              Account copied — pay in your app, then notify the cashier below.
            </p>
          ) : (
            <p className="text-[11px] text-brand-secondary">
              The {method === "cbe_birr" ? "account" : "till"} is sent to the cashier automatically. You do not need to type a transaction ID.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-brand-secondary mb-2 flex items-center gap-1">
          <HeartHandshake className="h-3.5 w-3.5" />
          Tip your waiter (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {TIP_PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setTipAmount(amt)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-xs font-bold border",
                tipAmount === amt ? "bg-brand-primary text-white border-brand-primary" : "border-divider"
              )}
            >
              {amt === 0 ? "No tip" : `+${amt} ETB`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-brand-secondary mb-2 flex items-center gap-1">
          <Phone className="h-3.5 w-3.5" />
          Phone number (optional)
        </p>
        {isReturning && !showPhone ? (
          <div className="flex items-center justify-between gap-2 rounded-button border border-status-available/40 bg-status-available-bg/40 px-3 py-2 text-xs">
            <span className="text-brand-primary">
              Using your saved number <strong className="font-mono">{savedPhone}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="font-semibold text-brand-accent shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0912 345 678"
              className="w-full rounded-button border border-divider bg-white px-3 py-2 text-xs font-mono"
            />
            <p className="mt-1 text-[10px] text-brand-secondary">
              For your receipt and loyalty rewards. We remember it on this device so you won&apos;t need to type it again.
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => {
          const cleanPhone = phone.trim();
          if (cleanPhone) remember(cleanPhone, savedName);
          onSubmit(method, payAccount, tipAmount, cleanPhone, savedName);
        }}
        className="w-full min-h-[48px] rounded-button bg-brand-accent text-white text-sm font-bold disabled:opacity-50"
      >
        {isProcessing
          ? "Submitting…"
          : `I paid ${formatETB(totalWithTip)} — notify cashier`}
      </button>
    </div>
  );
}
