'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './AIChatPanel.module.scss';

interface AIChatFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export function AIChatFAB({ onClick, isOpen }: AIChatFABProps) {
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = () => {
    setHasBeenClicked(true);
    onClick();
  };

  // Hide FAB when chat panel is open
  if (isOpen) return null;

  return (
    <button
      className={`${styles.fab} ${!hasBeenClicked ? styles.fabPulse : ''}`}
      onClick={handleClick}
      aria-label="Mở trợ lý AI"
      id="ai-chat-fab"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
