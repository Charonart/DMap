'use client';

import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { useMapStore } from '@/hooks/useMapStore';
import { useAuthStore } from '@/stores/useAuthStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  suggestedQuestions: string[];
  anonRemaining: number | null;
  requiresLogin: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý DMap 🤖\n\nTôi có thể giúp bạn tìm hiểu về tính năng tiếp cận cho người khuyết tật tại các địa điểm trên bản đồ.\n\nHãy chọn một địa điểm trên bản đồ hoặc hỏi tôi bất cứ điều gì!',
  timestamp: new Date(),
};

const INITIAL_SUGGESTIONS = [
  'Địa điểm nào có lối đi xe lăn tốt nhất?',
  'Tìm nhà hàng có thang máy ở gần đây',
  'Giải thích thang điểm tiếp cận DMap',
];

// Generate a persistent anonymous ID
function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('dmap_anon_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('dmap_anon_id', id);
  }
  return id;
}

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [anonRemaining, setAnonRemaining] = useState<number | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { selectedPoiId, userLocation } = useMapStore();
  const { isAuthenticated } = useAuthStore();

  // Load active session on mount
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const headers: Record<string, string> = {};
        if (!isAuthenticated) {
          headers['x-anon-id'] = getAnonId();
        }
        const res = await axiosInstance.get('/ai/sessions/active', { headers });
        if (res.data?.data?.sessionId) {
          setSessionId(res.data.data.sessionId);
          if (res.data.data.messages && res.data.data.messages.length > 0) {
            const historyMsgs: ChatMessage[] = res.data.data.messages.map((m: any) => ({
              id: m.id.toString(),
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at)
            }));
            setMessages([WELCOME_MESSAGE, ...historyMsgs]);
          }
        }
      } catch (e) {
        console.error("Failed to load active session:", e);
      }
    };
    fetchActiveSession();
  }, [isAuthenticated]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedQuestions([]);

    try {
      const headers: Record<string, string> = {};
      if (!isAuthenticated) {
        headers['x-anon-id'] = getAnonId();
      }

      const payload: any = {
        message: text.trim(),
        poiId: selectedPoiId || undefined,
        sessionId: sessionId || undefined,
      };

      if (userLocation) {
        payload.userLocation = userLocation;
      }

      const response = await axiosInstance.post('/ai/chat', payload, { headers });

      const { reply, suggestedQuestions: suggestions, remainingMessages, sessionId: newSessionId } = response.data.data;

      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (suggestions && suggestions.length > 0) {
        setSuggestedQuestions(suggestions);
      }

      if (remainingMessages !== undefined) {
        setAnonRemaining(remainingMessages);
      }
    } catch (error: unknown) {
      let errorMessage = 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: { message?: string; data?: { requiresLogin?: boolean } } } };
        if (axiosError.response?.status === 429) {
          const data = axiosError.response.data;
          errorMessage = data.message || 'Bạn đã hết lượt sử dụng.';
          if (data.data?.requiresLogin) {
            setRequiresLogin(true);
            setAnonRemaining(0);
          }
        } else if (axiosError.response?.status === 503) {
          errorMessage = 'Tính năng AI chưa được cấu hình trên server.';
        } else {
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      }

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedPoiId, isAuthenticated, sessionId, userLocation]);

  const clearChat = useCallback(async () => {
    try {
       const headers: Record<string, string> = {};
       if (!isAuthenticated) headers['x-anon-id'] = getAnonId();
       
       // Create a new session on backend
       const res = await axiosInstance.post('/ai/sessions', {}, { headers });
       if (res.data?.data?.sessionId) {
          setSessionId(res.data.data.sessionId);
       } else {
          setSessionId(null);
       }
    } catch (e) {
       console.error("Failed to create new session", e);
       setSessionId(null);
    }

    setMessages([WELCOME_MESSAGE]);
    setSuggestedQuestions(INITIAL_SUGGESTIONS);
    setRequiresLogin(false);
  }, [isAuthenticated]);

  return {
    messages,
    isLoading,
    suggestedQuestions,
    anonRemaining,
    requiresLogin,
    sendMessage,
    clearChat,
  };
}
