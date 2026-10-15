import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles, 
  FileText, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { sendChatMessage } from '../../services/botService';
import { toast } from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
  "What are your clinic consultation hours?",
  "What is Varmam therapy?",
  "Which doctors are available?",
  "Where is the clinic located in Karaikal?"
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Namaste! 🙏 Welcome to **Sanjeevini Siddha & Ayurveda Medical Centre**.\n\nI am your AI healthcare assistant. I answer patient questions **strictly based on our official clinic documents and guides**.\n\nHow can I help you today? You can type below, choose a quick topic, or tap the microphone to speak!`,
      sources: [{ document: 'Clinic Guide PDF' }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Toggle voice input recording
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
        recognitionRef.current.start();
      } catch (err) {
        toast.error('Could not start microphone. Check permissions.');
      }
    }
  };

  // Text-to-speech speaker toggle
  const toggleSpeech = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
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
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send query to backend
  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
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
      const historyPayload = newMessages
        .filter(m => !m.id.startsWith('welcome-'))
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await sendChatMessage(query, historyPayload);
      const data = res?.data?.data || {};

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Thank you for your question. Please contact our clinic directly at +91 94431 89498 for personalized guidance.',
        sources: data.sources || [],
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorText = err?.response?.data?.message || 'Could not connect to the assistant. Please try again.';
      toast.error(errorText);

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving that answer right now. Please call our clinic at **+91 94431 89498** or message us on WhatsApp.',
          sources: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Restart conversation
  const handleResetChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Namaste! 🙏 Conversation reset.\n\nI answer patient questions **strictly based on our official clinic documents and guides**.\n\nWhat would you like to know?`,
        sources: [{ document: 'Clinic Guide PDF' }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');
  };

  // Format markdown bold text and bullet points simply
  const renderFormattedText = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Process bold markers (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-primary-800">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Bullet list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm my-1">
            {formattedParts}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm leading-relaxed mb-1">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-36 right-6 z-40 flex items-center">
        {/* Initial Greeting Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
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
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Action Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-[#17382B] to-[#244638] text-white p-4 rounded-full shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center border-2 border-gold/40 group"
          aria-label="Open AI Assistant"
          title="Chat with Sanjeevini AI"
        >
          {/* Subtle pulse aura */}
          <span className="absolute -inset-1 rounded-full bg-primary-500/20 animate-ping opacity-75 pointer-events-none" />
          
          <Bot className="w-6 h-6 text-gold transition-transform group-hover:rotate-12" />

          {/* Active online green dot */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full shadow" />
        </motion.button>
      </div>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-sage/80 flex flex-col overflow-hidden font-body"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#17382B] via-[#1F4535] to-[#244638] text-white p-4 flex items-center justify-between border-b border-gold/20 shadow-sm shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-gold/40 shadow-inner">
                  <Bot className="w-5 h-5 text-gold" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-dark rounded-full" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white flex items-center gap-1.5">
                    Sanjeevini AI
                    <span className="text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                      RAG Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Strictly grounded in clinic PDFs
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/30">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const isSpeaking = speakingMessageId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        isAssistant
                          ? 'bg-white text-gray-800 border border-sage/60 rounded-tl-sm'
                          : 'bg-primary text-white rounded-tr-sm'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="break-words">
                        {renderFormattedText(msg.content)}
                      </div>

                      {/* Source attribution pill */}
                      {isAssistant && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1 items-center text-[10px] text-gray-500">
                          <FileText className="w-3 h-3 text-gold shrink-0" />
                          <span>Sources:</span>
                          {msg.sources.map((s, idx) => (
                            <span 
                              key={idx} 
                              className="px-1.5 py-0.5 rounded bg-sage/30 text-primary-800 font-medium"
                            >
                              {s.document || 'Clinic Guide'}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions: Timestamp & Text-to-Speech */}
                      <div className={`flex items-center justify-between mt-1 text-[10px] ${isAssistant ? 'text-gray-400' : 'text-gray-200'}`}>
                        <span>{msg.timestamp}</span>
                        {isAssistant && (
                          <button
                            onClick={() => toggleSpeech(msg.id, msg.content)}
                            title={isSpeaking ? 'Stop reading' : 'Listen to answer'}
                            className="ml-2 hover:text-primary transition-colors flex items-center gap-0.5"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                                <span className="text-red-500 font-medium">Stop</span>
                              </>
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-gray-500 hover:text-primary" />
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-sage/60 max-w-[70%] shadow-sm"
                >
                  <Bot className="w-4 h-4 text-primary animate-bounce" />
                  <span className="text-xs text-gray-500">Searching clinic documents & reasoning...</span>
                  <div className="flex space-x-1">
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
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs bg-sage/40 hover:bg-sage text-primary font-medium border border-primary/20 transition-all shrink-0 hover:scale-[1.02] flex items-center"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3 h-3 ml-1 text-gold" />
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
                  className="bg-red-50 border-t border-red-200 px-4 py-2 flex items-center justify-between text-xs text-red-600 shrink-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="font-medium">Listening to your voice... Speak clearly</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="text-[11px] underline font-semibold text-red-700 hover:text-red-900"
                  >
                    Done Speaking
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form Bar */}
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop recording voice' : 'Click to speak question'}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                      : 'bg-cream hover:bg-sage/40 text-primary border border-sage/80'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 text-primary" />
                  )}
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? 'Listening...' : 'Type or speak your question...'}
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-sm transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  title="Send message"
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              {/* Strict RAG Medical Disclaimer */}
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Answers strictly derived from clinic documents. Emergency? Call <a href="tel:+919443189498" className="text-primary font-medium hover:underline">+91 94431 89498</a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
