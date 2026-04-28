'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/hooks/useAIChat';
import styles from './AIChatPanel.module.scss';

interface AIChatMessageProps {
  message: ChatMessageType;
}

export function AIChatMessage({ message }: AIChatMessageProps) {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}
    >
      <div>
        <div
          className={`${styles.messageBubble} ${isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}
        >
          {/* Simple markdown-like rendering: bold and line breaks */}
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {renderFormattedLine(line)}
            </React.Fragment>
          ))}
        </div>
        <div className={`${styles.messageTime} ${isUser ? styles.messageTimeUser : ''}`}>
          {time}
        </div>
      </div>
    </div>
  );
}

// Simple inline formatting: **bold** and *italic*
function renderFormattedLine(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
