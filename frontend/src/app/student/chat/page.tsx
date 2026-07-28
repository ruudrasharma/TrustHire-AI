"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, AlertTriangle, User, Bot } from "lucide-react";
import { chatApi, ApiException } from "@/lib/api";
import type { ChatIntent } from "@/lib/types";

const STUDENT_ID_KEY = "th_student_id";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
}

const INTENT_OPTIONS: { value: ChatIntent; label: string; desc: string }[] = [
  { value: "faq", label: "General FAQ", desc: "Campus placement questions" },
  { value: "eligibility", label: "Eligibility", desc: "Explain eligibility results" },
  { value: "preparation", label: "Preparation", desc: "Interview & skill guidance" },
  { value: "profile", label: "Profile", desc: "Profile summary & advice" },
];

// Inner component — uses useSearchParams, must live inside <Suspense>
function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [intent, setIntent] = useState<ChatIntent>(
    (searchParams.get("intent") as ChatIntent) || "faq"
  );
  const [driveId, setDriveId] = useState(searchParams.get("driveId") || "");
  const [sending, setSending] = useState(false);
  const [ollamaDown, setOllamaDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const studentId = localStorage.getItem(STUDENT_ID_KEY) || "STU-001";
    const userMsg: Message = { role: "user", content: trimmed, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);
    setOllamaDown(false);

    try {
      const res = await chatApi.send({
        studentId,
        driveId: driveId || undefined,
        message: trimmed,
        intent,
      });
      setMessages(m => [...m, { role: "assistant", content: res.answer, timestamp: new Date() }]);
    } catch (e) {
      if (e instanceof ApiException && e.error.status === 503) {
        setOllamaDown(true);
        setMessages(m => [...m, {
          role: "error",
          content: "The AI assistant is temporarily unavailable. Other features (drive browsing, applications, eligibility checks) are unaffected.",
          timestamp: new Date(),
        }]);
      } else {
        setMessages(m => [...m, {
          role: "error",
          content: e instanceof ApiException ? e.error.message : "Something went wrong",
          timestamp: new Date(),
        }]);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center">
            <Sparkles size={18} className="text-[var(--accent-purple)]" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--text-primary)]">AI Career Assistant</h1>
            <p className="text-xs text-[var(--text-muted)]">Advisory only — never approves or modifies applications</p>
          </div>
        </div>

        {/* Intent selector */}
        <div className="flex gap-1.5 flex-wrap">
          {INTENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setIntent(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                intent === opt.value
                  ? "bg-[rgba(167,139,250,0.12)] text-[var(--accent-purple)] border-[rgba(167,139,250,0.3)]"
                  : "bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Drive ID field for eligibility/prep */}
        {(intent === "eligibility" || intent === "preparation") && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Drive ID (e.g. DRV-001)"
              value={driveId}
              onChange={e => setDriveId(e.target.value)}
              className="w-full max-w-[220px] bg-[var(--surface-1)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>
        )}
      </motion.div>

      {/* Ollama down banner */}
      <AnimatePresence>
        {ollamaDown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.2)] text-sm text-[var(--accent-amber)]">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">AI Assistant offline</p>
                <p className="text-xs opacity-80 mt-0.5">
                  Ollama is not running. Drive browsing, eligibility checks, and applications continue to work normally.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-[var(--accent-purple)]" />
            </div>
            <p className="font-medium text-[var(--text-primary)] mb-2">Ask me anything about placements</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              I can explain eligibility, suggest preparation steps, or summarize your profile — but I never change your application status.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === "user"
                ? "bg-[rgba(34,211,238,0.1)]"
                : msg.role === "error"
                ? "bg-[rgba(251,191,36,0.1)]"
                : "bg-[rgba(167,139,250,0.1)]"
            }`}>
              {msg.role === "user"
                ? <User size={13} className="text-[var(--accent-cyan)]" />
                : msg.role === "error"
                ? <AlertTriangle size={13} className="text-[var(--accent-amber)]" />
                : <Bot size={13} className="text-[var(--accent-purple)]" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[rgba(34,211,238,0.08)] text-[var(--text-primary)] rounded-tr-sm"
                : msg.role === "error"
                ? "bg-[rgba(251,191,36,0.06)] text-[var(--accent-amber)] border border-[rgba(251,191,36,0.2)] rounded-tl-sm"
                : "bg-[var(--surface-2)] text-[var(--text-primary)] rounded-tl-sm"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[rgba(167,139,250,0.1)] flex items-center justify-center mt-0.5">
              <Bot size={13} className="text-[var(--accent-purple)]" />
            </div>
            <div className="bg-[var(--surface-2)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-[var(--accent-purple)]" />
              <span className="text-xs text-[var(--text-muted)]">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
        <input
          id="chat-input"
          type="text"
          placeholder={`Ask about ${intent === "faq" ? "placements" : intent}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={sending}
          className="flex-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors disabled:opacity-60"
        />
        <motion.button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-purple)] text-white disabled:opacity-40 transition-opacity"
          aria-label="Send message"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </motion.button>
      </div>
    </div>
  );
}

// Outer page wraps ChatContent in Suspense — required by Next.js 16 for useSearchParams during build
export default function AIChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100dvh-8rem)]">
        <Loader2 size={24} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
