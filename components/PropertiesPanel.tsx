
import React, { useState, useEffect, useCallback } from 'react';
import { Widget, CanvasSettings, WidgetType, StylePreset, WidgetStyle, Screen, WidgetEvent, EventTrigger, EventAction, Layer, DevicePreset } from '../types';
import { PROJECT_THEMES, DEVICE_PRESETS, LVGL_FONTS } from '../constants';
import InfoTooltip from './InfoTooltip';
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
  Play,
  RotateCcw,
  ChevronDown,
  Flag,
  Shield,
  MousePointer2,
  ScrollText,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

// --- Helper Functions for Hex/Alpha ---
const getAlpha = (hex?: string) => {
  if (!hex) return 100;
  if (hex.length === 9) { // #RRGGBBAA
    return Math.round((parseInt(hex.slice(7), 16) / 255) * 100);
  }
  return 100;
};

const setAlpha = (hex: string | undefined, alpha: number) => {
  const base = (hex && hex.length >= 7) ? hex.slice(0, 7) : '#000000';
  if (alpha === 100) return base; // Standard hex if fully opaque
  const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
  return `${base}${a}`;
};

const getBaseColor = (hex?: string) => {
  if (!hex) return '#000000';
  return hex.slice(0, 7);
};

// --- Smart Input Component to prevent History spam ---
// commits changes only on blur or Enter key
interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onCommit: (value: string) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ value, onCommit, ...props }) => {
  const [localValue, setLocalValue] = useState<string>(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleBlur = () => {
    if (localValue !== String(value)) {
      onCommit(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Triggers handleBlur
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

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
  onRenameLayer: (id: string, name: string) => void;
  onReorderLayers: (draggedId: string, targetId: string) => void;
}

const LVGL_SYMBOLS_LIST = [
  'LV_SYMBOL_HOME', 'LV_SYMBOL_SETTINGS', 'LV_SYMBOL_OK', 'LV_SYMBOL_CLOSE', 'LV_SYMBOL_PLUS', 'LV_SYMBOL_MINUS',
  'LV_SYMBOL_EDIT', 'LV_SYMBOL_SAVE', 'LV_SYMBOL_WIFI', 'LV_SYMBOL_BLUETOOTH', 'LV_SYMBOL_GPS', 'LV_SYMBOL_USB',
  'LV_SYMBOL_CHARGE', 'LV_SYMBOL_BATTERY_FULL', 'LV_SYMBOL_BATTERY_3', 'LV_SYMBOL_BATTERY_2', 'LV_SYMBOL_BATTERY_1',
  'LV_SYMBOL_BATTERY_EMPTY', 'LV_SYMBOL_CALL', 'LV_SYMBOL_PLAY', 'LV_SYMBOL_PAUSE', 'LV_SYMBOL_STOP', 'LV_SYMBOL_NEXT',
  'LV_SYMBOL_PREV', 'LV_SYMBOL_BELL', 'LV_SYMBOL_TRASH', 'LV_SYMBOL_USER', 'LV_SYMBOL_POWER', 'LV_SYMBOL_KEYBOARD',
  'LV_SYMBOL_UPLOAD', 'LV_SYMBOL_DOWNLOAD', 'LV_SYMBOL_EYE_OPEN', 'LV_SYMBOL_EYE_CLOSE', 'LV_SYMBOL_VOLUME_MAX',
  'LV_SYMBOL_MUTE', 'LV_SYMBOL_SHUFFLE', 'LV_SYMBOL_LOOP',
  'LV_SYMBOL_CLOUD', 'LV_SYMBOL_SERVER', 'LV_SYMBOL_DATABASE', 'LV_SYMBOL_NETWORK', 'LV_SYMBOL_GLOBE',
  'LV_SYMBOL_REFRESH', 'LV_SYMBOL_COPY', 'LV_SYMBOL_PASTE', 'LV_SYMBOL_CUT', 'LV_SYMBOL_BACKSPACE',
  'LV_SYMBOL_NEW_LINE', 'LV_SYMBOL_SD_CARD', 'LV_SYMBOL_DRIVE', 'LV_SYMBOL_AUDIO', 'LV_SYMBOL_VIDEO',
  'LV_SYMBOL_LIST', 'LV_SYMBOL_TINT', 'LV_SYMBOL_IMAGE'
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
  onRenameLayer,
  onReorderLayers
}) => {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [tempLayerName, setTempLayerName] = useState('');

  // Helper functions
  const handleStartRename = (id: string, name: string) => {
    setEditingLayerId(id);
    setTempLayerName(name);
  };

  const handleFinishRename = () => {
    if (editingLayerId && tempLayerName.trim()) {
      onRenameLayer(editingLayerId, tempLayerName.trim());
    }
    setEditingLayerId(null);
  };

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
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Screen Name
              <InfoTooltip text="Unique identifier for this screen in the generated code." />
            </label>
            <SmartInput
              type="text"
              value={currentScreen.name}
              onCommit={(val) => onUpdateScreen({ name: val })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Background Color
              <InfoTooltip text="Global background color for this specific screen." />
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={getBaseColor(currentScreen.backgroundColor)}
                onChange={(e) => onUpdateScreen({ backgroundColor: e.target.value })} // Simple solid color for background for now
                className="h-8 w-8 bg-transparent border-0 cursor-pointer"
              />
              <SmartInput
                type="text"
                value={currentScreen.backgroundColor}
                onCommit={(val) => onUpdateScreen({ backgroundColor: val })}
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
                <InfoTooltip text="Manage Z-index ordering. Drag to reorder. Lock to prevent editing. Hide to exclude from AI context." />
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
                  className={`flex items-center gap-2 p-2 rounded border transition-all cursor-pointer group ${activeLayerId === layer.id
                    ? 'bg-blue-900/30 border-blue-500/50'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    } hover:shadow-md cursor-grab active:cursor-grabbing`}
                >
                  <div className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300">
                    <GripVertical size={12} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingLayerId === layer.id ? (
                      <input
                        type="text"
                        value={tempLayerName}
                        onChange={(e) => setTempLayerName(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename();
                          if (e.key === 'Escape') setEditingLayerId(null);
                        }}
                        autoFocus
                        className="w-full bg-slate-900 border border-blue-500 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className={`text-xs font-medium truncate ${activeLayerId === layer.id ? 'text-white' : 'text-slate-300'}`}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(layer.id, layer.name);
                        }}
                        title="Double-click to rename"
                      >
                        {layer.name}
                      </div>
                    )}
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
            <InfoTooltip text="Applies a predefined color scheme to ALL widgets in the project. Useful for quick styling." />
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(PROJECT_THEMES).map(theme => (
              <button
                key={theme.id}
                onClick={() => onApplyTheme(theme.id)}
                className={`p-2 rounded border text-left transition-all ${settings.theme === theme.id
                  ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.background }}></div>
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.primary }}></div>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Project Name
              <InfoTooltip text="Used for the filename when exporting or saving your project." />
            </label>
            <SmartInput
              type="text"
              value={settings.projectName}
              onCommit={(val) => onUpdateSettings({ ...settings, projectName: val })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-2">
              <Smartphone size={12} /> Target Device
              <InfoTooltip text="Sets the canvas dimensions to match popular embedded display modules." />
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
                <SmartInput
                  type="number"
                  min="0"
                  value={settings.width}
                  onCommit={(val) => onUpdateSettings({ ...settings, width: Math.max(0, parseInt(val) || 0), targetDevice: 'custom' })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
                <SmartInput
                  type="number"
                  min="0"
                  value={settings.height}
                  onCommit={(val) => onUpdateSettings({ ...settings, height: Math.max(0, parseInt(val) || 0), targetDevice: 'custom' })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1" htmlFor="settings-rotation">Screen Rotation</label>
              <div className="flex bg-slate-800 rounded p-1 border border-slate-600 text-center">
                {[0, 90, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => onUpdateSettings({ ...settings, rotation: deg as any })}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors ${settings.rotation === deg ? 'bg-blue-600 text-white shadow-sm font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                  >
                    {deg === 0 ? '0°' : deg === 90 ? '90°' : deg === 180 ? '180°' : '270°'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ ...settings, width: settings.height, height: settings.width })}
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
              <InfoTooltip text="Define logic for user interactions like Clicks or Value Changes." />
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
                    <SmartInput
                      type="text"
                      placeholder="Code (e.g. printf('Clicked'))"
                      value={evt.customCode || ''}
                      onCommit={(val) => handleUpdateEvent(evt.id, { customCode: val })}
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
              <InfoTooltip text="Save the current widget's style to reuse on other widgets." />
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

        {/* Common Features: Flags & State */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flag size={12} /> Common Features
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, hidden: !widget.flags?.hidden } })}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.hidden ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              {widget.flags?.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              Hidden
            </button>
            <button
              onClick={() => onUpdateWidget(widget.id, { state: { ...widget.state, disabled: !widget.state?.disabled } })}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.state?.disabled ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Shield size={14} /> Disabled
            </button>
            <button
              onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, clickable: widget.flags?.clickable === false ? true : false } })}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.clickable !== false ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <MousePointerClick size={14} /> Clickable
            </button>
            <button
              onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, scrollable: !widget.flags?.scrollable } })}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.scrollable ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <ScrollText size={14} /> Scrollable
            </button>
          </div>

          {/* Advanced Flags */}
          <div className="mt-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Interaction</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, checkable: !widget.flags?.checkable } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.checkable ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <MousePointerClick size={14} /> Checkable
              </button>
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, press_lock: !widget.flags?.press_lock } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.press_lock ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <Lock size={14} /> Press Lock
              </button>
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, adv_hittest: !widget.flags?.adv_hittest } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.adv_hittest ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <MousePointer2 size={14} /> Adv. Hit
              </button>
            </div>

            <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Layout & Scroll</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, floating: !widget.flags?.floating } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.floating ? 'bg-amber-900/30 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <ArrowUpToLine size={14} /> Float
              </button>
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, overflow_visible: !widget.flags?.overflow_visible } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.overflow_visible ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <Eye size={14} /> Overflow
              </button>
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, scroll_elastic: !widget.flags?.scroll_elastic } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.scroll_elastic ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <ScrollText size={14} /> Elastic
              </button>
              <button
                onClick={() => onUpdateWidget(widget.id, { flags: { ...widget.flags, scroll_momentum: !widget.flags?.scroll_momentum } })}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border transition-colors ${widget.flags?.scroll_momentum ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <ScrollText size={14} /> Momentum
              </button>
            </div>
          </div>
        </section>

        <hr className="border-slate-800" />

        {/* Layout Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Layout</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">X Pos</label>
              <SmartInput
                type="number"
                min="0"
                value={widget.x}
                onCommit={(val) => onUpdateWidget(widget.id, { x: Math.max(0, parseInt(val) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Y Pos</label>
              <SmartInput
                type="number"
                min="0"
                value={widget.y}
                onCommit={(val) => onUpdateWidget(widget.id, { y: Math.max(0, parseInt(val) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
              <SmartInput
                type="number"
                min="0"
                value={widget.width}
                onCommit={(val) => onUpdateWidget(widget.id, { width: Math.max(0, parseInt(val) || 0) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
              <SmartInput
                type="number"
                min="0"
                value={widget.height}
                onCommit={(val) => onUpdateWidget(widget.id, { height: Math.max(0, parseInt(val) || 0) })}
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
                    <SmartInput
                      type="text"
                      value={widget.text || ''}
                      onCommit={(val) => onUpdateWidget(widget.id, { text: val })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                )}
              </>
            )}

            {(widget.type === WidgetType.LABEL || widget.type === WidgetType.CHECKBOX || widget.type === WidgetType.TEXT_AREA) && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
                <SmartInput
                  type="text"
                  value={widget.text || ''}
                  onCommit={(val) => onUpdateWidget(widget.id, { text: val })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            )}
            {(widget.type === WidgetType.SLIDER || widget.type === WidgetType.ARC || widget.type === WidgetType.BAR) && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Value</label>
                  <SmartInput
                    type="number"
                    value={widget.value || 0}
                    onCommit={(val) => onUpdateWidget(widget.id, { value: parseInt(val) || 0 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Min</label>
                    <SmartInput
                      type="number"
                      value={widget.min || 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { min: parseInt(val) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max</label>
                    <SmartInput
                      type="number"
                      value={widget.max || 100}
                      onCommit={(val) => onUpdateWidget(widget.id, { max: parseInt(val) || 100 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {widget.type === WidgetType.SPINBOX && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Value</label>
                    <SmartInput
                      type="number"
                      value={widget.value || 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { value: parseInt(val) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Step</label>
                    <SmartInput
                      type="number"
                      value={widget.step || 1}
                      onCommit={(val) => onUpdateWidget(widget.id, { step: parseInt(val) || 1 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Min</label>
                    <SmartInput
                      type="number"
                      value={widget.min || 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { min: parseInt(val) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max</label>
                    <SmartInput
                      type="number"
                      value={widget.max || 100}
                      onCommit={(val) => onUpdateWidget(widget.id, { max: parseInt(val) || 100 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {widget.type === WidgetType.TEXT_AREA && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Placeholder</label>
                <SmartInput
                  type="text"
                  value={widget.placeholder || ''}
                  onCommit={(val) => onUpdateWidget(widget.id, { placeholder: val })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  placeholder="Type here..."
                />
              </div>
            )}

            {/* Options for List-type widgets */}
            {(widget.type === WidgetType.ROLLER || widget.type === WidgetType.DROPDOWN || widget.type === WidgetType.LIST || widget.type === WidgetType.TABVIEW || widget.type === WidgetType.BUTTONMATRIX) && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {widget.type === WidgetType.TABVIEW ? 'Tabs' : (widget.type === WidgetType.BUTTONMATRIX ? 'Buttons' : 'Items')} (One per line)
                  <InfoTooltip text="Enter items separated by new lines." />
                </label>
                <textarea
                  value={widget.options || ''}
                  onChange={(e) => { }} // Controlled by onBlur below, but need state if using SmartInput logic.
                  // Custom logic for TextArea since SmartInput is Input based
                  onBlur={(e) => onUpdateWidget(widget.id, { options: e.target.value })}
                  // Use defaultValue to allow editing without controlling every keystroke via parent
                  defaultValue={widget.options || ''}
                  key={widget.id + '_options'} // Force re-render if widget changes
                  className="w-full h-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder={widget.type === WidgetType.TABVIEW ? "Tab 1\nTab 2" : "Option 1\nOption 2"}
                />
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Path/Filename Reference
                    <InfoTooltip text="Used in generated code (e.g., 'S:icon.png'). Matches your embedded file system." />
                  </label>
                  <SmartInput
                    type="text"
                    value={widget.src || ''}
                    onCommit={(val) => onUpdateWidget(widget.id, { src: val })}
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

            {widget.type === WidgetType.SPANGROUP && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-400">Restyle Spans</label>
                  <button
                    onClick={() => {
                      const newSpans = [...(widget.spans || []), { id: Date.now().toString(), text: 'New Span', color: widget.style.textColor }];
                      onUpdateWidget(widget.id, { spans: newSpans });
                    }}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {(widget.spans || []).map((span, idx) => (
                    <div key={span.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={span.text}
                          onChange={(e) => {
                            const newSpans = [...(widget.spans || [])];
                            newSpans[idx] = { ...span, text: e.target.value };
                            onUpdateWidget(widget.id, { spans: newSpans });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        />
                        <button
                          onClick={() => {
                            const newSpans = (widget.spans || []).filter(s => s.id !== span.id);
                            onUpdateWidget(widget.id, { spans: newSpans });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={span.color || widget.style.textColor || '#000000'}
                          onChange={(e) => {
                            const newSpans = [...(widget.spans || [])];
                            newSpans[idx] = { ...span, color: e.target.value };
                            onUpdateWidget(widget.id, { spans: newSpans });
                          }}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                        />

                        <div className="flex bg-slate-900 rounded border border-slate-600 p-0.5">
                          <button
                            onClick={() => {
                              const newSpans = [...(widget.spans || [])];
                              newSpans[idx] = { ...span, fontWeight: span.fontWeight === 'bold' ? 'normal' : 'bold' };
                              onUpdateWidget(widget.id, { spans: newSpans });
                            }}
                            className={`p-1 rounded ${span.fontWeight === 'bold' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            <Bold size={12} />
                          </button>
                          <button
                            onClick={() => {
                              const newSpans = [...(widget.spans || [])];
                              newSpans[idx] = { ...span, fontStyle: span.fontStyle === 'italic' ? 'normal' : 'italic' };
                              onUpdateWidget(widget.id, { spans: newSpans });
                            }}
                            className={`p-1 rounded ${span.fontStyle === 'italic' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            <Italic size={12} />
                          </button>
                          <button
                            onClick={() => {
                              const newSpans = [...(widget.spans || [])];
                              newSpans[idx] = { ...span, textDecoration: span.textDecoration === 'underline' ? 'none' : 'underline' };
                              onUpdateWidget(widget.id, { spans: newSpans });
                            }}
                            className={`p-1 rounded ${span.textDecoration === 'underline' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            <Underline size={12} />
                          </button>
                        </div>

                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Size"
                            value={span.fontSize || ''}
                            onChange={(e) => {
                              const newSpans = [...(widget.spans || [])];
                              newSpans[idx] = { ...span, fontSize: parseInt(e.target.value) || undefined };
                              onUpdateWidget(widget.id, { spans: newSpans });
                            }}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Style Properties */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Style</h3>
          <div className="space-y-4">
            {/* Background Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bg_toggle"
                  checked={widget.style.backgroundColor !== 'transparent'}
                  onChange={(e) => {
                    const newColor = e.target.checked ? '#ffffff' : 'transparent';
                    onUpdateWidget(widget.id, { style: { ...widget.style, backgroundColor: newColor } });
                  }}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-offset-slate-900"
                />
                <label htmlFor="bg_toggle" className="text-xs font-medium text-slate-400 cursor-pointer select-none">Background</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getBaseColor(widget.style.backgroundColor) || '#000000'}
                  disabled={widget.style.backgroundColor === 'transparent'}
                  onChange={(e) => {
                    const base = e.target.value;
                    const currentAlpha = getAlpha(widget.style.backgroundColor);
                    onUpdateWidget(widget.id, { style: { ...widget.style, backgroundColor: setAlpha(base, currentAlpha) } });
                  }}
                  className={`h-6 w-6 bg-transparent border-0 cursor-pointer ${widget.style.backgroundColor === 'transparent' ? 'opacity-30 cursor-not-allowed' : ''}`}
                  title="Background Color"
                />
              </div>
            </div>

            {/* Text Color Row (Always enabled usually) */}
            <div className="flex items-center justify-between">
              <div className="pl-6">
                <label className="text-xs font-medium text-slate-400">Text / Icon Color</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getBaseColor(widget.style.textColor) || '#000000'}
                  onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, textColor: e.target.value } })}
                  className="h-6 w-6 bg-transparent border-0 cursor-pointer"
                  title="Text Color"
                />
              </div>
            </div>

            {/* Border Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="border_toggle"
                    checked={(widget.style.borderWidth || 0) > 0}
                    onChange={(e) => {
                      const newWidth = e.target.checked ? 1 : 0;
                      onUpdateWidget(widget.id, { style: { ...widget.style, borderWidth: newWidth } });
                    }}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="border_toggle" className="text-xs font-medium text-slate-400 cursor-pointer select-none">Border</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={getBaseColor(widget.style.borderColor) || '#000000'}
                    disabled={(widget.style.borderWidth || 0) === 0}
                    onChange={(e) => {
                      const base = e.target.value;
                      const currentAlpha = getAlpha(widget.style.borderColor);
                      onUpdateWidget(widget.id, { style: { ...widget.style, borderColor: setAlpha(base, currentAlpha) } });
                    }}
                    className={`h-6 w-6 bg-transparent border-0 cursor-pointer ${(widget.style.borderWidth || 0) === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="Border Color"
                  />
                </div>
              </div>

              {/* Border Controls (Thickness & Opacity) */}
              {(widget.style.borderWidth || 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 pl-6 pr-1">
                    <span className="text-[10px] text-slate-500 w-[45px]">Thickness</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={widget.style.borderWidth || 1}
                      onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, borderWidth: parseInt(e.target.value) } })}
                      className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-3 text-right">{widget.style.borderWidth}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-6 pr-1">
                    <span className="text-[10px] text-slate-500 w-[45px]">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={getAlpha(widget.style.borderColor)}
                      onChange={(e) => {
                        const newAlpha = parseInt(e.target.value);
                        const baseColor = getBaseColor(widget.style.borderColor);
                        onUpdateWidget(widget.id, { style: { ...widget.style, borderColor: setAlpha(baseColor, newAlpha) } });
                      }}
                      className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-3 text-right">{getAlpha(widget.style.borderColor)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Typography & Spacing */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/50">
              {/* Opacity */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Opacity (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={widget.style.opacity ?? 100}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, opacity: parseInt(e.target.value) } })}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{widget.style.opacity ?? 100}%</span>
                </div>
              </div>

              {/* Font Settings */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Font Size</label>
                  <div className="flex items-center bg-slate-800 border border-slate-600 rounded px-2">
                    <input
                      type="number"
                      value={widget.style.fontSize ?? 14}
                      onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, fontSize: parseInt(e.target.value) } })}
                      className="w-full bg-transparent py-1 text-sm text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 ml-1">px</span>
                  </div>
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Font Family</label>
                  <select
                    value={widget.style.fontFamily || 'Montserrat, sans-serif'}
                    onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, fontFamily: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  >
                    {LVGL_FONTS.map(font => (
                      <option key={font.name} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50">
              <label className="block text-xs font-medium text-slate-400 mb-2">Border & Effects</label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Corner Radius</span>
                  <SmartInput
                    type="number"
                    min="0"
                    value={widget.style.borderRadius ?? 0}
                    onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, borderRadius: parseInt(val) } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Opacity (%)</span>
                  <SmartInput
                    type="number"
                    min="0"
                    max="100"
                    value={widget.style.opacity ?? 100}
                    onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, opacity: parseInt(val) } })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Shadow</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={getBaseColor(widget.style.shadowColor) || '#000000'}
                      onChange={(e) => onUpdateWidget(widget.id, { style: { ...widget.style, shadowColor: setAlpha(e.target.value, getAlpha(widget.style.shadowColor)) } })}
                      className="w-4 h-4 bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Blur</span>
                    <SmartInput
                      type="number" min="0" value={widget.style.shadowWidth ?? 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, shadowWidth: parseInt(val) } })}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Spread</span>
                    <SmartInput
                      type="number" min="0" value={widget.style.shadowSpread ?? 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, shadowSpread: parseInt(val) } })}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">X Offset</span>
                    <SmartInput
                      type="number" value={widget.style.shadowOffsetX ?? 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, shadowOffsetX: parseInt(val) } })}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Y Offset</span>
                    <SmartInput
                      type="number" value={widget.style.shadowOffsetY ?? 0}
                      onCommit={(val) => onUpdateWidget(widget.id, { style: { ...widget.style, shadowOffsetY: parseInt(val) } })}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Entry Animations */}
            <div className="pt-2 border-t border-slate-700/50">
              <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                <Play size={12} /> Entry Animation
              </label>

              <div className="space-y-2">
                <div>
                  <select
                    value={widget.animation?.type || 'NONE'}
                    onChange={(e) => onUpdateWidget(widget.id, {
                      animation: {
                        duration: 500, delay: 0, easing: 'ease',
                        ...(widget.animation || {}),
                        type: e.target.value as any
                      }
                    })}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="NONE">None</option>
                    <option value="FADE_IN">Fade In</option>
                    <option value="SLIDE_IN_LEFT">Slide In (Left)</option>
                    <option value="SLIDE_IN_RIGHT">Slide In (Right)</option>
                    <option value="SLIDE_IN_TOP">Slide In (Top)</option>
                    <option value="SLIDE_IN_BOTTOM">Slide In (Bottom)</option>
                    <option value="SCALE_UP">Scale Up</option>
                    <option value="SCALE_DOWN">Scale Down</option>
                    <option value="BOUNCE_IN">Bounce In</option>
                    <option disabled>──────</option>
                    <option value="FADE_OUT">Fade Out</option>
                    <option value="SLIDE_OUT_LEFT">Slide Out (Left)</option>
                    <option value="SLIDE_OUT_RIGHT">Slide Out (Right)</option>
                    <option value="SLIDE_OUT_TOP">Slide Out (Top)</option>
                    <option value="SLIDE_OUT_BOTTOM">Slide Out (Bottom)</option>
                    <option value="BOUNCE_OUT">Bounce Out</option>
                  </select>
                </div>

                {widget.animation && widget.animation.type !== 'NONE' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block mb-1">Duration (ms)</span>
                      <SmartInput
                        type="number" min="0" step="100"
                        value={widget.animation.duration}
                        onCommit={(val) => onUpdateWidget(widget.id, { animation: { ...widget.animation!, duration: parseInt(val) } })}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block mb-1">Delay (ms)</span>
                      <SmartInput
                        type="number" min="0" step="100"
                        value={widget.animation.delay}
                        onCommit={(val) => onUpdateWidget(widget.id, { animation: { ...widget.animation!, delay: parseInt(val) } })}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-500 block mb-1">Easing</span>
                      <select
                        value={widget.animation.easing}
                        onChange={(e) => onUpdateWidget(widget.id, { animation: { ...widget.animation!, easing: e.target.value as any } })}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-white"
                      >
                        <option value="linear">Linear</option>
                        <option value="ease">Ease</option>
                        <option value="ease-out">Ease Out</option>
                        <option value="ease-in">Ease In</option>
                        <option value="ease-in-out">Ease In Out</option>
                        <option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Bouncy</option>
                      </select>
                    </div>
                    {/* Replay Button */}
                    <button
                      className="col-span-2 mt-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-1 rounded transition-colors"
                      onClick={() => {
                        // Hack to force replay: Toggle a 'replay' key or just let React handle it if we duplicate?
                        // Actually, changing key is best. But for now, user can click away and back.
                        // Let's implement a 'force update' by briefly setting type to NONE then back? No that's bad state.
                        // Ideally: <Canvas> uses a key={seed} that we increment?
                        // For now, just a visual "Play" icon interaction might be enough or we notify parent.
                        const current = widget.animation!;
                        onUpdateWidget(widget.id, { animation: { ...current, type: 'NONE' } });
                        setTimeout(() => {
                          onUpdateWidget(widget.id, { animation: current });
                        }, 50);
                      }}
                    >
                      <RotateCcw size={10} /> Replay Animation
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertiesPanel;
