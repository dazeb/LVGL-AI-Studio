import React, { useState, useCallback } from 'react';
import { Widget, CanvasSettings, WidgetType, CodeLanguage } from './types';
import { DEFAULT_CANVAS_SETTINGS, DEFAULT_WIDGET_PROPS } from './constants';
import WidgetPalette from './components/WidgetPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import CodeViewer from './components/CodeViewer';
import { generateLVGLCode } from './services/geminiService';
import { Code, MonitorPlay } from 'lucide-react';

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('c');

  const selectedWidget = widgets.find(w => w.id === selectedId) || null;

  const handleAddWidget = (type: WidgetType, x?: number, y?: number) => {
    const defaultProps = DEFAULT_WIDGET_PROPS[type];
    
    // Determine position: use provided x,y or default with offset
    let posX = x !== undefined ? x : 20;
    let posY = y !== undefined ? y : 20;

    // If no specific coordinates provided, offset slightly to avoid stacking
    if (x === undefined && widgets.length > 0) {
       posX += 10;
       posY += 10;
    }

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type,
      name: `${type}_${widgets.filter(w => w.type === type).length + 1}`,
      x: posX,
      y: posY,
      ...defaultProps,
      // Deep copy style to avoid reference issues
      style: { ...defaultProps.style } 
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedId(newWidget.id);
  };

  const handleUpdateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === id) {
        // If style is updated, merge it carefully
        const newStyle = updates.style ? { ...w.style, ...updates.style } : w.style;
        return { ...w, ...updates, style: newStyle };
      }
      return w;
    }));
  }, []);

  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleGenerateCode = async () => {
    setShowCode(true);
    // Always regenerate to capture latest changes
    setIsGenerating(true);
    const generated = await generateLVGLCode(widgets, settings, codeLanguage);
    setCode(generated);
    setIsGenerating(false);
  };

  // Effect to re-generate when language changes inside the modal
  const handleLanguageChange = async (lang: CodeLanguage) => {
    setCodeLanguage(lang);
    if (showCode) {
      setIsGenerating(true);
      const generated = await generateLVGLCode(widgets, settings, lang);
      setCode(generated);
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <MonitorPlay size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-lg text-white tracking-tight">LVGL Studio <span className="text-blue-500">AI</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500 hidden md:block">
            {widgets.length} widgets • {settings.width}x{settings.height}
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
             <select 
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)}
              className="bg-transparent text-xs font-medium text-slate-300 focus:outline-none px-2 py-1 cursor-pointer hover:text-white"
            >
              <option value="c">C (LVGL)</option>
              <option value="micropython">MicroPython</option>
            </select>
          </div>

          <button 
            onClick={handleGenerateCode}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
          >
            <Code size={16} /> Generate Code
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <WidgetPalette onAddWidget={handleAddWidget} />
        
        <Canvas 
          widgets={widgets} 
          settings={settings} 
          selectedId={selectedId}
          onSelectWidget={setSelectedId}
          onUpdateWidget={handleUpdateWidget}
          onAddWidget={handleAddWidget}
        />
        
        <PropertiesPanel 
          widget={selectedWidget}
          settings={settings}
          onUpdateWidget={handleUpdateWidget}
          onUpdateSettings={setSettings}
          onDeleteWidget={handleDeleteWidget}
        />
      </main>

      {/* Code Modal */}
      {showCode && (
        <CodeViewer 
          code={code}
          language={codeLanguage}
          isLoading={isGenerating}
          onClose={() => setShowCode(false)}
          onRefresh={handleGenerateCode}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </div>
  );
};

export default App;