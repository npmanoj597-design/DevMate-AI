import { useEffect, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import MessageBubble from "./components/MessageBubble";
import ChatInput from "./components/ChatInput";
import jsPDF from "jspdf";

type Message = {
  sender: "user" | "bot";
  text: string;
};

type Chat = {
  id: number;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "devmate_chats";
const CURRENT_CHAT_KEY = "devmate_current_chat";

function App() {
  // ===========================
  // State
  // ===========================

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [loaded, setLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);

  // ===========================
  // Current Chat
  // ===========================

  const currentChat =
    chats.find((chat) => chat.id === currentChatId) ?? null;

  const messages = currentChat?.messages ?? [];
  
  const filteredChats = chats.filter((chat) =>
  chat.title
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
);

  // ===========================
  // Load LocalStorage
  // ===========================

  useEffect(() => {
    const savedChats = localStorage.getItem(STORAGE_KEY);
    const savedCurrent = localStorage.getItem(CURRENT_CHAT_KEY);

    if (savedChats) {
      const parsedChats: Chat[] = JSON.parse(savedChats);

      setChats(parsedChats);

      if (savedCurrent) {
        const id = Number(savedCurrent);

        const exists = parsedChats.find(
          (chat) => chat.id === id
        );

        if (exists) {
          setCurrentChatId(id);
        } else if (parsedChats.length > 0) {
          setCurrentChatId(parsedChats[0].id);
        }
      } else if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      }
    }

    setLoaded(true);
  }, []);

  // ===========================
  // Save Chats
  // ===========================

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(chats)
    );
  }, [chats, loaded]);

  // ===========================
  // Save Current Chat
  // ===========================

  useEffect(() => {
    if (!loaded) return;

    if (currentChatId !== null) {
      localStorage.setItem(
        CURRENT_CHAT_KEY,
        currentChatId.toString()
      );
    }
  }, [currentChatId, loaded]);

  // ===========================
  // Auto Scroll
  // ===========================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ===========================
  // Create Chat
  // ===========================

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  // ===========================
  // Open Chat
  // ===========================

  const openChat = (id: number) => {
    setCurrentChatId(id);
  };

  // ===========================
  // Delete Chat
  // ===========================

  const deleteChat = (id: number) => {
    const updatedChats = chats.filter(
      (chat) => chat.id !== id
    );

    setChats(updatedChats);

    if (updatedChats.length === 0) {
      setCurrentChatId(null);
      return;
    }

    if (currentChatId === id) {
      setCurrentChatId(updatedChats[0].id);
    }
  };

  // ===========================
  // Rename Chat
  // ===========================

  const renameChat = (
    id: number,
    title: string
  ) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title,
            }
          : chat
      )
    );
  };

  // ===========================
// Generate AI Chat Title
// ===========================

const generateChatTitle = async (
  chatId: number,
  firstMessage: string
) => {
  console.log("Generating title...");
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/generate-title",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: firstMessage,
        }),
      }
    );

    const data = await response.json();

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: data.title,
            }
          : chat
      )
    );
  } catch (err) {
    console.log(err);
  }
};

   // ===========================
// Send Message
// ===========================

const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userText = input;

  setInput("");
  setLoading(true);

  abortController.current = new AbortController();

  let chatId = currentChatId;

  // Check if this is the first message in the chat
  const isFirstMessage =
    currentChat === null ||
    currentChat.messages.length === 0;

  // ===========================
  // Create first chat if needed
  // ===========================

  if (chatId === null) {
    chatId = Date.now();

    const newChat: Chat = {
      id: chatId,
      title: "New Chat",
      messages: [
        {
          sender: "user",
          text: userText,
        },
        {
          sender: "bot",
          text: "",
        },
      ],
    };

    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(chatId);

  } else {

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  sender: "user",
                  text: userText,
                },
                {
                  sender: "bot",
                  text: "",
                },
              ],
            }
          : chat
      )
    );
  }

  // Generate AI title only once
  if (isFirstMessage) {
    generateChatTitle(chatId!, userText);
  }

  // ===========================
  // Build Conversation History
  // ===========================

    const currentMessages = currentChat?.messages ?? [];

  const history = [
    ...currentMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
    {
      role: "user",
      content: userText,
    },
  ];

  try {
   const formData = new FormData();

formData.append(
  "messages",
  JSON.stringify(history)
);

if (selectedFile) {
  formData.append("file", selectedFile);
}

const response = await fetch(
  "http://127.0.0.1:8000/chat-stream",
  {
    method: "POST",
    signal: abortController.current.signal,
    body: formData,
  }
);

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      fullResponse += decoder.decode(value, {
        stream: true,
      });

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          const updatedMessages = [...chat.messages];

          updatedMessages[updatedMessages.length - 1] = {
            sender: "bot",
            text: fullResponse,
          };

          return {
            ...chat,
            messages: updatedMessages,
          };
        })
      );
    }
      } catch (error: any) {

    // Ignore abort errors
    if (error.name === "AbortError") {
      console.log("Generation stopped.");
    } else {

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          const updatedMessages = [...chat.messages];

          updatedMessages[updatedMessages.length - 1] = {
            sender: "bot",
            text: "❌ Unable to connect to backend.",
          };

          return {
            ...chat,
            messages: updatedMessages,
          };
        })
      );

      console.error(error);
    }

  } finally {

    setLoading(false);
    setSelectedFile(null);

    abortController.current = null;
  }
};
// ===========================
// Regenerate Response
// ===========================

