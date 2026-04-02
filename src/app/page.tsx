"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagline, setTagline] = useState(0);

  const taglines = [
    "Where your problems become someone else's entertainment 🍿",
    "Ask me anything, even weird stuff. I dare you 👀",
    "Therapy, but make it chaotic 🌪️",
    "100% anonymous. 0% solutions. All vibes. ✨",
    "Talk about anything: yourself, me, or that crush 🤫",
    "Confess, rant, or just babble wildly 🐒",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTagline((t) => (t + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function enterChaos() {
    setLoading(true);
    try {
      // Check if user already exists in localStorage
      const existingId = localStorage.getItem("chaos_user_id");
      if (existingId) {
        const res = await fetch(`/api/user?id=${existingId}`);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("chaos_thread_id", data.threadId);
          router.push("/chat");
          return;
        }
      }

      // Create new user
      const res = await fetch("/api/user", { method: "POST" });
      const data = await res.json();
      localStorage.setItem("chaos_user_id", data.user.id);
      localStorage.setItem("chaos_thread_id", data.threadId);
      localStorage.setItem("chaos_nickname", data.user.nickname);
      router.push("/chat");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen noise flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-900/15 blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-pink-900/10 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Floating emojis */}
      <div className="absolute top-[10%] left-[5%] text-4xl animate-float opacity-30">
        🧠
      </div>
      <div className="absolute top-[20%] right-[8%] text-3xl animate-wiggle opacity-20 delay-300">
        💀
      </div>
      <div className="absolute bottom-[15%] left-[10%] text-3xl animate-float opacity-20 delay-500">
        🕵️
      </div>
      <div className="absolute bottom-[25%] right-[5%] text-4xl animate-wiggle opacity-25">
        🌪️
      </div>
      <div className="absolute top-[60%] left-[2%] text-2xl animate-float opacity-20 delay-700">
        ✨
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-6xl animate-float">🧠</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-3 leading-tight">
          <span className="text-[#fbbf24]">Chaos</span>{" "}
          <span className="text-white">Therapy</span>
        </h1>

        <div className="h-8 mb-8 overflow-hidden">
          <p
            key={tagline}
            className="text-[#a855f7] text-sm md:text-base slide-in"
          >
            {taglines[tagline]}
          </p>
        </div>

        {/* Description card */}
        <div className="bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">🕵️</span>
            <div>
              <p className="text-[#fbbf24] text-sm font-bold">
                You are: Anonymous Creature
              </p>
              <p className="text-gray-400 text-xs">
                Completely untraceable. Even we don't know who you are (probably
                for the best).
              </p>
            </div>
          </div>
          <div className="border-t border-[#2a2a3a]" />
          <div className="flex items-start gap-3">
            <span className="text-xl">🧠</span>
            <div>
              <p className="text-[#a855f7] text-sm font-bold">
                Me (Vishwansh): Chaos Therapist
              </p>
              <p className="text-gray-400 text-xs">
                Will respond eventually. May judge you silently. Will definitely
                react to your confessions.
              </p>
            </div>
          </div>
          <div className="border-t border-[#2a2a3a]" />
          <div className="flex items-start gap-3">
            <span className="text-xl">🤫</span>
            <div>
              <p className="text-[#f472b6] text-sm font-bold">
                Confession Mode Available
              </p>
              <p className="text-gray-400 text-xs">
                For your most questionable thoughts. The therapist reacts. You
                cringe. Everyone wins.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={enterChaos}
          disabled={loading}
          className="relative group w-full md:w-auto px-10 py-4 bg-[#fbbf24] text-black font-display font-extrabold text-lg rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Generating your alter ego…
            </span>
          ) : (
            "🚪 Enter the Chaos"
          )}
        </button>

        <p className="mt-4 text-gray-600 text-xs">
          No login. No tracking. Just vibes and questionable life decisions.
        </p>
        <p className="mt-4 text-gray-600 text-xs">
          Built during exams (Free time)
        </p>
      </div>

      {/* Admin link */}
      <a
        href="/admin"
        className="absolute bottom-6 right-6 text-[#2a2a3a] text-xs hover:text-[#fbbf24] transition-colors duration-200"
      >
        🔐 therapist portal
      </a>
    </main>
  );
}
