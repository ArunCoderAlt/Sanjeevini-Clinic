import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Minimize2, 
  Maximize2,
  Sparkles, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { sendChatMessage } from '../../services/botService';
import { toast } from 'react-hot-toast';

// Session storage key for persisting conversation across page refreshes
const CHAT_SESSION_KEY = 'sanjeevini_chat_session';
const CHAT_LANG_KEY = 'sanjeevini_chat_lang';

const SUGGESTED_PROMPTS = {
  en: [
    "What are your clinic consultation hours?",
    "What is Varmam therapy?",
    "Which doctors are available?",
    "Where is the clinic located in Karaikal?"
  ],
  ta: [
    "மருத்துவமனை ஆலோசனை நேரம் என்ன?",
    "வர்மம் சிகிச்சை என்றால் என்ன?",
    "எந்த மருத்துவர்கள் உள்ளனர்?",
    "மருத்துவமனை எங்கு அமைந்துள்ளது?"
  ]
};

const WELCOME_MESSAGES = {
  en: `Namaste! 🙏 Welcome to **Sanjeevini Siddha & Ayurveda Medical Centre**.\n\nI am your AI healthcare assistant. I answer questions in both **English and தமிழ் (Tamil)** based on our official clinic documents.\n\nHow can I help you today? You can type below, tap a suggested topic, or tap the microphone to speak!`,
  ta: `வணக்கம்! 🙏 **சஞ்சீவினி சித்த & ஆயுர்வேத மருத்துவ மையத்திற்கு** தங்களை அன்புடன் வரவேற்கிறோம்.\n\nநான் உங்கள் AI மருத்துவ உதவியாளர். நமது மருத்துவமனை ஆவணங்களின்படி உங்கள் சந்தேகங்களுக்கு **தமிழ் மற்றும் ஆங்கிலத்தில்** பதிலளிக்கிறேன்.\n\nதங்களுக்கு இன்று எவ்வாறு உதவலாம்? கீழே தட்டச்சு செய்யவும் அல்லது மைக்ரோஃபோன் மூலம் பேசவும்!`
};

/** Save conversation to sessionStorage so it survives page refresh */
function saveSession(messages, lang) {
  try {
    // Only save last 50 messages to avoid storage overflow
    const toSave = messages.slice(-50).map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      sources: m.sources,
      modelUsed: m.modelUsed,
      keyStatus: m.keyStatus,
      timestamp: m.timestamp
    }));
    sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(toSave));
    sessionStorage.setItem(CHAT_LANG_KEY, lang);
  } catch {
    // sessionStorage may be full or unavailable
  }
}

/** Restore conversation from sessionStorage */
function loadSession() {
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_KEY);
    const lang = sessionStorage.getItem(CHAT_LANG_KEY) || 'en';
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { messages: parsed, lang };
      }
    }
  } catch {
    // Invalid or empty
  }
  return null;
}

function clearSession() {
  try {
    sessionStorage.removeItem(CHAT_SESSION_KEY);
    sessionStorage.removeItem(CHAT_LANG_KEY);
  } catch {}
}

