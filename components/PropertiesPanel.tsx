import React from 'react';
import { Widget, CanvasSettings, WidgetType } from '../types';
import { Settings, Trash2, Sliders, RotateCw } from 'lucide-react';

interface PropertiesPanelProps {
  widget: Widget | null;
  settings: CanvasSettings;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateSettings: (settings: CanvasSettings) => void;
  onDeleteWidget: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  widget, 
  settings, 
  onUpdateWidget, 
  onUpdateSettings,
  onDeleteWidget
}) => {
  
  if (!widget) {
    const isLandscape = settings.width >= settings.height;

    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-500" size={18} /> Canvas Settings
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Screen Name</label>
            <input 
              type="text" 
              value={settings.name}
              onChange={(e) => onUpdateSettings({...settings, name: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
                <input 
                  type="number" 
                  value={settings.width}
                  onChange={(e) => onUpdateSettings({...settings, width: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
                <input 
                  type="number" 
                  value={settings.height}
                  onChange={(e) => onUpdateSettings({...settings, height: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button 
              onClick={() => onUpdateSettings({...settings, width: settings.height, height: settings.width})}
              className="w-full flex items-center justify-center gap-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 border border-slate-700 transition-colors"
              title="Swap Width and Height"
            >
               <RotateCw size={14} /> 
               Switch to {isLandscape ? 'Portrait' : 'Landscape'}
            </button>
          </div>

           <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={settings.backgroundColor}
                onChange={(e) => onUpdateSettings({...settings, backgroundColor: e.target.value})}
                className="h-8 w-8 bg-transparent border-0 cursor-pointer"
              />
              <input 
                type="text" 
                value={settings.backgroundColor}
                onChange={(e) => onUpdateSettings({...settings, backgroundColor: e.target.value})}
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 text-slate-500 text-xs text-center">
          Select a widget to edit properties
        </div>
      </div>
    );
  }

  // Widget Properties Mode
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="text-green-500" size={18} /> Properties
        </h2>
        <button 
          onClick={() => onDeleteWidget(widget.id)}
          className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-800 rounded"
          title="Delete Widget"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Common Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Layout</h3>
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">X Pos</label>
              <input 
                type="number" 
                value={widget.x}
                onChange={(e) => onUpdateWidget(widget.id, { x: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Y Pos</label>
              <input 
                type="number" 
                value={widget.y}
                onChange={(e) => onUpdateWidget(widget.id, { y: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
              <input 
                type="number" 
                value={widget.width}
                onChange={(e) => onUpdateWidget(widget.id, { width: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
              <input 
                type="number" 
                value={widget.height}
                onChange={(e) => onUpdateWidget(widget.id, { height: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        </section>

        {/* Specific Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Content</h3>
          <div className="space-y-3">
             {(widget.type === WidgetType.BUTTON || widget.type === WidgetType.LABEL || widget.type === WidgetType.CHECKBOX || widget.type === WidgetType.TEXT_AREA) && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
                <input 
                  type="text" 
                  value={widget.text || ''}
                  onChange={(e) => onUpdateWidget(widget.id, { text: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            )}
            {widget.type === WidgetType.TEXT_AREA && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Placeholder</label>
                <input 
                  type="text" 
                  value={widget.placeholder || ''}
                  onChange={(e) => onUpdateWidget(widget.id, { placeholder: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            )}
             {(widget.type === WidgetType.SLIDER || widget.type === WidgetType.ARC) && (
              <div className="grid grid-cols-2 gap-2">
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Value</label>
                  <input 
                    type="number" 
                    value={widget.value || 0}
                    onChange={(e) => onUpdateWidget(widget.id, { value: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max</label>
                  <input 
                    type="number" 
                    value={widget.max || 100}
                    onChange={(e) => onUpdateWidget(widget.id, { max: parseInt(e.target.value) || 100 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>
            )}
             {(widget.type === WidgetType.SWITCH || widget.type === WidgetType.CHECKBOX) && (
              <div className="flex items-center gap-2">
                 <input 
                    type="checkbox" 
                    checked={widget.checked || false}
                    onChange={(e) => onUpdateWidget(widget.id, { checked: e.target.checked })}
                    className="h-4 w-4 bg-slate-800 border border-slate-600 rounded"
                    id="checked_prop"
                  />
                  <label htmlFor="checked_prop" className="text-sm text-slate-300">Checked State</label>
              </div>
            )}
            {widget.type === WidgetType.CHART && (
              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Chart Type</label>
                 <select 
                    value={widget.chartType}
                    onChange={(e) => onUpdateWidget(widget.id, { chartType: e.target.value as 'line' | 'bar' })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                 >
                   <option value="line">Line Chart</option>
                   <option value="bar">Bar Chart</option>
                 </select>
              </div>
            )}
            {widget.type === WidgetType.IMAGE && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Source (Symbol/Path)</label>
                <input 
                  type="text" 
                  value={widget.src || ''}
                  onChange={(e) => onUpdateWidget(widget.id, { src: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            )}
          </div>
        </section>

        {/* Style Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Style</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Background</label>
                <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={widget.style.backgroundColor || '#000000'}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, backgroundColor: e.target.value } })}
                    className="h-6 w-6 bg-transparent border-0 cursor-pointer"
                  />
                </div>
             </div>
             <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Text/FG Color</label>
                <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={widget.style.textColor || '#000000'}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, textColor: e.target.value } })}
                    className="h-6 w-6 bg-transparent border-0 cursor-pointer"
                  />
                </div>
             </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Border/Accent</label>
                <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={widget.style.borderColor || '#000000'}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, borderColor: e.target.value } })}
                    className="h-6 w-6 bg-transparent border-0 cursor-pointer"
                  />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Radius</label>
                  <input 
                    type="number" 
                    value={widget.style.borderRadius || 0}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, borderRadius: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Font Size</label>
                  <input 
                    type="number" 
                    value={widget.style.fontSize || 14}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, fontSize: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
               </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertiesPanel;