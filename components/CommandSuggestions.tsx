import React from 'react';
import { Command } from '../commands';

interface CommandSuggestionsProps {
  suggestions: Command[];
  query: string;
  onSelect: (command: string) => void;
  activeIndex: number;
}

const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ suggestions, query, onSelect, activeIndex }) => {
  if (suggestions.length === 0) {
    return null;
  }

  const highlightMatch = (text: string, highlight: string) => {
    const nameOnly = text.substring(1); // remove '/'
    const index = nameOnly.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) {
        return <span>{text}</span>;
    }
    const before = nameOnly.slice(0, index);
    const match = nameOnly.slice(index, index + highlight.length);
    const after = nameOnly.slice(index + highlight.length);
    return (
      <span>
        /{before}
        <strong className="text-purple-500 dark:text-purple-400 font-bold">{match}</strong>
        {after}
      </span>
    );
  };

  return (
    <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
      <ul role="listbox">
        {suggestions.map((cmd, index) => (
          <li
            key={cmd.name}
            onClick={() => onSelect(cmd.name)}
            role="option"
            aria-selected={index === activeIndex}
            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-150 ${index === activeIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">{highlightMatch(cmd.name, query)}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{cmd.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandSuggestions;