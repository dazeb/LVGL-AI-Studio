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
  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('c');

  // Helper to get actual widget objects from IDs
  const selectedWidgets = widgets.filter(w => selectedIds.includes(w.id));

  const handleAddWidget = (type: WidgetType, x?: number, y?: number) => {
    const defaultProps = DEFAULT_WIDGET_PROPS[type];
    
    let posX = x !== undefined ? x : 20;
    let posY = y !== undefined ? y : 20;

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
      style: { ...defaultProps.style } 
    };

    setWidgets(prev => [...prev, newWidget]);
    // Auto-select the new widget
    setSelectedIds([newWidget.id]);
  };

  const handleSelectWidget = (id: string | null, isShift: boolean) => {
    if (id === null) {
      if (!isShift) setSelectedIds([]);
      return;
    }

    const targetWidget = widgets.find(w => w.id === id);
    if (!targetWidget) return;

    // Identify all widgets that should be part of this click (handle groups)
    let idsToToggle = [id];
    if (targetWidget.groupId) {
      idsToToggle = widgets.filter(w => w.groupId === targetWidget.groupId).map(w => w.id);
    }

    if (isShift) {
      // Toggle selection
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        const allPresent = idsToToggle.every(tid => newSet.has(tid));
        
        if (allPresent) {
          // Deselect all
          idsToToggle.forEach(tid => newSet.delete(tid));
        } else {
          // Select all
          idsToToggle.forEach(tid => newSet.add(tid));
        }
        return Array.from(newSet);
      });
    } else {
      // If simply clicking an unselected item (or group), replace selection.
      // If clicking something ALREADY selected, keep it selected (to allow dragging context)
      // BUT if it's a drag start, we don't want to deselect others yet. 
      // This nuance is often handled by 'mouseup' vs 'mousedown', but for now:
      // If the clicked item is already in the selection, DO NOT clear the selection,
      // because the user might be starting a drag of the multi-selection.
      // However, if the user clicked an *unselected* item, we clear and select it.
      
      const isAlreadySelected = idsToToggle.every(tid => selectedIds.includes(tid));
      if (!isAlreadySelected) {
        setSelectedIds(idsToToggle);
      }
    }
  };

  const handleUpdateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === id) {
        const newStyle = updates.style ? { ...w.style, ...updates.style } : w.style;
        return { ...w, ...updates, style: newStyle };
      }
      return w;
    }));
  }, []);

  // Batch update for moving multiple widgets
  const handleUpdateWidgets = useCallback((updates: {id: string, changes: Partial<Widget>}[]) => {
    setWidgets(prev => {
      const updateMap = new Map(updates.map(u => [u.id, u.changes]));
      return prev.map(w => {
        if (updateMap.has(w.id)) {
          const changes = updateMap.get(w.id)!;
          const newStyle = changes.style ? { ...w.style, ...changes.style } : w.style;
          return { ...w, ...changes, style: newStyle };
        }
        return w;
      });
    });
  }, []);

  const handleDeleteWidgets = (ids: string[]) => {
    setWidgets(prev => prev.filter(w => !ids.includes(w.id)));
    setSelectedIds([]);
  };

  const handleGroup = () => {
    if (selectedIds.length < 2) return;
    const newGroupId = `group_${Date.now()}`;
    handleUpdateWidgets(selectedIds.map(id => ({
      id,
      changes: { groupId: newGroupId }
    })));
  };

  const handleUngroup = () => {
    handleUpdateWidgets(selectedIds.map(id => ({
      id,
      changes: { groupId: undefined } // Remove property
    })));
  };

  const handleGenerateCode = async () => {
    setShowCode(true);
    setIsGenerating(true);
    const generated = await generateLVGLCode(widgets, settings, codeLanguage);
    setCode(generated);
    setIsGenerating(false);
  };

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
          selectedIds={selectedIds}
          onSelectWidget={handleSelectWidget}
          onUpdateWidgets={handleUpdateWidgets}
          onAddWidget={handleAddWidget}
        />
        
        <PropertiesPanel 
          selectedWidgets={selectedWidgets}
          settings={settings}
          onUpdateWidget={handleUpdateWidget} // For single edits
          onUpdateSettings={setSettings}
          onDeleteWidgets={handleDeleteWidgets}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
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