import React, { useState } from 'react';
import { Widget, CanvasSettings, WidgetType, StylePreset, WidgetStyle, Screen, WidgetEvent, EventTrigger, EventAction, Layer, DevicePreset } from '../types';
import { PROJECT_THEMES, DEVICE_PRESETS } from '../constants';
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
  X as XIcon,
  MousePointerClick,
  Zap,
  Code,
  Palette,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Image as ImageIcon,
  Smartphone,
  ChevronDown
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedWidgets: Widget[];
  settings: CanvasSettings;
  currentScreen: Screen;
  allScreens: Screen[];
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateSettings: (settings: CanvasSettings) => void;
  onUpdateScreen: (updates: Partial<Screen>) => void;
  onDeleteWidgets: (ids: string[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onLayerAction: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  stylePresets: StylePreset[];
  onAddPreset: (name: string, style: WidgetStyle) => void;
  onDeletePreset: (id: string) => void;
  onApplyTheme: (themeId: string) => void;
  
  // Layer Management
  layers: Layer[];
  activeLayerId: string;
  onSetActiveLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleLayerVisible: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onReorderLayers: (draggedId: string, targetId: string) => void;
}

const LVGL_SYMBOLS_LIST = [
  'LV_SYMBOL_HOME', 'LV_SYMBOL_SETTINGS', 'LV_SYMBOL_OK', 'LV_SYMBOL_CLOSE', 'LV_SYMBOL_PLUS', 'LV_SYMBOL_MINUS',
  'LV_SYMBOL_EDIT', 'LV_SYMBOL_SAVE', 'LV_SYMBOL_WIFI', 'LV_SYMBOL_BLUETOOTH', 'LV_SYMBOL_GPS', 'LV_SYMBOL_USB',
  'LV_SYMBOL_CHARGE', 'LV_SYMBOL_BATTERY_FULL', 'LV_SYMBOL_BATTERY_3', 'LV_SYMBOL_BATTERY_2', 'LV_SYMBOL_BATTERY_1',
  'LV_SYMBOL_BATTERY_EMPTY', 'LV_SYMBOL_CALL', 'LV_SYMBOL_PLAY', 'LV_SYMBOL_PAUSE', 'LV_SYMBOL_STOP', 'LV_SYMBOL_NEXT',
  'LV_SYMBOL_PREV', 'LV_SYMBOL_BELL', 'LV_SYMBOL_TRASH', 'LV_SYMBOL_USER', 'LV_SYMBOL_POWER', 'LV_SYMBOL_KEYBOARD',
  'LV_SYMBOL_UPLOAD', 'LV_SYMBOL_DOWNLOAD', 'LV_SYMBOL_EYE_OPEN', 'LV_SYMBOL_EYE_CLOSE', 'LV_SYMBOL_VOLUME_MAX',
  'LV_SYMBOL_MUTE', 'LV_SYMBOL_SHUFFLE', 'LV_SYMBOL_LOOP'
];

const EVENT_TRIGGERS: EventTrigger[] = ['CLICKED', 'PRESSED', 'RELEASED', 'VALUE_CHANGED', 'FOCUSED', 'DEFOCUSED'];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedWidgets, 
  settings, 
  currentScreen,
  allScreens,
  onUpdateWidget, 
  onUpdateSettings,
  onUpdateScreen,
  onDeleteWidgets,
  onGroup,
  onUngroup,
  onLayerAction,
  stylePresets,
  onAddPreset,
  onDeletePreset,
  onApplyTheme,
  layers,
  activeLayerId,
  onSetActiveLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleLayerVisible,
  onToggleLayerLock,
  onReorderLayers
}) => {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  
  // Case 1: No selection -> Screen Settings
  if (selectedWidgets.length === 0) {
    const isLandscape = settings.width >= settings.height;

    // Group Presets by Manufacturer
    const groupedPresets = DEVICE_PRESETS.reduce((acc, preset) => {
        if (!acc[preset.manufacturer]) acc[preset.manufacturer] = [];
        acc[preset.manufacturer].push(preset);
        return acc;
    }, {} as Record<string, DevicePreset[]>);

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const preset = DEVICE_PRESETS.find(p => p.id === val);
        if (preset) {
            onUpdateSettings({
                ...settings,
                width: preset.width,
                height: preset.height,
                targetDevice: preset.id
            });
        } else {
             onUpdateSettings({ ...settings, targetDevice: 'custom' });
        }
    };

    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-500" size={18} /> Screen Settings
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Screen Name</label>
             <input 
               type="text" 
               value={currentScreen.name}
               onChange={(e) => onUpdateScreen({ name: e.target.value })}
               className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
             />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={currentScreen.backgroundColor}
                onChange={(e) => onUpdateScreen({ backgroundColor: e.target.value })}
                className="h-8 w-8 bg-transparent border-0 cursor-pointer"
              />
              <input 
                type="text" 
                value={currentScreen.backgroundColor}
                onChange={(e) => onUpdateScreen({ backgroundColor: e.target.value })}
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <hr className="border-slate-800 my-4" />

          {/* Layer Management Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                   <Layers size={12} /> Layers
                </h3>
                <button 
                   onClick={onAddLayer}
                   disabled={layers.length >= 5}
                   className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <Plus size={10} /> Add
                </button>
            </div>
            
            <div className="space-y-1 bg-slate-800/50 p-1 rounded border border-slate-700/50">
               {/* Render reversed so top layer is at top of list */}
               {[...layers].reverse().map(layer => (
                  <div 
                     key={layer.id}
                     draggable
                     onDragStart={(e) => {
                       e.dataTransfer.setData('layerId', layer.id);
                       e.dataTransfer.effectAllowed = 'move';
                     }}
                     onDragOver={(e) => {
                        e.preventDefault(); // allow drop
                     }}
                     onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('layerId');
                        if (draggedId && draggedId !== layer.id) {
                            onReorderLayers(draggedId, layer.id);
                        }
                     }}
                     onClick={() => onSetActiveLayer(layer.id)}
                     className={`flex items-center gap-2 p-2 rounded border transition-all cursor-pointer group ${
                        activeLayerId === layer.id 
                        ? 'bg-blue-900/30 border-blue-500/50' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                     } hover:shadow-md cursor-grab active:cursor-grabbing`}
                  >
                     <div className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300">
                        <GripVertical size={12} />
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${activeLayerId === layer.id ? 'text-white' : 'text-slate-300'}`}>
                           {layer.name}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1">
                        <button 
                           onClick={(e) => { e.stopPropagation(); onToggleLayerLock(layer.id); }}
                           className={`p-1 rounded hover:bg-slate-700 ${layer.locked ? 'text-amber-500' : 'text-slate-500'}`}
                           title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                        >
                           {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        
                        <button 
                           onClick={(e) => { e.stopPropagation(); onToggleLayerVisible(layer.id); }}
                           className={`p-1 rounded hover:bg-slate-700 ${layer.visible ? 'text-slate-300' : 'text-slate-600'}`}
                           title={layer.visible ? "Hide Layer" : "Show Layer"}
                        >
                           {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        
                        <button 
                           onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                           disabled={layers.length <= 1}
                           className={`p-1 rounded hover:bg-red-900/50 text-slate-500 hover:text-red-400 disabled:opacity-0`}
                           title="Delete Layer"
                        >
                           <Trash2 size={12} />
                        </button>
                     </div>
                  </div>
               ))}
               <div className="text-[10px] text-slate-500 text-center py-1">
                 {layers.length} / 5 layers used
               </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1 italic">
               Drag and drop to reorder
            </div>
          </div>

          <hr className="border-slate-800 my-4" />

          <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Palette size={12} /> Project Theme
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
             {Object.values(PROJECT_THEMES).map(theme => (
                <button
                   key={theme.id}
                   onClick={() => onApplyTheme(theme.id)}
                   className={`p-2 rounded border text-left transition-all ${
                     settings.theme === theme.id 
                     ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50' 
                     : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                   }`}
                >
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{backgroundColor: theme.colors.background}}></div>
                      <div className="w-3 h-3 rounded-full border border-white/20" style={{backgroundColor: theme.colors.primary}}></div>
                   </div>
                   <span className={`text-xs font-medium ${settings.theme === theme.id ? 'text-white' : 'text-slate-400'}`}>
                      {theme.name}
                   </span>
                </button>
             ))}
          </div>

          <hr className="border-slate-800 my-4" />

          <h3 className="text-xs font-bold text-slate-500 uppercase">Global Project Settings</h3>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
            <input 
              type="text" 
              value={settings.projectName}
              onChange={(e) => onUpdateSettings({...settings, projectName: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-2">
                <Smartphone size={12} /> Target Device
             </label>
             <select 
                value={settings.targetDevice || 'custom'}
                onChange={handleDeviceChange}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
             >
                <option value="custom">Custom Resolution</option>
                {Object.keys(groupedPresets).map(mfr => (
                    <optgroup key={mfr} label={mfr}>
                        {groupedPresets[mfr].map(preset => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name} ({preset.width}x{preset.height})
                            </option>
                        ))}
                    </optgroup>
                ))}
             </select>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
                <input 
                  type="number" 
                  min="0"
                  value={settings.width}
                  onChange={(e) => onUpdateSettings({...settings, width: Math.max(0, parseInt(e.target.value) || 0), targetDevice: 'custom'})}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
                <input 
                  type="number" 
                  min="0"
                  value={settings.height}
                  onChange={(e) => onUpdateSettings({...settings, height: Math.max(0, parseInt(e.target.value) || 0), targetDevice: 'custom'})}
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

  // Case 2: Multiple selection
  if (selectedWidgets.length > 1) {
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
        </div>
      </div>
    );
  }

  // Case 3: Single Widget
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
            onUpdateWidget(widget.id, { 
                imageData: result,
                src: file.name,
                width: img.width > 200 ? 200 : img.width, // Set reasonable default but don't blow up canvas
                height: img.width > 200 ? (200 / img.width) * img.height : img.height
            });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
      onUpdateWidget(widget.id, { imageData: undefined, src: 'lv_img_placeholder' });
  };

  // --- Event Handlers ---
  const handleAddEvent = () => {
    const newEvent: WidgetEvent = {
      id: `evt_${Date.now()}`,
      trigger: 'CLICKED',
      action: 'NAVIGATE'
    };
    onUpdateWidget(widget.id, { events: [...(widget.events || []), newEvent] });
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<WidgetEvent>) => {
    const updatedEvents = widget.events.map(evt => evt.id === eventId ? { ...evt, ...updates } : evt);
    onUpdateWidget(widget.id, { events: updatedEvents });
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = widget.events.filter(evt => evt.id !== eventId);
    onUpdateWidget(widget.id, { events: updatedEvents });
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
        <LayerControls />

        {/* Interaction / Events Section */}
        <section className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                 <Zap size={12} /> Events
              </h3>
              <button 
                 onClick={handleAddEvent}
                 className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
              >
                 <Plus size={10} /> Add
              </button>
           </div>
           
           <div className="space-y-3">
              {(widget.events || []).length === 0 && (
                <div className="text-xs text-slate-500 italic text-center py-2">No events configured</div>
              )}
              
              {(widget.events || []).map(evt => (
                <div key={evt.id} className="bg-slate-800 p-2 rounded border border-slate-600 space-y-2">
                   {/* Trigger & Delete */}
                   <div className="flex justify-between items-center gap-2">
                      <select 
                         value={evt.trigger}
                         onChange={(e) => handleUpdateEvent(evt.id, { trigger: e.target.value as EventTrigger })}
                         className="flex-1 bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs text-white focus:outline-none"
                      >
                         {EVENT_TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button onClick={() => handleDeleteEvent(evt.id)} className="text-slate-400 hover:text-red-400">
                         <XIcon size={14} />
                      </button>
                   </div>
                   
                   {/* Action */}
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase w-10">Do:</span>
                      <select 
                         value={evt.action}
                         onChange={(e) => handleUpdateEvent(evt.id, { action: e.target.value as EventAction })}
                         className="flex-1 bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs text-white focus:outline-none"
                      >
                         <option value="NAVIGATE">Navigate To</option>
                         <option value="CUSTOM_CODE">Custom Code</option>
                      </select>
                   </div>
                   
                   {/* Parameters */}
                   {evt.action === 'NAVIGATE' ? (
                      <select 
                         value={evt.targetScreenId || ''}
                         onChange={(e) => handleUpdateEvent(evt.id, { targetScreenId: e.target.value })}
                         className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white focus:outline-none"
                      >
                         <option value="">-- Select Screen --</option>
                         {allScreens.filter(s => s.id !== currentScreen.id).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                         ))}
                      </select>
                   ) : (
                      <div className="relative">
                         <Code size={12} className="absolute top-1.5 left-1.5 text-slate-500" />
                         <input 
                           type="text" 
                           placeholder="Code (e.g. printf('Clicked'))"
                           value={evt.customCode || ''}
                           onChange={(e) => handleUpdateEvent(evt.id, { customCode: e.target.value })}
                           className="w-full bg-slate-900 border border-slate-600 rounded pl-5 pr-2 py-1 text-xs text-white focus:outline-none font-mono"
                         />
                      </div>
                   )}
                </div>
              ))}
           </div>
        </section>

        {/* Presets - Updated to Dropdown */}
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
          
          <div className="relative">
             {/* Invisible Backdrop for click-outside */}
             {isPresetDropdownOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setIsPresetDropdownOpen(false)}></div>
             )}

             <button 
               onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
               className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white flex justify-between items-center focus:outline-none focus:border-blue-500 hover:bg-slate-750 transition-colors relative z-50"
             >
               <span className="text-slate-300">Apply a preset...</span>
               <ChevronDown size={14} className={`transition-transform duration-200 ${isPresetDropdownOpen ? 'rotate-180' : ''}`} />
             </button>

             {isPresetDropdownOpen && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {stylePresets.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic text-center">No presets saved</div>
                  ) : (
                    stylePresets.map(preset => (
                      <div 
                        key={preset.id} 
                        className="flex items-center justify-between p-2 hover:bg-slate-700 group transition-colors cursor-pointer border-b border-slate-700/50 last:border-0"
                        onClick={() => {
                           handleApplyPreset(preset);
                           setIsPresetDropdownOpen(false);
                        }}
                      >
                        <span className="flex-1 text-xs text-slate-300 hover:text-white truncate">
                           {preset.name}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id); }}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-600 transition-colors"
                          title="Delete preset"
                        >
                           <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
               </div>
             )}
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* Layout Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Layout</h3>
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">X Pos</label>
              <input 
                type="number" 
                min="0"
                value={widget.x}
                onChange={(e) => onUpdateWidget(widget.id, { x: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Y Pos</label>
              <input 
                type="number" 
                min="0"
                value={widget.y}
                onChange={(e) => onUpdateWidget(widget.id, { y: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
              <input 
                type="number" 
                min="0"
                value={widget.width}
                onChange={(e) => onUpdateWidget(widget.id, { width: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
              <input 
                type="number" 
                min="0"
                value={widget.height}
                onChange={(e) => onUpdateWidget(widget.id, { height: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        </section>

        {/* Content Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Content</h3>
          <div className="space-y-3">
             {(widget.type === WidgetType.BUTTON) && (
               <>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Content Type</label>
                    <div className="flex bg-slate-800 rounded p-1 border border-slate-600">
                       <button 
                         onClick={() => onUpdateWidget(widget.id, { contentMode: 'text' })}
                         className={`flex-1 py-1 text-xs rounded transition-colors ${widget.contentMode !== 'icon' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                       >
                         Text
                       </button>
                       <button 
                         onClick={() => onUpdateWidget(widget.id, { contentMode: 'icon' })}
                         className={`flex-1 py-1 text-xs rounded transition-colors ${widget.contentMode === 'icon' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                       >
                         Icon
                       </button>
                    </div>
                 </div>

                 {widget.contentMode === 'icon' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Icon Symbol</label>
                      <select 
                         value={widget.symbol || 'LV_SYMBOL_HOME'}
                         onChange={(e) => onUpdateWidget(widget.id, { symbol: e.target.value })}
                         className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none"
                      >
                         {LVGL_SYMBOLS_LIST.map(sym => (
                            <option key={sym} value={sym}>{sym.replace('LV_SYMBOL_', '')}</option>
                         ))}
                      </select>
                    </div>
                 ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Button Text</label>
                      <input 
                        type="text" 
                        value={widget.text || ''}
                        onChange={(e) => onUpdateWidget(widget.id, { text: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      />
                    </div>
                 )}
               </>
            )}

             {(widget.type === WidgetType.LABEL || widget.type === WidgetType.CHECKBOX || widget.type === WidgetType.TEXT_AREA) && (
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
            {widget.type === WidgetType.IMAGE && (
              <div className="space-y-3">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Image Source</label>
                    <div className="flex gap-2">
                       <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors text-xs font-medium">
                          <Upload size={14} /> Upload Image
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                       </label>
                       {widget.imageData && (
                           <button 
                             onClick={handleClearImage}
                             className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-xs"
                             title="Clear Image"
                           >
                             <Trash2 size={14} />
                           </button>
                       )}
                    </div>
                 </div>
                 
                 {widget.imageData && (
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                       <img src={widget.imageData} alt="Preview" className="w-full h-auto max-h-32 object-contain rounded" />
                       <div className="mt-1 text-[10px] text-slate-500 text-center truncate">
                          Preview
                       </div>
                    </div>
                 )}

                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Path/Filename Reference</label>
                   <input 
                     type="text" 
                     value={widget.src || ''}
                     onChange={(e) => onUpdateWidget(widget.id, { src: e.target.value })}
                     className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                     placeholder="path/to/image.png"
                   />
                </div>
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
                    min="0"
                    value={widget.style.borderRadius || 0}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, borderRadius: Math.max(0, parseInt(e.target.value) || 0) } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Font Size</label>
                  <input 
                    type="number" 
                    min="0"
                    value={widget.style.fontSize || 14}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, fontSize: Math.max(0, parseInt(e.target.value) || 0) } })}
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