import React from 'react';
import { ChatSession } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';

interface SidebarProps {
    isOpen: boolean;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectChat: (sessionId: string) => void;
    onClearHistory: () => void;
    onClose: () => void;
    onOpenSettings: () => void;
    t: (key: string) => string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, sessions, currentSessionId, onNewChat, onSelectChat, onClearHistory, onClose, onOpenSettings, t }) => {
    
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <aside className={`fixed inset-y-0 left-0 rtl:right-0 flex flex-col h-full w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 rtl:translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('chatHistory')}</h2>
                    <button onClick={onClose} className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-2 flex-shrink-0">
                    <button 
                        onClick={onNewChat} 
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <PlusIcon />
                        <span className="font-semibold">{t('newChat')}</span>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map(session => (
                        <a 
                            key={session.id} 
                            onClick={() => onSelectChat(session.id)}
                            className={`block w-full text-left p-3 rounded-lg cursor-pointer transition-colors duration-150 truncate ${session.id === currentSessionId ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            title={session.title}
                        >
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{session.title}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.createdAt)}</p>
                        </a>
                    ))}
                </nav>
                <div className="p-2 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 space-y-2">
                    <button 
                        onClick={onOpenSettings}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <SettingsIcon />
                        <span className="font-semibold">{t('settings')}</span>
                    </button>
                    <button 
                        onClick={onClearHistory}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <TrashIcon />
                        <span className="font-semibold">{t('clearHistory')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
