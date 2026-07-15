import { useState } from "react";
import {
  Bot,
  MessageSquarePlus,
  Settings,
  MessageCircle,
  Trash2,
  Pencil,
} from "lucide-react";

type Chat = {
  id: number;
  title: string;
  messages: {
    sender: "user" | "bot";
    text: string;
  }[];
};

type Props = {
  chats: Chat[];
  currentChatId: number | null;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onNewChat: () => void;
  onSelectChat: (id: number) => void;
  onDeleteChat: (id: number) => void;
  onRenameChat: (id: number, title: string) => void;
};

function Sidebar({
  chats,
  currentChatId,
  searchQuery,
  setSearchQuery,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const saveTitle = (id: number) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }

    onRenameChat(id, editingTitle.trim());
    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900 text-white">
      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <Bot size={30} />

          <div>
            <h1 className="text-xl font-bold">DevMate AI</h1>

            <p className="text-xs text-slate-400">
              AI Coding Assistant
            </p>
          </div>
        </div>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 transition hover:bg-blue-700"
        >
          <MessageSquarePlus size={18} />
          New Chat
        </button>
      </div>

   {/* Search */}
<div className="px-4 pb-3">
  <input
    type="text"
    placeholder="🔍 Search chats..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
  />
</div>

{/* Chat List */}
<div className="flex-1 overflow-y-auto px-3">
        <p className="mb-3 px-2 text-xs uppercase tracking-wide text-slate-400">
          Recent Chats
        </p>

        {chats.length === 0 ? (
          <p className="px-2 text-sm text-slate-500">
            No chats yet
          </p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 transition ${
                currentChatId === chat.id
                  ? "bg-slate-700"
                  : "hover:bg-slate-800"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <MessageCircle size={16} />

                {editingId === chat.id ? (
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(e) =>
                      setEditingTitle(e.target.value)
                    }
                    onBlur={() => saveTitle(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveTitle(chat.id);
                      }
                    }}
                    className="w-full rounded bg-slate-800 px-2 py-1 text-sm outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate text-sm">
                    {chat.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setEditingTitle(chat.title);
                  }}
                >
                  <Pencil
                    size={15}
                    className="text-slate-300 hover:text-white"
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                >
                  <Trash2
                    size={15}
                    className="text-red-400 hover:text-red-300"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center gap-2 rounded-lg p-3 transition hover:bg-slate-800">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;