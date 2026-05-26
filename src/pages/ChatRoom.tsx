import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

type Msg = { id: string; sender_id: string; content: string; created_at: string };

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [user, loading, nav]);

  useEffect(() => {
    if (!roomId) return;
    supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at").then(({ data }) => setMessages((data as Msg[]) || []));
    const ch = supabase.channel(`room-${roomId}`).on("postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
      (p) => setMessages(prev => [...prev, p.new as Msg])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !user || !roomId) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({ room_id: roomId, sender_id: user.id, content: input.trim() });
    if (!error) setInput("");
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Tangira ikiganiro...</p>}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>{m.content}</div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 pt-3 border-t border-border">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Andika ubutumwa..." />
          <Button type="submit" size="icon" disabled={sending || !input.trim()}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </form>
      </div>
    </div>
  );
}
