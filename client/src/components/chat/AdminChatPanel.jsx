import { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Search, Circle } from 'lucide-react';
import { useUserInfoStore } from '@/zustand/userInfoStore';
import { useCustomersStore } from '@/zustand/customersStore';
import { io } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const apiUrl = import.meta.env.VITE_API_URL;
let socket;

export function AdminChatPanel() {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const messagesEndRef = useRef(null);
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const { customers, fetchCustomers, isLoading } = useCustomersStore();
  
  // Inicializar socket
  useEffect(() => {
    // Crear una sola instancia del socket
    if (!socket) {
      socket = io(apiUrl);
      console.log('Socket initialized in AdminChatPanel');
    }

    // Manejar eventos de conexión
    const handleConnect = () => {
      console.log('Admin connected to chat socket');
      setIsConnected(true);
      
      // Identificar al admin en el servidor
      if (userInfo?.ExternalLoginID) {
        socket.emit('identify', {
          userId: userInfo.ExternalLoginID,
          name: `${userInfo.Name || ''} ${userInfo.Surname || ''}`.trim(),
          role: 'admin',
          isSuperAdmin: userInfo.SuperAdmin === 1
        });
      }
    };

    const handleDisconnect = () => {
      console.log('Admin disconnected from chat socket');
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [userInfo]);

  // Cargar clientes solo una vez
  useEffect(() => {
    if (!initialFetchDone && !isLoading) {
      fetchCustomers();
      setInitialFetchDone(true);
    }
  }, [fetchCustomers, isLoading, initialFetchDone]);

  useEffect(() => {
    // Cargar mensajes guardados del localStorage
    const savedMessages = localStorage.getItem('adminChatMessages');
    if (savedMessages) {
      try {
        setUserMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error parsing saved messages:', e);
        localStorage.removeItem('adminChatMessages');
      }
    }

    // Escuchar actualizaciones de estado de usuarios
    const handleUserStatus = (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: data.status === 'online'
      }));
    };

    // Escuchar mensajes entrantes
    const handleChatMessage = (data) => {
      // Solo procesar mensajes relevantes
      if (!data.sender) return;
      
      const senderId = data.sender;
      
      // Añadir mensaje a los mensajes del usuario
      setUserMessages(prev => {
        const userMsgs = prev[senderId] || [];
        
        // Evitar duplicados verificando si ya existe un mensaje con el mismo id
        if (userMsgs.some(msg => msg.id === data.id)) {
          return prev;
        }
        
        const updatedMsgs = [...userMsgs, {
          id: data.id,
          text: data.text,
          sender: data.sender,
          senderName: data.senderName,
          timestamp: data.timestamp || new Date().toISOString(),
          isAdmin: data.isAdmin
        }];
        
        const newMessages = {
          ...prev,
          [senderId]: updatedMsgs
        };
        
        localStorage.setItem('adminChatMessages', JSON.stringify(newMessages));
        return newMessages;
      });
      
      // Incrementar contador de no leídos si no estamos viendo los mensajes de este usuario
      if (selectedUser?.id !== senderId) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    };
    
    // Escuchar indicadores de escritura
    const handleTyping = (data) => {
      if (data.sender && data.sender !== userInfo?.ExternalLoginID) {
        // Actualizar estado de escritura
        setTypingUsers(prev => {
          const newState = {
            ...prev,
            [data.sender]: new Date().getTime()
          };
          
          // Programar limpieza después de 3 segundos
          setTimeout(() => {
            setTypingUsers(current => {
              const timestamp = current[data.sender];
              if (timestamp && new Date().getTime() - timestamp > 3000) {
                const updated = { ...current };
                delete updated[data.sender];
                return updated;
              }
              return current;
            });
          }, 3000);
          
          return newState;
        });
      }
    };

    socket.on('user-status', handleUserStatus);
    socket.on('chat-message', handleChatMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('user-status', handleUserStatus);
      socket.off('chat-message', handleChatMessage);
      socket.off('typing', handleTyping);
    };
  }, [selectedUser, userInfo]);

  // Scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages, selectedUser]);

  // Resetear contador de no leídos al seleccionar un usuario
  useEffect(() => {
    if (selectedUser) {
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUser.id]: 0
      }));
    }
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: userInfo.ExternalLoginID,
      senderName: `${userInfo.Name || ''} ${userInfo.Surname || ''}`.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: true,
      recipient: selectedUser.id
    };
    
    // Enviar mensaje al servidor
    socket.emit('chat-message', newMessage);
    
    // Añadir mensaje a los mensajes del usuario (optimista)
    setUserMessages(prev => {
      const userMsgs = prev[selectedUser.id] || [];
      const updatedMsgs = [...userMsgs, newMessage];
      
      const newMessages = {
        ...prev,
        [selectedUser.id]: updatedMsgs
      };
      
      localStorage.setItem('adminChatMessages', JSON.stringify(newMessages));
      return newMessages;
    });
    
    // Limpiar input
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Enviar indicador de escritura
    if (selectedUser) {
      socket.emit('typing', {
        sender: userInfo?.ExternalLoginID,
        recipient: selectedUser.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Filtrar usuarios basados en la búsqueda
  const filteredUsers = customers.filter(customer => 
    (customer.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     customer.Surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     customer.TaxName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm', { locale: es });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    // Si el mensaje es de hoy, mostrar hora
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'HH:mm', { locale: es });
    }
    
    // Si el mensaje es de esta semana, mostrar día
    const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(messageDate, 'EEEE', { locale: es });
    }
    
    // De lo contrario mostrar fecha
    return format(messageDate, 'dd/MM/yyyy', { locale: es });
  };

  const getLastMessage = (userId) => {
    const messages = userMessages[userId] || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const isUserTyping = (userId) => {
    return typingUsers[userId] && (new Date().getTime() - typingUsers[userId]) < 3000;
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] border rounded-lg overflow-hidden">
      {/* Lista de usuarios */}
      <div className="w-1/3 border-r">
        <div className="p-3 border-b">
          <div className="relative">
            <Input
              placeholder="Buscar usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-3.5rem)]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay usuarios disponibles
            </div>
          ) : (
            filteredUsers.map(user => {
              const userId = user.Ex_InvoicingAddressID;
              const lastMessage = getLastMessage(userId);
              const unreadCount = unreadCounts[userId] || 0;
              const isOnline = onlineUsers[userId] || false;
              const userName = user.Name || user.TaxName;
              
              return (
                <div
                  key={userId}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedUser?.id === userId ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => setSelectedUser({ id: userId, name: userName })}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium truncate">{userName}</h4>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {isUserTyping(userId) ? (
                            <span className="text-blue-500">Escribiendo...</span>
                          ) : (
                            lastMessage ? lastMessage.text : 'No hay mensajes'
                          )}
                        </p>
                        {unreadCount > 0 && (
                          <Badge className="ml-2 bg-blue-500">{unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>
      
      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Cabecera del chat */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Circle className={`h-2 w-2 mr-1 ${onlineUsers[selectedUser.id] ? 'text-green-500' : 'text-gray-400'}`} />
                    {onlineUsers[selectedUser.id] ? 'En línea' : 'Desconectado'}
                  </div>
                </div>
              </div>
              {!isConnected && (
                <Badge variant="outline" className="text-xs bg-yellow-500 text-white">
                  Reconectando...
                </Badge>
              )}
            </div>
            
            {/* Mensajes del chat */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {(userMessages[selectedUser.id] || []).length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <p>No hay mensajes con este usuario.</p>
                  </div>
                ) : (
                  (userMessages[selectedUser.id] || []).map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex gap-2 max-w-[80%]">
                        {!msg.isAdmin && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className={`rounded-lg p-3 ${
                            msg.isAdmin 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{formatMessageTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isUserTyping(selectedUser.id) && (
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
            <div className="p-3 border-t">
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
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Centro de mensajes</h3>
              <p className="max-w-xs">Selecciona un usuario para ver sus mensajes y responder.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}