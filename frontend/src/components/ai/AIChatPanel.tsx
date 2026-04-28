'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, PlusCircle, MapPin, Bot } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useMapStore } from '@/hooks/useMapStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { AIChatFAB } from './AIChatFAB';
import { AIChatMessage } from './AIChatMessage';
import { AIChatInput } from './AIChatInput';
import styles from './AIChatPanel.module.scss';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    suggestedQuestions,
    anonRemaining,
    requiresLogin,
    sendMessage,
    clearChat,
  } = useAIChat();

  const { selectedPoiId } = useMapStore();
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // match panelOut animation duration
  };

  const handleSuggestionClick = (q: string) => {
    sendMessage(q);
  };

  const handleLoginClick = () => {
    setAuthModalOpen(true, 'login');
  };

  return (
    <>
      {/* FAB — shown when panel is closed */}
      <AIChatFAB onClick={() => setIsOpen(true)} isOpen={isOpen} />

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`}
          role="dialog"
          aria-label="Trợ lý AI DMap"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className={styles.headerTitle}>DMap Assistant</div>
              <div className={styles.headerSubtitle}>Trợ lý tiếp cận AI</div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerBtn}
                onClick={clearChat}
                aria-label="Cuộc trò chuyện mới"
                title="Cuộc trò chuyện mới"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              <button
                className={styles.headerBtn}
                onClick={handleClose}
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* POI Context Badge */}
          {selectedPoiId && (
            <div className={styles.contextBadge}>
              <MapPin className="w-3 h-3" />
              <span>Đang xem địa điểm #{selectedPoiId}</span>
            </div>
          )}

          {/* Anonymous Quota Banner */}
          {!isAuthenticated && anonRemaining !== null && (
            <div className={`${styles.quotaBanner} ${anonRemaining <= 1 ? styles.quotaBannerWarning : ''}`}>
              {requiresLogin ? (
                <>
                  Đã hết lượt miễn phí.{' '}
                  <button className={styles.loginCTA} onClick={handleLoginClick}>
                    Đăng nhập để tiếp tục
                  </button>
                </>
              ) : (
                <>Còn {anonRemaining}/3 tin nhắn miễn phí</>
              )}
            </div>
          )}

          {/* Messages */}
          <div className={styles.messagesArea}>
            {messages.map((msg) => (
              <AIChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className={styles.messageRow + ' ' + styles.messageRowAssistant}>
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {suggestedQuestions.length > 0 && !isLoading && (
            <div className={styles.suggestions}>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  className={styles.suggestionChip}
                  onClick={() => handleSuggestionClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <AIChatInput
            onSend={sendMessage}
            disabled={isLoading || requiresLogin}
          />
        </div>
      )}
    </>
  );
}
