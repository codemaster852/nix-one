import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

const SETTINGS_KEY = 'appSettings';

const defaultSettings: Settings = {
    theme: 'dark',
    language: 'en',
    saveHistory: true,
};

export const useSettings = (): [Settings, (newSettings: Partial<Settings>) => void] => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            }
        } catch (error) {
            console.error('Failed to parse settings from localStorage', error);
        }
    }, []);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prevSettings => {
            const updated = { ...prevSettings, ...newSettings };
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save settings to localStorage', error);
            }
            return updated;
        });
    }, []);
    
    return [settings, updateSettings];
};
