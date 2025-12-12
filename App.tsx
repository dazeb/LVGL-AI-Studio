
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Widget, CanvasSettings, WidgetType, CodeLanguage, StylePreset, WidgetStyle, Layer } from './types';
import { DEFAULT_CANVAS_SETTINGS, DEFAULT_WIDGET_PROPS } from './constants';
import WidgetPalette from './components/WidgetPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import CodeViewer from './components/CodeViewer';
import { generateLVGLCode } from './services/geminiService';
import { Code, MonitorPlay } from 'lucide-react';

const App: React.FC = () => {
  // Layer State
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer_1', name: 'Base Layer', visible: true, locked: false }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer_1');

  const [widgets, setWidgets] = useState<Widget[]>([]);
  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('c');

  // Default presets
  const [stylePresets, setStylePresets] = useState<StylePreset[]>([
    { id: 'p1', name: 'Primary', style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 8, borderWidth: 0 } },
    { id: 'p2', name: 'Outline', style: { backgroundColor: 'transparent', textColor: '#3b82f6', borderColor: '#3b82f6', borderWidth: 2, borderRadius: 8 } },
    { id: 'p3', name: 'Dark Card', style: { backgroundColor: '#1e293b', textColor: '#e2e8f0', borderColor: '#334155', borderWidth: 1, borderRadius: 12 } },
    { id: 'p4', name: 'Alert', style: { backgroundColor: '#ef4444', textColor: '#ffffff', borderRadius: 4, borderWidth: 0 } },
    { id: 'p5', name: 'Success', style: { backgroundColor: '#22c55e', textColor: '#ffffff', borderRadius: 6, borderWidth: 0 } },
    { id: 'p6', name: 'Warning', style: { backgroundColor: '#f59e0b', textColor: '#ffffff', borderRadius: 6, borderWidth: 0 } },
    { id: 'p7', name: 'Glass', style: { backgroundColor: '#ffffff20', textColor: '#ffffff', borderColor: '#ffffff40', borderWidth: 1, borderRadius: 16 } },
    { id: 'p8', name: 'Pill', style: { borderRadius: 999, backgroundColor: '#6366f1', textColor: '#ffffff', borderWidth: 0 } },
    { id: 'p9', name: 'Minimal', style: { backgroundColor: 'transparent', borderWidth: 0, textColor: '#94a3b8' } },
    { id: 'p10', name: 'Cyber', style: { backgroundColor: '#000000', borderColor: '#00ff00', borderWidth: 1, textColor: '#00ff00', borderRadius: 0 } },
    { id: 'p11', name: 'Soft', style: { backgroundColor: '#e2e8f0', textColor: '#475569', borderRadius: 12, borderWidth: 0 } },
    { id: 'p12', name: 'Ghost', style: { backgroundColor: 'transparent', textColor: '#f8fafc', borderColor: '#475569', borderWidth: 1, borderRadius: 6 } },
  ]);

  // Layer Management
  const handleAddLayer = () => {
    if (layers.length >= 5) return; // Limit max layers
    const newId = `layer_${Date.now()}`;
    setLayers(prev => [...prev, { id: newId, name: `Layer ${prev.length + 1}`, visible: true, locked: false }]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    
    // Remove widgets in this layer
    setWidgets(prev => prev.filter(w => w.layerId !== id));
    
    // Remove layer
    setLayers(prev => {
      const remaining = prev.filter(l => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  };

  const handleToggleLayerVisible = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    // If hiding a layer, deselect its widgets
    const layerWidgets = widgets.filter(w => w.layerId === id).map(w => w.id);
    setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  const handleToggleLayerLock = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    // If locking a layer, deselect its widgets
    const layerWidgets = widgets.filter(w => w.layerId === id).map(w => w.id);
    setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  // Helper to get actual widget objects from IDs
  const selectedWidgets = widgets.filter(w => selectedIds.includes(w.id));

  // Process widgets for rendering: Filter invisible, Sort by layer order
  const visibleSortedWidgets = useMemo(() => {
    return widgets
      .filter(w => {
        const layer = layers.find(l => l.id === w.layerId);
        return layer && layer.visible;
      })
      .sort((a, b) => {
        const layerIndexA = layers.findIndex(l => l.id === a.layerId);
        const layerIndexB = layers.findIndex(l => l.id === b.layerId);
        if (layerIndexA !== layerIndexB) return layerIndexA - layerIndexB;
        // Same layer: preserve array order (creation order / Z-index)
        return 0;
      });
  }, [widgets, layers]);

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
      layerId: activeLayerId,
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

    // Check if layer is locked
    const layer = layers.find(l => l.id === targetWidget.layerId);
    if (layer?.locked) return;

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

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length === 0) return;

    setWidgets(prev => {
      let newWidgets = [...prev];
      
      if (action === 'front') {
         const selected = newWidgets.filter(w => selectedIds.includes(w.id));
         const unselected = newWidgets.filter(w => !selectedIds.includes(w.id));
         return [...unselected, ...selected];
      }
      
      if (action === 'back') {
         const selected = newWidgets.filter(w => selectedIds.includes(w.id));
         const unselected = newWidgets.filter(w => !selectedIds.includes(w.id));
         return [...selected, ...unselected];
      }

      if (action === 'forward') {
        // Iterate from end to start to bubble selected items up one slot
        for (let i = newWidgets.length - 2; i >= 0; i--) {
            const current = newWidgets[i];
            const next = newWidgets[i+1];
            
            if (selectedIds.includes(current.id) && !selectedIds.includes(next.id)) {
                // Swap
                newWidgets[i] = next;
                newWidgets[i+1] = current;
            }
        }
        return newWidgets;
      }

      if (action === 'backward') {
        // Iterate from start to end to bubble selected items down one slot
        for (let i = 1; i < newWidgets.length; i++) {
            const current = newWidgets[i];
            const prev = newWidgets[i-1];
            
            if (selectedIds.includes(current.id) && !selectedIds.includes(prev.id)) {
                // Swap
                newWidgets[i] = prev;
                newWidgets[i-1] = current;
            }
        }
        return newWidgets;
      }

      return newWidgets;
    });
  };

  const handleAddPreset = (name: string, style: WidgetStyle) => {
    setStylePresets(prev => [...prev, { id: `preset_${Date.now()}`, name, style }]);
  };

  const handleDeletePreset = (id: string) => {
    setStylePresets(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateCode = async () => {
    setShowCode(true);
    setIsGenerating(true);
    // Use visibleSortedWidgets to ensure WYSIWYG and correct Z-order in code
    const generated = await generateLVGLCode(visibleSortedWidgets, settings, codeLanguage);
    setCode(generated);
    setIsGenerating(false);
  };

  const handleLanguageChange = async (lang: CodeLanguage) => {
    setCodeLanguage(lang);
    if (showCode) {
      setIsGenerating(true);
      const generated = await generateLVGLCode(visibleSortedWidgets, settings, lang);
      setCode(generated);
      setIsGenerating(false);
    }
  };

  // Keyboard navigation for moving widgets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIds.length === 0) return;

      // Avoid interfering with input fields
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      let dx = 0;
      let dy = 0;
      // Precision movement: 1px default, 10px with Shift
      const step = e.shiftKey ? 10 : 1; 

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      const updates: {id: string, changes: Partial<Widget>}[] = [];
      
      // Calculate updates based on current state
      selectedIds.forEach(id => {
        const widget = widgets.find(w => w.id === id);
        if (widget) {
          const layer = layers.find(l => l.id === widget.layerId);
          // Only move if layer is not locked
          if (layer && !layer.locked) {
             updates.push({
               id,
               changes: {
                 x: Math.round(widget.x + dx), 
                 y: Math.round(widget.y + dy)
               }
             });
          }
        }
      });

      if (updates.length > 0) {
        handleUpdateWidgets(updates);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, widgets, layers, handleUpdateWidgets]);

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
              className="bg-slate-800 text-xs font-medium text-slate-300 focus:outline-none px-2 py-1 cursor-pointer hover:text-white border-none"
            >
              <option value="c" className="bg-slate-800">C (LVGL)</option>
              <option value="micropython" className="bg-slate-800">MicroPython</option>
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
        <WidgetPalette 
          onAddWidget={handleAddWidget} 
          layers={layers}
          activeLayerId={activeLayerId}
          onSetActiveLayer={setActiveLayerId}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onToggleLayerVisible={handleToggleLayerVisible}
          onToggleLayerLock={handleToggleLayerLock}
        />
        
        <Canvas 
          widgets={visibleSortedWidgets} 
          layers={layers}
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
          onLayerAction={handleLayerAction}
          stylePresets={stylePresets}
          onAddPreset={handleAddPreset}
          onDeletePreset={handleDeletePreset}
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
