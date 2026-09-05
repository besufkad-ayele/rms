"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getOfflineQueue, QueueItem } from "@/lib/offline/db";
import { processOfflineQueue, SyncResult } from "@/lib/offline/sync-engine";

interface OfflineSyncContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncResult: SyncResult | null;
  syncNow: () => Promise<SyncResult | void>;
  refreshPendingCount: () => Promise<void>;
  enqueueAndSyncIfOnline: (
    actionType: QueueItem["actionType"],
    payload: any
  ) => Promise<{ success: boolean; offlineQueued: boolean; message?: string }>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const queue = await getOfflineQueue();
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const syncNow = useCallback(async (): Promise<SyncResult | void> => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await processOfflineQueue();
      setSyncResult(result);
      setLastSyncedAt(new Date());
      await refreshPendingCount();
      return result;
    } catch (err) {
      console.error("Error running manual/automatic sync:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  // Handle online/offline events
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto Sync when connection is restored!
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial count load
    refreshPendingCount();

    // Periodic check for internet connectivity & auto sync every 30s
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine && !isOnline) {
        setIsOnline(true);
        syncNow();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, refreshPendingCount, syncNow]);

  const enqueueAndSyncIfOnline: OfflineSyncContextType["enqueueAndSyncIfOnline"] = async (
    actionType,
    payload
  ) => {
    const { enqueueOfflineAction } = await import("@/lib/offline/db");

    if (!navigator.onLine) {
      // Offline: Enqueue locally
      await enqueueOfflineAction(actionType, payload);
      await refreshPendingCount();
      return {
        success: true,
        offlineQueued: true,
        message: "Network offline. Action saved locally and queued for sync.",
      };
    }

    // Online: Try sync immediately, fallback to queue if network throws exception
    try {
      const result = await enqueueOfflineAction(actionType, payload);
      await refreshPendingCount();
      const syncRes = await syncNow();

      if (syncRes && syncRes.failed > 0) {
        return {
          success: false,
          offlineQueued: true,
          message: "Saved locally, but immediate sync failed. Will retry automatically.",
        };
      }

      return {
        success: true,
        offlineQueued: false,
      };
    } catch (err: any) {
      return {
        success: false,
        offlineQueued: true,
        message: err?.message || "Failed to process action.",
      };
    }
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        lastSyncedAt,
        syncResult,
        syncNow,
        refreshPendingCount,
        enqueueAndSyncIfOnline,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error("useOfflineSync must be used within an OfflineSyncProvider");
  }
  return context;
}
