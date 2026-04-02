'use client'

import { useEffect, useState, useCallback } from 'react'

interface Message {
  id: string
  threadId: string
  sender: string
  content: string
  type: string
  reaction: string | null
  scheduledAt: string | null
  createdAt: string
}

interface Thread {
  id: string
  messages: Message[]
}

interface User {
  id: string
  nickname: string
  createdAt: string
  threads: Thread[]
}

const REACTIONS = ['😂', '😐', '😳'] as const
const REACTION_LABELS: Record<string, string> = {
  '😂': 'This is illegal but funny',
  '😐': 'We need to talk',
  '😳': 'WHAT DID I JUST READ',
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [secretInput, setSecretInput] = useState('')

  const fetchUsers = useCallback(async (s: string) => {
    try {
      const res = await fetch(`/api/admin/threads?secret=${s}`)
      if (!res.ok) { setAuthError(true); return }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchMessages = useCallback(async (threadId: string, s: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/messages?threadId=${threadId}&secret=${s}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  async function login() {
    setAuthError(false)
    const res = await fetch(`/api/admin/threads?secret=${secretInput}`)
    if (res.ok) {
      setSecret(secretInput)
      setAuthed(true)
      const data = await res.json()
      setUsers(data.users || [])
    } else {
      setAuthError(true)
    }
  }

  async function selectUser(user: User) {
    setSelectedUser(user)
    setMessages([])
    setReply('')
    setScheduledAt('')
    const tid = user.threads[0]?.id
    if (tid) await fetchMessages(tid, secret)
  }

  async function sendReply() {
    if (!reply.trim() || !selectedUser?.threads[0]?.id || sending) return
    setSending(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedUser.threads[0].id,
          sender: 'admin',
          content: reply.trim(),
          type: 'normal',
          scheduledAt: scheduledAt || null,
        }),
      })
      setReply('')
      setScheduledAt('')
      await fetchMessages(selectedUser.threads[0].id, secret)
      await fetchUsers(secret)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  async function addReaction(messageId: string, reaction: string) {
    try {
      await fetch('/api/messages/react', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, reaction }),
      })
      if (selectedUser?.threads[0]?.id) {
        await fetchMessages(selectedUser.threads[0].id, secret)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const now = new Date()
  const pendingCount = messages.filter(m =>
    m.scheduledAt && new Date(m.scheduledAt) > now
  ).length

  if (!authed) {
    return (
      <div className="min-h-screen noise flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-6xl mb-3 animate-float">🧠</p>
            <h1 className="font-display font-extrabold text-2xl text-white">Therapist Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Enter the secret to access the chaos</p>
          </div>
          <div className="bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
            <input
              type="password"
              value={secretInput}
              onChange={e => setSecretInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Secret password…"
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#fbbf24] transition-colors"
            />
            {authError && (
              <p className="text-pink-400 text-xs text-center">❌ Wrong password, chaos criminal</p>
            )}
            <button
              onClick={login}
              className="w-full py-3 bg-[#fbbf24] text-black font-display font-extrabold rounded-xl hover:scale-105 transition-all duration-200"
            >
              🔓 Enter the Portal
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen noise bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#2a2a3a] flex flex-col bg-[#0d0d14]">
        <div className="p-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <div>
              <h1 className="font-display font-extrabold text-sm text-white">Chaos Therapist</h1>
              <p className="text-[10px] text-green-400">● Admin Portal Active</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-[#2a2a3a]">
          <p className="text-xs text-gray-500 mb-2">
            {users.length} creature{users.length !== 1 ? 's' : ''} in the chaos
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-3xl mb-2">🌵</p>
              <p className="text-gray-600 text-xs">No creatures yet. Share the link.</p>
            </div>
          ) : (
            users.map(user => {
              const lastMsg = user.threads[0]?.messages[0]
              const isSelected = selectedUser?.id === user.id
              return (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className={`w-full text-left px-4 py-3 border-b border-[#1a1a24] transition-all duration-150 ${
                    isSelected
                      ? 'bg-purple-900/20 border-l-2 border-l-[#a855f7]'
                      : 'hover:bg-[#13131a]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">🕵️</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#fbbf24]' : 'text-white'}`}>
                        {user.nickname}
                      </p>
                      {lastMsg ? (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {lastMsg.sender === 'admin' ? '🧠 ' : '🕵️ '}{lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-600 mt-0.5">No messages yet</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4 animate-float">👈</p>
              <p className="text-gray-400 text-sm">Select a creature to begin judging</p>
              <p className="text-gray-600 text-xs mt-1">Their problems await your wisdom</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="border-b border-[#2a2a3a] px-6 py-3 bg-[#0d0d14] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕵️</span>
                <div>
                  <p className="font-display font-bold text-white text-sm">{selectedUser.nickname}</p>
                  <p className="text-[10px] text-gray-500">
                    Thread ID: {selectedUser.threads[0]?.id?.slice(0, 8)}…
                  </p>
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-900/30 border border-yellow-500/40 rounded-full">
                  <span className="text-xs">⏳</span>
                  <span className="text-xs text-yellow-300">{pendingCount} scheduled</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[#fbbf24] dot-bounce" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🦗</p>
                  <p className="text-gray-500 text-sm">Cricket sounds. No messages yet.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isUser = msg.sender === 'user'
                  const isConfession = msg.type === 'confession'
                  const isScheduled = msg.scheduledAt && new Date(msg.scheduledAt) > now

                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'} slide-in`}>
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isUser ? 'items-start' : 'items-end'}`}>
                        {isConfession && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-pink-900/30 border border-pink-500/40 rounded-full">
                            <span className="text-[10px]">🤫</span>
                            <span className="text-[10px] text-pink-300 font-bold">Forbidden Thought</span>
                          </div>
                        )}
                        {isScheduled && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-900/30 border border-yellow-500/40 rounded-full">
                            <span className="text-[10px]">⏳</span>
                            <span className="text-[10px] text-yellow-300">
                              Sends: {new Date(msg.scheduledAt!).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-3 rounded-2xl text-sm ${
                          isScheduled
                            ? 'bg-yellow-900/20 border border-yellow-500/30 opacity-70'
                            : isConfession
                            ? 'bubble-confession'
                            : isUser
                            ? 'bubble-user'
                            : 'bubble-admin'
                        }`}>
                          <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Reaction buttons for confessions */}
                        {isConfession && isUser && (
                          <div className="flex gap-1 mt-1">
                            {REACTIONS.map(r => (
                              <button
                                key={r}
                                onClick={() => addReaction(msg.id, r)}
                                title={REACTION_LABELS[r]}
                                className={`px-2 py-1 rounded-lg text-sm border transition-all duration-150 ${
                                  msg.reaction === r
                                    ? 'bg-pink-900/40 border-pink-500 scale-110'
                                    : 'bg-[#13131a] border-[#2a2a3a] hover:border-pink-500/50'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                            {msg.reaction && (
                              <span className="text-[10px] text-gray-500 self-center ml-1">
                                {REACTION_LABELS[msg.reaction]}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-[10px] text-gray-600">
                          {isUser ? '🕵️ ' : '🧠 '}
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Reply box */}
            <div className="border-t border-[#2a2a3a] p-4 bg-[#0d0d14]">
              <div className="space-y-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your therapeutic response (judgment optional)…"
                  rows={3}
                  className="w-full bg-[#13131a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-colors resize-none"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 whitespace-nowrap">⏰ Schedule:</label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="flex-1 bg-[#13131a] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                    />
                    {scheduledAt && (
                      <button
                        onClick={() => setScheduledAt('')}
                        className="text-xs text-gray-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="px-5 py-2 bg-[#a855f7] text-white font-display font-bold text-sm rounded-xl hover:scale-105 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sending ? '...' : scheduledAt ? '⏳ Schedule' : '🧠 Send Wisdom'}
                  </button>
                </div>
                {scheduledAt && (
                  <p className="text-xs text-yellow-400">
                    ⏳ This message will be delivered on {new Date(scheduledAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