const regenerateResponse = async (botIndex: number) => {
  if (loading || currentChatId === null) return;

  setLoading(true);
   abortController.current = new AbortController();

  // Get all messages before the bot response
  const history = messages.slice(0, botIndex);

  // Replace the old AI response with an empty one
  setChats((prev) =>
    prev.map((chat) => {
      if (chat.id !== currentChatId) return chat;

      const updated = [...chat.messages];

      updated[botIndex] = {
        sender: "bot",
        text: "",
      };

      return {
        ...chat,
        messages: updated,
      };
    })
  );

  // Convert to backend format
  const backendMessages = history.map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  }));

  try {
    const formData = new FormData();

formData.append(
  "messages",
  JSON.stringify(backendMessages)
);

// Send uploaded file again if one exists
if (selectedFile) {
  formData.append("file", selectedFile);
}

const response = await fetch(
  "http://127.0.0.1:8000/chat-stream",
  {
    method: "POST",
    signal: abortController.current?.signal,
    body: formData,
  }
);

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      fullResponse += decoder.decode(value, {
        stream: true,
      });

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChatId) return chat;

          const updated = [...chat.messages];

          updated[botIndex] = {
            sender: "bot",
            text: fullResponse,
          };

          return {
            ...chat,
            messages: updated,
          };
        })
      );
    }
  } catch (error: any) {
  if (error.name === "AbortError") {
    setLoading(false);
    return;
  }
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        const updated = [...chat.messages];

        updated[botIndex] = {
          sender: "bot",
          text: "❌ Unable to regenerate response.",
        };

        return {
          ...chat,
          messages: updated,
        };
      })
    );
  }

  finally {
  setLoading(false);
  abortController.current = null;
}
};
// ===========================
// Edit Message
// ===========================

const editMessage = (index: number) => {
  if (loading || currentChatId === null) return;

  const message = messages[index];

  if (!message || message.sender !== "user") return;

  setInput(message.text);

  setChats((prev) =>
    prev.map((chat) => {
      if (chat.id !== currentChatId) return chat;

      return {
        ...chat,
        messages: chat.messages.slice(0, index),
      };
    })
  );
};
// ===========================
// Continue Response
// ===========================

const continueResponse = async (botIndex: number) => {
  if (loading || currentChatId === null) return;

  setLoading(true);
   abortController.current = new AbortController();

  // Conversation up to this bot message
  const history = messages.slice(0, botIndex + 1);

  const backendMessages = [
    ...history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
    {
      role: "user",
      content: "Continue your previous response.",
    },
  ];
try {
  const formData = new FormData();

  formData.append(
    "messages",
    JSON.stringify(backendMessages)
  );

  // Send uploaded file again if one exists
  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  const response = await fetch(
    "http://127.0.0.1:8000/chat-stream",
    {
      method: "POST",
      signal: abortController.current?.signal,
      body: formData,
    }
  );

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = messages[botIndex].text;

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    fullResponse += decoder.decode(value, {
      stream: true,
    });

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        const updated = [...chat.messages];

        updated[botIndex] = {
          sender: "bot",
          text: fullResponse,
        };

        return {
          ...chat,
          messages: updated,
        };
      })
    );
  }
} catch (error: any) {
  if (error.name === "AbortError") {
    return;
  }

  console.error(error);
} finally {
  setLoading(false);
  abortController.current = null;
}
};
// ===========================
// Export Chat
// ===========================

