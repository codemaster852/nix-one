export interface LanguageOption {
  value: string;
  label: string;
}

export interface Source {
    title: string;
    uri: string;
}

export type MessagePart =
    | { type: 'text'; content: string }
    | { type: 'code'; content: string; language: string }
    | { type: 'image'; content: string }
    | { type: 'audio'; content: string }
    | { type: 'search_result'; content: string; sources: Source[] };

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface ChatSession {
  id:string;
  title: string;
  createdAt: number;
  messages: Message[];
  systemInstruction: string;
}

export interface Settings {
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
    saveHistory: boolean;
}