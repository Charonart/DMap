'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Search, MapPin } from 'lucide-react';
import { useMapStore } from '@/hooks/useMapStore';
import { useMapContext } from '@/components/map/MapContext';
import styles from './SmartSearchBar.module.scss';

export function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setSelectedPoiId, setFilterSearchQuery } = useMapStore();
  const { map } = useMapContext();

  // Debounce the input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setFilterSearchQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setFilterSearchQuery]);

  // Fetch autocomplete
  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['search.autocomplete', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const res = await axiosInstance.get('/search/autocomplete', {
        params: { q: debouncedQuery }
      });
      return res.data.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (suggestion: any) => {
    setQuery(suggestion.name);
    setIsFocused(false);
    setSelectedPoiId(suggestion.id);
    if (map && suggestion.lat && suggestion.lng) {
      map.flyTo({ center: [suggestion.lng, suggestion.lat], zoom: 16 });
    }
  };

  return (
    <div className={styles.root}>
      {/* Search icon */}
      <Search className="w-5 h-5" style={{
        position: 'absolute', left: '0.875rem', top: '50%',
        transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <input
        className={styles.searchInput}
        placeholder="Tìm kiếm địa điểm..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      
      {isFocused && query.length >= 2 && (
        <div className={styles.dropdown}>
          {isFetching ? (
            <div className={styles.dropdownLoading}>Đang tìm...</div>
          ) : suggestions?.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {suggestions.map((item: any) => (
                <li 
                  key={item.id}
                  onPointerDown={() => handleSelect(item)}
                  className={styles.suggestionItem}
                >
                  <MapPin className="w-5 h-5" style={{ flexShrink: 0, color: 'var(--color-on-surface-variant)' }} />
                  <div className={styles.suggestionText}>
                    <span className={styles.suggestionName}>{item.name}</span>
                    <span className={styles.suggestionSub}>{item.address || item.category_name}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.dropdownEmpty}>Không tìm thấy địa điểm phù hợp</div>
          )}
        </div>
      )}
    </div>
  );
}
