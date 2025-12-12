
import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Shield, Server, Cpu, Key } from 'lucide-react';
import { AISettings, AIProvider } from '../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSave 
}) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
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
            } else if (value === 'custom') {
                updates.baseUrl = 'http://localhost:11434/v1';
                updates.model = 'llama3';
            }
        }
        return { ...prev, ...updates };
    });
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden">
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
             <Cpu size={20} className="text-blue-500" /> AI Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
           
           {/* Provider */}
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                 {(['gemini', 'openai', 'custom'] as AIProvider[]).map(p => (
                    <button
                       key={p}
                       onClick={() => handleChange('provider', p)}
                       className={`py-2 px-3 rounded text-sm font-medium border transition-all capitalize ${
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
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                 <Key size={14} /> API Key
              </label>
              <input 
                 type="password"
                 value={localSettings.apiKey}
                 placeholder={localSettings.provider === 'gemini' ? "Leave empty to use process.env.API_KEY" : "sk-..."}
                 onChange={(e) => handleChange('apiKey', e.target.value)}
                 className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                 {localSettings.provider === 'gemini' 
                    ? "If set, this overrides the default environment key."
                    : "Required for OpenAI. Optional for some local endpoints."}
              </p>
           </div>

           {/* Base URL (Conditional) */}
           {localSettings.provider !== 'gemini' && (
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                     <Server size={14} /> Base URL
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Model Name</label>
              <input 
                 type="text"
                 value={localSettings.model}
                 onChange={(e) => handleChange('model', e.target.value)}
                 className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
           </div>

        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-850 flex justify-end gap-3">
           <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
           >
              <Save size={16} /> Save Settings
           </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsDialog;
