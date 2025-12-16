
import React, { useState } from 'react';
import { WidgetType, Layer, Screen, Widget, AISettings } from '../types';
import { generateSingleWidget } from '../services/aiService';
import {
  Square,
  Type,
  Sliders,
  CheckSquare,
  CircleDashed,
  Box,
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
  Grid,
  Monitor,
  Lightbulb, // For LED
  Keyboard, // For Keyboard
  Calendar, // For Calendar
  Aperture, // For ColorWheel
  Loader, // For Spinner
  Sparkles,
  Loader2,
  List, // For List
  Table, // For Table
  LayoutGrid,
  AppWindow,
  LayoutDashboard,
  MenuSquare,
  MessageCircle,
  ImagePlus,
  Activity,
  Ruler,
  Film,
  FileVideo,
  Palette,
  Spline,
  Pilcrow,
  MousePointerClick,
  RectangleHorizontal,
  ToggleRight,
  Scroll,
  ChevronsUpDown,
  AlignLeft,
  ListFilter,
  Files,
  Cuboid,
  Languages
} from 'lucide-react';

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
  onAddWidgetFromAI: (partialWidget: Partial<Widget>) => void;
  screens: Screen[];
  activeScreenId: string;
  onSetActiveScreen: (id: string) => void;
  onAddScreen: () => void;
  onDeleteScreen: (id: string) => void;
  aiSettings: AISettings;
}

