
import React from 'react';
import { Widget, CanvasSettings, WidgetType, StylePreset, WidgetStyle } from '../types';
import { 
  Settings, 
  Trash2, 
  Sliders, 
  RotateCw, 
  Layers, 
  Ungroup, 
  Group,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Bookmark,
  Plus,
  X as XIcon
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedWidgets: Widget[]; // Changed from widget | null
  settings: CanvasSettings;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateSettings: (settings: CanvasSettings) => void;
  onDeleteWidgets: (ids: string[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onLayerAction: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  stylePresets: StylePreset[];
  onAddPreset: (name: string, style: WidgetStyle) => void;
  onDeletePreset: (id: string) => void;
}

const LVGL_SYMBOLS_LIST = [
  'LV_SYMBOL_HOME',
  'LV_SYMBOL_SETTINGS',
  'LV_SYMBOL_OK',
  'LV_SYMBOL_CLOSE',
  'LV_SYMBOL_PLUS',
  'LV_SYMBOL_MINUS',
  'LV_SYMBOL_EDIT',
  'LV_SYMBOL_SAVE',
  'LV_SYMBOL_WIFI',
  'LV_SYMBOL_BLUETOOTH',
  'LV_SYMBOL_GPS',
  'LV_SYMBOL_USB',
  'LV_SYMBOL_CHARGE',
  'LV_SYMBOL_BATTERY_FULL',
  'LV_SYMBOL_BATTERY_3',
  'LV_SYMBOL_BATTERY_2',
  'LV_SYMBOL_BATTERY_1',
  'LV_SYMBOL_BATTERY_EMPTY',
  'LV_SYMBOL_CALL',
  'LV_SYMBOL_PLAY',
  'LV_SYMBOL_PAUSE',
  'LV_SYMBOL_STOP',
  'LV_SYMBOL_NEXT',
  'LV_SYMBOL_PREV',
  'LV_SYMBOL_BELL',
  'LV_SYMBOL_TRASH',
  'LV_SYMBOL_USER',
  'LV_SYMBOL_POWER',
  'LV_SYMBOL_KEYBOARD',
  'LV_SYMBOL_UPLOAD',
  'LV_SYMBOL_DOWNLOAD',
  'LV_SYMBOL_EYE_OPEN',
  'LV_SYMBOL_EYE_CLOSE',
  'LV_SYMBOL_VOLUME_MAX',
  'LV_SYMBOL_MUTE',
  'LV_SYMBOL_SHUFFLE',
  'LV_SYMBOL_LOOP'
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedWidgets, 
  settings, 
  onUpdateWidget, 
  onUpdateSettings,
  onDeleteWidgets,
  onGroup,
  onUngroup,
  onLayerAction,
  stylePresets,
  onAddPreset,
  onDeletePreset
}) => {
  
  // Case 1: No selection -> Canvas Settings
  if (selectedWidgets.length === 0) {
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
          Select widgets to edit or group
        </div>
      </div>
    );
  }

  const LayerControls = () => (
     <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700 mb-4">
        <button onClick={() => onLayerAction('front')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded flex justify-center" title="Bring to Front">
          <ArrowUpToLine size={16} />
        </button>
        <button onClick={() => onLayerAction('forward')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded flex justify-center" title="Bring Forward">
          <ArrowUp size={16} />
        </button>
        <button onClick={() => onLayerAction('backward')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded flex justify-center" title="Send Backward">
          <ArrowDown size={16} />
        </button>
        <button onClick={() => onLayerAction('back')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded flex justify-center" title="Send to Back">
          <ArrowDownToLine size={16} />
        </button>
     </div>
  );

  // Case 2: Multiple selection -> Grouping Actions
  if (selectedWidgets.length > 1) {
    // Check if they are already in the same group
    const firstGroupId = selectedWidgets[0].groupId;
    const allSameGroup = firstGroupId && selectedWidgets.every(w => w.groupId === firstGroupId);
    
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-500" size={18} /> Selection ({selectedWidgets.length})
          </h2>
           <button 
            onClick={() => onDeleteWidgets(selectedWidgets.map(w => w.id))}
            className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-800 rounded"
            title="Delete Selected"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
           {/* Layer Controls */}
           <LayerControls />

           <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-3">
                 {allSameGroup 
                   ? "These widgets are grouped." 
                   : "Multiple widgets selected."}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={onGroup}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
                >
                   <Group size={16} /> Group
                </button>
                
                <button
                   onClick={onUngroup}
                   disabled={!selectedWidgets.some(w => w.groupId)}
                   className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <Ungroup size={16} /> Ungroup
                </button>
              </div>
           </div>
           
           <div className="text-xs text-slate-500">
              To edit specific properties, select a single widget.
           </div>
        </div>
      </div>
    );
  }

  // Case 3: Single Widget -> Full Property Editor
  const widget = selectedWidgets[0];

  const handleApplyPreset = (preset: StylePreset) => {
    onUpdateWidget(widget.id, { style: { ...widget.style, ...preset.style } });
  };

  const handleSaveCurrentAsPreset = () => {
    const name = prompt("Enter a name for this style preset:", "My Custom Style");
    if (name) {
      onAddPreset(name, widget.style);
    }
  };
  
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="text-green-500" size={18} /> Properties
        </h2>
        <div className="flex gap-1">
          {widget.groupId && (
             <button 
               onClick={onUngroup}
               className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
               title="Ungroup"
             >
               <Ungroup size={18} />
             </button>
          )}
          <button 
            onClick={() => onDeleteWidgets([widget.id])}
            className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-800 rounded"
            title="Delete Widget"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Layer Controls */}
        <LayerControls />

        {/* Presets */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Bookmark size={12} /> Style Presets
             </h3>
             <button 
               onClick={handleSaveCurrentAsPreset}
               className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded px-2 py-0.5 flex items-center gap-1 transition-colors"
               title="Save current style"
             >
               <Plus size={12} /> Save
             </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {stylePresets.map(preset => (
              <div 
                key={preset.id} 
                className="group relative flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full pl-3 pr-1 py-1 transition-all cursor-pointer"
              >
                <span onClick={() => handleApplyPreset(preset)} className="text-xs text-slate-300 mr-2 select-none hover:text-white">
                   {preset.name}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-600 rounded-full text-slate-400 hover:text-red-400 transition-all"
                  title="Delete preset"
                >
                   <XIcon size={12} />
                </button>
              </div>
            ))}
            {stylePresets.length === 0 && <div className="text-xs text-slate-500 italic">No presets saved</div>}
          </div>
        </section>

        <hr className="border-slate-800" />

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
            {widget.type === WidgetType.ICON && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Symbol</label>
                <select 
                   value={widget.symbol || 'LV_SYMBOL_HOME'}
                   onChange={(e) => onUpdateWidget(widget.id, { symbol: e.target.value })}
                   className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                >
                   {LVGL_SYMBOLS_LIST.map(sym => (
                      <option key={sym} value={sym}>{sym.replace('LV_SYMBOL_', '')}</option>
                   ))}
                </select>
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
