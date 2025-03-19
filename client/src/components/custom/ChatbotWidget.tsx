import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

type ChatMessage = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

// Simple implementation of a chatbot without using the react-chatbot-kit
const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! Welcome to ARCEM Construction. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch services and projects data when the chat is opened
  useEffect(() => {
    if (isOpen && services.length === 0) {
      fetchServices();
    }
    if (isOpen && projects.length === 0) {
      fetchProjects();
    }
  }, [isOpen, services.length, projects.length]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchServices = async () => {
    try {
      const response = await apiRequest("GET", "/api/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiRequest("GET", "/api/projects/featured");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Process the message and generate a bot response
    setTimeout(() => {
      const botResponse = processUserMessage(inputMessage);
      const botMessage: ChatMessage = {
        id: messages.length + 2,
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // If there's a special response with a services list
      if (botResponse.type === "services") {
        displayServicesList();
      } else if (botResponse.type === "projects") {
        displayProjectsList();
      } else if (botResponse.type === "contact") {
        displayContactInfo();
      }
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const processUserMessage = (
    message: string,
  ): { text: string; type?: string } => {
    const lowerCaseMessage = message.toLowerCase();

    // Check for greetings
    if (
      lowerCaseMessage.includes("hi") ||
      lowerCaseMessage.includes("hello") ||
      lowerCaseMessage.includes("hey")
    ) {
      return {
        text: "Hello! How can I assist you with your construction needs today?",
      };
    }

    // Check for services related queries
    if (
      lowerCaseMessage.includes("service") ||
      lowerCaseMessage.includes("offer") ||
      lowerCaseMessage.includes("provide") ||
      lowerCaseMessage.includes("do you do")
    ) {
      return {
        text: "We offer a wide range of construction services. Here are some of our main services:",
        type: "services",
      };
    }

    // Check for project related queries
    if (
      lowerCaseMessage.includes("project") ||
      lowerCaseMessage.includes("portfolio") ||
      lowerCaseMessage.includes("work") ||
      lowerCaseMessage.includes("built") ||
      lowerCaseMessage.includes("examples")
    ) {
      return {
        text: "Take a look at some of our featured projects:",
        type: "projects",
      };
    }

    // Check for contact related queries
    if (
      lowerCaseMessage.includes("contact") ||
      lowerCaseMessage.includes("reach") ||
      lowerCaseMessage.includes("email") ||
      lowerCaseMessage.includes("phone") ||
      lowerCaseMessage.includes("call") ||
      lowerCaseMessage.includes("talk to")
    ) {
      return {
        text: "You can reach us through any of the following methods:",
        type: "contact",
      };
    }

    // Check for testimonial related queries
    if (
      lowerCaseMessage.includes("testimonial") ||
      lowerCaseMessage.includes("review") ||
      lowerCaseMessage.includes("feedback") ||
      lowerCaseMessage.includes("client")
    ) {
      return {
        text: "Our clients speak highly of our work. You can view testimonials on our testimonials page or submit your own experience working with us.",
      };
    }

    // Check for quote related queries
    if (
      lowerCaseMessage.includes("quote") ||
      lowerCaseMessage.includes("estimate") ||
      lowerCaseMessage.includes("cost") ||
      lowerCaseMessage.includes("price") ||
      lowerCaseMessage.includes("pricing") ||
      lowerCaseMessage.includes("how much")
    ) {
      return {
        text: "We'd be happy to provide a quote for your project. Please fill out our contact form with details about your project, and our team will get back to you within 24-48 hours.",
      };
    }

    // Default fallback
    return {
      text: "I'm not sure I understand. Would you like to know about our services, projects, or how to contact us?",
    };
  };

  const displayServicesList = () => {
    const serviceMessage: ChatMessage = {
      id: messages.length + 3,
      text: "",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, serviceMessage]);
  };

  const displayProjectsList = () => {
    const projectMessage: ChatMessage = {
      id: messages.length + 3,
      text: "",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, projectMessage]);
  };

  const displayContactInfo = () => {
    const contactMessage: ChatMessage = {
      id: messages.length + 3,
      text: "Phone: (713) 624-0083\nEmail: aj@arcemusa.com\nAddress: 215 Birch Hill Dr, Sugar Land, TX 77479\nBusiness Hours: Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, contactMessage]);
  };

  const formatMessageText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderServicesList = () => {
    if (services.length === 0) {
      return <div className="text-center py-2">Loading services...</div>;
    }

    return (
      <div className="services-list p-2 rounded-md bg-gray-100 my-2">
        <ul className="space-y-2">
          {services.slice(0, 5).map((service: any) => (
            <li
              key={service.id}
              className="p-2 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              <div className="font-semibold text-[#1E90DB]">
                {service.title}
              </div>
              <div className="text-sm text-gray-600">
                {service.description.substring(0, 100)}...
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-sm text-gray-500">
          For more details, please visit our Services page.
        </div>
      </div>
    );
  };

  const renderProjectsList = () => {
    if (projects.length === 0) {
      return <div className="text-center py-2">Loading projects...</div>;
    }

    return (
      <div className="projects-list p-2 rounded-md bg-gray-100 my-2">
        <div className="space-y-3">
          {projects.slice(0, 3).map((project: any) => (
            <div
              key={project.id}
              className="group flex gap-2 p-2 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              {project.imageUrl && (
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[#1E90DB] group-hover:underline">
                  {project.title}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {project.category}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          View all our projects on the Projects page.
        </div>
      </div>
    );
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
          <div className="chatbot-messages p-3 overflow-y-auto flex-grow">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1E90DB] text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-[#080808] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.text ? (
                    <div className="text-sm">{formatMessageText(msg.text)}</div>
                  ) : (
                    <div>
                      {msg.sender === "bot" &&
                        services.length > 0 &&
                        renderServicesList()}
                      {msg.sender === "bot" &&
                        projects.length > 0 &&
                        renderProjectsList()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input border-t border-gray-200 p-3">
            <div className="flex">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="flex-grow mr-2"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#1E90DB] hover:bg-[#1670B0]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={toggleChatbot}
          className="rounded-full h-14 w-14 bg-[#1E90DB] hover:bg-[#1670B0] shadow-lg flex items-center justify-center p-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default ChatbotWidget;
