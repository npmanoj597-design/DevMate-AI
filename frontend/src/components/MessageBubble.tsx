import {
  Bot,
  RotateCcw,
  SquarePen,
  Download,
  FileText,
  User,
  Play,
} from "lucide-react";

import MarkdownRenderer from "./MarkdownRenderer";

type Props = {
  sender: "user" | "bot";
  text: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onExport?: () => void;
  onExportPDF?: () => void;
};

function MessageBubble({
  sender,
  text,
  onEdit,
  onRegenerate,
  onContinue,
  onExport,
   onExportPDF,

}: Props) {
  const isUser = sender === "user";

  return (
    <div
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <Bot size={18} />
        </div>
      )}

      {/* Message */}
      <div className="max-w-3xl">
        <div
          className={`rounded-2xl px-5 py-3 shadow ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">
              {text}
            </p>
          ) : (
            <MarkdownRenderer content={text} />
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap gap-2">

          {/* Edit */}
          {isUser && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
            >
              <SquarePen size={16} />
              Edit
            </button>
          )}

          {/* Regenerate */}
          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
            >
              <RotateCcw size={16} />
              Regenerate
            </button>
          )}

          {!isUser && onExport && (
  <button
    onClick={onExport}
    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
  >
    <Download size={16} />
    Export
  </button>
)}

{!isUser && onExportPDF && (
  <button
    onClick={onExportPDF}
    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
  >
    <FileText size={16} />
    PDF
  </button>
)}

          {/* Continue */}
          {!isUser && onContinue && (
            <button
              onClick={onContinue}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
            >
              <Play size={16} />
              Continue
            </button>
          )}

        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white">
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;