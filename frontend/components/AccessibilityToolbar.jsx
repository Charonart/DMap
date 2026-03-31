'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/AccessibilityToolbar.module.css';

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'default',
    fontSize: 100
  });
  const panelRef = useRef(null);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('dmap-a11y-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applyTheme(parsed.theme);
        applyFontSize(parsed.fontSize);
      } catch(e) {}
    }
    
    // Click outside to close
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (themeCode) => {
    if (themeCode === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeCode);
    }
  };

  const applyFontSize = (size) => {
    document.documentElement.style.fontSize = `${size}%`;
  };

  const handleThemeChange = (newTheme) => {
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    applyTheme(newTheme);
    localStorage.setItem('dmap-a11y-settings', JSON.stringify(newSettings));
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    const newSettings = { ...settings, fontSize: newSize };
    setSettings(newSettings);
    applyFontSize(newSize);
    localStorage.setItem('dmap-a11y-settings', JSON.stringify(newSettings));
  };

  return (
    <div className={styles.container} ref={panelRef}>
      <button 
        className={styles.fab} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Accessibility Menu"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2v20"></path>
          <path d="M12 2v20c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill={settings.theme !== 'default' ? "currentColor" : "none"}></path>
        </svg>
      </button>

      {isOpen && (
        <div className={`${styles.panel} m3-overlay`} role="dialog" aria-label="Accessibility Settings">
          <div className={styles.header}>
            <h3>Accessibility Settings</h3>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close">
              &times;
            </button>
          </div>
          
          <div className={styles.section}>
            <label htmlFor="font-size-slider" className={styles.label}>
              Text Size: {settings.fontSize}%
            </label>
            <div className={styles.sliderControl}>
              <span className={styles.sliderSmall}>A</span>
              <input 
                id="font-size-slider"
                type="range" 
                min="80" 
                max="150" 
                step="5" 
                value={settings.fontSize} 
                onChange={handleFontSizeChange}
                className={styles.slider}
              />
              <span className={styles.sliderLarge}>A</span>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Contrast Theme</label>
            <div className={styles.themeGrid}>
              <button 
                className={`${styles.themeBtn} ${settings.theme === 'default' ? styles.activeTheme : ''}`}
                onClick={() => handleThemeChange('default')}
                style={{ background: '#f8faf8', color: '#1b1c1b', border: '1px solid #747775' }}
                aria-pressed={settings.theme === 'default'}
              >
                Default
              </button>
              <button 
                className={`${styles.themeBtn} ${settings.theme === 'hc-black-white' ? styles.activeTheme : ''}`}
                onClick={() => handleThemeChange('hc-black-white')}
                style={{ background: '#000000', color: '#ffffff', border: '1px solid #ffffff' }}
                aria-pressed={settings.theme === 'hc-black-white'}
              >
                Black / White
              </button>
              <button 
                className={`${styles.themeBtn} ${settings.theme === 'hc-black-yellow' ? styles.activeTheme : ''}`}
                onClick={() => handleThemeChange('hc-black-yellow')}
                style={{ background: '#000000', color: '#ffff00', border: '1px solid #ffff00' }}
                aria-pressed={settings.theme === 'hc-black-yellow'}
              >
                Black / Yellow
              </button>
              <button 
                className={`${styles.themeBtn} ${settings.theme === 'hc-white-black' ? styles.activeTheme : ''}`}
                onClick={() => handleThemeChange('hc-white-black')}
                style={{ background: '#ffffff', color: '#000000', border: '2px solid #000000' }}
                aria-pressed={settings.theme === 'hc-white-black'}
              >
                White / Black
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
