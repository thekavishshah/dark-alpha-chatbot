"use client";
import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,    setInput]    = useState("");
  const [chatId,   setChatId]   = useState<string | undefined>();

  /* ---------- persist chatId across page reloads ---------- */
  useEffect(() => {
    setChatId(localStorage.getItem("dac-chat-id") ?? undefined);
  }, []);
  useEffect(() => {
    if (chatId) localStorage.setItem("dac-chat-id", chatId);
  }, [chatId]);

  /* ---------- NEW: fetch full history whenever chatId changes ---------- */
  useEffect(() => {
    if (!chatId) return;
    (async () => {
      try {
        const res  = await fetch(`/api/messages/${chatId}`);
        if (!res.ok) return;
        const data = (await res.json()) as Msg[];
        setMessages(data);
      } catch {
        /* ignore */
      }
    })();
  }, [chatId]);

  /* ---------- send message ---------- */
  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: [...messages, userMsg], chatId }),
      });

      const id = res.headers.get("x-chat-id");
      if (id && id !== chatId) setChatId(id);

      if (res.body) {
        const reader   = res.body.getReader();
        const decoder  = new TextDecoder();
        let assistant  = "";

        let firstChunk = true;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          assistant += decoder.decode(value, { stream: true });

          setMessages(prev => {
            const arr = [...prev];
            if (firstChunk) {
              arr.push({ role: "assistant", content: assistant });
              firstChunk = false;
            } else {
              arr[arr.length - 1].content = assistant;
            }
            return arr;
          });
        }
      } else {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.content ?? "🤖" },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ network error" },
      ]);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontWeight: 600, fontSize: 24, marginBottom: 16 }}>
        Dark Alpha Capital Chat
      </h1>

      <div style={{ minHeight: 320 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 16,
                background: m.role === "user" ? "#d0eaff" : "#f0f0f0",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex" }}>
        <input
          style={{ flex: 1, padding: 8, fontSize: 16 }}
          value={input}
          placeholder="Ask anything…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button
          style={{ marginLeft: 8, padding: "0 16px", fontSize: 16 }}
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
