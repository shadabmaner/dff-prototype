"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RoomInfoPanel } from '@/components/chat/RoomInfoPanel';
import { 
  Send, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Video, 
  MoreVertical,
  Zap,
  Clock,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';


export default function MessagesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  
  const { 
    rooms, 
    activeRoomId, 
    messages, 
    isLoading, 
    isTyping, 
    error, 
    selectRoom, 
    sendMessage,
    sendTypingStatus,
    searchUsers,
    chatProfile,
    myUsername,
    myId,
    presence
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced user search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchUsers]);

  // Typing status logic
  useEffect(() => {
    if (!messageText.trim()) {
      sendTypingStatus(false);
      return;
    }
    
    sendTypingStatus(true);
    const timeout = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [messageText, sendTypingStatus]);


  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const text = messageText.trim();
    setMessageText('');
    try {
      await sendMessage(text);
    } catch (err) {
      // Revert text if failed and needed, but hooks handle status
    }
  };

  const filteredRooms = rooms.filter(room => {
    const otherUsername = room.usernames.find(u => u !== myUsername);
    return otherUsername?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeRoom = rooms.find(r => r._id === activeRoomId);
  const activeChatPartner = activeRoom?.name || activeRoom?.usernames.find(u => u !== myUsername) || selectedUsername;


  return (
    <div className="flex h-[calc(100vh-7rem)] gap-6 p-4 md:p-6 bg-slate-50/50">
      
      {/* Premium Sidebar: Clinical Terminal Design */}
      <Card className="w-80 flex flex-col hidden lg:flex rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-700 shadow-lg shadow-primary/20">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Clinical Comms</p>
            </div>
            <Badge variant="outline" className="rounded-lg border-slate-100 bg-slate-50 text-[9px] font-bold uppercase tracking-widest px-2 shadow-inner">
              Encrypted
            </Badge>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search experts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 bg-slate-50 border-none ring-1 ring-slate-100 focus-visible:ring-primary/30 rounded-2xl text-xs font-medium placeholder:text-slate-400"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="space-y-1">
            {searchTerm.length > 0 && (searchResults.length > 0 || isSearching) ? (
              <div className="pb-4">
                <p className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Search Results</p>
                {searchResults.map(result => (
                  <button
                    key={result._id}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedUsername(result.name || result.username);
                      selectRoom(result.username, 'username');
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left hover:bg-slate-100 border-none group"
                  >
                    <Avatar className="h-11 w-11 border-2 border-transparent group-hover:border-primary/20 transition-all">
                      <AvatarFallback className="bg-primary text-white font-bold text-sm">
                        {result.name?.charAt(0) || result.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-extrabold truncate text-[13px] tracking-tight text-slate-900">
                        {result.name || result.username}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 truncate">
                        @{result.username}
                      </p>
                    </div>
                  </button>
                ))}
                {searchResults.length === 0 && !isSearching && (
                  <p className="text-[10px] text-center text-slate-400 py-4 uppercase font-bold tracking-widest">No users found</p>
                )}
                <div className="mx-4 my-2 h-px bg-slate-50" />
              </div>
            ) : null}

            <p className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Recent Channels</p>
            {filteredRooms.map(room => {
              const otherUser = (room.type === 'd' ? room.name : null) || room.usernames.find(u => u !== myUsername) || 'Unknown User';
              const lastMsg = room.lastMessage;
              const isSelected = activeRoomId === room._id;

              return (
                <button
                  key={room._id}
                  onClick={() => {
                    setSelectedUsername(otherUser);
                    selectRoom(room._id, 'id');
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group",
                    isSelected 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                      : "hover:bg-slate-100 border-none"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-transparent group-hover:border-primary/20 transition-all">
                      <AvatarFallback className={cn(
                        "font-bold text-sm",
                        isSelected ? "bg-white/10 text-white" : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                      )}>
                        {otherUser.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {room.type === 'd' && (
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors duration-300",
                        (() => {
                          const otherId = room.memberIds.find(id => id !== myId);
                          const status = presence[otherId as string];
                          return status === 'online' ? "bg-emerald-500" : "bg-slate-300";
                        })()
                      )} />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={cn("font-extrabold truncate text-[13px] tracking-tight", isSelected ? "text-white" : "text-slate-900")}>
                        {otherUser}
                      </p>
                      {lastMsg && (
                        <span className={cn("text-[9px] font-bold", isSelected ? "text-white/40" : "text-slate-400")}>
                          {format(new Date(lastMsg.ts), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className={cn("text-[11px] font-medium truncate italic", isSelected ? "text-white/60" : "text-slate-400")}>
                      {lastMsg ? lastMsg.msg : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredRooms.length === 0 && !isLoading && (
              <p className="text-[10px] text-center text-slate-400 py-10 uppercase font-bold tracking-widest">No active channels</p>
            )}
            </div>
        </div>
      </Card>

      {/* Main Terminal Chat Area */}
      <Card className="flex-1 flex flex-col rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white relative">
        <AnimatePresence mode="wait">
          {selectedUsername ? (
            <motion.div 
              key="chat-active"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Clinical Header */}
              <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md shrink-0_ z-20">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-700 text-white font-extrabold">
                      {activeChatPartner?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                       <h3 className="font-black text-slate-900 tracking-tight text-lg uppercase italic">{activeChatPartner}</h3>
                       <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-black border-none uppercase tracking-tighter shadow-sm shadow-emerald-200">ACTIVE SESSION</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5 leading-none">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                        (() => {
                          const otherId = activeRoom?.memberIds?.find(id => id !== myId);
                          const status = presence[otherId as string];
                          return status === 'online' ? "bg-emerald-500" : "bg-slate-300";
                        })()
                      )} />
                      {(() => {
                        const otherId = activeRoom?.memberIds?.find(id => id !== myId);
                        const status = presence[otherId as string];
                        return status === 'online' ? "Online now" : "Offline";
                      })()} · Optimized Sync
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-2xl border-slate-100 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-2xl border-slate-100 text-slate-400 hover:text-primary hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-slate-100 mx-1" />
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl text-slate-300 hover:text-slate-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Terminal Message History */}
              <div className="flex-1 bg-slate-50/30 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                  {isLoading && (
                    <div className="flex flex-col items-center gap-3 py-10">
                      <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing with clinical node...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex justify-center p-4">
                      <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl text-[11px] font-bold border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                      </div>
                    </div>
                  )}

                  {!isLoading && messages.map((msg, i) => {
                    const isMe = chatProfile 
                      ? (msg.u._id === chatProfile._id || msg.u.username === chatProfile.username)
                      : (msg.u._id === user?.id || msg.u.username === (user as any)?.name || msg.u.username === user?.email?.split('@')[0]);
                    const timeString = format(new Date(msg.ts), 'HH:mm');
                    const showDate = i === 0 || format(new Date(messages[i-1].ts), 'yyyy-MM-dd') !== format(new Date(msg.ts), 'yyyy-MM-dd');
                    
                    return (
                      <React.Fragment key={msg._id}>
                        {showDate && (
                          <div className="flex items-center gap-4 py-4 opacity-30 select-none">
                             <div className="h-px flex-1 bg-slate-300" />
                             <p className="text-[9px] font-black uppercase tracking-[0.4em]">{format(new Date(msg.ts), 'EEEE, MMM dd')}</p>
                             <div className="h-px flex-1 bg-slate-300" />
                          </div>
                        )}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "group flex w-full flex-col",
                            isMe ? "items-end" : "items-start"
                          )}
                        >
                          <div className={cn(
                            "flex items-end gap-3",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}>
                             <div className={cn(
                               "relative max-w-[500px] p-4 rounded-[1.25rem] shadow-sm transition-all group-hover:shadow-md",
                               isMe 
                                 ? "bg-slate-900 text-white rounded-br-none" 
                                 : "bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-slate-200/50"
                             )}>
                               <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">{msg.msg}</p>
                             </div>
                             <div className="flex flex-col gap-1 pb-1">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{timeString}</span>
                             </div>
                          </div>
                          {isMe && (
                             <div className="mr-3 mt-1.5 flex items-center gap-1.5 opacity-30 text-primary">
                                 {msg.status === 'sending' ? (
                                    <Clock className="h-3 w-3 animate-pulse" />
                                 ) : msg.readBy && msg.readBy.length > 0 ? (
                                    <CheckCheck className="h-2.5 w-2.5" />
                                 ) : (
                                    <Check className="h-2.5 w-2.5" />
                                 )}
                             </div>
                          )}
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary animate-bounce" />
                      </div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] italic">Orchestrating response...</p>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>

              {/* Premium Input Console */}
              <div className="p-8 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
                <form 
                  onSubmit={handleSend}
                  className="max-w-4xl mx-auto flex items-end gap-4"
                >
                  <div className="flex-1 relative bg-slate-50 rounded-3xl border border-transparent transition-all group">
                     <textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder="Type clinical observation..."
                      className="w-full bg-transparent border-none focus:ring-0 focus resize-none max-h-32 px-6 py-5 text-sm font-medium placeholder:text-slate-400 placeholder:uppercase placeholder:italic placeholder:font-black placeholder:tracking-[0.1em] placeholder:text-[10px] focus:border-none"
                      rows={1}
                    />
                    <div className="absolute right-4 bottom-4 flex gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-300 hover:bg-white hover:text-primary shadow-inner">
                          <Zap className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!messageText.trim() || isLoading}
                    className="h-14 w-14 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/30 shrink-0 transition-all active:scale-95 group"
                  >
                    <Send className="h-5 w-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </form>
                <div className="max-w-4xl mx-auto mt-4 px-2">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center">Protocol-governed session · AES-256 Multi-layer Protection</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/30"
            >
              <div className="relative group">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                 <div className="relative h-28 w-28 rounded-[2rem] bg-slate-950 flex items-center justify-center mb-8 shadow-2xl border border-white/5">
                    <Zap className="h-10 w-10 text-primary" />
                 </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Clinical Terminal v1.0</h2>
              <p className="text-slate-500 max-w-sm text-center text-sm font-medium leading-relaxed">
                Identify a clinical collaborator or patient node from the sidebar to establish a secure, real-time communication uplink.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-md">
                 <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    <p className="text-[10px] font-black uppercase text-slate-900">DM Module</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase text-slate-900">Call Logs</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Right Side Panel - Room Info */}
      {selectedUsername && activeRoom && (
        <RoomInfoPanel 
          activeRoom={activeRoom}
          activeChatPartner={activeChatPartner}
          myId={myId}
          presence={presence}
        />
      )}
      
    </div>
  );
}
