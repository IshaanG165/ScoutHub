"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/supabase/auth";
import { fetchConnectedUsers, fetchMessages, sendMessage } from "@/lib/supabase/db";

function MessagesContent() {
  const { user, supabase, loading } = useAuth();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");

  const [contacts, setContacts] = React.useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(initialUserId || null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loadingData, setLoadingData] = React.useState(true);

  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user || !supabase) return;
    async function load() {
      const data = await fetchConnectedUsers(user!.id, supabase);
      setContacts(data);
      if (!selectedUserId && data.length > 0 && !initialUserId) {
        setSelectedUserId(data[0].id);
      }
      setLoadingData(false);
    }
    load();
  }, [user, supabase, initialUserId, selectedUserId]);

  React.useEffect(() => {
    if (!user || !supabase || !selectedUserId) return;
    async function loadMsgs() {
      const msgs = await fetchMessages(user!.id, selectedUserId!, supabase);
      setMessages(msgs);
      scrollToBottom();
    }
    loadMsgs();

    const channel = supabase.channel("realtime:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUserId) ||
          (msg.sender_id === selectedUserId && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUserId, user, supabase]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.trim() || !user || !selectedUserId) return;
    
    const content = draft.trim();
    setDraft("");
    
    // Optimistic UI
    const tempMsg = {
      id: "temp-" + Date.now(),
      sender_id: user.id,
      receiver_id: selectedUserId,
      content,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    await sendMessage(user.id, selectedUserId, content, supabase);
  };

  if (loading || loadingData) {
    return (
      <AppShell>
        <div className="flex h-[calc(100vh-100px)] animate-pulse rounded-2xl bg-scouthub-tint" />
      </AppShell>
    );
  }

  const selectedContact = contacts.find((c) => c.id === selectedUserId);

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-120px)] max-w-6xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5 animate-fade-in">
        
        {/* Sidebar */}
        <div className="w-full max-w-[320px] flex-shrink-0 border-r border-black/5 bg-scouthub-tint/20 flex flex-col">
          <div className="p-4 border-b border-black/5">
            <h1 className="text-xl font-extrabold tracking-tight">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedUserId(contact.id)}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
                    selectedUserId === contact.id ? "bg-scouthub-green/10 ring-1 ring-scouthub-green/20" : "hover:bg-scouthub-tint"
                  }`}
                >
                  <Avatar src={contact.avatar_url} alt={contact.full_name} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-scouthub-dark">{contact.full_name}</div>
                    <div className="truncate text-xs text-scouthub-muted capitalize">{contact.role}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center p-5 text-sm text-scouthub-muted">
                No connections yet. Go to Discover to find people!
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex flex-1 flex-col bg-scouthub-tint/5">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-black/5 bg-white p-4">
                <Avatar src={selectedContact.avatar_url} alt={selectedContact.full_name} size={40} />
                <div>
                  <div className="text-sm font-extrabold flex items-center gap-1">
                    {selectedContact.full_name}
                    {selectedContact.verified && <CheckCircle2 className="h-4 w-4 text-scouthub-green" />}
                  </div>
                  <div className="text-xs text-scouthub-muted capitalize">{selectedContact.role}</div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No messages yet" description="Send a message to start the conversation." />
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMine ? "bg-scouthub-green text-white rounded-br-none" : "bg-white ring-1 ring-black/5 text-scouthub-dark rounded-bl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={endOfMessagesRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-black/5 bg-white p-4">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your message..."
                    className="h-12 flex-1 rounded-xl bg-scouthub-tint/60 px-4 text-sm ring-1 ring-black/5 placeholder:text-scouthub-muted focus:outline-none focus:ring-2 focus:ring-scouthub-green/20"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-scouthub-green text-white transition hover:bg-scouthub-green/90 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-scouthub-muted text-sm">
              <div className="flex flex-col items-center">
                <MessageSquare className="h-12 w-12 text-scouthub-muted/50 mb-3" />
                Select a conversation to start messaging
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
