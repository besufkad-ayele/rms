"use client";

import { Printer } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { ReceiptData } from "@/lib/receipts";

export function PrintableReceipt({
  receipt,
  onContinue,
  continueLabel = "Continue",
}: {
  receipt: ReceiptData;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  const issued = new Date(receipt.issuedAt);

  return (
    <div className="space-y-4">
      <div className="thermal-receipt font-nyala mx-auto w-[80mm] max-w-full bg-white text-black p-4 border border-divider shadow-card">
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-neutral-400">
          <p className="font-bold text-base leading-tight">{receipt.restaurantName}</p>
          <p className="text-[11px] leading-snug">{receipt.restaurantAddress}</p>
          <p className="text-[11px]">{receipt.restaurantPhone}</p>
          <p className="text-[11px] font-mono">TIN: {receipt.tin}</p>
          <p className="text-[11px] font-mono">VAT No: {receipt.vatNumber}</p>
          <p className="text-[10px] uppercase tracking-wider pt-1 font-bold">
            {receipt.status === "confirmed" ? "Tax Receipt" : "Guest Check — Awaiting Staff"}
          </p>
        </div>

        <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-neutral-400">
          <div className="flex justify-between">
            <span>Receipt</span>
            <span className="font-mono font-bold">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>{issued.toLocaleString("en-ET")}</span>
          </div>
          <div className="flex justify-between">
            <span>Table</span>
            <span>{receipt.tableCode}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{receipt.cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Tender</span>
            <span>{receipt.paymentMethod}</span>
          </div>
          {receipt.transactionReference ? (
            <div className="flex justify-between">
              <span>Ref</span>
              <span className="font-mono">{receipt.transactionReference}</span>
            </div>
          ) : null}
        </div>

        <table className="w-full text-[11px] my-2">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="text-left font-semibold py-1">Item</th>
              <th className="text-right font-semibold">Qty</th>
              <th className="text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td className="py-0.5 pr-1">{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatETB(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-[11px] space-y-0.5 border-t border-dashed border-neutral-400 pt-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatETB(receipt.bill.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service 10%</span>
            <span>{formatETB(receipt.bill.serviceCharge)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT 15%</span>
            <span>{formatETB(receipt.bill.vat)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL</span>
            <span>{formatETB(receipt.bill.total)}</span>
          </div>
        </div>

        <p className="text-[9px] text-center leading-snug mt-3 text-neutral-600">
          Internal restaurant receipt. Not a certified Ministry of Revenue / ERCA
          fiscal invoice. Connect a certified EFD for legal VAT invoices.
        </p>
        <p className="text-[10px] text-center mt-1">Ameseginalehu — thank you</p>
      </div>

      <div className="no-print flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-primary text-white text-xs font-bold"
        >
          <Printer className="h-4 w-4" />
          Print / send to thermal printer
        </button>
        {onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 min-h-[44px] rounded-button border border-divider bg-white text-xs font-bold text-brand-primary"
          >
            {continueLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
