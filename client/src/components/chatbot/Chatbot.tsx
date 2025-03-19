import React, { useState, useEffect } from 'react';
import { Chatbot as ReactChatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '../ui/button';

// Dynamically import to avoid SSR issues
const MessageParser = React.lazy(() => import('./MessageParser'));
const ActionProvider = React.lazy(() => import('./ActionProvider'));

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-widget fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="chatbot-container bg-white rounded-lg shadow-xl overflow-hidden w-80 sm:w-96 flex flex-col border border-gray-200">
          <div className="chatbot-header bg-[#080808] text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              ARCEM Support
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleChatbot} 
              className="text-white hover:bg-gray-700 p-1 h-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="chatbot-content h-[400px]">
            <ReactChatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={toggleChatbot}
          className="rounded-full h-14 w-14 bg-[#1E90DB] hover:bg-[#1670B0] shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default Chatbot;