import React, { useState, useEffect, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import Loader from './Loader';
import { Command } from '../commands';
import CommandSuggestions from './CommandSuggestions';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  t: (key: string) => string;
  commands: Command[];
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, t, commands }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Command[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setActiveSuggestionIndex(0);

    if (value.startsWith('/') && !value.includes(' ')) {
        const query = value.substring(1).toLowerCase();
        const filtered = commands.filter(cmd => cmd.name.substring(1).toLowerCase().startsWith(query));
        setSuggestions(filtered);
    } else {
        setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (command: string) => {
    setInput(`${command} `);
    setSuggestions([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (suggestions[activeSuggestionIndex]) {
                e.preventDefault();
                handleSelectSuggestion(suggestions[activeSuggestionIndex].name);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestions([]);
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e as any);
      }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="relative">
      <CommandSuggestions
        suggestions={suggestions}
        query={input.substring(1)}
        onSelect={handleSelectSuggestion}
        activeIndex={activeSuggestionIndex}
      />
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('chatPlaceholder')}
          className="w-full p-4 pr-16 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none placeholder-gray-500 text-gray-900 dark:text-white max-h-40"
          rows={1}
          disabled={isLoading}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          aria-label={t('sendMessage')}
        >
          {isLoading ? <Loader /> : <SendIcon />}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;