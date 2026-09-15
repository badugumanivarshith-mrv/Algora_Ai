import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beaker, 
  BookOpen, 
  Cpu, 
  Github, 
  Lightbulb, 
  LineChart, 
  Search, 
  Plus,
  ChevronRight,
  TrendingUp,
  FileText,
  Star,
  Rocket,
  Award,
  Users
} from 'lucide-react';
import { researchApi } from '../services/researchApi';

const ResearchLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('research');
  const [projects, setProjects] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projData, analyticsData] = await Promise.all([
        researchApi.getProjects(),
        researchApi.getAnalytics()
      ]);
      setProjects(projData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching research data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'research', label: 'Research Projects', icon: Beaker },
    { id: 'assistant', label: 'AI Research Assistant', icon: Search },
    { id: 'literature', label: 'Literature Reviews', icon: BookOpen },
    { id: 'opensource', label: 'Open Source Hub', icon: Github },
    { id: 'innovation', label: 'Innovation Lab', icon: Lightbulb },
    { id: 'startup', label: 'Startup Builder', icon: Rocket },
    { id: 'analytics', label: 'Research Analytics', icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">Research & Innovation Lab</h1>
          <p className="text-neutral-600 text-lg">Conduct research, build MVPs, and contribute to Open Source.</p>
        </header>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={20} />
              </div>
              <span className="text-neutral-500 font-medium">Papers Read</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{analytics?.papers_read || 0}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <span className="text-neutral-500 font-medium">Impact Factor</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{analytics?.impact_factor || 0}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Star size={20} />
              </div>
              <span className="text-neutral-500 font-medium">Innovation Score</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">84%</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Award size={20} />
              </div>
              <span className="text-neutral-500 font-medium">OSS Contributions</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">12</div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-neutral-900 text-white shadow-lg scale-105' 
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'research' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-neutral-900">Active Research Projects</h2>
                    <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
                      <Plus size={20} />
                      New Project
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((proj) => (
                      <div key={proj.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                            {proj.domain}
                          </span>
                          <span className="text-neutral-400 text-sm">{new Date(proj.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">{proj.title}</h3>
                        <p className="text-neutral-600 line-clamp-2 mb-4">{proj.abstract}</p>
                        <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                          <div className="flex items-center gap-1 text-neutral-500 text-sm">
                            <Users size={16} />
                            <span>3 Collaborators</span>
                          </div>
                          <div className="flex items-center gap-1 text-neutral-500 text-sm">
                            <BookOpen size={16} />
                            <span>5 Papers Linked</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && !loading && (
                      <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
                        <Beaker size={48} className="mx-auto text-neutral-300 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900">No Research Projects Yet</h3>
                        <p className="text-neutral-500">Start your first research endeavor today!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'assistant' && (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-neutral-100 text-neutral-900 rounded-2xl mb-4">
                      <Search size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">AI Research Assistant</h2>
                    <p className="text-neutral-600">Analyze papers, summarize methodologies, and find prerequisites.</p>
                  </div>
                  <div className="space-y-4">
                    <textarea 
                      placeholder="Paste research paper abstract or text here..."
                      className="w-full h-48 p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <button className="bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors">
                        Summarize
                      </button>
                      <button className="bg-white text-neutral-900 border border-neutral-200 py-3 rounded-xl font-bold hover:bg-neutral-50 transition-colors">
                        Explain Methods
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'innovation' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-neutral-900">Innovation Lab</h2>
                    <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
                      <h3 className="text-xl font-bold mb-4">Idea Evaluator</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                          <input type="text" className="w-full p-3 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900" placeholder="E.g. AI-Powered Code Auditor" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Problem Statement</label>
                          <textarea className="w-full p-3 h-24 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900" placeholder="What problem are you solving?" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Solution Statement</label>
                          <textarea className="w-full p-3 h-24 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900" placeholder="How does your solution work?" />
                        </div>
                        <button className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 shadow-lg transition-all">
                          Evaluate Idea with AI
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-neutral-900">MVP Milestones</h2>
                    <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <Rocket className="text-orange-400" />
                        <h3 className="text-lg font-bold">Active MVP Track</h3>
                      </div>
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full border-2 ${i === 1 ? 'bg-orange-400 border-orange-400' : 'border-neutral-700'}`} />
                              {i !== 3 && <div className="w-0.5 h-12 bg-neutral-700" />}
                            </div>
                            <div>
                              <h4 className="font-bold">Phase {i}: Core Engine</h4>
                              <p className="text-sm text-neutral-400">Implementation of basic LLM parsing layer.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more tab content as needed */}
              {['literature', 'opensource', 'startup', 'analytics'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-neutral-200">
                  <Cpu size={64} className="text-neutral-200 mb-6" />
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Module Loading...</h3>
                  <p className="text-neutral-500">The {activeTab} workspace is being initialized.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ResearchLab;
