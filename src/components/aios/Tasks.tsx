import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Square, Clock, AlertCircle, Filter, Search, Plus, Calendar, Flag, MoreVertical, MoreHorizontal } from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await aiosApi.getTasks();
      setTasks(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: any) => {
    switch (priority?.toString().toLowerCase()) {
      case 'high':
      case '3': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium':
      case '2': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-500">Autonomous and manual task orchestration.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'Pending', 'Running', 'Completed', 'Failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
              filter === f 
              ? 'bg-gray-900 text-white border-gray-900' 
              : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all flex items-start gap-4"
          >
            <button className="mt-1 text-gray-300 hover:text-indigo-600 transition-colors">
              {task.status === 'Completed' ? (
                <CheckSquare className="w-6 h-6 text-indigo-600" />
              ) : (
                <Square className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={`font-bold text-gray-900 ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                  <button className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                </div>
                {task.agent_id && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <Flag className="w-3.5 h-3.5" />
                    Agent Assigned
                  </div>
                )}
                {task.status === 'Running' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Processing...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="p-5 bg-gray-50 rounded-full w-fit mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Either you are all caught up, or your filters are too strict.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { ClipboardList } from 'lucide-react';
export default Tasks;
