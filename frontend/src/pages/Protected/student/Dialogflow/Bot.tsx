import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const DialogflowButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen && (
        <div className="mb-4 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -right-2 -top-2 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-700 z-10"
          >
            <X size={20} />
          </button>
          <iframe 
            width="350" 
            height="430" 
            allow="microphone;" 
            src="https://console.dialogflow.com/api-client/demo/embedded/57abccca-61a3-491c-8811-9e724c12640f"
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default DialogflowButton;