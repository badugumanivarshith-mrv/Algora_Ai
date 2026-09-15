import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings2, Plus, Zap, Bot, ArrowRight, Trash2, CheckCircle2, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const Automations: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [wfRes, sugRes] = await Promise.all([
        aiosApi.getWorkflows(),
        aiosApi.getAutomationSuggestions()
      ]);
      setWorkflows(wfRes.data || []);
      setSuggestions(sugRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Assistant Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">AI Automation Assistant</h2>
          </div>
          <p className="text-indigo-100 mb-8 max-w-2xl">
            I've analyzed your activity across Algora and external integrations. Here are some smart workflows I recommend to boost your productivity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-start gap-4 group cursor-pointer"
              >
                <div className="p-2.5 bg-indigo-500/30 rounded-xl">
                  <Wand2 className="w-5 h-5 text-indigo-100" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{sug.title}</h3>
                  <p className="text-sm text-indigo-100/80 mb-3 leading-relaxed">{sug.description}</p>
                  <button className="text-sm font-bold flex items-center gap-1.5 text-white hover:underline">
                    Create Workflow <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            {suggestions.length === 0 && !loading && (
              <div className="col-span-2 py-8 text-center text-indigo-100/60 border-2 border-dashed border-white/20 rounded-2xl">
                Analyzing your productivity patterns...
              </div>
            )}
          </div>
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
      </section>

      {/* Active Workflows Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Active Workflows</h2>
            <p className="text-gray-500">Your autonomous productivity pipelines.</p>
          </div>
          <button 
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Workflow
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {workflows.map((wf) => (
            <motion.div
              key={wf.id}
              layout
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-6"
            >
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Zap className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{wf.name}</h3>
                  {wf.is_active ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-100">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-gray-100">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{wf.description}</p>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-400 font-medium">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-gray-900 text-base">{wf.last_triggered_at ? new Date(wf.last_triggered_at).toLocaleDateString() : 'Never'}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Last Run</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                  <Settings2 className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-gray-100 mx-2" />
                <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-90">
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          ))}

          {workflows.length === 0 && !loading && (
            <div className="py-16 text-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl">
              <div className="p-4 bg-white rounded-2xl w-fit mx-auto mb-4 shadow-sm border border-gray-100">
                <Bot className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No automations yet</h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">Start by creating your first workflow or use AI suggestions above.</p>
              <button 
                onClick={() => setShowBuilder(true)}
                className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1.5"
              >
                Create your first workflow <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Automations;
