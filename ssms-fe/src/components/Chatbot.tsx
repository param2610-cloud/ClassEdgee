import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatbotRule {
  keywords: string[];
  response: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const chatbotRules: ChatbotRule[] = [
  {
    keywords: ['hello', 'hi', 'hey'],
    response: "Hello! I'm the SCMS assistant. How can I help you today?"
  },
  {
    keywords: ['attendance', 'present', 'absent'],
    response: "To view or mark attendance, please go to the Attendance section in the main menu."
  },
  {
    keywords: ['resource', 'equipment', 'projector', 'computer'],
    response: "You can check the availability of classroom resources in the Resource Management section."
  },
  {
    keywords: ['quiz', 'test', 'exam'],
    response: "Interactive quizzes are available in the Learning Tools section. Your teacher can also create custom quizzes."
  },
  {
    keywords: ['analytics', 'performance', 'stats', 'statistics'],
    response: "You can view class performance analytics in the Analytics Dashboard section."
  },
  {
    keywords: ['help', 'support', 'issue'],
    response: "If you're experiencing any issues or need further assistance, please contact our support team at support@scms.com."
  }
];

const Chatbot: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setConversation([...conversation, userMessage]);

    const botResponse = generateResponse(input);
    const botMessage: Message = { text: botResponse, sender: 'bot' };
    setConversation([...conversation, userMessage, botMessage]);

    setInput('');
  };

  const generateResponse = (message: string): string => {
    const lowercaseMessage = message.toLowerCase();
    for (const rule of chatbotRules) {
      if (rule.keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        return rule.response;
      }
    }
    return "I'm sorry, I don't have information about that. Can you please rephrase your question or ask about attendance, resources, quizzes, or analytics?";
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>SCMS Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto mb-4 space-y-2">
          {conversation.map((msg, index) => (
            <div key={index} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;