import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserInfoStore } from '@/zustand/userInfoStore';
import { io } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const apiUrl = import.meta.env.VITE_API_URL;
const socket = io(apiUrl);

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const { toast } = useToast();

  useEffect(() => {
    // Load previous messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Connect to socket
    socket.on('connect', () => {
      console.log('Connected to chat socket');
      
      // Identify user to server
      if (userInfo?.ExternalLoginID) {
        socket.emit('identify', {
          userId: userInfo.ExternalLoginID,
          name: `${userInfo.Name} ${userInfo.Surname || ''}`.trim(),
          role: userInfo.Administrator ? 'admin' : 'user',
          isSuperAdmin: userInfo.SuperAdmin
        });
      }
    });

    // Listen for incoming messages
    socket.on('chat-message', (data) => {
      const newMessage = {
        id: Date.now(),
        text: data.text,
        sender: data.sender,
        senderName: data.senderName,
        timestamp: data.timestamp || new Date().toISOString(),
        isAdmin: data.isAdmin
      };
      
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      
      // If chat is not open, increment unread count
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Listen for typing indicators
    socket.on('typing', (data) => {
      if (data.sender !== userInfo?.ExternalLoginID) {
        setIsTyping(true);
        
        // Clear previous timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Set new timeout to clear typing indicator
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        setTypingTimeout(timeout);
      }
    });

    return () => {
      socket.off('chat-message');
      socket.off('typing');
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [userInfo, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (!userInfo) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para enviar mensajes",
        variant: "destructive"
      });
      return;
    }
    
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: userInfo.ExternalLoginID,
      senderName: `${userInfo.Name} ${userInfo.Surname || ''}`.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: userInfo.Administrator
    };
    
    // Add message to local state
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      return updatedMessages;
    });
    
    // Send message to server
    socket.emit('chat-message', newMessage);
    
    // Clear input
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Send typing indicator
    socket.emit('typing', {
      sender: userInfo?.ExternalLoginID,
      timestamp: new Date().toISOString()
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm', { locale: es });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-2 transition-all duration-300 overflow-hidden ${
            isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 h-96'
          }`}
        >
          {/* Chat header */}
          <div className="bg-blue-600 dark:bg-blue-800 text-white p-3 flex justify-between items-center cursor-pointer"
               onClick={toggleMinimize}>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <h3 className="font-medium">Soporte Rapitecnic</h3>
            </div>
            <div className="flex items-center gap-1">
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <X size={18} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Chat messages */}
              <ScrollArea className="p-3 h-[calc(100%-6rem)]">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      <p>Inicia una conversación con el equipo de soporte.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === userInfo?.ExternalLoginID ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex gap-2 max-w-[80%]">
                          {msg.sender !== userInfo?.ExternalLoginID && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/rapitecnic-sin-letras.png" />
                              <AvatarFallback>RT</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div className={`rounded-lg p-3 ${
                              msg.sender === userInfo?.ExternalLoginID 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>{formatMessageTime(msg.timestamp)}</span>
                              {msg.isAdmin && (
                                <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">Admin</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Chat input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="resize-none min-h-[40px] max-h-[120px]"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    className="h-10 w-10"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}