import { useEffect, useRef, useState } from "react";
import {
  Bug,
  CloudSun,
  Leaf,
  Loader2,
  RotateCcw,
  Send,
  Sprout,
  Square,
  Stethoscope,
  Beef,
  Store,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/hooks/useLang";

type Message = { role: "user" | "assistant"; content: string; error?: boolean };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farming-chat`;
const STORAGE_KEY = "umuhinzi_chat_v1";

const QUICK_PROMPTS = [
  {
    icon: Leaf,
    label: { rw: "Guhinga ibirayi", en: "Growing potatoes" },
    message: {
      rw: "Sobanura uburyo bwiza bwo guhinga ibirayi mu Rwanda, kuva gutegura ubutaka kugeza gusarura.",
      en: "Explain good practices for growing potatoes in Rwanda, from preparing the soil through harvest.",
    },
  },
  {
    icon: Bug,
    label: { rw: "Indwara z'ibihingwa", en: "Crop health" },
    message: {
      rw: "Amababi y'ibihingwa byanjye arimo guhindura ibara. Ni ibihe bimenyetso nkwiye kureba kandi nakora iki?",
      en: "The leaves on my crops are changing color. What symptoms should I check for, and what should I do?",
    },
  },
  {
    icon: CloudSun,
    label: { rw: "Igihe cyo gutera", en: "Planting season" },
    message: {
      rw: "Ni ryari igihe cyiza cyo gutera ibigori mu Rwanda, kandi ni iki nakwitondera mu gihe cy'imvura?",
      en: "When is the best time to plant maize in Rwanda, and what should I consider during the rainy season?",
    },
  },
  {
    icon: Beef,
    label: { rw: "Kwita ku matungo", en: "Livestock care" },
    message: {
      rw: "Inka yanjye yanze kurya kandi ifite umuriro. Ni izihe ntambwe z'ibanze nakora kandi ni ryari nahamagara veterineri?",
      en: "My cow has stopped eating and has a fever. What basic steps should I take, and when should I contact a vet?",
    },
  },
  {
    icon: Stethoscope,
    label: { rw: "Ubuzima bw'amatungo", en: "Animal health" },
    message: {
      rw: "Ni ibihe bimenyetso by'ingenzi nakurikirana kugira ngo menye ko ihene yanjye irwaye?",
      en: "What key signs should I watch for to know if my goat may be ill?",
    },
  },
  {
    icon: Store,
    label: { rw: "Kubika umusaruro", en: "Storing harvests" },
    message: {
      rw: "Ni gute nabika umusaruro w'ibigori nyuma yo gusarura kugira ngo utangirika?",
      en: "How can I store maize after harvest to help prevent spoilage?",
    },
  },
];

const ERRORS: Record<number, { rw: string; en: string }> = {
  429: {
    rw: "Abantu benshi barimo kubaza ubu. Tegereza akanya gato wongere ugerageze.",
    en: "The assistant is busy right now. Please wait a moment and try again.",
  },
  402: {
    rw: "Serivisi ya AI ntiboneka by'agateganyo. Gerageza nyuma.",
    en: "The AI service is temporarily unavailable. Please try again later.",
  },
  400: {
    rw: "Andika ikibazo cyawe neza wongere wohereze.",
    en: "Please check your question and try sending it again.",
  },
};

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (message): message is Message =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          typeof message.error !== "undefined" ? typeof message.error === "boolean" : true,
      )
      .slice(-40);
  } catch {
    return [];
  }
}

export default function FarmingChat() {
  const { lang } = useLang();
  const isEnglish = lang === "en";
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const text = isEnglish
    ? {
        title: "Farm & livestock advisor",
        context: "Practical guidance for farmers in Rwanda",
        newChat: "New conversation",
        welcome: "How can we help on your farm today?",
        description: "Ask about crops, animal care, weather, or your next steps. You can write in Kinyarwanda or English.",
        topics: "Explore common farm questions",
        note: "For urgent animal-health concerns, contact a veterinary professional. AI guidance is informational and is not a diagnosis.",
        placeholder: "Ask a question about your farm...",
        inputLabel: "Your farming question",
        send: "Send question",
        stop: "Stop response",
        thinking: "Preparing practical guidance...",
        retry: "Try again",
        stopped: "Response stopped.",
        noAnswer: "No answer was received. Please ask again in a different way.",
        connectionError: "Could not connect to the assistant. Check your internet connection and try again.",
        interrupted: "The response was interrupted. Please try again.",
        characterCount: "characters",
      }
    : {
        title: "Umujyanama w'ubuhinzi n'ubworozi",
        context: "Inama zifasha abahinzi n'aborozi bo mu Rwanda",
        newChat: "Ikiganiro gishya",
        welcome: "Uyu munsi twagufasha iki mu murima cyangwa mu rwuri?",
        description: "Baza ku bihingwa, kwita ku matungo, ikirere cyangwa intambwe wakurikiza. Ushobora kwandika mu Kinyarwanda cyangwa mu Cyongereza.",
        topics: "Hitamo ikibazo ukunze kwibaza",
        note: "Ku kibazo gikomeye cy'ubuzima bw'itungo, hamagara veterineri. Inama za AI zigamije gutanga amakuru, ntizisimbura isuzuma ry'umuganga.",
        placeholder: "Baza ikibazo kijyanye n'umurima wawe...",
        inputLabel: "Ikibazo cyawe ku buhinzi cyangwa ubworozi",
        send: "Ohereza ikibazo",
        stop: "Hagarika igisubizo",
        thinking: "Ndimo gutegura inama zagufasha...",
        retry: "Ongera ugerageze",
        stopped: "Wahagaritse igisubizo.",
        noAnswer: "Nta gisubizo cyabonetse. Ongera ubaze mu yandi magambo.",
        connectionError: "Interineti yagize ikibazo. Ongera ugerageze.",
        interrupted: "Igisubizo cyaciwe. Ongera ugerageze.",
        characterCount: "inyuguti",
      };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
      } catch {
        // Chat remains usable when browser storage is unavailable or full.
      }
    }
  }, [messages, isLoading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setMessages([]);
    setInput("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }
    inputRef.current?.focus();
  };

  const sendMessage = async (value: string) => {
    const question = value.trim();
    if (!question || isLoading) return;

    const requestId = ++generationRef.current;
    const userMessage: Message = { role: "user", content: question };
    const history = messages.filter((message) => !message.error);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantSoFar = "";
    const upsert = (content: string, error = false) => {
      if (requestId !== generationRef.current) return;
      setMessages((current) => {
        const last = current[current.length - 1];
        if (last?.role === "assistant") {
          return current.map((message, index) =>
            index === current.length - 1 ? { ...message, content, error } : message,
          );
        }
        return [...current, { role: "assistant", content, error }];
      });
    };

    const handleLine = (raw: string) => {
      const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
      if (!line.startsWith("data: ")) return;
      const json = line.slice(6).trim();
      if (!json || json === "[DONE]") return;
      try {
        const content = JSON.parse(json).choices?.[0]?.delta?.content;
        if (content) {
          assistantSoFar += content;
          upsert(assistantSoFar);
        }
      } catch {
        // Ignore malformed or non-content stream events.
      }
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...history, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        upsert(
          ERRORS[response.status]?.[lang] ??
            (isEnglish
              ? "There was a problem connecting to the assistant. Please try again."
              : "Habaye ikibazo mu guhuza na AI. Ongera ugerageze."),
          true,
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lineEnd: number;
        while ((lineEnd = buffer.indexOf("\n")) !== -1) {
          handleLine(buffer.slice(0, lineEnd));
          buffer = buffer.slice(lineEnd + 1);
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) handleLine(buffer);
      if (!assistantSoFar) upsert(text.noAnswer, true);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        if (!assistantSoFar) upsert(text.stopped, true);
      } else {
        console.error(error);
        upsert(
          assistantSoFar
            ? `${assistantSoFar}\n\n_${text.interrupted}_`
            : text.connectionError,
          true,
        );
      }
    } finally {
      if (requestId === generationRef.current) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    const index = messages.lastIndexOf(lastUser);
    setMessages(messages.slice(0, index));
    window.setTimeout(() => void sendMessage(lastUser.content), 0);
  };

  const last = messages[messages.length - 1];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border bg-card/70 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-secondary">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-sm font-bold text-foreground sm:text-base">{text.title}</h1>
              <p className="truncate text-xs text-muted-foreground">{text.context}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={newChat} className="shrink-0">
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{text.newChat}</span>
            <span className="sm:hidden">{isEnglish ? "New" : "Gishya"}</span>
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
          {messages.length === 0 && (
            <section className="mx-auto max-w-3xl py-2 sm:py-6" aria-labelledby="chat-welcome">
              <div className="mb-7 text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sprout className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 id="chat-welcome" className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {text.welcome}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {text.description}
                </p>
              </div>

              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{text.topics}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {isEnglish ? "Rwanda" : "U Rwanda"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_PROMPTS.map(({ icon: Icon, label, message }) => (
                  <button
                    key={label.en}
                    type="button"
                    onClick={() => void sendMessage(message[lang])}
                    className="group flex min-h-20 items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{label[lang]}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-border/70 bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
                {text.note}
              </p>
            </section>
          )}

          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <span className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sprout className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <div
                className={`max-w-[88%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                  message.role === "user"
                    ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
                    : message.error
                      ? "rounded-bl-md border border-destructive/30 bg-destructive/10 text-foreground"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-foreground">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {!isLoading && last?.error && (
            <div className="pl-10">
              <Button variant="outline" size="sm" onClick={retryLast}>
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />{text.retry}
              </Button>
            </div>
          )}

          {isLoading && last?.role === "user" && (
            <div className="flex items-end gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sprout className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />{text.thinking}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="border-t border-border bg-background px-3 py-3 sm:px-6 sm:py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
          className="mx-auto flex max-w-5xl items-end gap-2"
        >
          <div className="min-w-0 flex-1">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 2000))}
              placeholder={text.placeholder}
              aria-label={text.inputLabel}
              rows={1}
              className="max-h-32 min-h-11 resize-none bg-card"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <p className="mt-1 px-1 text-right text-[11px] text-muted-foreground" aria-live="off">
              {input.length}/2000 {text.characterCount}
            </p>
          </div>
          {isLoading ? (
            <Button type="button" size="icon" variant="outline" onClick={stop} aria-label={text.stop} className="mb-5 h-11 w-11 shrink-0">
              <Square className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label={text.send} className="mb-5 h-11 w-11 shrink-0">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </form>
      </footer>
    </div>
  );
}
