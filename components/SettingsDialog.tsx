
import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Shield, Server, Cpu, Key, ExternalLink, Zap, FolderOpen, Download, Layout, Settings } from 'lucide-react';
import { AISettings, AIProvider } from '../types';
import { AI_MODELS } from '../constants';
import InfoTooltip from './InfoTooltip';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
}

type SettingsTab = 'project' | 'ai';

const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSave,
  onSaveProject,
  onOpenProject
}) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('project');

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSaveAISettings = () => {
    onSave(localSettings);
    onClose(); 
  };

  const handleChange = (field: keyof AISettings, value: string) => {
    setLocalSettings(prev => {
        const updates: Partial<AISettings> = { [field]: value };
        
        // Auto-set defaults when provider changes
        if (field === 'provider') {
            if (value === 'gemini') {
                updates.baseUrl = '';
                updates.model = 'gemini-2.5-flash';
            } else if (value === 'openai') {
                updates.baseUrl = 'https://api.openai.com/v1';
                updates.model = 'gpt-4o';
            } else if (value === 'anthropic') {
                updates.baseUrl = 'https://api.anthropic.com/v1';
                updates.model = 'claude-3-5-sonnet-20240620';
            } else if (value === 'deepseek') {
                updates.baseUrl = 'https://api.deepseek.com';
                updates.model = 'deepseek-chat';
            } else if (value === 'custom') {
                updates.baseUrl = 'http://localhost:11434/v1';
                updates.model = 'llama3';
            }
        }
        return { ...prev, ...updates };
    });
  };

  const handleGoogleAuth = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        handleChange('apiKey', '');
        alert("Google Account connected! Pro tokens enabled.");
      } catch (err) {
        console.error(err);
        alert("Failed to select key.");
      }
    } else {
      alert("Google AI Studio integration is not available in this environment.");
    }
  };

  const renderSidebarItem = (id: SettingsTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === id 
          ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-2xl h-[500px] rounded-xl shadow-2xl flex border border-slate-700 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-48 bg-slate-950 border-r border-slate-800 flex flex-col">
           <div className="p-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                 <Settings size={16} /> Settings
              </h2>
           </div>
           <div className="flex-1 py-2">
              {renderSidebarItem('project', <Layout size={18} />, 'Project')}
              {renderSidebarItem('ai', <Cpu size={18} />, 'AI Generation')}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
           
           <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                 {activeTab === 'project' ? 'Project Management' : 'AI Configuration'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6">
              
              {/* --- PROJECT TAB --- */}
              {activeTab === 'project' && (
                 <div className="space-y-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                       <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase">File Operations</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => { onOpenProject(); onClose(); }}
                             className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg transition-all group"
                          >
                             <div className="p-3 rounded-full bg-slate-700 group-hover:bg-slate-600 text-amber-500 transition-colors">
                                <FolderOpen size={24} />
                             </div>
                             <span className="text-sm font-medium text-slate-200">Open Project</span>
                             <span className="text-[10px] text-slate-500">Import .json file</span>
                          </button>

                          <button 
                             onClick={onSaveProject}
                             className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg transition-all group"
                          >
                             <div className="p-3 rounded-full bg-slate-700 group-hover:bg-slate-600 text-green-500 transition-colors">
                                <Download size={24} />
                             </div>
                             <span className="text-sm font-medium text-slate-200">Save Project</span>
                             <span className="text-[10px] text-slate-500">Export as .json</span>
                          </button>
                       </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-800">
                       <p className="text-xs text-slate-500 text-center">
                          LVGL Studio AI automatically saves your work to your browser's local storage. 
                          Use "Save Project" to create a backup file or share your work.
                       </p>
                    </div>
                 </div>
              )}

              {/* --- AI TAB --- */}
              {activeTab === 'ai' && (
                 <div className="space-y-5">
                    {/* Provider */}
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                         Provider
                         <InfoTooltip text="Select the AI service to use for code generation." />
                       </label>
                       <div className="flex flex-wrap gap-2">
                          {(['gemini', 'openai', 'anthropic', 'deepseek', 'custom'] as AIProvider[]).map(p => (
                             <button
                                key={p}
                                onClick={() => handleChange('provider', p)}
                                className={`flex-1 py-2 px-1 rounded text-xs font-medium border transition-all capitalize truncate min-w-[70px] text-center ${
                                   localSettings.provider === p 
                                   ? 'bg-blue-600 border-blue-500 text-white' 
                                   : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                                }`}
                             >
                                {p}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* API Key */}
                    {localSettings.provider !== 'gemini' && (
                      <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <Key size={14} /> API Key
                            <InfoTooltip text="Your private API key. Stored locally in your browser." />
                         </label>
                         <input 
                            type="password"
                            value={localSettings.apiKey}
                            placeholder="Enter API Key..."
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                         />
                      </div>
                    )}

                    {localSettings.provider === 'gemini' && (
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                              <Key size={14} /> API Key
                              <InfoTooltip text="Authenticate securely with Google." />
                           </label>
                           <div className="mt-2">
                             <button 
                                 onClick={handleGoogleAuth}
                                 className="w-full flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 text-xs font-medium transition-colors"
                             >
                                 <Zap size={12} className="fill-current" /> Connect Google Account
                             </button>
                           </div>
                        </div>
                    )}

                    {/* Base URL */}
                    {localSettings.provider !== 'gemini' && (
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                              <Server size={14} /> Base URL
                              <InfoTooltip text="Optional override. Use 'http://localhost:11434/v1' for local Ollama." />
                           </label>
                           <input 
                              type="text"
                              value={localSettings.baseUrl}
                              onChange={(e) => handleChange('baseUrl', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                           />
                        </div>
                    )}

                    {/* Model */}
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                         Model
                         <InfoTooltip text="The specific AI model ID to use (e.g. gpt-4o, claude-3-5-sonnet)." />
                       </label>
                       <div className="flex flex-wrap gap-2 mb-2">
                         {AI_MODELS[localSettings.provider]?.map(m => (
                             <button
                                 key={m.id}
                                 onClick={() => handleChange('model', m.id)}
                                 className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                                     localSettings.model === m.id 
                                     ? 'bg-blue-900/40 border-blue-500 text-blue-200' 
                                     : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                                 }`}
                             >
                                 {m.name}
                             </button>
                         ))}
                       </div>
                       <input 
                          type="text"
                          value={localSettings.model}
                          onChange={(e) => handleChange('model', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="Custom model ID..."
                       />
                    </div>
                 </div>
              )}
           </div>

           {/* Footer */}
           <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button 
                 onClick={onClose}
                 className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                 Close
              </button>
              {activeTab === 'ai' && (
                  <button 
                     onClick={handleSaveAISettings}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                  >
                     <Save size={16} /> Save Settings
                  </button>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
