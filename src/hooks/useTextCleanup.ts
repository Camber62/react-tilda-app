import { useCallback } from 'react';

// Удаляет все http/https и www-ссылки
function removeLinks(text: string): string {
  return text.replace(/https?:\/\/\S+|www\.\S+/gi, '');
}

// Удаляет только звездочки из текста
function removeStars(text: string): string {
  return text
    // Удаляем все звездочки (одиночные и двойные)
    .replace(/\*/g, '')
    // Удаляем лишние пробелы, которые могут появиться после удаления звездочек
    .replace(/\s+/g, ' ')
    .trim();
}

export function useTextCleanup() {
  // Возвращает функцию, которая очищает текст от ссылок и звездочек

  return useCallback((text: string) => {
    let cleanedText = removeLinks(text);
    cleanedText = removeStars(cleanedText);
    return cleanedText;
  }, []);
} 