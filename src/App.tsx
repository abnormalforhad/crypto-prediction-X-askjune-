import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Zap, Cpu, AlertTriangle, Blocks, TerminalSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsError, setModelsError] = useState('');

  const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingChat]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const res = await fetch('/api/models');
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || 'Failed to fetch models');
      }
      
      // Handle standard OpenAI style format where data is in data.data or similar
      let modelsList = Array.isArray(data) ? data : (data.data || []);
      
      // Filter out only blockchain/june related models
      modelsList = modelsList.filter((m: any) => {
        const id = m.id || m;
        return typeof id === 'string' && (id.toLowerCase().includes('june') || id.toLowerCase().includes('blockchain'));
      });

      // Fallback if the API returns an empty list after filtering
      if (modelsList.length === 0) {
        modelsList = [{ id: 'blockchain/june' }];
      }

      setModels(modelsList);
      
      if (modelsList.length > 0) {
        setSelectedModel(modelsList[0].id || modelsList[0]);
      }
    } catch (err: any) {
      setModelsError(err.message || 'Error connecting to node');
    } finally {
      setLoadingModels(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoadingChat(true);
    setShowWelcome(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      const reply = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
      
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: 'system', content: `[SYSTEM ERROR] ${err.message}` }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#e5e5e5] font-sans flex flex-col lowercase selection:bg-[#c5a47e]/30 selection:text-[#c5a47e]">
      {/* Header */}
      <header className="border-b border-glass bg-[#080808]/80 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e]">
            <Blocks className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight serif uppercase">askjune<span className="accent-text">.ai</span> <span className="opacity-50 text-xl lowercase">// terminal</span></h1>
            <div className="flex items-center gap-2 text-xs text-[#c5a47e]/70 font-mono mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a47e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a47e]"></span>
              </span>
              blockchain.info node active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border-glass bg-glass">
            <Cpu className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-mono text-gray-400">models</span>
            {loadingModels ? (
               <Loader2 className="w-4 h-4 animate-spin text-[#c5a47e] ml-2" />
            ) : modelsError ? (
               <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
            ) : (
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#e5e5e5] font-mono ml-1 uppercase cursor-pointer"
              >
                {models.map((m, i) => {
                  const id = m.id || m;
                  return <option key={i} value={id} className="bg-[#0f0f0f]">{id}</option>;
                })}
                {models.length === 0 && <option value="">no models</option>}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6 pt-8 pb-32">
        {modelsError && (
          <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400 mb-1">api connection failed</h3>
              <p className="text-sm text-red-500/80 font-mono break-all">{modelsError}</p>
              <p className="text-xs text-gray-500 mt-3 font-mono">
                tip: ensure JUNE_API_KEY is properly configured in your environment variables.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {showWelcome && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center mt-12 mb-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#c5a47e]/10 border border-[#c5a47e]/30 flex items-center justify-center text-[#c5a47e] mb-6 shadow-[0_0_30px_rgba(197,164,126,0.15)] relative">
                  <div className="absolute inset-0 rounded-2xl border border-[#c5a47e]/50 animate-ping opacity-20"></div>
                  <Blocks className="w-8 h-8" />
                </div>
                <h2 className="serif text-4xl mb-3 text-white">Predict market movements with <span className="italic accent-text">precision</span>.</h2>
                <p className="text-sm opacity-50 max-w-lg mb-10 text-[#e5e5e5] leading-relaxed">
                  Access the June AI cluster directly. Analyze chains, verify contracts, or simulate trades in real-time. Make sure your <code className="bg-[#111] px-1.5 py-0.5 rounded border border-glass text-[#c5a47e] font-mono text-[11px]">JUNE_API_KEY</code> is set in your environment.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
                  {[
                    { title: 'DeFi Analysis', prompt: 'Analyze the current TVL trends in top Ethereum DeFi protocols over the last 30 days.' },
                    { title: 'Smart Contract Audit', prompt: 'What are the most common vulnerabilities in ERC-20 token contracts?' },
                    { title: 'Market Sentiment', prompt: 'Summarize the current market sentiment for Bitcoin based on recent institutional moves.' },
                    { title: 'Chain Analytics', prompt: 'Explain the impact of Layer 2 rollups on Ethereum mainnet transaction fees.' }
                  ].map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className="p-4 rounded-xl border-glass bg-glass hover:bg-[#c5a47e]/5 hover:border-[#c5a47e]/30 transition-all flex flex-col gap-2 group cursor-pointer text-left"
                    >
                      <h4 className="text-xs uppercase tracking-widest font-semibold opacity-60 group-hover:opacity-100 group-hover:text-[#c5a47e] transition-colors">{item.title}</h4>
                      <p className="text-sm opacity-50 group-hover:opacity-80 transition-opacity line-clamp-2">{item.prompt}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'border-glass bg-black text-gray-300' 
                    : msg.role === 'system'
                    ? 'bg-red-950/50 border-red-900 text-red-500'
                    : 'bg-[#c5a47e]/10 border-[#c5a47e]/30 text-[#c5a47e]'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <TerminalSquare className="w-4 h-4"/> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-glass border-glass text-[#e5e5e5]'
                    : msg.role === 'system'
                    ? 'bg-red-950/20 border border-red-900/30 text-red-400 font-mono text-sm'
                    : 'bg-transparent border-glass border-l-[#c5a47e] border-l-2 text-[#e5e5e5]'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {loadingChat && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-[#c5a47e]/10 border border-[#c5a47e]/30 text-[#c5a47e] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 border-glass border-l-[#c5a47e] border-l-2 rounded-2xl flex items-center gap-2 text-[#c5a47e] font-mono text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>processing_hash...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-1" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-t from-[#080808] via-[#080808] to-transparent pt-12 pb-6 px-4">
        <div className="max-w-3xl mx-auto relative cursor-text">
          <div className="absolute inset-0 bg-[#c5a47e]/5 blur-xl rounded-full pointer-events-none"></div>
          <div className="relative bg-glass border-glass rounded-2xl flex items-end shadow-2xl overflow-hidden focus-within:border-[#c5a47e]/50 focus-within:ring-1 focus-within:ring-[#c5a47e]/50 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="transmit query to network..."
              className="w-full max-h-48 min-h-[56px] bg-transparent border-none outline-none resize-none px-5 py-4 text-[15px] text-[#e5e5e5] placeholder:opacity-30 block leading-relaxed"
              rows={1}
            />
            <div className="pb-3 pr-3 shrink-0">
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || loadingChat}
                className="w-10 h-10 rounded-xl bg-[#c5a47e] hover:bg-[#d4bc9d] border border-[#c5a47e]/30 flex items-center justify-center text-[#080808] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-between px-2 text-[10px] font-mono text-gray-600 group">
             <span>Shift+Enter for new line</span>
             <span className="flex items-center gap-1 group-hover:text-[#c5a47e] opacity-60 transition-colors">
               <ShieldIcon /> end-to-end encrypted protocol
             </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
  );
}

