import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayerAction: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onDuplicate, onDelete, onLayerAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Use mousedown to capture click before other handlers might interfere
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Ensure menu stays within viewport (basic check)
  const safeX = Math.min(x, window.innerWidth - 200); // 200px approx width
  const safeY = Math.min(y, window.innerHeight - 250); // 250px approx height

  return (
    <div 
      ref={menuRef}
      className="fixed z-[9999] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: safeY, left: safeX }}
    >
        <button 
          onClick={() => { onDuplicate(); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
        >
            <Copy size={14} /> Duplicate
        </button>
        <div className="h-px bg-slate-700 my-1" />
        <button 
          onClick={() => { onLayerAction('front'); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
        >
            <ArrowUpToLine size={14} /> Bring to Front
        </button>
        <button 
          onClick={() => { onLayerAction('forward'); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
        >
            <ArrowUp size={14} /> Bring Forward
        </button>
        <button 
          onClick={() => { onLayerAction('backward'); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
        >
            <ArrowDown size={14} /> Send Backward
        </button>
        <button 
          onClick={() => { onLayerAction('back'); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
        >
            <ArrowDownToLine size={14} /> Send to Back
        </button>
        <div className="h-px bg-slate-700 my-1" />
        <button 
          onClick={() => { onDelete(); onClose(); }} 
          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 flex items-center gap-2 transition-colors"
        >
            <Trash2 size={14} /> Delete
        </button>
    </div>
  );
};

export default ContextMenu;