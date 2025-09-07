import { GoogleGenAI } from "@google/genai";
import { MessagePart, Source } from "../types";

let aiInstance: GoogleGenAI | null = null;
let apiKeyPromise: Promise<string> | null = null;

const fetchApiKey = async (): Promise<string> => {
    const parseKey = (text: string): string | null => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    
        for (const line of lines) {
            // Specifically look for the GEMINI_API_KEY variable
            if (line.startsWith('GEMINI_API_KEY=')) {
                return line.substring('GEMINI_API_KEY='.length).trim();
            }
        }
        
        // Fallback for backward compatibility: if there's only one line and no '=', assume it's the key.
        if (lines.length === 1 && !lines[0].includes('=')) {
            return lines[0];
        }
        
        return null;
    }

    // Try to fetch from /env.local
    try {
        const responseLocal = await fetch('/env.local');
        if (responseLocal.ok) {
            const text = await responseLocal.text();
            const key = parseKey(text);
            if (key) return key;
        }
    } catch (e) { /* ignore and proceed to the next file */ }

    // Try to fetch from /env.txt
    try {
        const responseTxt = await fetch('/env.txt');
        if (responseTxt.ok) {
            const text = await responseTxt.text();
            const key = parseKey(text);
            if (key) return key;
        }
    } catch (e) { /* ignore and fail */ }

    throw new Error("API Key not found. Create an 'env.local' or 'env.txt' file in the root of your project and add your key as 'GEMINI_API_KEY=YOUR_API_KEY'.");
};


const getAiClient = async (): Promise<GoogleGenAI> => {
    if (aiInstance) {
        return aiInstance;
    }

    if (!apiKeyPromise) {
        apiKeyPromise = fetchApiKey();
    }
    
    const apiKey = await apiKeyPromise;
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
};

const generateTextAndCodeResponse = async (prompt: string, systemInstruction: string): Promise<MessagePart[]> => {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction },
    });
    return parseCodeFromMarkdown(response.text.trim());
};

const parseCodeFromMarkdown = (text: string): MessagePart[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/gs;
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const content = text.substring(lastIndex, match.index).trim();
            if (content) parts.push({ type: 'text', content });
        }
        const language = match[1] || 'text';
        const content = match[2].trim();
        parts.push({ type: 'code', content, language });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        const content = text.substring(lastIndex).trim();
        if (content) parts.push({ type: 'text', content });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text.trim() }];
};

const getLocalizedHelpMessage = (t: (key: string) => string) => {
    return t('helpMessage');
};

const generateArticleResponse = async (topic: string, systemInstruction: string): Promise<MessagePart[]> => {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write an article about: ${topic}`,
        config: { systemInstruction },
    });
    return parseCodeFromMarkdown(response.text.trim());
};

export const processPrompt = async (
    prompt: string, 
    systemInstruction: string,
    language: 'en' | 'ar',
    t: (key: string, ...args: any[]) => string
): Promise<MessagePart[]> => {
    try {
        const ai = await getAiClient();
        const fullSystemInstruction = `${systemInstruction}\n\n- IMPORTANT: You must respond in ${language === 'ar' ? 'Arabic' : 'English'}.`;
        
        const commandMatch = prompt.match(/^\/(\S+)\s*(.*)/);

        if (commandMatch) {
            const commandName = commandMatch[1].toLowerCase();
            let args = commandMatch[2].trim();

            const commandMap: { [key: string]: string } = {
                [t('imageCommandName').substring(1)]: 'image',
                [t('voiceCommandName').substring(1)]: 'voice',
                [t('helpCommandName').substring(1)]: 'help',
                [t('jokeCommandName').substring(1)]: 'joke',
                [t('storyCommandName').substring(1)]: 'story',
                [t('searchCommandName').substring(1)]: 'search',
                [t('deepresearchCommandName').substring(1)]: 'deepresearch',
                [t('articleCommandName').substring(1)]: 'article',
                'image': 'image', 'voice': 'voice', 'help': 'help', 'joke': 'joke', 'story': 'story', 
                'search': 'search', 'deepresearch': 'deepresearch', 'article': 'article',
            };

            const command = commandMap[commandName];

            switch (command) {
                case 'image': {
                    if (!args) return [{ type: 'text', content: t('imagePromptMissing') }];
                    
                    const arRegex = /--ar\s+(1:1|16:9|9:16|4:3|3:4)/;
                    const arMatch = args.match(arRegex);
                    const aspectRatio = arMatch ? arMatch[1] as "1:1" | "16:9" | "9:16" | "4:3" | "3:4" : '1:1';
                    const imagePrompt = args.replace(arRegex, '').trim();

                    if (!imagePrompt) return [{ type: 'text', content: t('imagePromptMissing') }];

                    const response = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001',
                        prompt: imagePrompt,
                        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio },
                    });
                    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                    return [{ type: 'image', content: `data:image/png;base64,${base64ImageBytes}` }];
                }
                case 'voice':
                     if (!args) return [{ type: 'text', content: t('voicePromptMissing') }];
                    const textPartsForVoice = await generateTextAndCodeResponse(args, fullSystemInstruction);
                    const textForVoice = textPartsForVoice.map(p => p.content).join('\n\n');
                    return [{ type: 'audio', content: textForVoice }];
                case 'help':
                    return [{ type: 'text', content: getLocalizedHelpMessage(t) }];
                case 'joke':
                    return generateTextAndCodeResponse(t('jokePrompt'), fullSystemInstruction);
                case 'story':
                    const storyPrompt = args ? t('storyTopicPrompt', args) : t('storyPrompt');
                    return generateTextAndCodeResponse(storyPrompt, fullSystemInstruction);
                case 'search':
                    if (!args) return [{ type: 'text', content: t('searchQueryMissing') }];
                    const searchResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: args,
                        config: { tools: [{ googleSearch: {} }], systemInstruction: fullSystemInstruction },
                    });
                    const sources: Source[] = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
                        title: c.web?.title || '', uri: c.web?.uri || ''
                    })).filter((s: Source) => s.uri) ?? [];
                    return [{ type: 'search_result', content: searchResponse.text.trim(), sources }];

                case 'deepresearch':
                    if (!args) return [{ type: 'text', content: t('researchTopicMissing') }];
                    const researchPrompt = t('deepResearchPrompt', args);
                    const researchResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash', contents: researchPrompt,
                        config: { tools: [{ googleSearch: {} }], systemInstruction: fullSystemInstruction },
                    });
                    const researchSources: Source[] = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
                        title: c.web?.title || '', uri: c.web?.uri || ''
                    })).filter((s: Source) => s.uri) ?? [];
                    return [{ type: 'search_result', content: researchResponse.text.trim(), sources: researchSources }];
                
                case 'article':
                    if (!args) return [{ type: 'text', content: t('articleTopicMissing') }];
                    return generateArticleResponse(args, t('articleSystemInstruction', fullSystemInstruction));
            }
        }
        return generateTextAndCodeResponse(prompt, fullSystemInstruction);

    } catch (error) {
        console.error("Error processing prompt with Gemini API:", error);
        if (error instanceof Error) {
           return [{ type: 'text', content: t('errorPrefix') + ' ' + error.message }];
        }
        return [{ type: 'text', content: t('unexpectedError') }];
    }
};