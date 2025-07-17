import { useCallback } from 'react';

// Удаляет все http/https и www-ссылки
function removeLinks(text: string): string {
  return text.replace(/https?:\/\/\S+|www\.\S+/gi, '');
}

export function useTextCleanup() {
  // Возвращает функцию, которая очищает текст только от ссылок
  return useCallback((text: string) => {
    return removeLinks(text);
  }, []);
} 