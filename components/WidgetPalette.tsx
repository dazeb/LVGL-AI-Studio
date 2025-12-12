import React from 'react';
import { WidgetType } from '../types';
import { 
  Square, 
  Type, 
  Sliders, 
  ToggleLeft, 
  CheckSquare, 
  CircleDashed, 
  Box,
  MessageSquare,
  BarChart3,
  Image as ImageIcon
} from 'lucide-react';

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
}

const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget }) => {
  const widgets = [
    { type: WidgetType.BUTTON, icon: <Square size={18} />, label: 'Button' },
    { type: WidgetType.LABEL, icon: <Type size={18} />, label: 'Label' },
    { type: WidgetType.SLIDER, icon: <Sliders size={18} />, label: 'Slider' },
    { type: WidgetType.SWITCH, icon: <ToggleLeft size={18} />, label: 'Switch' },
    { type: WidgetType.CHECKBOX, icon: <CheckSquare size={18} />, label: 'Checkbox' },
    { type: WidgetType.ARC, icon: <CircleDashed size={18} />, label: 'Arc' },
    { type: WidgetType.CONTAINER, icon: <Box size={18} />, label: 'Container' },
    { type: WidgetType.TEXT_AREA, icon: <MessageSquare size={18} />, label: 'Text Area' },
    { type: WidgetType.CHART, icon: <BarChart3 size={18} />, label: 'Chart' },
    { type: WidgetType.IMAGE, icon: <ImageIcon size={18} />, label: 'Image' },
  ];

  const handleDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full select-none">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Box className="text-blue-500" /> Toolbox
        </h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
        {widgets.map((widget) => (
          <div
            key={widget.type}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.type)}
            onClick={() => onAddWidget(widget.type)}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 hover:ring-2 hover:ring-blue-500 transition-all border border-slate-700 text-slate-300 group cursor-grab active:cursor-grabbing"
          >
            <div className="mb-2 text-blue-400 group-hover:text-blue-300 pointer-events-none">
              {widget.icon}
            </div>
            <span className="text-xs font-medium pointer-events-none">{widget.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Drag & Drop or Click to add
        </p>
      </div>
    </div>
  );
};

export default WidgetPalette;