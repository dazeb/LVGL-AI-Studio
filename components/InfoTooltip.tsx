
import React from 'react';
import { CircleHelp } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, side = 'top' }) => {
  let positionClass = '';
  
  switch(side) {
      case 'top': positionClass = 'bottom-full left-1/2 -translate-x-1/2 mb-2'; break;
      case 'bottom': positionClass = 'top-full left-1/2 -translate-x-1/2 mt-2'; break;
      case 'left': positionClass = 'right-full top-1/2 -translate-y-1/2 mr-2'; break;
      case 'right': positionClass = 'left-full top-1/2 -translate-y-1/2 ml-2'; break;
  }

  return (
    <div className="group relative inline-flex items-center justify-center ml-1.5 align-middle z-50">
      <CircleHelp size={12} className="text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
      <div 
        className={`absolute ${positionClass} hidden group-hover:block w-48 bg-slate-800 text-xs text-slate-200 p-2 rounded-md border border-slate-600 shadow-xl z-[100] leading-snug text-left font-normal`}
      >
        {text}
        {/* Tiny arrow */}
        <div className="absolute w-2 h-2 bg-slate-800 border-r border-b border-slate-600 transform rotate-45"
             style={{
                 bottom: side === 'top' ? '-5px' : 'auto',
                 top: side === 'bottom' ? '-5px' : 'auto',
                 left: (side === 'top' || side === 'bottom') ? '50%' : 'auto',
                 right: side === 'left' ? '-5px' : 'auto',
                 marginLeft: '-4px'
             }}
        ></div>
      </div>
    </div>
  );
};

export default InfoTooltip;
