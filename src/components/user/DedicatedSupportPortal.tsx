import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { uploadFile, validateFile } from '../../api/storage';
import { SupportMessage } from '../../types';
import { UserBottomNav, UserTab } from './UserBottomNav';
import appIcon from '../../assets/images/ms_official_icon_new_1791275507280.jpg';
import {
  Headphones,
  Send,
  Camera,
  CheckCheck,
  Clock,
  User,
  Shield,
  HelpCircle,
  ArrowLeft,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DedicatedSupportPortalProps {
  onBackToApp?: () => void;
  onNavigateTab?: (tab: UserTab) => void;
  isEmbedded?: boolean;
}

export const DedicatedSupportPortal: React.FC<DedicatedSupportPortalProps> = ({
  onBackToApp,
  onNavigateTab,
  isEmbedded = false,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Persistent guest identifier so visitors retain their support thread across reloads
  const [guestId] = useState<string>(() => {
    let stored = localStorage.getItem('ms_support_guest_id');
    if (!stored) {
      stored = `guest_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('ms_support_guest_id', stored);
    }
    return stored;
  });

  const fetchMessages = async () => {
    try {
      const data = await api.getSupportMessages(user ? undefined : guestId);
      setMessages(data);
    } catch (e) {
      console.error('Failed to load support messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, guestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file format or size');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !filePreview) return;

    setIsSending(true);
    setError(null);

    let finalAttachmentUrl = filePreview;

    try {
      if (selectedFile) {
        setUploadProgress(15);
        const uploadRes = await uploadFile(selectedFile, {
          folder: 'support',
          userId: user?.id || guestId,
        });
        setUploadProgress(75);
        if (uploadRes && uploadRes.url) {
          finalAttachmentUrl = uploadRes.url;
        }
      }

      const displayName = guestName.trim()
        ? `${guestName.trim()}${guestPhone.trim() ? ` (${guestPhone.trim()})` : ''}`
        : guestPhone.trim()
        ? `Phone: ${guestPhone.trim()}`
        : undefined;

      const sendRes = await api.sendSupportMessage({
        message: text.trim(),
        attachment: finalAttachmentUrl || undefined,
        guestId: user ? undefined : guestId,
        guestName: displayName,
      });

      if (sendRes && (sendRes as any).autoReply) {
        setMessages((prev) => [...prev, sendRes.message, (sendRes as any).autoReply]);
      } else if (sendRes && sendRes.message) {
        setMessages((prev) => [...prev, sendRes.message]);
      }

      setText('');
      setSelectedFile(null);
      setFilePreview(null);
      setUploadProgress(null);
      await fetchMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please retry.');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setText('');
    setIsSending(true);
    setError(null);

    try {
      const displayName = guestName.trim()
        ? `${guestName.trim()}${guestPhone.trim() ? ` (${guestPhone.trim()})` : ''}`
        : guestPhone.trim()
        ? `Phone: ${guestPhone.trim()}`
        : undefined;

      const sendRes = await api.sendSupportMessage({
        message: question,
        guestId: user ? undefined : guestId,
        guestName: displayName,
      });

      if (sendRes && (sendRes as any).autoReply) {
        setMessages((prev) => [...prev, sendRes.message, (sendRes as any).autoReply]);
      } else if (sendRes && sendRes.message) {
        setMessages((prev) => [...prev, sendRes.message]);
      }

      await fetchMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to submit question.');
    } finally {
      setIsSending(false);
    }
  };

  const handleTabClick = (tab: UserTab) => {
    if (tab === 'support') return;
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onBackToApp) {
      onBackToApp();
      window.history.pushState({}, '', `/?tab=${tab}`);
    } else {
      window.location.href = `/?tab=${tab}`;
    }
  };

  const quickQuestions = [
    'What are the package prices?',
    'What are attendance check-in hours?',
    'How do I deposit via JazzCash or Easypaisa?',
    'What are the withdrawal limits?',
    'What is the referral program bonus?',
  ];

  return (
    <div className={`bg-slate-950 text-slate-100 flex flex-col w-full selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden ${
      isEmbedded ? 'h-full flex-1' : 'h-screen pb-16'
    }`}>
      {/* Top Support Navigation Bar */}
      <header className="shrink-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md bg-slate-900 flex items-center justify-center shrink-0">
              <img src={appIcon} alt="MS Official Icon" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                MS Official Support Desk
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">Official Representatives Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh Sync Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Support Workspace — ONLY Support Chat Panel Full Fit */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col min-h-0 sm:px-4 sm:py-3 overflow-hidden">
        {/* Support Chat Panel Container — Full Width & Full Height */}
        <div className="w-full flex-1 flex flex-col bg-slate-900 sm:border border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden min-h-0">
          {/* Panel Sub-Header */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white block truncate text-xs">
                  {user ? `Member: ${user.name}` : `Live Helpdesk (${guestId.substring(0, 8)})`}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  Direct Administrator Channel
                </span>
              </div>
            </div>
          </div>

          {/* Guest Contact Details (Only if unauthenticated) */}
          {!user && (
            <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-col sm:flex-row gap-2 text-xs shrink-0">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="WhatsApp / Phone (Optional)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="m-3 p-3 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Messages Stream — Flexibly Expands to Fill Viewport Height */}
          <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 min-h-0">
            {/* Automated Welcome Message */}
            <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-[11px]">MS Official Customer Support</span>
                  <span className="text-[9px] text-slate-500 font-mono">Verified Representative</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Welcome to MS Official Customer Support. Our official team is available 24/7 to assist you with weekly/monthly packages, JazzCash/Easypaisa payment verification, daily attendance rewards (9:00 AM - 9:00 PM), or withdrawal processing.
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Type your message or attach a screenshot receipt below.
                </div>
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[92%] sm:max-w-[85%] flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isUser
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/30'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`rounded-2xl p-3 text-xs space-y-1 shadow-md ${
                        isUser
                          ? 'bg-emerald-600/90 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                        <span className={`font-bold flex items-center gap-1 ${!isUser ? 'text-emerald-300' : ''}`}>
                          {isUser ? 'You' : (msg.userName && !msg.userName.includes('AI') ? msg.userName : 'Customer Support')}
                          {!isUser && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </span>
                        <span className="font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}

                      {msg.attachment && (
                        <div className="pt-1.5">
                          <a href={msg.attachment} target="_blank" rel="noreferrer">
                            <img
                              src={msg.attachment}
                              alt="Attachment"
                              className="max-h-56 sm:max-h-72 rounded-xl object-cover border border-white/20 shadow-md hover:opacity-90 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Common Topics Quick Chips Bar */}
          <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-400" /> Quick:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                disabled={isSending}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shrink-0 transition-colors cursor-pointer text-[11px] whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Attachment Preview Box */}
          {filePreview && (
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-emerald-500/40" />
                <div className="text-[11px]">
                  <span className="text-emerald-400 font-semibold block truncate max-w-[200px]">
                    {selectedFile?.name || 'Screenshot attached'}
                  </span>
                  <span className="text-[10px] text-slate-500">Ready to send with message</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload Progress Indicator */}
          {uploadProgress !== null && (
            <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[10px] flex items-center justify-between font-mono text-emerald-400 shrink-0">
              <span>Uploading attachment...</span>
              <span>{uploadProgress}%</span>
            </div>
          )}

          {/* Pinned Bottom Input Form */}
          <form onSubmit={handleSend} className="p-2.5 sm:p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 sm:gap-2.5 shrink-0">
            <label
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
              title="Attach screenshot proof or receipt"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question or report payment proof..."
              className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans shadow-inner"
            />

            <button
              type="submit"
              disabled={isSending || (!text.trim() && !filePreview)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </main>

      {/* Render standalone bottom nav only if NOT embedded in UserApp */}
      {!isEmbedded && (
        <UserBottomNav
          currentTab="support"
          onTabChange={handleTabClick}
          unreadSupportCount={0}
        />
      )}
    </div>
  );
};
