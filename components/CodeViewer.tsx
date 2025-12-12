import React from 'react';
import { X, Copy, Download, RefreshCw, Loader2 } from 'lucide-react';
import { CodeLanguage } from '../types';

interface CodeViewerProps {
  code: string;
  language: CodeLanguage;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onLanguageChange: (lang: CodeLanguage) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  language, 
  isLoading,
  onClose, 
  onRefresh,
  onLanguageChange
}) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = language === 'c' ? 'ui.c' : 'ui.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-slate-700">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-white">
                {language === 'c' ? 'Generated C Code' : 'Generated MicroPython'}
             </h2>
             <div className="flex bg-slate-800 rounded p-1 border border-slate-700">
                <button 
                  onClick={() => onLanguageChange('c')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'c' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  C
                </button>
                <button 
                   onClick={() => onLanguageChange('micropython')}
                   className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'micropython' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Python
                </button>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#0d1117] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400 gap-4">
               <Loader2 className="animate-spin w-10 h-10" />
               <p className="text-sm font-mono">Generative AI is coding your UI...</p>
            </div>
          ) : (
            <pre className="p-6 font-mono text-sm text-slate-300">
              <code>{code}</code>
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 rounded-b-xl flex justify-between items-center">
           <div className="flex gap-2">
             <button 
                onClick={onRefresh} 
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors border border-slate-600 disabled:opacity-50"
             >
               <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
               Regenerate
             </button>
             <p className="text-xs text-slate-500 self-center ml-2 hidden sm:block">
                Powered by Gemini 2.5 Flash
             </p>
           </div>

           <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors border border-slate-600 disabled:opacity-50"
              >
                <Copy size={16} /> Copy
              </button>
              <button 
                onClick={handleDownload}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
              >
                <Download size={16} /> Download {language === 'c' ? '.c' : '.py'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;