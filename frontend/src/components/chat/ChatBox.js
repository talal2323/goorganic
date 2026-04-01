'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
  startConversation
} from '@/utils/chatApi';
import { connectChatSocket, disconnectChatSocket } from '@/utils/chatClient';
import { blockedMessageText, getFilterReasonLabel } from '@/utils/messageFilter';

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatBox = ({ vendorId, vendorName = 'Vendor' }) => {
  const { state } = useAppContext();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const anchorRef = useRef(null);

  const initializeConversation = async () => {
    if (!vendorId) {
      setError('Vendor is required to start chat.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const conversation = await startConversation(vendorId);
      setConversationId(conversation._id);

      const messageResponse = await getConversationMessages(conversation._id, { limit: 100 });
      setMessages(messageResponse.messages || []);
      await markConversationRead(conversation._id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to start conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  useEffect(() => {
    if (!conversationId || !token) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    socket.emit('join_conversation', { conversationId });

    const onMessage = (payload) => {
      const incomingMessage = payload?.message;
      if (!incomingMessage) return;

      const incomingConversationId = typeof incomingMessage.conversation === 'string'
        ? incomingMessage.conversation
        : incomingMessage.conversation?._id;

      if (incomingConversationId === conversationId) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    };

    socket.on('message_received', onMessage);
    socket.on('chat_error', (err) => setError(err?.message || 'Chat error.'));

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('message_received', onMessage);
      socket.off('chat_error');
      disconnectChatSocket();
    };
  }, [conversationId, token]);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !conversationId || isSending) {
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const socket = token ? connectChatSocket(token) : null;
      if (socket?.connected) {
        socket.emit('send_message', {
          conversationId,
          messageText: content
        });
      } else {
        const response = await sendConversationMessage({
          conversationId,
          messageText: content
        });
        setMessages((prev) => [...prev, response.message]);
      }
      setInput('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!state?.isLoggedIn) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Please login to start a secure chat with this vendor.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-white via-green-50 to-emerald-100 p-3 shadow-xl sm:p-4">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-white/90 p-3 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Chat with {vendorName}</h3>
        </div>
      </div>

      <div className="h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet. Say hello to get started.</p>
        ) : (
          messages.map((msg, index) => {
            const senderId = typeof msg?.sender === 'string' ? msg.sender : msg?.sender?._id;
            const mine = state?.user?._id && senderId ? String(state.user._id) === String(senderId) : false;

            return (
              <div key={msg._id || index} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine
                  ? 'rounded-br-md bg-green-700 text-white'
                  : 'rounded-tl-md border border-gray-200 bg-gray-50 text-gray-800'}`}>
                  {msg.status === 'filtered' ? (
                    <p className={mine ? 'text-green-100' : 'text-gray-700'}>{blockedMessageText}</p>
                  ) : (
                    <p>{msg.messageText}</p>
                  )}

                  {msg.status === 'filtered' && Array.isArray(msg?.filterMetadata?.reasons) && msg.filterMetadata.reasons.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {msg.filterMetadata.reasons.map((reason) => (
                        <span
                          key={`${msg._id}-${reason}`}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${mine ? 'bg-green-600 text-green-50' : 'bg-amber-100 text-amber-800'}`}
                        >
                          {getFilterReasonLabel(reason)}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className={`mt-1 text-right text-[10px] ${mine ? 'text-green-100' : 'text-gray-500'}`}>{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={anchorRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
          placeholder="Type your message..."
          rows="3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Phone numbers, email addresses, bank names, wallet names, and off-platform payment requests are blocked.
      </p>
    </div>
  );
};

export default ChatBox;