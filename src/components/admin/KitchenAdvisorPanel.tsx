"use client";

import React, { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Send, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { askKitchenAdvisorAction } from "@/app/admin/dashboard/actions";

type ChatTurn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should we add or promote this week?",
  "Which items should we stop or reprice?",
  "How is inventory pressure affecting top sellers?",
  "Summarize growth winners and losers.",
];

export function KitchenAdvisorPanel() {
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  const ask = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || isPending) return;
    setError(null);
    setTurns((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    startTransition(async () => {
      const res = await askKitchenAdvisorAction(trimmed);
      if (!res.ok) {
        setError(res.error);
        setTurns((prev) => [
          ...prev,
          { role: "assistant", content: `**Could not answer.** ${res.error}` },
        ]);
        return;
      }
      setTurns((prev) => [...prev, { role: "assistant", content: res.markdown }]);
    });
  };

  return (
    <div className="rounded-card border border-divider bg-white p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-accent" />
            <h3 className="font-header text-base font-bold text-brand-heading">
              Kitchen AI Advisor
            </h3>
          </div>
          <p className="mt-0.5 text-[11px] text-brand-secondary">
            Asks Gemini using live sales, tips, menu mix, and inventory pressure. Answers render as
            Markdown.
          </p>
        </div>
        <MessageSquare className="h-4 w-4 text-brand-secondary shrink-0" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isPending}
            onClick={() => ask(s)}
            className="rounded-pill border border-divider bg-bg-subtle px-2.5 py-1 text-[10px] font-semibold text-brand-primary hover:bg-bg-card disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-card border border-divider bg-bg-subtle/40 p-3">
        {turns.length === 0 && (
          <p className="py-8 text-center text-xs text-brand-secondary">
            Ask about products, growth, inventory, or what to add next.
          </p>
        )}
        {turns.map((t, i) => (
          <div
            key={`${t.role}-${i}`}
            className={cn(
              "rounded-card border px-3 py-2.5 text-xs",
              t.role === "user"
                ? "ml-6 border-brand-primary/20 bg-brand-primary text-white"
                : "mr-2 border-divider bg-white text-brand-primary"
            )}
          >
            {t.role === "user" ? (
              <p className="font-medium">{t.content}</p>
            ) : (
              <div className="ai-md space-y-2 text-xs leading-relaxed text-brand-primary [&_h1]:font-header [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-brand-heading [&_h2]:font-header [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-brand-heading [&_h3]:text-xs [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-bold [&_strong]:text-brand-heading [&_p]:my-1.5 [&_code]:rounded [&_code]:bg-bg-subtle [&_code]:px-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-brand-secondary">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Analyzing sales &amp; inventory…
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-status-danger">{error}</p>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Should we raise coffee prices given bean cost?"
          className="min-w-0 flex-1 rounded-button border border-divider bg-bg-subtle px-3 py-2.5 text-xs text-brand-primary"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="inline-flex items-center gap-1.5 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Ask
        </button>
      </form>
    </div>
  );
}
