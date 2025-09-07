import React from 'react';
import { Settings } from '../types';
import CloseIcon from './icons/CloseIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    t: (key: string) => string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, t }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settingsTitle')}</h2>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Theme Setting */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme')}</label>
                        <div className="mt-2 flex gap-2">
                            <button onClick={() => onSettingsChange({ theme: 'light' })} className={`w-full p-2 rounded-md text-sm font-semibold border ${settings.theme === 'light' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>{t('light')}</button>
                            <button onClick={() => onSettingsChange({ theme: 'dark' })} className={`w-full p-2 rounded-md text-sm font-semibold border ${settings.theme === 'dark' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>{t('dark')}</button>
                        </div>
                    </div>

                    {/* Language Setting */}
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</label>
                        <select
                            id="language-select"
                            value={settings.language}
                            onChange={(e) => onSettingsChange({ language: e.target.value as 'en' | 'ar' })}
                            className="mt-2 block w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="en">{t('english')}</option>
                            <option value="ar">{t('arabic')}</option>
                        </select>
                    </div>

                    {/* Save History Setting */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{t('saveChatHistory')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('saveHistoryDescription')}</p>
                        </div>
                        <label htmlFor="save-history-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="save-history-toggle"
                                className="sr-only peer"
                                checked={settings.saveHistory}
                                onChange={(e) => onSettingsChange({ saveHistory: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
