"use client";

import { useChat, type Message } from "ai/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef } from "react";
import Sidebar from "./sidebar";

export default function ChatPage() {
  const router      = useRouter();
  const params      = useSearchParams();
  const chatIdParam = params.get("c") ?? undefined;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
  } = useChat({
    initialMessages: [],
    body: { chatId: chatIdParam },
    onResponse(resp) {
      const cid = resp.headers.get("x-chat-id") ?? undefined;
      if (cid && cid !== chatIdParam) {
        router.replace(`/chat?c=${cid}`);
      }
    },
  });

  // 🔄 Load history whenever chatIdParam changes
  useEffect(() => {
    if (!chatIdParam) {
      setMessages([]);
      return;
    }
    fetch(`/api/messages/${chatIdParam}`)
      .then(res => res.json())
      .then((hist: { role: "user" | "assistant"; content: string }[]) => {
        // map to `Message[]` by adding an `id`
        const mapped: Message[] = hist.map((m, i) => ({
          id: `${chatIdParam}-${i}`,   // stable per chat + index
          role: m.role,
          content: m.content,
        }));
        setMessages(mapped);
      })
      .catch(console.error);
  }, [chatIdParam, setMessages]);

  // 📜 Scroll to bottom on new messages
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen">
      <Sidebar current={chatIdParam} />

      <main className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e: FormEvent) => {
            if (!input.trim()) return;
            handleSubmit(e);
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 border rounded p-2"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about Dark Alpha Capital…"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
