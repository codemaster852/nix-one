import React from 'react';
import { Message } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import CodeBlock from './CodeBlock';
import AudioPlayer from './AudioPlayer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 ${!isModel && 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white ${isModel ? 'bg-purple-600' : 'bg-gray-600'}`}>
        {isModel ? <BotIcon /> : <UserIcon />}
      </div>
      <div className={`w-full max-w-2xl flex flex-col gap-2 ${isModel ? 'items-start' : 'items-end'}`}>
        {message.parts.map((part, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl break-words w-auto max-w-full ${isModel ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200' : 'bg-blue-600 text-white'}`}
          >
            {part.type === 'text' && <p className="whitespace-pre-wrap">{part.content}</p>}
            {part.type === 'image' && <img src={part.content} alt="Generated content" className="rounded-lg max-w-full h-auto sm:max-w-sm" />}
            {part.type === 'code' && <CodeBlock code={part.content} language={part.language} />}
            {part.type === 'audio' && <AudioPlayer text={part.content} />}
            {part.type === 'search_result' && (
              <div>
                <p className="whitespace-pre-wrap">{part.content}</p>
                {part.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sources:</h4>
                    <ul className="space-y-2">
                      {part.sources.map((source, i) => (
                        <li key={i} className="text-sm">
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300 hover:underline break-all"
                            title={source.uri}
                          >
                            {i + 1}. {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;