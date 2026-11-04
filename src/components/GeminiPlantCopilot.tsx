import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Cpu
} from 'lucide-react';
import { LanguageMode, DepartmentId, WeeklyTask, MachineOEE } from '../types/dashboard.ts';
import { DEPARTMENTS } from '../data/mockData.ts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiPlantCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  langMode: LanguageMode;
  tasksCount: number;
  overdueTasksCount: number;
}

export const GeminiPlantCopilot: React.FC<GeminiPlantCopilotProps> = ({
  isOpen,
  onClose,
  langMode,
  tasksCount,
  overdueTasksCount,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: langMode === 'am'
        ? 'ሰላም! እኔ የማሽነሪ ኢንጂነሪንግ ግሩፕ (MEG) አግሮ-ማሽነሪ ኢንዱስትሪ የፋብሪካ አመራር AI ረዳት ነኝ። ስለ ማምረቻ ስራዎች፣ OEE፣ የስክራፕ ቅነሳ፣ እና የሳምንት ስራዎች እንዴት ልርዳዎት እችላለሁ?'
        : 'Welcome to MEG Agro-Machinery Operations Copilot. I can assist with factory OEE analysis, Disc Blade heat treatment troubleshooting, scrap reduction directives, and weekly task optimization. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    {
      title: langMode === 'am' ? 'የOEE እና የስክራፕ ቅነሳ' : 'OEE & Scrap Optimization',
      prompt: langMode === 'am' 
        ? 'የዲስክ ብሌድ ማጠንከሪያ እና የብየዳ OEE ቅናሽ እንዴት መፍታት ይቻላል?' 
        : 'How do we resolve the Disc Blade quench warpage and welding shop OEE deficit?',
    },
    {
      title: langMode === 'am' ? 'የስራዎች አፈጻጸም ትንተና' : 'Weekly Task Bottlenecks',
      prompt: langMode === 'am' 
        ? 'ያለፈባቸውን ስራዎች ለማጠናቀቅ ምን ዓይነት የአመራር እርምጃ ይወሰድ?' 
        : `What immediate operational directives are recommended for the ${overdueTasksCount} overdue tasks?`,
    },
    {
      title: langMode === 'am' ? 'የጥገና ቅድመ-ዝግጅት' : 'Preventative Maintenance',
      prompt: langMode === 'am' 
        ? 'ለአየር ኮምፕረሰር እና ለሲኤንሲ ማሽኖች አስቸኳይ የጥገና መመሪያ አዘጋጅልኝ።' 
        : 'Draft a quick 5-step maintenance checklist for the Rotary Screw Compressor and CNC Lathe.',
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          langMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || (langMode === 'am' ? 'ምላሽ ማግኘት አልተቻለም።' : 'No response received.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Gemini Copilot Error:', err);
      // Fallback response with industrial guidance
      const fallbackReply = langMode === 'am'
        ? `የአመራር ምክረ-ሀሳብ:\n• በማሽን ጥገና ላይ የቅድሚያ ቁጥጥር ማድረግ\n• የዲስክ ብሌድ የሙቀት መቆጣጠሪያውን (Zone 2 furnace) በአስቸኳይ ማስተካከል\n• የስራዎች አፈጻጸም በየዕለቱ በፈረቃ መሪዎች እንዲገመገም ማድረግ።`
        : `MEG Plant Operational Guidance:\n1. Prioritize critical path bottleneck tasks and recalibrate Zone 2 furnace thermocouples to mitigate quench warpage.\n2. Ensure preventive maintenance on Rotary Screw Compressor is cleared to restore required pneumatic pressure.\n3. Conduct shift-level Kaizen stand-ups for active task tracking.`;

      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Copilot Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm tracking-tight">
                  MEG Plant Operations Copilot
                </h3>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800/50">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {langMode === 'am' 
                  ? 'የአግሮ-ማሽነሪ ኢንዱስትሪ ስልታዊ የፋብሪካ ረዳት' 
                  : 'Agro-Machinery Industrial Operations & Diagnostics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded border border-slate-700/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              {qp.title}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-sky-950 text-sky-400 border border-sky-800/60'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-slate-850 bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <span
                    className={`block mt-1 text-[10px] text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-center gap-2">
                <span>Analyzing plant metrics &amp; generating directives...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                langMode === 'am'
                  ? 'ስለ ማምረቻ ስራዎች፣ OEE ወይም ስክራፕ ጥያቄ ይጠይቁ...'
                  : 'Ask about plant OEE, scrap rates, equipment PM, or directives...'
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Machinery Engineering Group (MEG) Agro-Machinery Operations</span>
            <span>Server-Side Gemini API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
