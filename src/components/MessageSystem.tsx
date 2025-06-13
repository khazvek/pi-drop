import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, MessageSquare, Trash2, Clock, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: string;
}

interface MessageSystemProps {
  isDark: boolean;
}

export default function MessageSystem({ isDark }: MessageSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('kaury-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(
          parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }))
        );
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    }

    const url =
      (import.meta as any).env.VITE_WS_URL || `ws://${location.hostname}:3001`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setMessages(
            data.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        } else if (data.type === 'message') {
          const msg = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          } as Message;
          setMessages((prev) => [msg, ...prev]);
        } else if (data.type === 'clear') {
          setMessages([]);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kaury-messages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;

    const message: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      sender: 'Mobile Device'
    };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'message', message })
      );
    } else {
      setMessages(prev => [message, ...prev]);
    }
    setNewMessage('');
  }, [newMessage]);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAllMessages = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'clear' }));
    }
    setMessages([]);
    setShowDeleteConfirm(false);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className={`rounded-lg border transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b flex justify-between items-center ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <MessageSquare className={`h-5 w-5 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Messages
          </h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
              isDark 
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            Clear All ({messages.length})
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 p-2 rounded border resize-none transition-colors duration-200 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors duration-200 flex items-center space-x-1"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className={`mx-auto h-8 w-8 mb-3 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No messages yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded border transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {message.sender}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className={`h-3 w-3 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className={`p-1 rounded transition-colors duration-200 ${
                      isDark 
                        ? 'hover:bg-red-900/50 text-red-400' 
                        : 'hover:bg-red-50 text-red-500'
                    }`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } whitespace-pre-wrap`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-sm w-full ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Clear All Messages
              </h3>
            </div>
            <p className={`text-sm mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to delete all {messages.length} messages? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded text-sm transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={clearAllMessages}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}