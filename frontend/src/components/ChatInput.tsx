import { Send, Paperclip, X } from "lucide-react";

type Props = {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;

  selectedFile: File | null;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<File | null>
  >;
};

function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  selectedFile,
  setSelectedFile,
}: Props) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="border-t bg-white p-5">
      {/* Selected File */}
      {selectedFile && (
        <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between rounded-lg border bg-gray-100 px-4 py-2">
          <span className="truncate text-sm">
            📄 {selectedFile.name}
          </span>

          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-5xl gap-3">
        {/* Upload Button */}
        <label className="flex cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white p-4 hover:bg-gray-100">
          <Paperclip size={20} />

          <input
            type="file"
            hidden
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
        </label>

        {/* Message Input */}
        <input
          className="flex-1 rounded-full border border-gray-300 px-5 py-3 outline-none focus:border-blue-600"
          placeholder="Ask DevMate AI anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
        />

        {/* Send Button */}
        <button
          disabled={loading}
          onClick={sendMessage}
          className="rounded-full bg-blue-600 p-4 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;