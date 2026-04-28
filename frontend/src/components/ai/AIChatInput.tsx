'use client';

import React, { useRef, useCallback, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import styles from './AIChatPanel.module.scss';

interface AIChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function AIChatInput({ onSend, disabled = false }: AIChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const value = textareaRef.current?.value.trim();
    if (value && !disabled) {
      onSend(value);
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [onSend, disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
    }
  };

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          placeholder="Hỏi về tiếp cận..."
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          aria-label="Nhập tin nhắn"
          id="ai-chat-input"
          maxLength={300}
        />
      </div>
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={disabled}
        aria-label="Gửi tin nhắn"
        id="ai-chat-send"
      >
        <SendHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
