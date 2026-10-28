'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard } from '@/components/common/UIComponents';
import { useAppContext } from '@/context/AppContext';
import {
    getAdminConversationMessages,
    getAdminConversations,
    getConversationMessages,
    getConversations,
    markConversationRead,
    sendConversationMessage
} from '@/utils/chatApi';
import { connectChatSocket, disconnectChatSocket } from '@/utils/chatClient';
import { blockedMessageText, getFilterReasonLabel } from '@/utils/messageFilter';

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const toTitleCase = (value = '') => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const d1 = new Date(a);
    const d2 = new Date(b);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

const ChatPage = ({ userRole }) => {
    const { state } = useAppContext();
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [search, setSearch] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const messagesContainerRef = useRef(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const activeConversation = useMemo(
        () => conversations.find((item) => item._id === activeConversationId) || null,
        [conversations, activeConversationId]
    );

    const filteredConversations = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return conversations;

        return conversations.filter((conversation) => {
            const customerName = conversation?.customer?.name?.toLowerCase() || '';
            const vendorName = conversation?.vendor?.shopName?.toLowerCase() || conversation?.vendor?.name?.toLowerCase() || '';
            const email = conversation?.customer?.email?.toLowerCase() || '';
            return customerName.includes(query) || vendorName.includes(query) || email.includes(query);
        });
    }, [conversations, search]);

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            const data = userRole === 'admin'
                ? await getAdminConversations({ limit: 50 })
                : { conversations: await getConversations() };

            const nextConversations = data.conversations || [];
            setConversations(nextConversations);

            if (nextConversations.length > 0 && !activeConversationId) {
                setActiveConversationId(nextConversations[0]._id);
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load conversations.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async (conversationId) => {
        if (!conversationId) return;

        try {
            const response = userRole === 'admin'
                ? await getAdminConversationMessages(conversationId, { limit: 100 })
                : await getConversationMessages(conversationId, { limit: 100 });

            setMessages(response.messages || []);

            if (userRole !== 'admin') {
                await markConversationRead(conversationId);
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load messages.');
        }
    };

    useEffect(() => {
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole]);

    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversationId]);

    useEffect(() => {
        if (!token) return undefined;

        const socket = connectChatSocket(token);
        if (!socket) return undefined;

        const onMessage = (payload) => {
            const incoming = payload?.message;
            if (!incoming?.conversation) {
                return;
            }

            const incomingConversationId = typeof incoming.conversation === 'string'
                ? incoming.conversation
                : incoming.conversation._id;

            if (incomingConversationId === activeConversationId) {
                setMessages((prev) => [...prev, incoming]);
            }

            loadConversations();
        };

        const onConversationUpdated = (conversation) => {
            setConversations((prev) => {
                const existing = prev.find((item) => item._id === conversation._id);
                if (!existing) {
                    return [conversation, ...prev];
                }
                return [
                    conversation,
                    ...prev.filter((item) => item._id !== conversation._id)
                ];
            });
        };

        socket.on('message_received', onMessage);
        socket.on('conversation_updated', onConversationUpdated);
        socket.on('chat_error', (err) => {
            setErrorMessage(err?.message || 'Chat connection error.');
        });

        return () => {
            socket.off('message_received', onMessage);
            socket.off('conversation_updated', onConversationUpdated);
            socket.off('chat_error');
            disconnectChatSocket();
        };
    }, [activeConversationId, token]);

    useEffect(() => {
        if (!activeConversationId || !token) return;
        const socket = connectChatSocket(token);
        socket?.emit('join_conversation', { conversationId: activeConversationId });

        return () => {
            socket?.emit('leave_conversation', { conversationId: activeConversationId });
        };
    }, [activeConversationId, token]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        const content = messageInput.trim();
        if (!content || !activeConversationId || userRole === 'admin' || isSending) {
            return;
        }

        setIsSending(true);
        setErrorMessage('');

        try {
            const socket = token ? connectChatSocket(token) : null;
            if (socket?.connected) {
                socket.emit('send_message', {
                    conversationId: activeConversationId,
                    messageText: content
                });
            } else {
                const response = await sendConversationMessage({
                    conversationId: activeConversationId,
                    messageText: content
                });
                setMessages((prev) => [...prev, response.message]);
            }

            setMessageInput('');
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const renderParticipant = (conversation) => {
        if (!conversation) return 'Unknown';
        if (userRole === 'vendor') {
            return conversation.customer?.name || 'Customer';
        }
        return conversation.vendor?.shopName || conversation.vendor?.name || 'Vendor';
    };

    const getAdminSenderMeta = (msg) => {
        const sender = msg?.sender;
        const senderId = typeof sender === 'string' ? sender : sender?._id;
        const senderRole = msg?.senderRole;

        if (senderRole === 'vendor') {
            const vendorName = activeConversation?.vendor?.shopName || activeConversation?.vendor?.name || sender?.name || 'Vendor';
            return { name: vendorName, role: 'Vendor' };
        }

        if (senderRole === 'customer') {
            const customerName = activeConversation?.customer?.name || sender?.name || 'Customer';
            return { name: customerName, role: 'Customer' };
        }

        if (senderId && activeConversation?.vendor?._id && String(senderId) === String(activeConversation.vendor._id)) {
            return {
                name: activeConversation.vendor?.shopName || activeConversation.vendor?.name || sender?.name || 'Vendor',
                role: 'Vendor'
            };
        }

        if (senderId && activeConversation?.customer?._id && String(senderId) === String(activeConversation.customer._id)) {
            return {
                name: activeConversation.customer?.name || sender?.name || 'Customer',
                role: 'Customer'
            };
        }

        return {
            name: sender?.name || 'Unknown Sender',
            role: toTitleCase(senderRole) || 'Unknown'
        };
    };

    const myUserId = state?.user?._id;

    return (
        <DashboardLayout title={userRole === 'admin' ? 'Chat Monitoring' : 'Customer Chat'} userRole={userRole}>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 via-white to-emerald-100 p-3 sm:p-5 shadow-xl">
                <DashboardCard className="h-[calc(100dvh-8rem)] min-h-0 flex flex-col overflow-hidden p-0 md:h-[78vh]">
                    <div className="flex h-full min-h-0 flex-col md:grid md:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="flex h-52 min-h-0 flex-none flex-col overflow-hidden border-b border-gray-200 bg-white/90 backdrop-blur-sm md:h-auto md:min-h-0 md:flex-1 md:border-b-0 md:border-r">
                            <div className="border-b border-gray-200 p-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {userRole === 'admin' ? 'All Conversations' : 'Customer Inbox'}
                                </h3>
                                <p className="mt-1 text-xs text-gray-600">
                                    {userRole === 'admin'
                                        ? 'Read-only monitoring of customer and vendor messages'
                                        : 'Real-time support with secure message filtering'}
                                </p>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name or email"
                                    className="mt-3 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                                />
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
                                {isLoading ? (
                                    <div className="space-y-2 p-2">
                                        {[1, 2, 3, 4].map((item) => (
                                            <div key={item} className="animate-pulse rounded-xl border border-gray-200 p-3">
                                                <div className="h-4 w-2/3 rounded bg-gray-200" />
                                                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <p className="p-4 text-sm text-gray-500">No conversations found.</p>
                                ) : (
                                    filteredConversations.map((conversation) => {
                                        const isActive = activeConversationId === conversation._id;
                                        const unread = userRole === 'vendor'
                                            ? conversation?.unreadCount?.vendor || 0
                                            : conversation?.unreadCount?.customer || 0;

                                        return (
                                            <button
                                                key={conversation._id}
                                                type="button"
                                                onClick={() => setActiveConversationId(conversation._id)}
                                                className={`mb-2 w-full rounded-xl border p-3 text-left transition ${isActive
                                                    ? 'border-green-600 bg-green-50 shadow'
                                                    : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="line-clamp-1 text-sm font-semibold text-gray-900">{renderParticipant(conversation)}</p>
                                                    {unread > 0 && userRole !== 'admin' && (
                                                        <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 line-clamp-1 text-xs text-gray-500">{conversation?.lastMessage?.text || 'No messages yet'}</p>
                                                <p className="mt-1 text-[10px] text-gray-400">{formatDateLabel(conversation?.updatedAt)}</p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-white to-green-50/40 md:flex-none">
                            {activeConversation ? (
                                <>
                                    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
                                        <p className="text-sm font-semibold text-gray-900">{renderParticipant(activeConversation)}</p>
                                        <p className="text-xs text-gray-500">
                                            {activeConversation?.customer?.email || 'Secure on-platform chat'}
                                        </p>
                                    </header>

                                    <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5">
                                        {messages.map((msg, index) => {
                                            const senderId = typeof msg?.sender === 'string' ? msg.sender : msg?.sender?._id;
                                            const mine = senderId && myUserId ? String(senderId) === String(myUserId) : false;
                                            const adminSenderMeta = userRole === 'admin' ? getAdminSenderMeta(msg) : null;
                                            const previous = messages[index - 1];
                                            const showDate = !previous || !isSameDay(previous.createdAt, msg.createdAt);

                                            return (
                                                <div key={msg._id || `${msg.createdAt}-${index}`}>
                                                    {showDate && (
                                                        <div className="my-4 flex justify-center">
                                                            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-500">
                                                                {formatDateLabel(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[70%] ${mine
                                                            ? 'rounded-br-md bg-green-700 text-white'
                                                            : 'rounded-tl-md border border-gray-200 bg-white text-gray-800'}`}>
                                                            {userRole === 'admin' && (
                                                                <p className="mb-1 text-[11px] font-semibold text-gray-500">
                                                                    {adminSenderMeta?.name} ({adminSenderMeta?.role})
                                                                </p>
                                                            )}
                                                            {msg.status === 'filtered' ? (
                                                                <p className={`text-sm ${mine ? 'text-green-100' : 'text-gray-700'}`}>{blockedMessageText}</p>
                                                            ) : (
                                                                <p className="text-sm leading-relaxed">{msg.messageText}</p>
                                                            )}

                                                            {msg.status === 'filtered' && Array.isArray(msg?.filterMetadata?.reasons) && msg.filterMetadata.reasons.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {msg.filterMetadata.reasons.map((reason) => (
                                                                        <span
                                                                            key={`${msg._id}-${reason}`}
                                                                            className={`rounded-full px-2 py-0.5 text-[10px] ${mine
                                                                                ? 'bg-green-600 text-green-50'
                                                                                : 'bg-amber-100 text-amber-800'}`}
                                                                        >
                                                                            {getFilterReasonLabel(reason)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <p className={`mt-1 text-right text-[10px] ${mine ? 'text-green-100' : 'text-gray-400'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {userRole !== 'admin' && (
                                        <footer className="border-t border-gray-200 bg-white p-3 sm:p-4">
                                            <form
                                                className="flex items-end gap-2"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }}
                                            >
                                                <textarea
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    rows={1}
                                                    placeholder="Type your message..."
                                                    className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                />
                                                <button
                                                    type="submit"
                                                    style={{ touchAction: 'manipulation' }}
                                                    disabled={isSending || !messageInput.trim()}
                                                    className="h-11 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
                                                >
                                                    {isSending ? 'Sending...' : 'Send'}
                                                </button>
                                            </form>
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                For your safety, sharing personal contact details and off-platform payment instructions is blocked.
                                            </p>
                                        </footer>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                                    Select a conversation to view messages.
                                </div>
                            )}
                        </section>
                    </div>
                </DashboardCard>
                {errorMessage && (
                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;