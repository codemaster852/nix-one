export default {
    appTitle: "Nix 1 AI Assistant",
    chatHistory: "Chat History",
    newChat: "New Chat",
    settings: "Settings",
    clearHistory: "Clear All History",
    welcomeMessage: "How can I help you today?",
    chatPlaceholder: "Ask me anything, or type '/' for commands...",
    sendMessage: "Send message",
    errorPrefix: "Error:",
    // Settings Modal
    settingsTitle: "Settings",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    saveChatHistory: "Save Chat History",
    saveHistoryDescription: "Automatically save your conversations locally.",
    close: "Close",
    // Commands
    helpCommandName: "/help",
    helpCommandDescription: "Shows the help message.",
    imageCommandName: "/image",
    imageCommandDescription: "Generates an image from a prompt.",
    voiceCommandName: "/voice",
    voiceCommandDescription: "Responds with a spoken voice.",
    jokeCommandName: "/joke",
    jokeCommandDescription: "Tells a random joke.",
    storyCommandName: "/story",
    storyCommandDescription: "Writes a short story.",
    searchCommandName: "/search",
    searchCommandDescription: "Searches the web for info.",
    deepresearchCommandName: "/deepresearch",
    deepresearchCommandDescription: "Performs in-depth research.",
    articleCommandName: "/article",
    articleCommandDescription: "Generates a well-structured article.",
    roleCommandName: "/role",
    roleCommandDescription: "Sets the AI's persona for the chat.",
    clearCommandName: "/clear",
    clearCommandDescription: "Starts a new chat session.",
    // Gemini Service
    defaultSystemInstruction: `You are a helpful and friendly AI assistant named Nix.
- If the user asks for code, you must wrap it in markdown code fences with the language name (e.g., \`\`\`javascript).
- Keep your responses concise and helpful.`,
    helpMessage: `Here are the available commands:
- \`/help\`: Shows this help message.
- \`/image <prompt> [--ar <ratio>]\`: Generates an image. 
    - You can specify styles like "in the style of Van Gogh".
    - Use \`--ar\` to set aspect ratio. Supported ratios: 1:1, 16:9, 9:16, 4:3, 3:4.
    - Example: \`/image a cat --ar 16:9\`
- \`/voice <prompt>\`: Responds with your prompt in a spoken voice.
- \`/joke\`: Tells a random joke.
- \`/story [topic]\`: Writes a short story, optionally about a given topic.
- \`/search <query>\`: Searches the web for up-to-date information.
- \`/deepresearch <topic>\`: Performs in-depth research and provides a summary with sources.
- \`/article <topic>\`: Generates a well-structured article on a given topic.
- \`/role <persona>\`: Assigns a role to the AI for the current chat. Example: \`/role You are a pirate\`
- \`/clear\`: Starts a new chat session.`,
    imagePromptMissing: "Please provide a prompt for the image.",
    voicePromptMissing: "Please provide a prompt for me to say.",
    searchQueryMissing: "Please provide a search query after /search.",
    researchTopicMissing: "Please provide a topic for deep research after /deepresearch.",
    articleTopicMissing: "Please provide a topic for the article after /article.",
    jokePrompt: "Tell me a joke.",
    storyPrompt: "Tell me a short story.",
    storyTopicPrompt: "Tell me a short story about {0}.",
    deepResearchPrompt: 'Perform a deep research on the following topic: "{0}". Synthesize information from multiple sources, identify key points, and provide a comprehensive and detailed summary.',
    articleSystemInstruction: `{0}

Regardless of your current persona, your primary task is to generate a well-structured and informative article on the given topic.
The article must include:
1. A clear and engaging title (using a markdown heading like '# Title').
2. A brief introduction that hooks the reader.
3. A body with several paragraphs, using headings to organize sections where appropriate.
4. A concluding paragraph that summarizes the key points.`,
    roleSetConfirmation: "Okay, I will now act as: {0}",
    unexpectedError: "An unexpected error occurred.",
    confirmClearHistory: "Are you sure you want to delete all chat history? This action cannot be undone."
};
