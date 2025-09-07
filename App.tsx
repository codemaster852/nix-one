import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ChatSession, Settings } from './types';
import { processPrompt } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Loader from './components/Loader';
import BotIcon from './components/icons/BotIcon';
import Sidebar from './components/Sidebar';
import MenuIcon from './components/icons/MenuIcon';
import SettingsModal from './components/SettingsModal';
import { useSettings } from './hooks/useSettings';
import { getTranslator } from './translator';
import { getCommands } from './commands';

const App: React.FC = () => {
  const [settings, setSettings] = useSettings();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const t = getTranslator(settings.language);
  const commands = getCommands(t);
  
  const DEFAULT_SYSTEM_INSTRUCTION = t('defaultSystemInstruction');

  useEffect(() => {
    // Apply theme and language direction
    const root = document.documentElement;
    if (settings.theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    root.lang = settings.language;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings]);

  useEffect(() => {
    if (settings.saveHistory) {
      try {
          const savedHistory = localStorage.getItem('chatHistory');
          if (savedHistory) {
              const parsedHistory: ChatSession[] = JSON.parse(savedHistory);
              if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                  setSessions(parsedHistory);
                  if (!currentSessionId) {
                    setCurrentSessionId(parsedHistory[0].id);
                  }
              }
          }
      } catch (e) {
          console.error("Failed to load or parse chat history:", e);
          localStorage.removeItem('chatHistory');
      }
    } else {
        setSessions([]);
        setCurrentSessionId(null);
    }
  }, [settings.saveHistory]);

  const saveHistory = useCallback((updatedSessions: ChatSession[]) => {
      setSessions(updatedSessions);
      if (settings.saveHistory) {
        localStorage.setItem('chatHistory', JSON.stringify(updatedSessions));
      }
  }, [settings.saveHistory]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (chatContainerRef.current) {
        const { scrollHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, currentSessionId]);
  
  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    if (prompt.trim().toLowerCase() === '/clear' || prompt.trim() === t('clearCommandName')) {
        handleNewChat();
        return;
    }

    let activeSessionId = currentSessionId;
    let newSessions = [...sessions];
    let sessionToUpdate: ChatSession;
    
    if (!activeSessionId) {
        activeSessionId = `session-${Date.now()}`;
        const title = prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt;
        sessionToUpdate = {
            id: activeSessionId,
            title: title,
            createdAt: Date.now(),
            messages: [],
            systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        };
        newSessions.unshift(sessionToUpdate);
        setCurrentSessionId(activeSessionId);
    } else {
        sessionToUpdate = { ...newSessions.find(s => s.id === activeSessionId)! };
    }

    const roleCommand = t('roleCommandName').substring(1); // remove '/'
    const roleRegex = new RegExp(`^/${roleCommand}\\s+(.*)`, 'i');
    const roleMatch = prompt.match(roleRegex);
    if (roleMatch) {
        const role = roleMatch[1].trim();
        if (role) {
            sessionToUpdate.systemInstruction = role;
            const roleMessage: Message = {
                id: `model-${Date.now()}`,
                role: 'model',
                parts: [{ type: 'text', content: t('roleSetConfirmation', role) }]
            };
            sessionToUpdate.messages.push(roleMessage);
            const finalSessions = newSessions.map(s => s.id === activeSessionId ? sessionToUpdate : s);
            saveHistory(finalSessions);
        }
        return;
    }

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', parts: [{ type: 'text', content: prompt }] };
    sessionToUpdate.messages.push(userMessage);
    
    saveHistory(newSessions.map(s => s.id === activeSessionId ? sessionToUpdate : s));
    setIsLoading(true);
    setError(null);
    
    try {
        const modelParts = await processPrompt(prompt, sessionToUpdate.systemInstruction, settings.language, t);
        const modelMessage: Message = { id: `model-${Date.now()}`, role: 'model', parts: modelParts };
        
        const sessionsFromStorage = settings.saveHistory ? (JSON.parse(localStorage.getItem('chatHistory') || '[]') as ChatSession[]) : [...newSessions];
        let sessionAfterApi = sessionsFromStorage.find(s => s.id === activeSessionId);
        if (sessionAfterApi) {
            sessionAfterApi.messages.push(modelMessage);
            saveHistory(sessionsFromStorage.map(s => s.id === activeSessionId ? sessionAfterApi : s));
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [sessions, currentSessionId, settings, t, saveHistory, DEFAULT_SYSTEM_INSTRUCTION]);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    if (window.innerWidth < 768) { setSidebarOpen(false); }
  };

  const handleSelectChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (window.innerWidth < 768) { setSidebarOpen(false); }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('confirmClearHistory'))) {
        localStorage.removeItem('chatHistory');
        setSessions([]);
        setCurrentSessionId(null);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-hidden">
        <Sidebar 
            isOpen={isSidebarOpen}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onClearHistory={handleClearHistory}
            onClose={() => setSidebarOpen(false)}
            onOpenSettings={() => setSettingsModalOpen(true)}
            t={t}
        />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-72 rtl:md:mr-72' : 'md:ml-0 rtl:md:mr-0'}`}>
            <header className="flex items-center text-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                <MenuIcon />
              </button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mx-auto">
                {t('appTitle')}
              </h1>
            </header>

            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {messages.length === 0 && !isLoading ? (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <div className="mb-4 rounded-full p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                                <BotIcon className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200">{t('welcomeMessage')}</h2>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                    </div>
                )}
                 {isLoading && (
                    <div className="flex items-start gap-3 mt-6" dir="ltr">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-purple-600 animate-pulse">
                             <BotIcon />
                        </div>
                        <div className="p-4 rounded-xl bg-gray-200 dark:bg-gray-800">
                            <Loader />
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="w-full max-w-4xl mx-auto">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} t={t} commands={commands} />
                     {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{t('errorPrefix')} {error}</p>}
                </div>
            </footer>
        </div>
        <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            settings={settings}
            onSettingsChange={setSettings}
            t={t}
        />
    </div>
  );
};

export default App;
