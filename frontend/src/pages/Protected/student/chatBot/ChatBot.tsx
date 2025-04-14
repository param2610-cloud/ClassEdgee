import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState<
    { sender: string; text: string; color?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Color palette for message backgrounds
  const studentColors = [
    "bg-gradient-to-r from-blue-500 to-blue-700",
    "bg-gradient-to-r from-purple-500 to-purple-700",
    "bg-gradient-to-r from-pink-500 to-pink-700",
  ];

  const botColors = [
    "bg-gradient-to-r from-green-400 to-green-600",
    "bg-gradient-to-r from-teal-400 to-teal-600",
    "bg-gradient-to-r from-indigo-400 to-indigo-600",
  ];

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      // Random color for student message
      const studentColor =
        studentColors[Math.floor(Math.random() * studentColors.length)];

      // Add student message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "student",
          text: input,
          color: studentColor,
        },
      ]);

      // Clear input
      setInput("");

      // Simulate bot response with delay and random color
      setTimeout(() => {
        const botColor =
          botColors[Math.floor(Math.random() * botColors.length)];
        const responses = [
          "That's an interesting point!",
          "Let me help you with that.",
          "Great question! Here's what I think.",
          "I'm here to assist you.",
          "Fascinating! Let me elaborate.",
        ];

        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "bot",
            text: randomResponse,
            color: botColor,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-gradient-to-b from-white to-gray-100 shadow-2xl rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <Bot className="mr-3" />
        <h2 className="text-xl font-bold">AI Assistant</h2>
        <Sparkles className="ml-auto text-yellow-300" />
      </div>

      {/* Messages Container */}
      <div className="flex flex-col flex-grow p-4 overflow-y-auto space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "student" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.sender === "bot" && <Bot className="text-gray-500" />}
              <div
                className={`
                  max-w-xs px-4 py-2 rounded-2xl 
                  text-white shadow-md transition-all 
                  hover:scale-105 hover:shadow-lg
                  ${message.color || ""}
                `}
              >
                {message.text}
              </div>
              {message.sender === "student" && (
                <User className="text-gray-500" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex p-4 bg-white border-t border-gray-200">
        <input
          type="text"
          className="
            flex-grow px-4 py-2 
            border border-gray-300 
            rounded-l-lg 
            focus:outline-none 
            focus:ring-2 
            focus:ring-purple-500
            transition-all
            hover:border-purple-300
          "
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="
            px-4 py-2 
            bg-gradient-to-r from-purple-500 to-blue-500 
            text-white 
            rounded-r-lg 
            hover:to-purple-600 hover:from-blue-600
            focus:outline-none 
            focus:ring-2 
            focus:ring-purple-300
            transition-all
            flex items-center
          "
        >
          <Send className="mr-2" /> Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
