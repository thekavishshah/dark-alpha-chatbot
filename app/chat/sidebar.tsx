"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ChatRow { id: string; title: string | null }

export default function Sidebar({ current }: { current?: string }) {
  const [chats, setChats] = useState<ChatRow[]>([]);

  useEffect(() => {
    fetch("/api/chats").then(r => r.json()).then(setChats);
  }, [current]);

  return (
    <aside className="w-64 border-r p-4 space-y-2">
      <button
        className="w-full bg-blue-600 text-white rounded p-2"
        onClick={() => location.assign("/chat")}   // no ?c = new chat
      >
        + New chat
      </button>

      {chats.map(c => (
        <Link key={c.id}
              href={`/chat?c=${c.id}`}
              className={`block truncate p-2 rounded
                         ${c.id === current ? "bg-gray-200"
                                            : "hover:bg-gray-100"}`}>
          {c.title || "Untitled chat"}
        </Link>
      ))}
    </aside>
  );
}
