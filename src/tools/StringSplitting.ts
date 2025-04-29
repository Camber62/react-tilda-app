export const StringSplitting = (text: string, length: number = 250) => {
    const chunk: string[] = [];
    let currentIndex = 0;
    
    // Удаляем переносы строк
    text = text.replaceAll("\n", " ").trim();
    
    while (currentIndex < text.length) {
        // Если оставшийся текст короче максимальной длины, берем его целиком
        if (currentIndex + length >= text.length) {
            chunk.push(text.substring(currentIndex).trim());
            break;
        }
        
        // Находим последний подходящий разделитель в пределах максимальной длины
        let splitIndex = currentIndex + length;
        
        // Ищем ближайший знак препинания с пробелом после него
        let punctuationIndex = -1;
        for (let i = splitIndex; i > currentIndex; i--) {
            if (['.', '!', '?', ',', ';', ':'].includes(text[i]) && 
                (i + 1 < text.length && (text[i + 1] === ' ' || text[i + 1] === '\t'))) {
                punctuationIndex = i + 1;
                break;
            }
        }
        
        // Если нашли подходящий знак препинания, используем его
        if (punctuationIndex > currentIndex) {
            splitIndex = punctuationIndex;
        } else {
            // Иначе ищем последний пробел
            let spaceIndex = text.lastIndexOf(' ', currentIndex + length);
            if (spaceIndex > currentIndex) {
                splitIndex = spaceIndex + 1;
            }
            // Если не нашли ни знаков препинания, ни пробелов, просто отрезаем по максимальной длине
        }
        
        chunk.push(text.substring(currentIndex, splitIndex).trim());
        currentIndex = splitIndex;
    }
    
    // Если массив пустой, возвращаем исходный текст как один элемент
    if (!chunk.length) {
        return [text];
    }
    
    return chunk;
}
