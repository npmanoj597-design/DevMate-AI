import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { Copy, Check } from "lucide-react";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  const [copied, setCopied] = useState("");

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");

      // Inline code
      if (!match) {
        return (
          <code
            className="rounded bg-slate-200 px-1 py-0.5 text-pink-600"
            {...props}
          >
            {children}
          </code>
        );
      }

      const language = match[1];

      return (
        <div className="my-5 overflow-hidden rounded-xl border border-slate-700 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-sm text-slate-300">
            <span className="font-medium capitalize">
              {language}
            </span>

            <button
              onClick={() => copyCode(code)}
              className="flex items-center gap-2 rounded px-2 py-1 transition hover:bg-slate-700"
            >
              {copied === code ? (
                <>
                  <Check size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code Block */}
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            PreTag="div"
            showLineNumbers
            wrapLongLines
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: "#0f172a",
              fontSize: "15px",
              padding: "18px",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  return (
    <div className="prose prose-slate max-w-none prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}