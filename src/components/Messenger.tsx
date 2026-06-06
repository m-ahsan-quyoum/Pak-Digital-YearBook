import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { User, Message } from '../types';
import { Send, User as UserIcon, MessageSquare, Shield, Smile, Sparkles } from 'lucide-react';

interface MessengerProps {
  currentUser: User;
  partnerProp?: User | null;
}

export default function Messenger({ currentUser, partnerProp = null }: MessengerProps) {
  const [classmates, setClassmates] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Load all registration students to display in sidebar
  useEffect(() => {
    const loadClassmates = async () => {
      setLoading(true);
      try {
        const list = await api.auth.getUsers();
        // Exclude ourselves
        const filtered = list.filter(u => u.id !== currentUser.id);
        setClassmates(filtered);
        
        // If loaded via a prop (like clicking message from search or feed)
        if (partnerProp) {
          const matched = filtered.find(u => u.id === partnerProp.id);
          if (matched) {
            setSelectedPartner(matched);
          } else {
            setSelectedPartner(partnerProp);
          }
        } else if (filtered.length > 0 && !selectedPartner) {
          setSelectedPartner(filtered[0]);
        }
      } catch (err) {
        console.error('Failed to load classmates roster', err);
      } finally {
        setLoading(false);
      }
    };
    loadClassmates();
  }, [currentUser, partnerProp]);

  // Handle selected partner change and start polling chat history
  useEffect(() => {
    if (!selectedPartner) return;

    const loadChat = async (isFirst = false) => {
      if (isFirst) setChatLoading(true);
      try {
        const history = await api.messages.getChat(selectedPartner.id);
        setMessages(history);
      } catch (err) {
        console.error('Error fetching chat logs', err);
      } finally {
        if (isFirst) setChatLoading(false);
      }
    };

    loadChat(true);

    // Dynamic message polling timer (runs every 3 seconds for instant sandbox feedback)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(() => {
      loadChat();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedPartner]);

  // Auto-scroll chats list to base on thread update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const sentMessage = await api.messages.send(selectedPartner.id, textToSend);
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
      }
    } catch (err) {
      console.error('Failed to transmit message', err);
    }
  };

  return (
    <div id="messenger-root" className="max-w-6xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-60px)] flex bg-white border border-[#E8E4E0] dark:bg-[#111a14]/90 dark:border-[#1a2d22] rounded-3xl overflow-hidden transition-all shadow-sm">
      
      {/* Classmates roster panel */}
      <div className="w-1/3 border-r border-[#E8E4E0] dark:border-[#1a2d22] bg-[#F9F8F6] dark:bg-[#13231a]/10 flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-[#E8E4E0] dark:border-[#1a2d22]/60 flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-[#006644] dark:text-emerald-400" />
            <h2 className="text-sm font-serif italic font-extrabold text-neutral-800 dark:text-slate-200 uppercase tracking-wide">Classmates</h2>
          </div>
          
          <div className="p-2 overflow-y-auto max-h-[calc(100vh-280px)] space-y-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-slate-500">Retrieving directories...</div>
            ) : classmates.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-550 dark:text-slate-500 leading-normal px-2">No other students yet.</div>
            ) : (
              classmates.map((student) => {
                const isSelected = selectedPartner && selectedPartner.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedPartner(student);
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#E6F0EC] border-[#006644]/15 text-[#006644] dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-transparent hover:bg-[#F3F1ED]/50 hover:text-neutral-900 border-transparent text-neutral-600 dark:text-slate-400 dark:hover:text-slate-205 dark:hover:bg-[#14261c]/50'
                    }`}
                  >
                    <img src={student.profilePhoto} alt={student.name} className="h-9 w-9 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-800 bg-neutral-100" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-serif italic font-extrabold truncate text-neutral-850 dark:text-slate-200">{student.name}</h4>
                        <span className="text-[8px] opacity-60 font-mono font-bold">c/o {student.batch}</span>
                      </div>
                      <p className="text-[9px] opacity-70 truncate text-neutral-500 dark:text-slate-400">{student.university.replace(/\(.*?\)/, '')}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="p-3 bg-neutral-100/50 dark:bg-slate-900/30 border-t border-[#E8E4E0] dark:border-[#1a2d22]/60 flex items-center gap-2 text-[10px] text-neutral-500 dark:text-slate-550">
          <Shield className="h-3 w-3 text-[#006644] dark:text-emerald-500/80" />
          <span>Secured Sandbox P2P Envelope</span>
        </div>
      </div>

      {/* Primary thread pane */}
      <div className="flex-1 flex flex-col justify-between bg-[#FDFCF9] dark:bg-[#0a110d]/30">
        {selectedPartner ? (
          <>
            {/* Header */}
            <div className="p-3.5 border-b border-[#E8E4E0] dark:border-[#1a2d22] bg-white dark:bg-[#13231a]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedPartner.profilePhoto} 
                  alt={selectedPartner.name} 
                  className="w-10 h-10 rounded-full object-cover border border-[#E8E4E0] dark:border-slate-850" 
                />
                <div className="text-left">
                  <h3 className="text-xs font-serif italic font-extrabold text-neutral-900 dark:text-slate-100 flex items-center gap-1.5">
                    {selectedPartner.name}
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006644] dark:bg-emerald-500 inline-block animate-pulse" />
                  </h3>
                  <p className="text-[9px] text-neutral-500 dark:text-slate-400 max-w-sm truncate">
                    {selectedPartner.university} • {selectedPartner.department}
                  </p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <span className="text-[8px] bg-[#E6F0EC] text-[#006644] dark:bg-emerald-500/10 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-[#006644]/15 dark:border-emerald-500/20">
                  {selectedPartner.degreeProgram.toUpperCase()} c/o {selectedPartner.batch}
                </span>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-transparent">
              {chatLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-550 dark:text-slate-500 space-y-2">
                  <div className="h-6 w-6 border-2 border-[#006644] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Unlocking secure chat timeline...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-[#F9F8F6] border border-[#E8E4E0] dark:bg-slate-900 flex items-center justify-center dark:border-slate-800 shadow-xs">
                    <Sparkles className="h-5 w-5 text-[#006644] dark:text-emerald-400/80 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-serif italic font-extrabold text-neutral-800 dark:text-slate-350">Memory Vault P2P Direct Envelope</h5>
                    <p className="text-[10px] text-neutral-400 dark:text-slate-500 max-w-xs mt-1">Start chatting with classmates. Plan reunions, trace legacy batches, or share society week details.</p>
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isSentByMe = m.senderId === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`max-w-[70%] rounded-2xl p-3 text-xs shadow-xs leading-relaxed text-left ${
                        isSentByMe 
                          ? 'bg-[#006644] text-white rounded-tr-none' 
                          : 'bg-white border border-[#E8E4E0] text-neutral-800 dark:bg-[#111a14] dark:text-slate-200 rounded-tl-none dark:border-[#1a2d22]'
                      }`}>
                        <p>{m.content}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1.5 opacity-70 text-[8px] ${
                          isSentByMe ? 'text-emerald-100' : 'text-neutral-400 dark:text-slate-500'
                        }`}>
                          <span>{new Date(m.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isSentByMe && <span>{m.isRead ? '• Read' : '• Sent'}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#E8E4E0] dark:border-[#1a2d22] bg-white dark:bg-[#13231a]/10 flex items-center gap-3">
              <input
                type="text"
                placeholder={`Send a secure graduation envelope to ${selectedPartner.name.split(' ')[0]}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#F9F8F6] border border-[#E8E4E0] rounded-xl px-4 py-3 text-xs text-neutral-800 dark:bg-[#0a110d] dark:border-[#1a2d22] dark:text-slate-100 placeholder-neutral-400 dark:placeholder-slate-650 focus:outline-none focus:border-[#006644] dark:focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-[#006644] hover:bg-[#004D33] text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 p-3 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-neutral-450 dark:text-slate-500 text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-neutral-300 dark:text-slate-700" />
            <div>
              <h4 className="text-sm font-serif italic font-extrabold text-neutral-800 dark:text-slate-400">Classmates Conversation Desk</h4>
              <p className="text-xs text-neutral-450 dark:text-slate-550 max-w-sm mt-1">Select any registered classmate or campus cohort from directory to trigger secure real-time messaging envelopes.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
