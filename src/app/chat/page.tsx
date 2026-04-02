"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  threadId: string;
  sender: string;
  content: string;
  type: string;
  reaction: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

const REACTIONS = {
  "😂": "This is illegal but funny",
  "😐": "We need to talk",
  "😳": "WHAT DID I JUST READ",
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConfession, setIsConfession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nickname, setNickname] = useState("");
  const [threadId, setThreadId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/messages?threadId=${tid}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("chaos_user_id");
    const tid = localStorage.getItem("chaos_thread_id");
    const nick = localStorage.getItem("chaos_nickname");

    if (!userId || !tid) {
      router.push("/");
      return;
    }

    setThreadId(tid);
    setNickname(nick || "Anonymous Creature");
    fetchMessages(tid).finally(() => setLoading(false));

    // Poll every 8 seconds for new messages
    pollRef.current = setInterval(() => fetchMessages(tid), 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !threadId || sending) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          sender: "user",
          content: input.trim(),
          type: isConfession ? "confession" : "normal",
        }),
      });
      setInput("");
      setIsConfession(false);
      await fetchMessages(threadId);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const hasAdminMessages = messages.some((m) => m.sender === "admin");

  return (
    <div className="min-h-[100dvh] noise flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3a] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg">
                🧠
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0f]" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">
                Chaos Therapist (Vishwansh)
              </p>
              <p className="text-xs text-green-400">● Judging silently</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">You are</p>
            <p className="text-xs text-[#fbbf24] font-bold truncate max-w-[140px]">
              🕵️ {nickname}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      {/* <main className="flex-1 overflow-y-auto px-4 py-4"> */}
      <main className="px-4 py-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🌪️</p>
              <p className="text-gray-400 text-sm">No chaos yet.</p>
              <p className="text-[#fbbf24] text-sm font-bold">
                Be the first problem.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble key={msg.id} msg={msg} index={i} />
            ))
          )}

          {/* Pending reply indicator */}
          {!loading && messages.length > 0 && !hasAdminMessages && (
            <div className="flex items-center gap-2 pl-2 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#a855f7] dot-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#a855f7] dot-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#a855f7] dot-bounce" />
              </div>
              <p className="text-xs text-[#a855f7]">
                ⏳ Therapist is overthinking your life…
              </p>
            </div>
          )}
          {!loading &&
            hasAdminMessages &&
            messages[messages.length - 1]?.sender === "user" && (
              <div className="flex items-center gap-2 pl-2 py-1">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dot-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dot-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dot-bounce" />
                </div>
                <p className="text-xs text-purple-400">
                  ⏳ Therapist is processing your questionable choices…
                </p>
              </div>
            )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 w-full pb-[env(safe-area-inset-bottom)] bg-[#0a0a0f]/90 backdrop-blur-md border-t border-[#2a2a3a] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {/* Confession toggle */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsConfession((c) => !c)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                isConfession
                  ? "bg-pink-900/50 border border-pink-500 text-pink-300"
                  : "bg-[#13131a] border border-[#2a2a3a] text-gray-500 hover:text-gray-300"
              }`}
            >
              <span>🤫</span>
              {isConfession ? "Confession Mode ON" : "Enable Confession Mode"}
            </button>
            {isConfession && (
              <span className="text-xs text-pink-400 animate-pulse">
                🔥 Forbidden thought mode activated
              </span>
            )}
          </div>

          {/* Input row */}
          <div
            className={`flex gap-2 rounded-xl border p-1 transition-all duration-200 ${
              isConfession
                ? "border-pink-500/50 bg-pink-900/10"
                : "border-[#2a2a3a] bg-[#13131a]"
            }`}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isConfession
                  ? "🤫 Type your forbidden thought… it will be judged."
                  : "Type your questionable life choices…"
              }
              rows={2}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="self-end mb-1 mr-1 px-4 py-2 bg-[#fbbf24] text-black text-xs font-display font-extrabold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {sending ? "..." : "🚀 Release"}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-700 mt-1">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </footer>
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.sender === "user";
  const isConfession = msg.type === "confession";

  return (
    <div
      className={`flex slide-in ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Admin avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
          🧠
        </div>
      )}

      <div
        className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        {/* Confession label */}
        {isConfession && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-pink-900/30 border border-pink-500/40 rounded-full self-start">
            <span className="text-xs">🤫</span>
            <span className="text-[10px] text-pink-300 font-bold">
              Forbidden Thought Detected
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isConfession
              ? "bubble-confession confession-shimmer"
              : isUser
                ? "bubble-user"
                : "bubble-admin"
          } ${!isUser ? "glow-purple" : ""}`}
        >
          <p className="text-white whitespace-pre-wrap">{msg.content}</p>
        </div>

        {/* Reaction badge */}
        {isConfession && msg.reaction && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#13131a] border border-[#2a2a3a] rounded-full">
            <span className="text-base">{msg.reaction}</span>
            <span className="text-xs text-gray-400">
              {REACTIONS[msg.reaction as keyof typeof REACTIONS]}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] text-gray-600 ${isUser ? "text-right" : "text-left"}`}
        >
          {!isUser && "🧠 "}
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-sm ml-2 mt-1 flex-shrink-0">
          🕵️
        </div>
      )}
    </div>
  );
}