function createWelcomeMessage(lang = 'en') {
  return {
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en,
    sources: [{ document: lang === 'ta' ? 'மருத்துவமனை வழிகாட்டி' : 'Clinic Guide PDF' }],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Restore previous session on mount (survives page refresh)
  const restored = useRef(loadSession());
  const [currentLang, setCurrentLang] = useState(restored.current?.lang || 'en');
  const [messages, setMessages] = useState(() => {
    if (restored.current?.messages?.length > 0) {
      return restored.current.messages;
    }
    return [createWelcomeMessage('en')];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    saveSession(messages, currentLang);
  }, [messages, currentLang]);

  // Switch language and update speech recognition & welcome greeting if only greeting exists
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    }
    // If conversation only contains initial greeting, update it to chosen language
    if (messages.length === 1 && messages[0].id.startsWith('welcome-')) {
      const newMessages = [createWelcomeMessage(lang)];
      setMessages(newMessages);
    }
    toast.success(lang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது' : 'Language set to English');
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    }
  }, [messages, isOpen]);

  // Hide initial floating tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Default to Indian English, versatile for Tamil/Indian accents

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignored
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Toggle voice input recording with dynamic Tamil / English speech model
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLang === 'ta' ? 'ta-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        toast.error('Could not start microphone. Check permissions.');
      }
    }
  };

  // Text-to-speech speaker toggle with Tamil & English auto-voice selection
  const toggleSpeech = (msgId, text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      toast.error('Speech synthesis not supported in this browser.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks for smoother TTS voice output
    const cleanSpeechText = text.replace(/[*_#]/g, '');
    const utterance = new window.SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Detect language: if contains Tamil Unicode range, use ta-IN
    const hasTamil = /[\u0B80-\u0BFF]/.test(cleanSpeechText);
    utterance.lang = hasTamil ? 'ta-IN' : 'en-IN';

    // Try to find native language voice from available browser speech voices
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const matchVoice = voices.find(v => hasTamil ? v.lang.startsWith('ta') : v.lang.startsWith('en'));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    } catch {
      // Ignored fallback
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send query to backend (auto-detects language)
  const handleSend = useCallback(async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Auto-detect Tamil script and switch language state seamlessly
    const isTamilInput = /[\u0B80-\u0BFF]/.test(query);
    if (isTamilInput && currentLang !== 'ta') {
      setCurrentLang('ta');
      if (recognitionRef.current) {
        recognitionRef.current.lang = 'ta-IN';
      }
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history excluding initial greeting
      // Exclude the greeting and local error notices (they are not real assistant answers), keep recent turns only
      const historyPayload = newMessages
        .filter(m => !m.id.startsWith('welcome-') && !m.id.startsWith('assistant-err-'))
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const effectiveLang = isTamilInput ? 'ta' : currentLang;
      const res = await sendChatMessage(query, historyPayload, effectiveLang);
      const data = res?.data?.data || {};

      const defaultFallbackReply = isTamilInput || currentLang === 'ta'
        ? 'தங்கள் கேள்விக்கு நன்றி. துல்லியமான மருத்துவ ஆலோசனைக்கு எங்கள் மருத்துவமனையை +91 98430 66362 என்ற எண்ணில் நேரடியாக தொடர்பு கொள்ளவும்.'
        : 'Thank you for your question. Please contact our clinic directly at +91 98430 66362 for personalized guidance.';

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || defaultFallbackReply,
        sources: data.sources || [],
        modelUsed: data.modelUsed,
        keyStatus: data.keyStatus,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show a subtle warning if the AI key is not working (but only once per session)
      if (data.keyStatus && data.keyStatus !== 'active') {
        const warningShown = sessionStorage.getItem('sanjeevini_key_warning_shown');
        if (!warningShown) {
          if (data.keyStatus === 'invalid') {
            toast.error('AI engine key needs updating. Answers may be limited.', { duration: 5000 });
          } else if (data.keyStatus === 'rate_limited') {
            toast('AI engine is temporarily rate-limited. Please try again shortly.', { icon: '⏳', duration: 4000 });
          } else if (data.keyStatus === 'error' || data.keyStatus === 'not_configured') {
            // Don't alarm users, just note limited mode
            toast('Running in knowledge-base mode. Answers are based on clinic documents.', { icon: '📄', duration: 4000 });
          }
          sessionStorage.setItem('sanjeevini_key_warning_shown', '1');
        }
      }
    } catch (err) {
      const errorText = err?.response?.data?.message || 'Could not connect to the assistant. Please try again.';
      toast.error(errorText);

      const errorFallbackMsg = isTamilInput || currentLang === 'ta'
        ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் தற்போது ஒரு சிக்கல் ஏற்பட்டது. தயவுசெய்து எங்களை **+91 98430 66362** என்ற எண்ணில் அழைக்கவும் அல்லது வாட்ஸ்அப்பில் தொடர்பு கொள்ளவும்.'
        : 'Sorry, I encountered an issue retrieving that answer right now. Please call our clinic at **+91 98430 66362** or message us on WhatsApp.';

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: errorFallbackMsg,
          sources: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, isListening, currentLang, messages]);

  // Restart conversation
  const handleResetChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    clearSession();
    sessionStorage.removeItem('sanjeevini_key_warning_shown');
    setMessages([createWelcomeMessage(currentLang)]);
    setInput('');
  };

  // Format markdown bold text and bullet points cleanly
  const renderFormattedText = (content, isAssistant = true) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();

      if (!cleanLine) {
        return <div key={idx} className="h-1.5" />;
      }

      // Check if line is a bullet or numbered list item
      const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ') || /^\d+[\.\)]\s/.test(cleanLine);
      const textToFormat = isBullet 
        ? cleanLine.replace(/^[-*]\s+|\d+[\.\)]\s+/, '') 
        : cleanLine;

      // Process bold markers (**text**)
      const parts = textToFormat.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong 
              key={pIdx} 
              className={isAssistant ? "font-semibold text-primary-900" : "font-bold text-white"}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <ul key={idx} className="ml-4 list-disc">
            <li className="text-xs sm:text-sm my-1 leading-relaxed">
              {formattedParts}
            </li>
          </ul>
        );
      }

      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed mb-1.5 last:mb-0">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button (visible only when chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-36 right-6 z-40 flex items-center"
          >
            {/* Initial Greeting Tooltip */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mr-3 hidden sm:flex items-center bg-white text-gray-800 px-4 py-2.5 rounded-2xl shadow-xl border border-sage/60 cursor-pointer text-xs font-medium"
                onClick={() => setIsOpen(true)}
              >
                <Sparkles className="w-4 h-4 text-gold mr-2 shrink-0 animate-spin-slow" />
                <span>Ask Sanjeevini AI</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                  className="ml-2 text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Dismiss tooltip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* The Action Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(true)}
              className="relative bg-gradient-to-r from-[#07192C] via-[#0C294A] to-[#144979] text-white p-4 rounded-full shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center border-2 border-gold/40 group cursor-pointer"
              aria-label="Open AI Assistant"
              title="Chat with Sanjeevini AI"
            >
              {/* Subtle pulse aura */}
              <span className="absolute -inset-1 rounded-full bg-primary-500/20 animate-ping opacity-75 pointer-events-none" />
              
              <Bot className="w-6 h-6 text-[#38BDF8] transition-transform group-hover:rotate-12" />

              {/* Active online dot */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#38BDF8] border-2 border-white rounded-full shadow" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 290 }}
            className={`fixed bottom-2 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto z-50 transition-all duration-300 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-sage/80 flex flex-col overflow-hidden font-body ${
              isExpanded
                ? 'w-auto sm:w-[600px] md:w-[640px] h-[calc(100dvh-16px)] sm:h-[720px] max-h-[calc(100vh-16px)] sm:max-h-[calc(100vh-32px)]'
                : 'w-auto sm:w-[460px] md:w-[480px] h-[min(620px,calc(100dvh-16px))] sm:h-[620px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#07192C] via-[#0C294A] to-[#144979] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-gold/20 shadow-sm shrink-0 gap-3 sm:gap-4">
              {/* Header Left: Avatar & Identity */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 overflow-hidden">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center border border-[#38BDF8]/40 shadow-inner shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#38BDF8]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#38BDF8] border-2 border-[#07192C] rounded-full" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate">
                    Sanjeevini AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full bg-[#38BDF8]/15 text-[#7DD3FC] border border-[#38BDF8]/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] inline-block animate-pulse" />
                      RAG Verified
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-gray-300 truncate hidden xs:inline sm:inline">
                      • Clinic PDFs
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right: Language Toggle & Window Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                {/* Language Switcher Pill */}
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-[#38BDF8]/30 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                      currentLang === 'en'
                        ? 'bg-[#38BDF8] text-[#07192C] shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="Switch to English"
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('ta')}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                      currentLang === 'ta'
                        ? 'bg-[#38BDF8] text-[#07192C] shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="தமிழுக்கு மாற்றவும் (Switch to Tamil)"
                  >
                    தமிழ்
                  </button>
                </div>

                {/* Window Action Controls */}
                <div className="flex items-center space-x-0.5 sm:space-x-1 border-l border-white/20 pl-1 sm:pl-1.5 shrink-0">
                  <button
                    onClick={handleResetChat}
                    title={currentLang === 'ta' ? 'உரையாடலை மீட்டமை' : 'Clear conversation'}
                    className="p-1 sm:p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Restart chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'Restore window size' : 'Expand window size'}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                    aria-label={isExpanded ? 'Restore window size' : 'Expand window size'}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title={currentLang === 'ta' ? 'மூடவும்' : 'Close'}
                    className="p-1 sm:p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-cream/30">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const isSpeaking = speakingMessageId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAssistant
                          ? 'bg-white text-gray-800 border border-sage/60 rounded-tl-sm'
                          : 'bg-primary text-white rounded-tr-sm'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="break-words">
                        {renderFormattedText(msg.content, isAssistant)}
                      </div>

                      {/* Footer Actions: Timestamp & Text-to-Speech */}
                      <div className={`flex items-center justify-between mt-2 pt-1 text-[10px] gap-2 ${
                        isAssistant ? 'text-gray-400 border-t border-gray-50' : 'text-gray-200'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isAssistant && (
                          <button
                            onClick={() => toggleSpeech(msg.id, msg.content)}
                            title={isSpeaking ? 'Stop reading' : 'Listen to answer'}
                            className="hover:text-primary transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-100/70"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                                <span className="text-red-500 font-medium">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-gray-500 hover:text-primary" />
                                <span className="text-gray-500 hover:text-primary font-medium">Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-sage/60 max-w-[78%] shadow-sm"
                >
                  <Bot className="w-4 h-4 text-primary animate-bounce shrink-0" />
                  <span className="text-xs text-gray-500">
                    {currentLang === 'ta' ? 'ஆவணங்களில் தேடி பதிலளிக்கிறோம்...' : 'Searching documents & reasoning...'}
                  </span>
                  <div className="flex space-x-1 shrink-0">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-300" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            {messages.length <= 3 && !loading && (
              <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 pl-0.5">
                  {currentLang === 'ta' ? 'கேள்வி:' : 'Ask:'}
                </span>
                {(SUGGESTED_PROMPTS[currentLang] || SUGGESTED_PROMPTS.en).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs bg-white hover:bg-sage/40 text-primary font-medium border border-primary/20 transition-all shrink-0 hover:scale-[1.02] flex items-center shadow-xs cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 text-gold" />
                  </button>
                ))}
              </div>
            )}

            {/* Voice Listening Active Banner */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border-t border-red-200 px-4 py-2.5 flex items-center justify-between text-xs text-red-600 shrink-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="font-medium">
                      {currentLang === 'ta' ? 'உங்கள் குரலைக் கேட்கிறது... தெளிவாகப் பேசவும்' : 'Listening to your voice... Speak clearly'}
                    </span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="text-[11px] underline font-semibold text-red-700 hover:text-red-900 cursor-pointer"
                  >
                    {currentLang === 'ta' ? 'முடிந்தது' : 'Done Speaking'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form Bar */}
            <div className="p-2.5 sm:p-3.5 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 sm:gap-2.5"
              >
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop recording voice' : (currentLang === 'ta' ? 'குரல் மூலம் கேட்க கிளிக் செய்யவும்' : 'Click to speak question')}
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                      : 'bg-[#FAF8F5] hover:bg-sage/40 text-primary border border-sage/80'
                  }`}
                  aria-label="Voice input"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  )}
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={1000}
                  placeholder={
                    isListening
                      ? (currentLang === 'ta' ? 'பேசுங்கள்... கேட்கிறது...' : 'Listening...')
                      : (currentLang === 'ta' ? 'கேள்வியை தமிழில் அல்லது ஆங்கிலத்தில் கேட்கவும்...' : 'Ask question in English or தமிழ்...')
                  }
                  disabled={loading}
                  className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-xs sm:text-sm transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  title={currentLang === 'ta' ? 'அனுப்பவும்' : 'Send message'}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              {/* Strict RAG Medical Disclaimer */}
              <p className="text-[10px] sm:text-[11px] text-gray-500 text-center mt-2 sm:mt-2.5 leading-tight px-1">
                {currentLang === 'ta' ? (
                  <>
                    மருத்துவமனை ஆவணங்களின்படி பதில்கள் | அவசர உதவிக்கு:{' '}
                    <a href="tel:+919843066362" className="text-primary font-bold hover:underline whitespace-nowrap">
                      +91 98430 66362
                    </a>
                  </>
                ) : (
                  <>
                    Answers strictly derived from clinic documents | Emergency:{' '}
                    <a href="tel:+919843066362" className="text-primary font-bold hover:underline whitespace-nowrap">
                      +91 98430 66362
                    </a>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
