import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, timeAgo } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { useDataStore } from '@/store/dataStore';
import { AIRecommendationCard } from '@/components/cards/AIRecommendationCard';
import {
  Brain, Sparkles, Send, X, TrendingUp, Activity, Stethoscope,
  Ambulance, Building2, Clock, Zap, MessageSquare,
} from 'lucide-react';
import type { AIRecommendation } from '@/types';

const SUGGESTED_QUERIES = [
  { icon: Building2, text: 'Which hospital has the most available ICU beds?' },
  { icon: Stethoscope, text: 'Find an available cardiologist' },
  { icon: TrendingUp, text: 'Predict ICU overload for next 2 hours' },
  { icon: Ambulance, text: 'Forecast ambulance demand this evening' },
  { icon: Clock, text: 'Estimate ER wait time at MGH' },
  { icon: Zap, text: 'Optimize resource distribution' },
];

const AI_RESPONSES: Record<string, string> = {
  'icu beds': 'Based on real-time data, Medinova University Hospital (MUH) has 4 available ICU beds — the highest in the network. MGH has 2, and MCI has 3. I recommend MUH for critical transfers due to proximity and capacity.',
  'cardiologist': 'Dr. Priya Sharma is currently available at MGH with a queue of 2 patients. She specializes in Interventional Cardiology with 12 years experience and a 4.8 rating. For emergencies, Dr. Vikram Singh at MCI is on-call.',
  'overload': 'AI forecast indicates MGH ICU will exceed 95% occupancy within 90 minutes at current admission rate. MRM will reach capacity in ~2 hours. Recommend proactive transfer of 2 critical patients to MUH which has 4 available ICU beds.',
  'ambulance': 'Predicted 40% surge in ambulance demand in Central Region between 14:00-17:00 based on historical patterns and current incident rate. Recommend pre-positioning 3 ALS units near Highway NH-48 and Cyber City.',
  'wait time': 'Current ER wait time at MGH averages 38 minutes (down from 52m). AI suggests opening triage bay 3 to reduce to ~25 minutes. MEH has the longest wait at 52 minutes — recommend 2 additional triage bays.',
  'optimize': 'Network resource optimization: 3 hospitals (MGH, MTC, MRM) show ventilator strain while MCI and MUH have surplus. Balancing 4 ventilators from MCI→MGH and 3 from MUH→MRM would reduce network risk by 34%.',
  'transfer': 'For optimal transfer routing: Patient TRF-501 can reach MUH 8 minutes faster via Route B (avoiding traffic on NH-48). Ambulance A-203 is nearest with ETA 6 minutes. Bed reserved at MUH ICU Bay 4.',
  'report': 'I can generate: Daily Operations Summary, Resource Utilization Report, Emergency Response Analysis, Transfer Efficiency Report, Department Performance Report, and AI Predictions Summary. Which would you like?',
  'doctor': 'Dr. Priya Sharma is currently available at MGH with a queue of 2 patients. She specializes in Interventional Cardiology with 12 years experience and a 4.8 rating. For emergencies, Dr. Vikram Singh at MCI is on-call.',
  'hospital': 'Medinova University Hospital (MUH) currently has the best overall health score (87/100) with 4 available ICU beds, 12 general beds, and 3 available emergency beds. All major equipment is operational.',
};

function generateResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (key.split(' ').every((word) => lower.includes(word))) return response;
  }
  return 'I can help with hospital recommendations, doctor availability, ICU overload predictions, ambulance demand forecasting, resource optimization, wait time estimation, and transfer routing. Try asking about any of these topics.';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export function AIAssistantPanel() {
  const { aiPanelOpen, setAIPanelOpen, pushToast } = useUIStore();
  const { recommendations } = useDataStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: 'Hello! I am your AI Operations Assistant. I can recommend hospitals, find doctors, predict ICU overload, forecast ambulance demand, optimize resources, and more. How can I help you manage your healthcare network today?', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const sendQuery = (query: string) => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: query, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const aiMsg: ChatMessage = { id: `a_${Date.now()}`, role: 'ai', content: generateResponse(query), timestamp: Date.now() };
      setMessages((m) => [...m, aiMsg]);
      setThinking(false);
    }, 800 + Math.random() * 600);
  };

  const handleRecAction = (rec: AIRecommendation) => {
    pushToast('AI Action Initiated', rec.action, 'success');
  };

  return (
    <>
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-30 hidden lg:flex flex-col border-l border-base-700/60 bg-base-900/80 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-base-700/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/10 border border-brand-500/25">
                    <Brain className="h-5 w-5 text-brand-300" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-brand-300 fill-brand-500/30" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink-100">AI Assistant</h2>
                  <p className="text-[10px] text-success-400 flex items-center gap-1">
                    <span className="live-dot bg-success-400 text-success-400" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAIPanelOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:text-ink-200 hover:bg-base-700/40 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
                >
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    msg.role === 'ai' ? 'bg-brand-500/15 text-brand-300' : 'bg-accent-500/15 text-accent-400',
                  )}>
                    {msg.role === 'ai' ? <Brain className="h-4 w-4" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div className={cn(
                    'rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]',
                    msg.role === 'ai' ? 'bg-base-800/60 text-ink-200 border border-base-700/40' : 'bg-brand-500/15 text-brand-100 border border-brand-500/25',
                  )}>
                    {msg.content}
                    <p className="text-[9px] text-ink-500 mt-1.5">{timeAgo(msg.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="rounded-xl px-3.5 py-3 bg-base-800/60 border border-base-700/40">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-brand-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.length <= 1 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-ink-500 uppercase tracking-wide mb-2">Suggested</p>
                  <div className="space-y-1.5">
                    {SUGGESTED_QUERIES.map((q) => (
                      <button
                        key={q.text}
                        onClick={() => sendQuery(q.text)}
                        className="flex w-full items-center gap-2.5 rounded-lg bg-base-850/40 px-3 py-2 text-xs text-ink-300 hover:text-brand-200 hover:bg-brand-500/10 border border-base-700/40 hover:border-brand-500/30 transition-all text-left"
                      >
                        <q.icon className="h-3.5 w-3.5 text-brand-300 shrink-0" />
                        <span className="truncate">{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                    <p className="text-[10px] font-bold text-ink-500 uppercase tracking-wide">Live Recommendations</p>
                  </div>
                  <div className="space-y-2">
                    {recommendations.slice(0, 3).map((rec) => (
                      <AIRecommendationCard key={rec.id} recommendation={rec} onAction={handleRecAction} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-base-700/40 p-3 shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); sendQuery(input); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI anything..."
                  className="flex-1 rounded-lg bg-base-850/60 border border-base-700/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-200 border border-brand-500/30 hover:bg-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile AI Panel */}
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-base-900 border-l border-base-700/60 lg:hidden flex flex-col"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-base-700/40">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-brand-300" />
                <h2 className="text-sm font-semibold text-ink-100">AI Assistant</h2>
              </div>
              <button onClick={() => setAIPanelOpen(false)} className="text-ink-400 hover:text-ink-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn('rounded-xl px-3.5 py-2.5 text-sm max-w-[85%]', msg.role === 'ai' ? 'bg-base-800/60 text-ink-200 border border-base-700/40' : 'bg-brand-500/15 text-brand-100')}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendQuery(input); }} className="border-t border-base-700/40 p-3 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask AI..." className="flex-1 rounded-lg bg-base-850/60 border border-base-700/60 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/50" />
              <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-200"><Send className="h-4 w-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
