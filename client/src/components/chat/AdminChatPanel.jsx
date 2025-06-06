import { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Search, Circle } from 'lucide-react';
import { useUserInfoStore } from '@/zustand/userInfoStore';
import { io } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const apiUrl = import.meta.env.VITE_API_URL;
const socket = io(apiUrl);

export function AdminChatPanel() {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const userInfo = useUserInfoStore((state) => state.userInfo);

  useEffect(() => {
    // Load users and messages from localStorage
    const savedUsers = localStorage.getItem('chatUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedMessages = localStorage.getItem('adminChatMessages');
    if (savedMessages) {
      setUserMessages(JSON.parse(savedMessages));
    }

    // Connect to socket
    socket.on('connect', () => {
      console.log('Admin connected to chat socket');
      
      // Identify admin to server
      if (userInfo?.ExternalLoginID) {
        socket.emit('identify', {
          userId: userInfo.ExternalLoginID,
          name: `${userInfo.Name} ${userInfo.Surname || ''}`.trim(),
          role: 'admin',
          isSuperAdmin: true
        });
      }
    });

    // Listen for user status updates
    socket.on('user-status', (data) => {
      // Update online status
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: data.status === 'online'
      }));
      
      // Add user to list if not already there
      setUsers(prev => {
        const existingUser = prev.find(u => u.id === data.userId);
        if (!existingUser && data.userId) {
          const newUsers = [...prev, { id: data.userId, name: data.name }];
          localStorage.setItem('chatUsers', JSON.stringify(newUsers));
          return newUsers;
        }
        return prev;
      });
    });

    // Listen for incoming messages
    socket.on('chat-message', (data) => {
      // Only process messages for admin
      if (!userInfo?.SuperAdmin) return;
      
      const senderId = data.sender;
      if (!senderId) return;
      
      // Add user to list if not already there
      setUsers(prev => {
        const existingUser = prev.find(u => u.id === senderId);
        if (!existingUser && senderId) {
          const newUsers = [...prev, { id: senderId, name: data.senderName }];
          localStorage.setItem('chatUsers', JSON.stringify(newUsers));
          return newUsers;
        }
        return prev;
      });
      
      // Add message to user's messages
      setUserMessages(prev => {
        const userMsgs = prev[senderId] || [];
        const updatedMsgs = [...userMsgs, {
          id: Date.now(),
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
      
      // Increment unread count if not viewing this user's messages
      if (selectedUser?.id !== senderId) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    });

    return () => {
      socket.off('user-status');
      socket.off('chat-message');
    };
  }, [userInfo, selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages, selectedUser]);

  // Reset unread count when selecting a user
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
      senderName: `${userInfo.Name} ${userInfo.Surname || ''}`.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: true,
      recipient: selectedUser.id
    };
    
    // Add message to user's messages
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
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm', { locale: es });
  };

  const formatLastMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    // If message is from today, show time
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'HH:mm', { locale: es });
    }
    
    // If message is from this week, show day name
    const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(messageDate, 'EEEE', { locale: es });
    }
    
    // Otherwise show date
    return format(messageDate, 'dd/MM/yyyy', { locale: es });
  };

  const getLastMessage = (userId) => {
    const messages = userMessages[userId] || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  return (
    <div className="flex h-[calc(100vh-16rem)] border rounded-lg overflow-hidden">
      {/* User list */}
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
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay usuarios disponibles
            </div>
          ) : (
            filteredUsers.map(user => {
              const lastMessage = getLastMessage(user.id);
              const unreadCount = unreadCounts[user.id] || 0;
              const isOnline = onlineUsers[user.id] || false;
              
              return (
                <div
                  key={user.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium truncate">{user.name}</h4>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {lastMessage ? lastMessage.text : 'No hay mensajes'}
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
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Circle className={`h-2 w-2 mr-1 ${onlineUsers[selectedUser.id] ? 'text-green-500' : 'text-gray-400'}`} />
                    {onlineUsers[selectedUser.id] ? 'En línea' : 'Desconectado'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat messages */}
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
                            <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
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
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Chat input */}
            <div className="p-3 border-t">
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
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Centro de mensajes</h3>
              <p className="max-w-xs">Selecciona un usuario para ver sus mensajes y responder.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}