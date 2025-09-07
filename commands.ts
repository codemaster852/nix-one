export interface Command {
  name: string;
  description: string;
}

export const getCommands = (t: (key: string) => string): Command[] => [
    { name: t('helpCommandName'), description: t('helpCommandDescription')},
    { name: t('imageCommandName'), description: t('imageCommandDescription')},
    { name: t('voiceCommandName'), description: t('voiceCommandDescription')},
    { name: t('jokeCommandName'), description: t('jokeCommandDescription')},
    { name: t('storyCommandName'), description: t('storyCommandDescription')},
    { name: t('searchCommandName'), description: t('searchCommandDescription')},
    { name: t('deepresearchCommandName'), description: t('deepresearchCommandDescription')},
    { name: t('articleCommandName'), description: t('articleCommandDescription')},
    { name: t('roleCommandName'), description: t('roleCommandDescription')},
    { name: t('clearCommandName'), description: t('clearCommandDescription')},
];