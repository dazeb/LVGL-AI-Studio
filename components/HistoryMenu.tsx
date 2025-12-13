
import React from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import { HistoryItem } from '../hooks/useHistory';

interface HistoryMenuProps {
  past: HistoryItem<any>[];
  onJumpTo: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const HistoryMenu: React.FC<HistoryMenuProps> = ({ past, onJumpTo, isOpen, onToggle, onClose }) => {
  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${isOpen ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
        title="History"
      >
         <History size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose}></div>
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 border-b border-slate-700 bg-slate-850 flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Project History</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
                {past.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center italic">
                        No actions yet.
                    </div>
                ) : (
                    // Display in reverse order (newest first)
                    [...past].reverse().map((item, reverseIndex) => {
                        const originalIndex = past.length - 1 - reverseIndex;
                        return (
                            <button
                                key={item.timestamp}
                                onClick={() => {
                                    onJumpTo(originalIndex);
                                    onClose();
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center gap-2 group transition-colors border-b border-slate-800 last:border-0"
                            >
                                <div className="p-1 rounded-full bg-slate-800 group-hover:bg-slate-700 text-slate-500 group-hover:text-blue-400 transition-colors">
                                    <RotateCcw size={10} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-slate-300 group-hover:text-white font-medium truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] text-slate-600">
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
            
            {past.length > 0 && (
                <div className="p-2 border-t border-slate-700 bg-slate-850 text-[10px] text-slate-500 text-center">
                    Click to restore state
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryMenu;
