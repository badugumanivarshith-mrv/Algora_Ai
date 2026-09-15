import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link2, Link2Off, CheckCircle2, Github, Slack, MessageSquare, Trello, ClipboardList, Briefcase, ExternalLink, RefreshCw } from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const IntegrationIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case 'github': return <Github className="w-6 h-6" />;
    case 'slack': return <Slack className="w-6 h-6" />;
    case 'discord': return <MessageSquare className="w-6 h-6" />;
    case 'trello': return <Trello className="w-6 h-6" />;
    case 'jira': return <Briefcase className="w-6 h-6" />;
    case 'notion': return <ClipboardList className="w-6 h-6" />;
    default: return <Link2 className="w-6 h-6" />;
  }
};

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supportedServices = [
    { name: 'GitHub', description: 'Sync repositories, issues, and PRs.' },
    { name: 'Slack', description: 'Get notifications and trigger workflows.' },
    { name: 'Jira', description: 'Manage project tasks and sprints.' },
    { name: 'Notion', description: 'Sync documentation and research notes.' },
    { name: 'Trello', description: 'Organize tasks on visual boards.' },
    { name: 'Discord', description: 'Collaborate with your research team.' },
  ];

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const res = await aiosApi.getIntegrations();
      setIntegrations(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (serviceName: string) => {
    try {
      // Simulate OAuth connection
      await aiosApi.connectIntegration({
        serviceName,
        accessToken: 'dummy_token_' + Date.now(),
        metadata: { connected_at: new Date().toISOString() }
      });
      loadIntegrations();
    } catch (e) {
      alert('Failed to connect service');
    }
  };

  const getStatus = (serviceName: string) => {
    const integration = integrations.find(i => i.service_name === serviceName);
    return integration ? integration.status : 'Disconnected';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">External Integrations</h2>
          <p className="text-gray-500">Connect Algora to your favorite productivity tools.</p>
        </div>
        <button 
          onClick={loadIntegrations}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportedServices.map((service) => {
          const status = getStatus(service.name);
          const isConnected = status === 'Connected';

          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isConnected ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                  <IntegrationIcon name={service.name} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isConnected ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Connected</>
                  ) : (
                    'Not Connected'
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {service.description}
              </p>

              <button
                onClick={() => !isConnected && handleConnect(service.name)}
                className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isConnected 
                  ? 'bg-gray-50 text-gray-400 cursor-default' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                {isConnected ? (
                  <>Manage Connection <ExternalLink className="w-4 h-4" /></>
                ) : (
                  <>Connect {service.name} <Link2 className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Integrations;
