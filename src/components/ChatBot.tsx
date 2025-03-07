import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { Workshop } from "../types";

interface ChatBotProps {
  workshopData: Workshop[];
  className?: string;
}

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  workshopData,
  className,
}) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const chatbotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(event.target as Node)
      ) {
        setIsChatbotOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: "user" as const, content: userInput };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      // Make API call to your ChatGPT endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          workshopData, // Send relevant data for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const botResponse = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", content: botResponse.message },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }

    setUserInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 
          bg-gradient-to-r from-blue-600 to-purple-600 
          text-white rounded-lg shadow-md 
          hover:from-blue-700 hover:to-purple-700 
          transition-all duration-200 
          transform hover:scale-105 
          ${className || ""}
        `}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>

      {isChatbotOpen && (
        <div
          ref={chatbotRef}
          className="fixed right-4 bottom-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border z-50"
        >
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">AI Workshop Assistant</h3>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about workshop data..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
