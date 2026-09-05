"use client";

import {
  getOfflineQueue,
  updateQueueItemStatus,
  removeQueueItem,
  QueueItem,
} from "./db";
import {
  submitOrderAction,
  submitPaymentAction,
  submitFeedbackAction,
} from "@/app/order/[tableCode]/actions";

const MAX_RETRIES = 5;

export interface SyncResult {
  totalProcessed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function processOfflineQueue(): Promise<SyncResult> {
  const queue = await getOfflineQueue();
  const pendingItems = queue.filter((item) => item.status !== "syncing");

  const result: SyncResult = {
    totalProcessed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  if (pendingItems.length === 0) {
    return result;
  }

  for (const item of pendingItems) {
    // If item reached max retries, mark failed and skip
    if (item.retryCount >= MAX_RETRIES) {
      await updateQueueItemStatus(item.id, "failed", "Exceeded max retries");
      result.failed++;
      result.errors.push(`Action ${item.actionType} (${item.id}) exceeded maximum retry attempts.`);
      continue;
    }

    result.totalProcessed++;
    await updateQueueItemStatus(item.id, "syncing");

    try {
      let response: { success: boolean; message?: string } = { success: false };

      switch (item.actionType) {
        case "CREATE_ORDER": {
          const { tableCode, items, customerNote } = item.payload;
          response = await submitOrderAction(tableCode, items, customerNote);
          break;
        }
        case "PROCESS_PAYMENT": {
          const { orderId, tableCode, method, amount } = item.payload;
          response = await submitPaymentAction(orderId, tableCode, method, amount);
          break;
        }
        case "SUBMIT_FEEDBACK": {
          const { orderId, tableCode, staffFriendliness, staffPromptness, foodRating, ambienceRating, comment, redirectedToGoogle } = item.payload;
          response = await submitFeedbackAction({
            orderId,
            tableCode,
            staffFriendliness: staffFriendliness || 5,
            staffPromptness: staffPromptness || 5,
            foodRating: foodRating || 5,
            ambienceRating: ambienceRating || 5,
            comment,
            redirectedToGoogle,
          });
          break;
        }
        default: {
          console.warn(`Unknown action type in sync engine: ${(item as any).actionType}`);
          response = { success: true };
          break;
        }
      }

      if (response.success) {
        await removeQueueItem(item.id);
        result.succeeded++;
      } else {
        const errorMsg = response.message || "Action execution failed on server";
        await updateQueueItemStatus(item.id, "pending", errorMsg, true);
        result.failed++;
        result.errors.push(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Network or execution error during sync";
      await updateQueueItemStatus(item.id, "pending", errorMsg, true);
      result.failed++;
      result.errors.push(errorMsg);
    }
  }

  return result;
}
