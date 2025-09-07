import en from './locales/en';
import ar from './locales/ar';

const locales = { en, ar };

export type LocaleKey = keyof typeof en;

export const getTranslator = (language: 'en' | 'ar'): ((key: LocaleKey, ...args: any[]) => string) => {
    const langFile = locales[language];

    return (key: LocaleKey, ...args: any[]): string => {
        let translation = langFile[key] || key;
        if (args.length > 0) {
            args.forEach((arg, index) => {
                const placeholder = new RegExp(`\\{${index}\\}`, 'g');
                translation = translation.replace(placeholder, arg);
            });
        }
        return translation;
    };
};
