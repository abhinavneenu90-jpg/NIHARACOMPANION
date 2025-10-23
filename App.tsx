import React, { useState, useEffect, useMemo } from 'react';
import { AppMode, Personality, ChatMessage, AiDiaryEntry } from './types';
import { PERSONALITIES, UPGRADE_CODE } from './constants';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatMode from './components/modes/ChatMode';
import ImageGenerationMode from './components/modes/ImageGenerationMode';
import AstroGuideMode from './components/modes/AstroGuideMode';
import AiDiaryMode from './components/modes/AiDiaryMode';
import LiveMode from './components/modes/LiveMode';
import SettingsModal from './components/SettingsModal';
import UpgradeModal from './components/UpgradeModal';
import { Settings, Zap, KeyRound } from 'lucide-react';
import { isApiAvailable } from './services/geminiService';

const ApiKeyError: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-[100] animate-subtle-fade-in p-4">
            <div className="glassmorphic rounded-2xl shadow-2xl p-8 w-full max-w-lg relative text-center border-2 border-red-500/50">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} />
                </div>
                <h2 className="text-3xl font-bold text-center mb-2 text-red-400">
                    Configuration Error
                </h2>
                <p className="text-center text-gray-300 mb-6">
                    The Google Gemini API key is missing or invalid.
                </p>
                <div className="text-left bg-black/20 p-4 rounded-lg">
                    <p className="text-gray-400">
                        Please create a <code className="bg-gray-700 text-amber-300 px-1.5 py-0.5 rounded-md text-sm">config.ts</code> file at the root of your project and add your API key:
                        <br />
                        <code className="bg-gray-800 text-gray-300 block mt-2 p-2 rounded">export const API_KEY = "YOUR_API_KEY_HERE";</code>
                    </p>
                </div>
                 <p className="text-xs text-gray-500 mt-6">
                    You can get a free API key from Google AI Studio. The app cannot function without it.
                </p>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
    const [isPro, setIsPro] = useState<boolean>(false);
    const [personality, setPersonality] = useState<Personality>(PERSONALITIES.nihara);
    const [commitmentLevel, setCommitmentLevel] = useState<number>(0);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [diaryEntries, setDiaryEntries] = useState<AiDiaryEntry[]>([]);
    const [voiceTone, setVoiceTone] = useState<string>('Zephyr');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    useEffect(() => {
        // Load data from localStorage on startup
        const savedUser = localStorage.getItem('nihara_userName');
        if (savedUser) setUserName(savedUser);
        const savedIsPro = localStorage.getItem('nihara_isPro') === 'true';
        if (savedIsPro) setIsPro(savedIsPro);
        const savedHistory = localStorage.getItem('nihara_chatHistory');
        if (savedHistory) setChatHistory(JSON.parse(savedHistory));
        const savedDiary = localStorage.getItem('nihara_diaryEntries');
        if (savedDiary) setDiaryEntries(JSON.parse(savedDiary));
        const savedCommitment = localStorage.getItem('nihara_commitmentLevel');
        if (savedCommitment) setCommitmentLevel(parseInt(savedCommitment, 10));
    }, []);

    useEffect(() => {
        // Save data to localStorage when it changes
        localStorage.setItem('nihara_userName', userName);
        localStorage.setItem('nihara_isPro', String(isPro));
        localStorage.setItem('nihara_chatHistory', JSON.stringify(chatHistory));
        localStorage.setItem('nihara_diaryEntries', JSON.stringify(diaryEntries));
        localStorage.setItem('nihara_commitmentLevel', String(commitmentLevel));
    }, [userName, isPro, chatHistory, diaryEntries, commitmentLevel]);

    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            isPro ? root.classList.add('mega-pro') : root.classList.remove('mega-pro');
        }
    }, [isPro]);

    const handleInteraction = () => {
        setCommitmentLevel(prev => Math.min(prev + 1, 100));
    };
    
    const handleUpgrade = (code: string): boolean => {
        if (code === UPGRADE_CODE) {
            setIsPro(true);
            return true;
        }
        return false;
    };

    const renderMode = () => {
        switch (mode) {
            case AppMode.CHAT:
                return <ChatMode userName={userName} personality={personality} chatHistory={chatHistory} setChatHistory={setChatHistory} onInteraction={handleInteraction} isPro={isPro} />;
            case AppMode.IMAGE_GEN:
                return <ImageGenerationMode onInteraction={handleInteraction} isPro={isPro} />;
            case AppMode.ASTRO_GUIDE:
                return <AstroGuideMode onInteraction={handleInteraction} isPro={isPro} />;
            case AppMode.AI_DIARY:
                return <AiDiaryMode entries={diaryEntries} setEntries={setDiaryEntries} onInteraction={handleInteraction} isPro={isPro} />;
            case AppMode.LIVE:
                return <LiveMode userName={userName} voiceTone={voiceTone} onInteraction={handleInteraction} isPro={isPro} />;
            default:
                return <ChatMode userName={userName} personality={personality} chatHistory={chatHistory} setChatHistory={setChatHistory} onInteraction={handleInteraction} isPro={isPro} />;
        }
    };

    if (!isApiAvailable) {
        return <ApiKeyError />;
    }

    if (!userName) {
        return (
             <div className="h-screen w-screen flex items-center justify-center animate-fade-in-blur">
                <WelcomeScreen onNameSet={setUserName} personality={personality} />
            </div>
        );
    }

    return (
        <div className={`flex h-screen w-screen p-2 md:p-4 text-white animate-subtle-fade-in ${isPro ? 'is-pro' : ''}`}>
             {!isPro && (
                <button onClick={() => setIsUpgradeModalOpen(true)} className="upgrade-button-top animate-subtle-fade-in">
                    <Zap size={14} className="inline-block mr-1" />
                    Upgrade to Pro
                </button>
            )}
            <Sidebar currentMode={mode} setMode={setMode} isPro={isPro} userName={userName} personalityName={personality.name} />
            <main className="flex-1 ml-2 md:ml-4 relative">
                <div className="w-full h-full glassmorphic rounded-2xl overflow-hidden p-1">
                     <div className={`w-full h-full bg-slate-900/50 rounded-xl ${mode === AppMode.CHAT ? 'chat-view-bg-animated' : 'chat-view-bg'} relative`}>
                        {renderMode()}
                    </div>
                </div>
                 <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors interactive-glow">
                    <Settings className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 right-4 text-xs text-white/30 pointer-events-none">
                    Nihara created by Abhinav Gireesh
                </div>
            </main>
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                isPro={isPro}
                currentPersonality={personality}
                onPersonalityChange={setPersonality}
                currentVoiceTone={voiceTone}
                onVoiceToneChange={setVoiceTone}
                commitmentLevel={commitmentLevel}
            />
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgrade={handleUpgrade}
            />
        </div>
    );
};

export default App;