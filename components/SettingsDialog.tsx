import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Shield, Server, Cpu, Key, ExternalLink, Zap } from 'lucide-react';
import { AISettings, AIProvider } from '../types';
import { AI_MODELS } from '../constants';

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
        // Clear manual key to force usage of the injected env key.
        // The App automatically uses process.env.API_KEY if settings.apiKey is empty.
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
              <div className="flex flex-wrap gap-2">
                 {(['gemini', 'openai', 'anthropic', 'deepseek', 'custom'] as AIProvider[]).map(p => (
                    <button
                       key={p}
                       onClick={() => handleChange('provider', p)}
                       className={`flex-1 py-2 px-1 rounded text-sm font-medium border transition-all capitalize truncate min-w-[80px] text-center ${
                          localSettings.provider === p 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                       }`}
                       title={p}
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
                </label>
                <input 
                   type="password"
                   value={localSettings.apiKey}
                   placeholder="Enter API Key..."
                   onChange={(e) => handleChange('apiKey', e.target.value)}
                   className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
                
                <p className="text-[10px] text-slate-500 mt-1">
                   {localSettings.provider === 'anthropic' 
                      ? "Required for Anthropic Claude models."
                      : localSettings.provider === 'deepseek'
                      ? "Required. Uses DeepSeek's OpenAI-compatible API."
                      : "Required for OpenAI. Optional for some local endpoints."}
                </p>
             </div>
           )}

           {localSettings.provider === 'gemini' && (
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                     <Key size={14} /> API Key
                  </label>
                  
                  {/* Google Auth Button */}
                  <div className="mt-2">
                    <button 
                        onClick={handleGoogleAuth}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 text-xs font-medium transition-colors"
                    >
                        <Zap size={12} className="fill-current" /> Connect Google Account (Pro Tokens)
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 mt-1">
                     API Key is handled automatically via Google Account or Environment Variables.
                  </p>
               </div>
           )}

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
                  {localSettings.provider === 'anthropic' && (
                    <p className="text-[10px] text-amber-500 mt-1">
                       Note: Direct Anthropic API calls from browser may fail CORS. Use a proxy if needed.
                    </p>
                  )}
               </div>
           )}

           {/* Model Selection */}
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Model</label>
              
              {/* Model Chips */}
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