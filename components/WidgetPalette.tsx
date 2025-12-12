
import React, { useState } from 'react';
import { WidgetType, Layer } from '../types';
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
  Image as ImageIcon,
  Star,
  Layers,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Grid
} from 'lucide-react';

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
  layers: Layer[];
  activeLayerId: string;
  onSetActiveLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleLayerVisible: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
}

const WidgetPalette: React.FC<WidgetPaletteProps> = ({ 
  onAddWidget,
  layers,
  activeLayerId,
  onSetActiveLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleLayerVisible,
  onToggleLayerLock
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'layers'>('widgets');

  const widgets = [
    { type: WidgetType.BUTTON, icon: <Square size={18} />, label: 'Button' },
    { type: WidgetType.LABEL, icon: <Type size={18} />, label: 'Label' },
    { type: WidgetType.ICON, icon: <Star size={18} />, label: 'Icon' },
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
      
      {/* Tab Header */}
      <div className="flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('widgets')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'widgets' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Grid size={14} /> Widgets
        </button>
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'layers' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layers size={14} /> Layers
        </button>
      </div>

      {activeTab === 'widgets' ? (
        <>
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-400">
              Adding to: <span className="text-blue-400 font-bold">{layers.find(l => l.id === activeLayerId)?.name}</span>
            </p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto flex-1">
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
          <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Drag & Drop or Click to add
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
             <h3 className="text-xs font-bold text-slate-400 uppercase">Layer Hierarchy</h3>
             <button 
                onClick={onAddLayer}
                disabled={layers.length >= 5}
                className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={layers.length >= 5 ? "Max 5 layers" : "Add Layer"}
             >
                <Plus size={16} />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {/* Render reversed so top layer is at top of list */}
             {[...layers].reverse().map(layer => (
                <div 
                   key={layer.id}
                   onClick={() => onSetActiveLayer(layer.id)}
                   className={`flex items-center gap-2 p-2 rounded border transition-all cursor-pointer ${
                      activeLayerId === layer.id 
                      ? 'bg-blue-900/30 border-blue-500/50' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                   }`}
                >
                   <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${activeLayerId === layer.id ? 'text-white' : 'text-slate-300'}`}>
                         {layer.name}
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1">
                      <button 
                         onClick={(e) => { e.stopPropagation(); onToggleLayerLock(layer.id); }}
                         className={`p-1.5 rounded hover:bg-slate-700 ${layer.locked ? 'text-amber-500' : 'text-slate-500'}`}
                         title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                      >
                         {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      
                      <button 
                         onClick={(e) => { e.stopPropagation(); onToggleLayerVisible(layer.id); }}
                         className={`p-1.5 rounded hover:bg-slate-700 ${layer.visible ? 'text-slate-300' : 'text-slate-600'}`}
                         title={layer.visible ? "Hide Layer" : "Show Layer"}
                      >
                         {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      
                      <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                         disabled={layers.length <= 1}
                         className={`p-1.5 rounded hover:bg-red-900/50 text-slate-500 hover:text-red-400 disabled:opacity-0`}
                         title="Delete Layer"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             ))}
          </div>
          
          <div className="p-3 border-t border-slate-700 text-[10px] text-slate-500 text-center">
             {layers.length} / 5 layers used
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetPalette;
