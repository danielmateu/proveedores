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
let socket;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const { toast } = useToast();

  console.log('ChatWidget rendered, socket:', socket ? 'exists' : 'null');

  // Inicializar socket
  useEffect(() => {
    console.log('Initializing socket in ChatWidget');
    // Crear una sola instancia del socket
    if (!socket) {
      socket = io(apiUrl);
      console.log('New socket created in ChatWidget');
    }

    // Manejar eventos de conexión
    const handleConnect = () => {
      console.log('Connected to chat socket');
      setIsConnected(true);
      
      // Identificar usuario al servidor
      if (userInfo?.ExternalLoginID) {
        socket.emit('identify', {
          userId: userInfo.ExternalLoginID,
          name: `${userInfo.Name || ''} ${userInfo.Surname || ''}`.trim(),
          role: userInfo.Administrator ? 'admin' : 'user',
          isSuperAdmin: userInfo.SuperAdmin === 1
        });
        console.log('User identified:', {
          userId: userInfo.ExternalLoginID,
          name: `${userInfo.Name || ''} ${userInfo.Surname || ''}`.trim(),
          role: userInfo.Administrator ? 'admin' : 'user',
          isSuperAdmin: userInfo.SuperAdmin === 1
        });
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from chat socket');
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [userInfo]);

  // Cargar mensajes y configurar listeners
  useEffect(() => {
    if (!userInfo?.ExternalLoginID) return;

    // Cargar mensajes previos del localStorage
    const savedMessages = localStorage.getItem(`chatMessages-${userInfo.ExternalLoginID}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error parsing saved messages:', e);
        localStorage.removeItem(`chatMessages-${userInfo.ExternalLoginID}`);
      }
    }

    // Escuchar mensajes entrantes
    const handleChatMessage = (data) => {
      console.log('Received message:', data);
      
      // Solo procesar mensajes para este usuario
      if (data.recipient === userInfo.ExternalLoginID || data.sender === userInfo.ExternalLoginID) {
        // Evitar duplicados verificando si ya existe un mensaje con el mismo id
        setMessages(prev => {
          if (prev.some(msg => msg.id === data.id)) {
            return prev;
          }
          
          const newMessage = {
            id: data.id,
            text: data.text,
            sender: data.sender,
            senderName: data.senderName,
            timestamp: data.timestamp || new Date().toISOString(),
            isAdmin: data.isAdmin
          };
          
          const updatedMessages = [...prev, newMessage];
          localStorage.setItem(`chatMessages-${userInfo.ExternalLoginID}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
        
        // Si el chat no está abierto, incrementar contador de no leídos
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    // Escuchar indicadores de escritura
    const handleTyping = (data) => {
      if (data.sender !== userInfo.ExternalLoginID) {
        setIsTyping(true);
        
        // Limpiar timeout anterior
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Establecer nuevo timeout para limpiar indicador de escritura
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        setTypingTimeout(timeout);
      }
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('typing', handleTyping);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [userInfo, isOpen]);

  // Scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resetear contador de no leídos al abrir el chat
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
      senderName: `${userInfo.Name || ''} ${userInfo.Surname || ''}`.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: userInfo.SuperAdmin === 1
    };
    
    console.log('Sending message:', newMessage);
    
    // Enviar mensaje al servidor
    socket.emit('chat-message', newMessage);
    
    // Limpiar input
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Enviar indicador de escritura
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
          {/* Cabecera del chat */}
          <div className="bg-blue-600 dark:bg-blue-800 text-white p-3 flex justify-between items-center cursor-pointer"
               onClick={toggleMinimize}>
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <h3 className="font-medium">Soporte Rapitecnic</h3>
              {!isConnected && (
                <Badge variant="outline" className="text-xs bg-yellow-500 text-white">
                  Reconectando...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <X size={18} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Mensajes del chat */}
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
              
              {/* Input del chat */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="resize-none min-h-[40px] max-h-[120px]"
                    rows={1}
                    disabled={!isConnected}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    className="h-10 w-10"
                    disabled={!isConnected}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Botón del chat */}
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