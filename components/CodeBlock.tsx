import React, { useState, useCallback } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 text-white">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700 dark:bg-gray-800 border-b border-gray-600 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-300 dark:text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-200 dark:text-gray-300 transition-colors"
        >
          {isCopied ? <CheckIcon /> : <ClipboardIcon />}
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-white">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;