const exportChat = () => {
  if (!currentChat) return;

  let markdown = `# ${currentChat.title}\n\n`;

  currentChat.messages.forEach((msg) => {
    markdown += `## ${msg.sender === "user" ? "User" : "DevMate AI"}\n\n`;
    markdown += `${msg.text}\n\n`;
  });

  const blob = new Blob([markdown], {
    type: "text/markdown",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `${currentChat.title}.md`;

  a.click();

  URL.revokeObjectURL(url);
};
// ===========================
// Clean Markdown for PDF
// ===========================

const cleanMarkdown = (text: string) => {
  return text
    .replace(/```[a-zA-Z]*\n/g, "")
.replace(/```/g, "")
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^- /gm, "• ")
    .replace(/^\* /gm, "• ");
};
// ===========================
// Export Chat as PDF
// ===========================

const exportChatAsPDF = () => {
  if (!currentChat) return;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  const margin = 15;
  const maxWidth = pageWidth - margin * 2;

  let y = margin;

  // -----------------------
  // Helper
  // -----------------------

  const checkPage = (neededHeight = 8) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // -----------------------
  // Title
  // -----------------------

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text(currentChat.title, margin, y);

  y += 15;

  // -----------------------
// Messages
// -----------------------

currentChat.messages.forEach((msg) => {

  checkPage(12);

  // Sender Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text(
    msg.sender === "user"
      ? "User"
      : "DevMate AI",
    margin,
    y
  );

  y += 8;

  // Message Content
  doc.setFont("courier", "normal");
  doc.setFontSize(11);

  const cleaned = cleanMarkdown(msg.text);

  const lines = doc.splitTextToSize(
    cleaned,
    maxWidth
  );

  for (const line of lines) {

    checkPage(6);

    doc.text(line, margin, y);

    y += 6;
  }

  y += 8;

});

// -----------------------
// Save PDF
// -----------------------

doc.save(`${currentChat.title}.pdf`);
};
// ===========================
// Stop Generating
// ===========================

const stopGenerating = () => {
  abortController.current?.abort();
  setLoading(false);
};
    return (
    <div className="flex h-screen bg-slate-100">
     <Sidebar
  chats={filteredChats}
  currentChatId={currentChatId}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  onNewChat={createNewChat}
  onSelectChat={openChat}
  onDeleteChat={deleteChat}
  onRenameChat={renameChat}
/>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b bg-white px-8 py-5 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">
            DevMate AI
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Your Personal AI Coding Assistant
          </p>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-8 py-8">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-lg">
                  <h2 className="mb-4 text-4xl font-bold text-slate-800">
                    👋 Welcome to DevMate AI
                  </h2>

                  <button
                    onClick={createNewChat}
                    className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                  >
                    + New Chat
                  </button>

                  <p className="mt-6 text-lg text-slate-500">
                    Ask anything about
                    <br />
                    Python • React • FastAPI • AI • Web Development • Debugging
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
  <MessageBubble
    key={index}
    sender={msg.sender}
    text={msg.text}
    onEdit={
    msg.sender === "user"
      ? () => editMessage(index)
      : undefined
  }
    onRegenerate={
      msg.sender === "bot"
        ? () => regenerateResponse(index)
        : undefined
    }
    onContinue={
      msg.sender === "bot"
        ? () => continueResponse(index)
        : undefined
    }
    onExport={
      msg.sender === "bot"
        ? () => exportChat()
        : undefined
    }
    onExportPDF={
      msg.sender === "bot"
        ? () => exportChatAsPDF()
        : undefined
    }
  />
))}

               {loading && (
  <div className="mt-4">
    <button
      onClick={stopGenerating}
      className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
    >
      🛑 Stop Generating
    </button>
  </div>
)}

                <div ref={bottomRef} />
              </>
            )}
          </div>
        </main>

        {/* Input */}
       <ChatInput
  input={input}
  setInput={setInput}
  sendMessage={sendMessage}
  loading={loading}
  selectedFile={selectedFile}
  setSelectedFile={setSelectedFile}
/>
      </div>
    </div>
  );
}

export default App;