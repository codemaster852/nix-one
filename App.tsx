import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

// To access the global variable from index.html without TypeScript errors
declare global {
  interface Window {
    GEMINI_API_KEY: string;
  }
}

// --- TYPES ---
interface Part {
  type: 'text';
  content: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: Part[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  systemInstruction: string;
}

type Language = 'en' | 'es' | 'fr' | 'de' | 'ar';
type Theme = 'light' | 'dark';

interface Settings {
  language: Language;
  theme: Theme;
  saveHistory: boolean;
}


// --- ICONS ---
const BotIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-white" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2a2 2 0 0 1 2 2a8 8 0 0 1 8 8a2 2 0 0 1-2 2h-2.18a4 4 0 0 0-3.82 2.83a2.5 2.5 0 0 1-4.82-1.04a2.5 2.5 0 0 1 0-.16a4 4 0 0 0-3.95-3.63H4a2 2 0 0 1-2-2a8 8 0 0 1 8-8m0 4a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-4 2a1 1 0 1 0 0 2a1 1 0 0 0 0-2m8 0a1 1 0 1 0 0 2a1 1 0 0 0 0-2" />
    </svg>
);

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);


// --- TRANSLATIONS & COMMANDS ---
const translations = {
    en: {
        appTitle: "Nix 1 AI Assistant",
        welcomeMessage: "How can I help you today?",
        defaultSystemInstruction: "You are a helpful and friendly AI assistant. Answer in a clear, conversational, and helpful tone.",
        confirmClearHistory: "Are you sure you want to clear all chat history? This action cannot be undone.",
        roleSetConfirmation: (role: string) => `System role updated. I will now act as: ${role}`,
        errorPrefix: "Error:",
        // ... other translations
        clearCommandName: "/clear",
        roleCommandName: "/role",
    },
    es: {
        appTitle: "Asistente de IA Nix 1",
        welcomeMessage: "¿Cómo puedo ayudarte hoy?",
        defaultSystemInstruction: "Eres un asistente de IA útil y amigable. Responde en un tono claro, conversacional y servicial.",
        confirmClearHistory: "¿Estás seguro de que quieres borrar todo el historial de chat? Esta acción no se puede deshacer.",
        roleSetConfirmation: (role: string) => `Rol del sistema actualizado. Ahora actuaré como: ${role}`,
        errorPrefix: "Error:",
        clearCommandName: "/limpiar",
        roleCommandName: "/rol",
    }
};

const getTranslator = (lang: Language) => (key: keyof typeof translations.en, ...args: any[]) => {
    const langDict = translations[lang] || translations.en;
    const text = langDict[key] || translations.en[key];
    if (typeof text === 'function') {
        return (text as Function)(...args);
    }
    return text;
};
const getCommands = (t: Function) => [
    { name: t('clearCommandName'), description: "Start a new chat session." },
    { name: t('roleCommandName'), description: "Set a system role for the assistant." }
];


