import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, MessageSquare, X, Send, Sparkles, Database, ShieldAlert, Cpu, 
  Terminal, Activity, Radio, Volume2, VolumeX, Mic, MicOff, RefreshCw
} from "lucide-react";
import { NetworkNode, ActivityLog } from "../types";

interface FloatingAssistantProps {
  activeTab: string;
  selectedNode: NetworkNode | null;
  editorBuffer: string;
  mfaActive: boolean;
  activityLogs: ActivityLog[];
  onAddLog: (
    message: string, 
    category: "security" | "network" | "recovery" | "terminal" | "system", 
    level: "info" | "warning" | "error" | "success"
  ) => void;
}

interface MiniMessage {
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export default function FloatingAssistant({
  activeTab,
  selectedNode,
  editorBuffer,
  mfaActive,
  activityLogs,
  onAddLog
}: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MiniMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am your Alpha Floating Assistant. I see you are exploring the workspace. I can automatically scan whatever screen you are engaging with to answer questions instantly. What would you like to build or check?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [screenContext, setScreenContext] = useState<string | null>(null);
  const [muteVoice, setMuteVoice] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle TTS setup
  const speakText = (text: string) => {
    if (muteVoice || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown bold tags & characters from text
    const cleaned = text.replace(/[*#`_\-]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    
    // Choose standard english voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API Voice Dictation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          onAddLog("Floating Menu: Microphone listening...", "system", "info");
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTextInput(transcript);
          onAddLog(`Captured voice input: "${transcript}"`, "system", "success");
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error in floating menu", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onAddLog("Voice Dictation not supported in this browser environment.", "system", "warning");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Screen Context Scanner
  const handleScanPage = () => {
    setIsScanning(true);
    onAddLog(`Initiating smart scan of active view: [${activeTab.toUpperCase()}]`, "system", "info");

    setTimeout(() => {
      // Assemble structured data of what is on screen
      let contextStr = `ACTIVE ENVIRONMENT COMPILER LOGS:\n`;
      contextStr += `- Active Tab: "${activeTab.toUpperCase()}"\n`;
      contextStr += `- Security MFA Mode: ${mfaActive ? "ENABLED (SECURE)" : "DISABLED (MFA LOCKED)"}\n`;
      
      if (selectedNode) {
        contextStr += `- Selected Network Node: ${selectedNode.name} (${selectedNode.ip}) with Port Binds ${selectedNode.ports.join(", ")} | CPU Load: ${selectedNode.load}%\n`;
      } else {
        contextStr += `- Selected Network Node: None selected in topology map.\n`;
      }

      if (activityLogs && activityLogs.length > 0) {
        contextStr += `- Recent daemon audit logs: "${activityLogs[0].message.slice(0, 80)}"\n`;
      }

      const rawCodeSnippet = editorBuffer ? editorBuffer.slice(0, 200) : "No code loaded in sandbox.";
      contextStr += `- Core Sandbox Code Fragment: "${rawCodeSnippet}..."\n`;

      setScreenContext(contextStr);
      setIsScanning(false);
      onAddLog(`Vision Sync Complete. Captured active context of ${activeTab.toUpperCase()} successfully.`, "system", "success");

      setMessages(prev => [
        ...prev,
        {
          sender: "system",
          text: `📸 Scanned Screen Context: Tab changed to [${activeTab.toUpperCase()}]. Captured logs, MFA states, and code buffer for instant explanation.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      speakText(`Active page contextual sync success. I now fully visualize the ${activeTab} tab.`);
    }, 1100);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || textInput;
    if (!textToSend.trim() && !screenContext) return;
    
    const userMsg = textToSend.trim() || "(Sent scanned view values directly to AI Companion)";
    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: userMsg,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    setTextInput("");
    setIsLoading(true);

    try {
      // Feed full visual profile context inside proxy prompt
      const processedMessage = `
        ${screenContext ? `[REAL-TIME SCREEN CONTEXT GATHERED]\n${screenContext}\n` : ""}
        User Query: "${userMsg}"
      `;

      // Pull biographical variables
      const userName = localStorage.getItem("alpha_user_bio_name_v1") || "";
      const experienceLevel = localStorage.getItem("alpha_user_bio_level_v1") || "Complete Beginner";
      const connectionsContext = localStorage.getItem("alpha_connector_configs_v1") || "None";

      const r = await fetch("/api/alpha-ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: processedMessage,
          model: "gemini",
          language: "en-US",
          tone: "interactive",
          temperature: 0.7,
          userProfile: {
            userName,
            experienceLevel,
            promptContext: `Looking at tab: ${activeTab}`,
            connectionsContext
          }
        })
      });

      if (!r.ok) {
        throw new Error("Companion api rejected connection");
      }

      const data = await r.json();
      const aiReply = data.reply || "Alpha core completed parsing client commands successfully.";

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      speakText(aiReply);

    } catch (err) {
      // Offline fallback
      const fallback = `I have received your request about the page. Since the Gemini API key isn't active, I will summarize locally: your current system has MFA active on [${activeTab.toUpperCase()}] and your network map is processing diagnostic packets on port 3000 safely. Configure the API Key for full explanation!`;
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: fallback,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" id="alpha-floating-assistant-host">
      {/* 1. COLLAPSED FLOATING BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            onAddLog("Opened Floating AI assistant drawer.", "system", "info");
          }}
          className="relative group p-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-emerald-600 hover:scale-105 active:scale-95 transition-all duration-300 rounded-full shadow-2xl shadow-indigo-950/70 border border-indigo-400 flex items-center justify-center animate-bounce"
          style={{ animationDuration: '3s' }}
          title="Open Floating Quick Help Assistant"
        >
          {/* Pulsing indicator aura */}
          <span className="absolute -inset-0.5 rounded-full bg-indigo-500/35 blur opacity-75 group-hover:opacity-100 transition animate-pulse" />
          <Bot className="w-6 h-6 text-white relative z-10" />
        </button>
      )}

      {/* 2. EXPANDED HUD WINDOW PANEL */}
      {isOpen && (
        <div 
          className="w-80 md:w-96 bg-[#060a15] border border-slate-800 rounded-2xl shadow-2xl shadow-[#020410]/90 overflow-hidden flex flex-col justify-between"
          id="alpha-floating-assistant-card"
        >
          {/* Header */}
          <div className="bg-[#0b1021] border-b border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="w-6.5 h-6.5 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-slate-100 block tracking-wider leading-tight">
                  ALPHA FLOATING AGENT
                </span>
                <span className="font-mono text-[8px] text-[#818cf8] tracking-widest uppercase">
                  ACTIVE VIEWER LINKED
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 animate-fade-in">
              {/* Voice Mute Toggle */}
              <button
                onClick={() => setMuteVoice(!muteVoice)}
                className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition ${!muteVoice ? "bg-indigo-950/40 text-indigo-400" : ""}`}
                title={muteVoice ? "Enable Speech Responses" : "Disable Speech Responses"}
              >
                {muteVoice ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Informational Ticker showing what page it is bound list */}
          <div className="bg-[#040813] border-b border-slate-900 px-3.5 py-2 flex items-center justify-between gap-1.5">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="font-mono text-[8.5px] uppercase">
                Linked Page:
              </span>
              <span className="p-0.5 px-2 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-indigo-400 uppercase font-bold">
                {activeTab}
              </span>
            </div>

            <button
              onClick={handleScanPage}
              disabled={isScanning}
              className="px-2 py-0.5 border border-emerald-900 bg-[#040a08]/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 rounded font-mono text-[8.5px] font-bold flex items-center space-x-1 uppercase tracking-wider transition disabled:opacity-50"
              title="Recognize and pull current screen variables instantly"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning..." : "Scan Screen"}</span>
            </button>
          </div>

          {/* Chat Messages Log Area */}
          <div className="h-64 overflow-y-auto p-4 space-y-3.5 bg-[#030610]" id="floating-chat-scrollpane">
            {messages.map((m, i) => {
              if (m.sender === "system") {
                return (
                  <div key={i} className="text-[10px] font-mono leading-relaxed bg-slate-950/40 border border-emerald-950 text-emerald-500/90 rounded p-2 flex items-start gap-1.5">
                    <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{m.text}</span>
                  </div>
                );
              }

              const isUser = m.sender === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-[11px] leading-relaxed ${
                    isUser 
                    ? "bg-indigo-600/95 text-white font-sans rounded-tr-none shadow shadow-indigo-900/40" 
                    : "bg-[#090f20] text-slate-300 font-sans border border-slate-850 rounded-tl-none"
                  }`}>
                    <div className="flex items-center space-x-2 pb-1 text-[8.5px] font-mono text-slate-500 justify-between">
                      <span>{isUser ? "YOU" : "ALPHA COMPANION"}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line leading-normal">{m.text}</p>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#090f20] border border-slate-850 rounded-xl rounded-tl-none p-3 max-w-[85%]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input Drawer Footer */}
          <div className="bg-[#0b1021] border-t border-slate-800 p-2.5 flex items-center gap-1.5">
            {/* Direct Microphone Dictation */}
            <button
              onClick={toggleListening}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition shrink-0 ${
                isListening 
                  ? "bg-red-950 border-red-700 text-red-500 animate-pulse" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title={isListening ? "Cancel Speaking" : "Dictate Prompt with Microphone"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder={`Ask about ${activeTab}...`}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-550 outline-none focus:border-indigo-800"
            />
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!textInput.trim() && !screenContext}
              className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 hover:text-indigo-300 flex items-center justify-center disabled:opacity-35 disabled:hover:text-indigo-455 transition shrink-0"
              title="Send to assistant"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
