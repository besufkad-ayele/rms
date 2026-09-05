"use client";

import React from "react";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export function OfflineSyncBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow, lastSyncedAt, syncResult } = useOfflineSync();

  // If online and no pending items, show a subtle compact badge or remain hidden unless syncing
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return (
      <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Connection Stable & Synced
          </span>
        </div>
        {lastSyncedAt && (
          <span className="text-emerald-400/80 hidden sm:inline">
            Last synced: {lastSyncedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full text-xs font-sans px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 transition-colors duration-300 border-b ${
        !isOnline
          ? "bg-amber-950/95 border-amber-600 text-amber-100"
          : "bg-amber-900/90 border-amber-500 text-amber-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status Indicator Icon */}
        {!isOnline ? (
          <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono text-[11px]">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>OFFLINE MODE</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono text-[11px]">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>ONLINE</span>
          </div>
        )}

        {/* Pending Items Count */}
        <div className="flex items-center gap-1 font-medium">
          {pendingCount > 0 ? (
            <span className="flex items-center gap-1.5 font-semibold text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{pendingCount} order(s)/action(s) stored locally</span>
            </span>
          ) : (
            <span className="text-amber-200/80">Queue empty</span>
          )}
        </div>
      </div>

      {/* Manual Sync Button */}
      <div className="flex items-center gap-3">
        {syncResult && syncResult.failed > 0 && (
          <span className="text-red-300 text-[11px] font-mono hidden md:inline">
            ⚠️ {syncResult.failed} retry failure(s)
          </span>
        )}

        <button
          onClick={() => syncNow()}
          disabled={isSyncing || (!isOnline && pendingCount === 0)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition-all duration-200 ${
            isSyncing
              ? "bg-amber-700/50 text-amber-300 cursor-not-allowed border border-amber-600"
              : isOnline && pendingCount > 0
              ? "bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold shadow-amber-500/20 active:scale-95"
              : "bg-amber-800/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/50"
          }`}
          title="Manually trigger sync of local queued actions to server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-300" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
        </button>
      </div>
    </div>
  );
}
