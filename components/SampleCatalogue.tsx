import React from 'react';
import { X, FolderOpen, ArrowRight } from 'lucide-react';
import { SAMPLE_PROJECTS, SampleProject } from '../data/samples';

interface SampleCatalogueProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleProject) => void;
}

const SampleCatalogue: React.FC<SampleCatalogueProps> = ({
  isOpen,
  onClose,
  onSelectSample
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Increased max-width to 7xl to accommodate 5 columns comfortably */}
      <div className="bg-slate-900 w-full max-w-7xl h-[85vh] rounded-xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="text-blue-500" size={24} /> Project Templates
             </h2>
             <p className="text-slate-400 text-xs mt-0.5">
               Jumpstart your embedded project with a pre-configured design.
             </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117]">
           {/* Updated Grid Layout: up to 5 columns on XL screens */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {SAMPLE_PROJECTS.map((sample) => (
                 <div 
                   key={sample.id}
                   className="group bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-900/10 transition-all flex flex-col h-full"
                 >
                    {/* Visual Header - Compacted */}
                    <div className={`h-24 bg-gradient-to-br ${sample.color} flex items-center justify-center relative`}>
                        <div className="bg-white/10 p-3 rounded-full backdrop-blur-md shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                           <div className="text-white">
                              {React.cloneElement(sample.icon as React.ReactElement<any>, { size: 28 })}
                           </div>
                        </div>
                        <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/30 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                           {sample.settings.width}x{sample.settings.height}
                        </div>
                    </div>

                    {/* Content - Compacted */}
                    <div className="p-3 flex-1 flex flex-col">
                       <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">
                          {sample.name}
                       </h3>
                       <p className="text-xs text-slate-400 mb-3 flex-1 line-clamp-3 leading-relaxed">
                          {sample.description}
                       </p>
                       
                       <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 font-mono">
                          <span>{sample.screens.length} Scrn</span>
                          <span className="truncate max-w-[80px] text-right" title={sample.settings.targetDevice}>{sample.settings.targetDevice?.replace(/_/g, ' ') || 'Custom'}</span>
                       </div>

                       <button 
                         onClick={() => onSelectSample(sample)}
                         className="w-full py-1.5 bg-slate-700 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                       >
                          Load <ArrowRight size={12} />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-850 border-t border-slate-700 text-center text-[10px] text-slate-500">
           Note: Loading a template will overwrite your current project workspace.
        </div>

      </div>
    </div>
  );
};

export default SampleCatalogue;