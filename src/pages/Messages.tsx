import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import type { Message, User } from '../types';

export default function Messages() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { messages, sendMessage, getConversation } = useMessageStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user && selectedUser) {
      getConversation(user.id, selectedUser.id);
    }
  }, [user, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser) return;

    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: newMessage,
        read: false
      });
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour accéder à la messagerie.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 min-h-[600px]">
            {/* Liste des conversations */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversations
                </h2>
              </div>
              <div className="overflow-y-auto h-[calc(600px-4rem)]">
                {/* TODO: Implement conversation list */}
              </div>
            </div>

            {/* Zone de messages */}
            <div className="col-span-8 flex flex-col">
              {selectedUser ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_id === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user.id
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Écrivez votre message..."
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Envoyer
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Sélectionnez une conversation pour commencer à discuter
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}