const WidgetPalette: React.FC<WidgetPaletteProps> = ({
  onAddWidget,
  onAddWidgetFromAI,
  screens,
  activeScreenId,
  onSetActiveScreen,
  onAddScreen,
  onDeleteScreen,
  aiSettings
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'screens'>('widgets');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const widgets = [
    { type: WidgetType.BUTTON, icon: <MousePointerClick size={18} />, label: 'Button', description: 'Clickable button to trigger events.' },
    { type: WidgetType.LABEL, icon: <Type size={18} />, label: 'Label', description: 'Display static or dynamic text.' },
    { type: WidgetType.ICON, icon: <Star size={18} />, label: 'Icon', description: 'Display a vector symbol.' },
    { type: WidgetType.SLIDER, icon: <Sliders size={18} />, label: 'Slider', description: 'Select a value from a range by dragging.' },
    { type: WidgetType.BAR, icon: <RectangleHorizontal size={18} />, label: 'Bar', description: 'Visual indicator of a value/progress.' },
    { type: WidgetType.SWITCH, icon: <ToggleRight size={18} />, label: 'Switch', description: 'Toggle binary state (On/Off).' },
    { type: WidgetType.CHECKBOX, icon: <CheckSquare size={18} />, label: 'Checkbox', description: 'Toggle an option selection.' },
    { type: WidgetType.ARC, icon: <CircleDashed size={18} />, label: 'Arc', description: 'Circular value indicator or loader.' },
    { type: WidgetType.SPINNER, icon: <Loader size={18} />, label: 'Spinner', description: 'Indicates background activity.' },
    { type: WidgetType.COLORWHEEL, icon: <Aperture size={18} />, label: 'Color Wheel', description: 'Circular color selector.' },
    { type: WidgetType.CONTAINER, icon: <Box size={18} />, label: 'Container', description: 'Wrapper to group other widgets.' },
    { type: WidgetType.LIST, icon: <List size={18} />, label: 'List', description: 'Vertical list of text items or buttons.' },
    { type: WidgetType.TABLE, icon: <Table size={18} />, label: 'Table', description: 'Organize data in rows and columns.' },
    { type: WidgetType.SPINBOX, icon: <ChevronsUpDown size={18} />, label: 'Spinbox', description: 'Numeric input with +/- buttons.' },
    { type: WidgetType.TEXT_AREA, icon: <AlignLeft size={18} />, label: 'Text Area', description: 'Multi-line text input field.' },
    { type: WidgetType.KEYBOARD, icon: <Keyboard size={18} />, label: 'Keyboard', description: 'Virtual onscreen keyboard.' },
    { type: WidgetType.CALENDAR, icon: <Calendar size={18} />, label: 'Calendar', description: 'Date picker and month view.' },
    { type: WidgetType.DROPDOWN, icon: <ListFilter size={18} />, label: 'Dropdown', description: 'Select one option from a list.' },
    { type: WidgetType.ROLLER, icon: <Scroll size={18} />, label: 'Roller', description: 'Scrollable drum selector.' },
    { type: WidgetType.LED, icon: <Lightbulb size={18} />, label: 'LED', description: 'Circular light indicator.' },
    { type: WidgetType.CHART, icon: <BarChart3 size={18} />, label: 'Chart', description: 'Visualize data points graphically.' },
    { type: WidgetType.IMAGE, icon: <ImageIcon size={18} />, label: 'Image', description: 'Display a bitmap image.' },
    { type: WidgetType.TABVIEW, icon: <Files size={18} />, label: 'Tab View', description: 'Organize content into tabbed pages.' },
    { type: WidgetType.BUTTONMATRIX, icon: <LayoutGrid size={18} />, label: 'Btn Matrix', description: 'Grid of multiple buttons.' },
    { type: WidgetType.WIN, icon: <AppWindow size={18} />, label: 'Window', description: 'Floating window with header & close button.' },
    { type: WidgetType.TILEVIEW, icon: <LayoutDashboard size={18} />, label: 'Tile View', description: 'Swipeable grid of pages.' },
    { type: WidgetType.MENU, icon: <MenuSquare size={18} />, label: 'Menu', description: 'Complex sidebar navigation menu.' },
    { type: WidgetType.IMAGEBUTTON, icon: <ImagePlus size={18} />, label: 'Img Button', description: 'Button using custom images for states.' },
    { type: WidgetType.MSGBOX, icon: <MessageCircle size={18} />, label: 'Msg Box', description: 'Modal dialog with text and buttons.' },
    { type: WidgetType.LINE, icon: <Activity size={18} />, label: 'Line', description: 'Draw straight connecting lines.' },
    { type: WidgetType.SCALE, icon: <Ruler size={18} />, label: 'Scale', description: 'Linear scale with ticks and labels.' },
    { type: WidgetType.ANIMIMG, icon: <Film size={18} />, label: 'Anim Img', description: 'Frame-based image animation.' },
    { type: WidgetType.LOTTIE, icon: <FileVideo size={18} />, label: 'Lottie', description: 'Vector animation player.' },
    { type: WidgetType.TEXTURE3D, icon: <Cuboid size={18} />, label: '3D Tex', description: 'Render 3D textures/models.' },
    { type: WidgetType.CANVAS, icon: <Palette size={18} />, label: 'Canvas', description: 'Buffer for custom drawing operations.' },
    { type: WidgetType.ARCLABEL, icon: <Spline size={18} />, label: 'Arc Label', description: 'Text rendered along a curve.' },
    { type: WidgetType.SPANGROUP, icon: <Pilcrow size={18} />, label: 'Span Grp', description: 'Rich text with multiple styles.' },
    { type: WidgetType.IMEPINYIN, icon: <Languages size={18} />, label: 'Pinyin', description: 'Chinese Pinyin input method.' },
  ];

  const [hoveredWidgetType, setHoveredWidgetType] = useState<WidgetType | null>(null);

  const handleDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAIGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const widgetData = await generateSingleWidget(prompt, aiSettings);
      onAddWidgetFromAI(widgetData);
      setPrompt(''); // Clear after success
    } catch (error) {
      alert("Failed to generate widget. Check API settings.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTabButton = (id: 'widgets' | 'screens', icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors ${activeTab === id ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
      title={label}
    >
      {icon} <span className="hidden xl:inline">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full select-none">

      {/* Tab Header */}
      <div className="flex border-b border-slate-700">
        {renderTabButton('widgets', <Grid size={14} />, 'Widgets')}
        {renderTabButton('screens', <Monitor size={14} />, 'Screens')}
      </div>

      {activeTab === 'widgets' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* AI Generator Input */}
          <div className="p-3 border-b border-slate-700 bg-slate-800/30">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Sparkles size={10} className="text-purple-400" /> AI Generator
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                placeholder="e.g. Red round button..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-1.5 rounded transition-colors"
                title="Generate Widget"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-400">
              Screen: <span className="text-blue-400 font-bold">{screens.find(s => s.id === activeScreenId)?.name}</span>
            </p>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto flex-1">
            {widgets.map((widget) => (
              <div
                key={widget.type}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.type)}
                onClick={() => onAddWidget(widget.type)}
                onMouseEnter={() => setHoveredWidgetType(widget.type)}
                onMouseLeave={() => setHoveredWidgetType(null)}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 hover:ring-2 hover:ring-blue-500 transition-all border border-slate-700 text-slate-300 group cursor-grab active:cursor-grabbing relative"
              >
                <div className="mb-2 text-blue-400 group-hover:text-blue-300 pointer-events-none">
                  {widget.icon}
                </div>
                <span className="text-xs font-medium pointer-events-none">{widget.label}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700 min-h-[60px] flex items-center justify-center bg-slate-950">
            {hoveredWidgetType ? (
              <div className="text-center animate-in fade-in duration-200">
                <div className="text-blue-400 font-bold text-xs mb-0.5">
                  {widgets.find(w => w.type === hoveredWidgetType)?.label}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {widgets.find(w => w.type === hoveredWidgetType)?.description}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center">
                Drag & Drop or Click to add
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'screens' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
            <h3 className="text-xs font-bold text-slate-400 uppercase">App Screens</h3>
            <button
              onClick={onAddScreen}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors"
              title="Add Screen"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {screens.map(screen => (
              <div
                key={screen.id}
                onClick={() => onSetActiveScreen(screen.id)}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${activeScreenId === screen.id
                  ? 'bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/20'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor size={16} className={activeScreenId === screen.id ? 'text-blue-400' : 'text-slate-500'} />
                    <span className={`text-sm font-medium ${activeScreenId === screen.id ? 'text-white' : 'text-slate-300'}`}>
                      {screen.name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteScreen(screen.id); }}
                    disabled={screens.length <= 1}
                    className="p-1 rounded hover:bg-red-900/50 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
                    title="Delete Screen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex gap-2 text-[10px] text-slate-500">
                  <span>{screen.widgets.length} Widgets</span>
                  <span>•</span>
                  <span>{screen.layers.length} Layers</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-700 text-[10px] text-slate-500 text-center">
            {screens.length} Screens in project
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetPalette;
