import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Leaf, Bug, CloudSun, Beef, Square, RotateCcw, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string; error?: boolean };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farming-chat`;
const STORAGE_KEY = "umuhinzi_chat_v1";

const QUICK_PROMPTS = [
  { icon: Leaf, label: "Guhinga ibirayi", message: "Sobanura uburyo bwiza bwo guhinga ibirayi mu Rwanda" },
  { icon: Bug, label: "Indwara z'ibihingwa", message: "Amababi y'ibihingwa byanjye arimo guhindura ibara. Ni indwara ki kandi nakoresha uwuhe muti?" },
  { icon: CloudSun, label: "Igihe cyo gutera", message: "Ni ryari igihe cyiza cyo gutera ibigori mu Rwanda?" },
  { icon: Beef, label: "Inka irwaye", message: "Inka yanjye yanze kurya kandi ifite umuriro. Nakora iki?" },
];

const ERRORS: Record<number, string> = {
  429: "Abantu benshi barimo kubaza ubu. Tegereza akanya gato wongere ugerageze.",
  402: "Serivisi ya AI ntiboneka by'agateganyo. Gerageza nyuma.",
  400: "Andika ikibazo cyawe neza wongere wohereze.",
};

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.content === "string").slice(-40) : [];
  } catch {
    return [];
  }
}

export default function FarmingChat() {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch { /* ignore */ }
    }
  }, [messages, isLoading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    stop();
    setMessages([]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const history = messages.filter((m) => !m.error);
    setMessages([...messages, userMsg]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantSoFar = "";
    const upsert = (content: string, error = false) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content, error } : m));
        }
        return [...prev, { role: "assistant", content, error }];
      });
    };

    const handleLine = (raw: string) => {
      let line = raw;
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) return;
      const json = line.slice(6).trim();
      if (!json || json === "[DONE]") return;
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) { assistantSoFar += c; upsert(assistantSoFar); }
      } catch { /* incomplete chunk — ignored */ }
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...history, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        upsert(ERRORS[resp.status] ?? "Habaye ikibazo mu guhuza na AI. Reba interineti wongere ugerageze.", true);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          handleLine(buf.slice(0, idx));
          buf = buf.slice(idx + 1);
        }
      }
      if (buf.trim()) handleLine(buf);
      if (!assistantSoFar) upsert("Nta gisubizo cyabonetse. Ongera ubaze mu yandi magambo.", true);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        if (!assistantSoFar) upsert("Wahagaritse igisubizo.", true);
      } else {
        console.error(e);
        upsert(assistantSoFar
          ? assistantSoFar + "\n\n_Igisubizo cyaciwe. Ongera ugerageze._"
          : "Interineti yagize ikibazo. Ongera ugerageze.", true);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    setMessages(messages.slice(0, idx));
    setTimeout(() => sendMessage(lastUser.content), 0);
  };

  const last = messages[messages.length - 1];

  return (
    <div className="flex flex-col h-full min-h-0">
      {messages.length > 0 && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2 max-w-3xl w-full mx-auto">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sprout className="h-4 w-4 text-primary" /> Umujyanama w'ubuhinzi
          </span>
          <Button variant="ghost" size="sm" onClick={newChat}>
            <RotateCcw className="h-4 w-4 mr-1" /> Ikiganiro gishya
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0" aria-live="polite">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-6 py-10">
              <div className="text-center space-y-2">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <Sprout className="h-7 w-7 text-secondary" />
                </span>
                <h1 className="font-heading text-2xl font-bold text-foreground">Baza Umuhinzi AI</h1>
                <p className="text-muted-foreground max-w-md">
                  Baza ikibazo ku buhinzi, ubworozi, ikirere, cyangwa indwara z'ibihingwa n'amatungo.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.message)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left text-sm"
                  >
                    <q.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap"
                    : m.error
                      ? "bg-destructive/10 text-foreground border border-destructive/30 rounded-bl-md"
                      : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-foreground">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {!isLoading && last?.error && (
            <div className="flex justify-start">
              <Button variant="outline" size="sm" onClick={retryLast}>
                <RotateCcw className="h-4 w-4 mr-1" /> Ongera ugerageze
              </Button>
            </div>
          )}

          {isLoading && last?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Ndimo gutekereza...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border p-3 sm:p-4 bg-background">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            placeholder="Andika ikibazo cyawe hano..."
            aria-label="Ikibazo cyawe"
            rows={1}
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
          />
          {isLoading ? (
            <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Hagarika" className="shrink-0 h-11 w-11">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Ohereza" className="shrink-0 h-11 w-11">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
