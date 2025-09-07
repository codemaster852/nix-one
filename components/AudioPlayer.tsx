import React, { useState, useCallback, useEffect } from 'react';
import PlayIcon from './icons/PlayIcon';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlay = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking]);

  useEffect(() => {
    return () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  return (
    <div className="bg-gray-200/50 dark:bg-gray-700/50 p-4 rounded-lg space-y-3 text-left">
        <div className="flex items-center space-x-3">
            <button
                onClick={handlePlay}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={isSpeaking ? "Stop speech" : "Play speech"}
            >
                {isSpeaking ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                ) : (
                    <PlayIcon />
                )}
            </button>
            <p className="text-gray-800 dark:text-gray-200 font-medium">Spoken Response</p>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{text}"</p>
    </div>
  );
};

export default AudioPlayer;