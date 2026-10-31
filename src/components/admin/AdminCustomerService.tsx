import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { SupportMessage, User, Wallet, UserPackage, AdminUserListItem } from '../../types';
import {
  Search,
  Headphones,
  Send,
  Camera,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Shield,
  X,
  MessageSquare,
  Wallet as WalletIcon,
  Package as PackageIcon,
  ExternalLink,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Users,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';

interface ConversationItem {
  userId: string;
  userName: string;
  unreadCount: number;
  lastMessage: SupportMessage;
}

export const AdminCustomerService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'members'>('chats');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [allMembers, setAllMembers] = useState<AdminUserListItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [userMetadata, setUserMetadata] = useState<{
    user: User;
    wallet: Wallet;
    packages: UserPackage[];
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentData, setAttachmentData] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Clear chat modals state
  const [userToClear, setUserToClear] = useState<{ userId: string; userName: string; count: number } | null>(null);
  const [isClearingUserChat, setIsClearingUserChat] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Delete single message state
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  const chatFeedRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  const fetchConversations = async () => {
    try {
      const data = await api.getAdminSupportConversations();
      setConversations(data);
      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0].userId);
        setSelectedUserName(data[0].userName);
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  };

  const fetchAllMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const members = await api.getAdminUsers();
      setAllMembers(members);
    } catch (e) {
      console.error('Failed to load members:', e);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchMessagesForUser = async (userId: string, isInitial = false) => {
    try {
      const [msgs, history] = await Promise.all([
        api.getAdminSupportMessages(userId),
        api.getAdminUserHistory(userId).catch(() => null),
      ]);
      setMessages(msgs);
      if (history) {
        setUserMetadata({
          user: history.user,
          wallet: history.wallet,
          packages: history.packages,
        });
        setSelectedUserName(history.user.name);
      }
      if (isInitial && chatFeedRef.current) {
        setTimeout(() => {
          if (chatFeedRef.current) {
            chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
          }
        }, 60);
      }
    } catch (e) {
      console.error('Failed to load messages for user:', e);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAllMembers();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      prevMsgCountRef.current = 0;
      fetchMessagesForUser(selectedUserId, true);
      const interval = setInterval(() => fetchMessagesForUser(selectedUserId, false), 3500);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // Only scroll internal chat container if new messages arrive, without moving the viewport or page
    if (chatFeedRef.current && messages.length > prevMsgCountRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  const handleSelectUser = (userId: string, name?: string) => {
    setSelectedUserId(userId);
    if (name) setSelectedUserName(name);
    fetchMessagesForUser(userId);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || (!replyText.trim() && !attachmentData)) return;

    setIsSending(true);
    setActionError(null);
    try {
      await api.replyAdminSupportMessage(selectedUserId, replyText.trim(), attachmentData || undefined);
      setReplyText('');
      setAttachmentData(null);
      await fetchMessagesForUser(selectedUserId);
      await fetchConversations();
    } catch (err: any) {
      setActionError(err.message || 'Failed to send reply');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleInitiateClearUserChat = (userId: string, userName?: string) => {
    const targetConv = conversations.find((c) => c.userId === userId);
    const resolvedName = userName || targetConv?.userName || userMetadata?.user.name || selectedUserName || 'Member';
    const count = userId === selectedUserId ? messages.length : 1;
    setUserToClear({
      userId,
      userName: resolvedName,
      count,
    });
  };

  const handleConfirmClearUserChat = async () => {
    if (!userToClear) return;
    setIsClearingUserChat(true);
    setActionError(null);
    try {
      const res = await api.clearAdminSupportChat(userToClear.userId);
      setActionFeedback(`Successfully cleared support chat for ${userToClear.userName} (${res.count ?? 0} messages deleted).`);
      setTimeout(() => setActionFeedback(null), 3500);

      if (selectedUserId === userToClear.userId) {
        setMessages([]);
      }
      await fetchConversations();
      setUserToClear(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to clear user chat');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsClearingUserChat(false);
    }
  };

  const handleDeleteSingleMessage = async (messageId: string) => {
    setIsDeletingMessage(true);
    setActionError(null);
    try {
      await api.deleteAdminSupportMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await fetchConversations();
      setActionFeedback('Message deleted from helpdesk.');
      setTimeout(() => setActionFeedback(null), 2500);
      setMessageToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete message');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setIsClearingAll(true);
    setActionError(null);
    try {
      const res = await api.clearAllAdminSupportChats();
      setActionFeedback(`All helpdesk conversations cleared successfully (${res.count ?? 0} messages purged).`);
      setTimeout(() => setActionFeedback(null), 4000);
      setMessages([]);
      setConversations([]);
      setSelectedUserId(null);
      setUserMetadata(null);
      setShowClearAllModal(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to clear all support chats');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsClearingAll(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = allMembers.filter((m) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConversation = conversations.find((c) => c.userId === selectedUserId);
  const activePackage = userMetadata?.packages.find((p) => p.status === 'active');
  const currentDisplayName = selectedUserName || activeConversation?.userName || userMetadata?.user.name || 'Member';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Communication Terminal</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Service & Helpdesk Console</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-user communication hub with click-to-chat across all members, conversation controls, and message purge capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchConversations();
              fetchAllMembers();
              if (selectedUserId) fetchMessagesForUser(selectedUserId);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Chats</span>
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1 font-medium">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl h-[680px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Pane 1: Conversations & All Members Switcher (4 of 12 cols on desktop) */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800 flex flex-col h-full bg-slate-950/70 overflow-hidden">
          {/* Tabs - Completely fixed, never moves or scrolls */}
          <div className="p-2 border-b border-slate-800 grid grid-cols-2 gap-1 bg-slate-950 shrink-0 sticky top-0 z-10 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('chats')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Active ({conversations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Users ({allMembers.length})</span>
            </button>
          </div>

          {/* Search bar - Completely fixed, never moves or scrolls */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 shrink-0 bg-slate-950 sticky top-0 z-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search members by name, phone...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* List Content - ONLY this inner roster scrolls */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 min-h-0 overscroll-contain">
            {activeTab === 'chats' ? (
              filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                  <MessageSquare className="w-6 h-6 text-slate-600 mx-auto" />
                  <p>No active conversations match search.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('members')}
                    className="text-red-400 hover:underline font-semibold block mx-auto text-[11px]"
                  >
                    Click here to message any registered member →
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedUserId === c.userId;
                  return (
                    <div
                      key={c.userId}
                      onClick={() => handleSelectUser(c.userId, c.userName)}
                      className={`w-full text-left p-3 transition-colors cursor-pointer flex items-start gap-2.5 relative group ${
                        isSelected ? 'bg-slate-900 border-l-4 border-red-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        {c.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white truncate">{c.userName}</span>
                          <div className="flex items-center gap-1">
                            {c.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white font-bold text-[9px] rounded-full">
                                {c.unreadCount}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInitiateClearUserChat(c.userId, c.userName);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                              title={`Clear chat for ${c.userName}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {c.lastMessage.message || (c.lastMessage.attachment ? '[Screenshot Attached]' : '...')}
                        </p>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* All Members Tab */
              isLoadingMembers ? (
                <div className="p-6 text-center text-xs text-slate-500">Loading registered members...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No members match search query.</div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedUserId === m.id;
                  const hasConversation = conversations.some((c) => c.userId === m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectUser(m.id, m.name)}
                      className={`w-full text-left p-3 transition-colors cursor-pointer flex items-center justify-between gap-2 relative group ${
                        isSelected ? 'bg-slate-900 border-l-4 border-red-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-red-400 flex items-center justify-center shrink-0 font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{m.name}</span>
                            {m.package && m.package !== 'None' && (
                              <span className="px-1.5 py-0.2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-bold rounded">
                                {m.package}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{m.phone || m.email}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {hasConversation ? (
                          <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-semibold rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-medium rounded group-hover:bg-red-600 group-hover:text-white transition-colors">
                            Click to chat
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Pane 2: Middle Chat Stream (6 of 12 cols on desktop) */}
        <div className="md:col-span-8 lg:col-span-6 flex flex-col h-full bg-slate-900/50 border-r border-slate-800/80 overflow-hidden">
          {selectedUserId ? (
            <>
              {/* Header */}
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-tight truncate">
                      {currentDisplayName}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono truncate block">
                    ID: {selectedUserId} · {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleInitiateClearUserChat(selectedUserId, currentDisplayName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Clear all chat messages for this user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear User Chat</span>
                  </button>
                </div>
              </div>

              {/* Messages Feed - Scrolls internally without moving window or header */}
              <div ref={chatFeedRef} className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 overscroll-contain">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 space-y-2 p-6 text-center">
                    <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300">No chat history with {currentDisplayName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Send a response or announcement below to start direct communication.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div key={m.id} className={`flex flex-col group ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                          <span>{isAdmin ? 'Administrator' : m.userName}</span>
                          <span>·</span>
                          <span className="font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleMessage(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer ml-0.5"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 relative ${
                            isAdmin
                              ? 'bg-red-600 text-white rounded-tr-sm shadow-md'
                              : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
                          }`}
                        >
                          {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
                          {m.attachment && (
                            <img
                              src={m.attachment}
                              alt="Attachment"
                              className="rounded-xl max-h-48 object-cover border border-black/30 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewModalImage(m.attachment)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Preview attachment */}
              {attachmentData && (
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <img src={attachmentData} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-red-500/40" />
                    <span className="text-xs text-red-400 font-medium">Image screenshot ready to send</span>
                  </div>
                  <button onClick={() => setAttachmentData(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendReply} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    title="Send screenshot"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write response to ${currentDisplayName}...`}
                  className="flex-1 py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />

                <button
                  type="submit"
                  disabled={(!replyText.trim() && !attachmentData) || isSending}
                  className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl cursor-pointer shadow-md transition-all active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-slate-500 text-xs text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">Select a conversation or member to start chatting</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Choose any active conversation from the left or switch to "All Users" to reach out to any registered account.
              </p>
            </div>
          )}
        </div>

        {/* Pane 3: Right Member Profile Sidebar (Desktop 3 of 12 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col h-full bg-slate-950/80 p-4 overflow-y-auto space-y-4 min-h-0 overscroll-contain">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Member Dossier</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{userMetadata?.user.name || currentDisplayName}</h4>
            <span className="text-[10px] text-slate-500 font-mono">{userMetadata?.user.email || selectedUserId}</span>
          </div>

          {/* Quick info badges */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Available Balance</span>
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                Rs. {(userMetadata?.wallet.availableBalance || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Pending: Rs. {(userMetadata?.wallet.pendingBalance || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-semibold">
                <PackageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Subscription Plan</span>
              </div>
              <div className="text-xs font-bold text-white">
                {activePackage ? activePackage.packageName : 'No Active Plan'}
              </div>
              {activePackage && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Expires: {new Date(activePackage.expiryDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone Number</span>
                <span className="font-mono text-slate-200">{userMetadata?.user.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Referral Code</span>
                <span className="font-mono text-slate-200">{userMetadata?.user.referralCode || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Member Status</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    userMetadata?.user.status === 'active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {userMetadata?.user.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Single User Chat Confirmation Modal */}
      {userToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setUserToClear(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Helpdesk Maintenance</span>
                <h3 className="text-base font-bold text-white tracking-tight">Clear User Chat History</h3>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-2xl mb-4 text-xs text-rose-200/90 leading-relaxed">
              Are you sure you want to clear the entire chat conversation for this user? All user queries, admin replies, and uploaded screenshots for this conversation will be permanently removed.
            </div>

            <div className="mb-5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">User Name:</span>
                <span className="font-bold text-white font-sans">{userToClear.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">User ID:</span>
                <span className="text-slate-300">{userToClear.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Current Messages:</span>
                <span className="text-rose-400 font-bold">{userToClear.count}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToClear(null)}
                disabled={isClearingUserChat}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearUserChat}
                disabled={isClearingUserChat}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingUserChat ? 'Clearing Chat...' : 'Confirm Clear Chat'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Helpdesk Chats Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/80 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowClearAllModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Total Reset</span>
                <h3 className="text-base font-bold text-white tracking-tight">Purge All Helpdesk Chats</h3>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-2xl mb-4 text-xs text-rose-200/90 leading-relaxed">
              DANGER: This action will permanently wipe ALL customer support messages and conversations across ALL users in the system.
            </div>

            <div className="mb-5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Active Conversations:</span>
              <span className="font-mono font-bold text-rose-400">{conversations.length}</span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                disabled={isClearingAll}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={isClearingAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingAll ? 'Purging Archive...' : 'Permanently Purge All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot / Attachment Lightbox Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImage}
              alt="Attachment Full View"
              className="rounded-2xl max-h-[85vh] max-w-full object-contain border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
