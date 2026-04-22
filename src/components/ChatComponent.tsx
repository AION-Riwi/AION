"use client";
import { useState } from "react";

type Message = {
  role: "user" | "assistant" | "error";
  content: string;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Controla si el chat está abierto o cerrado

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantMessage;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "error", content: "No se pudo conectar con la IA." },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante (Círculo) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-all z-50"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Ventana del Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Cabecera */}
          <div className="bg-blue-600 p-4 text-white font-bold flex justify-between items-center">
            <span>Asistente de Comida</span>
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-center text-zinc-500 mt-10 text-sm italic">
                ¡Hola! Soy tu experto en comida callejera. ¿En qué puedo
                ayudarte hoy?
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white self-end rounded-tr-none"
                    : m.role === "error"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 self-start rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl self-start rounded-tl-none animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <div className="flex gap-2">
              <input
                className="flex-1 border dark:border-zinc-600 rounded-full px-4 py-2 text-sm text-black dark:text-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                placeholder="Escribe un mensaje..."
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && sendMessage()
                }
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