// --- COMPONENTS ---
const Loader: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
    </div>
);

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isModel = message.role === 'model';
    // Basic markdown for code blocks
    const content = message.parts[0].content.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-2 rounded-md my-2"><code>$1</code></pre>');

    return (
        <div className={`flex items-start gap-3 ${!isModel ? 'flex-row-reverse' : ''}`} dir={isModel ? 'ltr' : 'rtl'}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isModel ? 'bg-purple-600' : 'bg-blue-500'}`}>
                {isModel ? <BotIcon /> : <span className="text-white font-bold">U</span>}
            </div>
            <div
                className={`prose prose-sm max-w-none rounded-xl p-4 ${isModel ? 'bg-gray-200 dark:bg-gray-800' : 'bg-blue-500 dark:bg-blue-600 text-white'}`}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

const ChatInput: React.FC<{ onSendMessage: (msg: string) => void, isLoading: boolean, t: Function, commands: { name: string, description: string }[] }> = ({ onSendMessage, isLoading, t, commands }) => {
    const [input, setInput] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-4 pr-12 rounded-full bg-gray-200 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-white bg-purple-600 rounded-full hover:bg-purple-700 disabled:bg-gray-400 transition"
                disabled={isLoading || !input.trim()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            </button>
        </form>
    );
};

const Sidebar: React.FC<{ isOpen: boolean, sessions: ChatSession[], currentSessionId: string | null, onNewChat: () => void, onSelectChat: (id: string) => void, onClearHistory: () => void, onClose: () => void, onOpenSettings: () => void, t: Function }> = (props) => {
    return (
        <aside className={`fixed top-0 left-0 rtl:right-0 rtl:left-auto h-full w-72 bg-gray-100 dark:bg-gray-800 z-30 transform transition-transform duration-300 ${props.isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}>
            <div className="flex flex-col h-full p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">History</h2>
                    <button onClick={props.onClose} className="p-2 rounded-md md:hidden hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                 <button onClick={props.onNewChat} className="w-full p-2 mb-4 text-left rounded-md bg-purple-600 text-white hover:bg-purple-700 transition">
                    + New Chat
                </button>
                <div className="flex-1 overflow-y-auto">
                    {props.sessions.map(session => (
                        <button key={session.id} onClick={() => props.onSelectChat(session.id)} className={`w-full p-2 mb-2 text-left rounded-md truncate ${props.currentSessionId === session.id ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {session.title}
                        </button>
                    ))}
                </div>
                <div className="mt-auto border-t border-gray-300 dark:border-gray-600 pt-4">
                    <button onClick={props.onOpenSettings} className="w-full p-2 mb-2 text-left rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">Settings</button>
                    <button onClick={props.onClearHistory} className="w-full p-2 text-left text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition">Clear History</button>
                </div>
            </div>
        </aside>
    );
};

const SettingsModal: React.FC<{isOpen: boolean, onClose: () => void, settings: Settings, onSettingsChange: (s: Settings) => void, t: Function}> = (props) => {
    if(!props.isOpen) return null;

    const handleSettingChange = (key: keyof Settings, value: any) => {
        props.onSettingsChange({ ...props.settings, [key]: value });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" onClick={props.onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1">Theme</label>
                        <select value={props.settings.theme} onChange={e => handleSettingChange('theme', e.target.value)} className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700">
                           <option value="light">Light</option>
                           <option value="dark">Dark</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Language</label>
                        <select value={props.settings.language} onChange={e => handleSettingChange('language', e.target.value)} className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700">
                           <option value="en">English</option>
                           <option value="es">Español</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label>Save Chat History</label>
                        <button onClick={() => handleSettingChange('saveHistory', !props.settings.saveHistory)} className={`w-12 h-6 rounded-full transition-colors ${props.settings.saveHistory ? 'bg-purple-600' : 'bg-gray-400'}`}>
                            <span className={`block w-4 h-4 m-1 bg-white rounded-full transform transition-transform ${props.settings.saveHistory ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>
                </div>
                <button onClick={props.onClose} className="mt-6 w-full p-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">Close</button>
            </div>
        </div>
    );
};


// --- HOOKS ---
const useSettings = (): [Settings, (settings: Settings) => void] => {
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      const defaultSettings: Settings = { theme: 'dark', language: 'en', saveHistory: true };
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch {
      return { theme: 'dark', language: 'en', saveHistory: true };
    }
  });

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  return [settings, setSettings];
};


// --- MAIN APP COMPONENT ---
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
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
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
  }, [settings.saveHistory, currentSessionId]);

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
        const apiKey = window.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key is missing. Please add it to index.html");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const history = sessionToUpdate.messages
            .filter(msg => msg.id !== userMessage.id)
            .map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: msg.parts.map(part => ({ text: part.content }))
            }));

        const chat = model.startChat({
            history,
            generationConfig: { maxOutputTokens: 2048 },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            systemInstruction: sessionToUpdate.systemInstruction || undefined,
        });
        
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();
        
        const modelMessage: Message = { id: `model-${Date.now()}`, role: 'model', parts: [{ type: 'text', content: responseText }] };
        
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

