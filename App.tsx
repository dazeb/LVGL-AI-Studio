

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Widget, CanvasSettings, WidgetType, CodeLanguage, StylePreset, WidgetStyle, Layer, AISettings, Screen, Theme, ProjectFile } from './types';
import { DEFAULT_CANVAS_SETTINGS, DEFAULT_WIDGET_PROPS, PROJECT_THEMES } from './constants';
import WidgetPalette from './components/WidgetPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import CodeViewer from './components/CodeViewer';
import SettingsDialog from './components/SettingsDialog';
import ConfirmDialog from './components/ConfirmDialog';
import SampleCatalogue from './components/SampleCatalogue';
import { SampleProject } from './data/samples';
import { generateLVGLCode } from './services/aiService';
import { Code, MonitorPlay, Settings as SettingsIcon, ZoomIn, ZoomOut, RotateCcw, FolderOpen, Download, Upload, FileJson } from 'lucide-react';

const STORAGE_KEY = 'lvgl_studio_autosave_v1';

const App: React.FC = () => {
  
  // --- Lazy Initializers for Persistence ---
  
  const getStoredState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) { console.error("Failed to load state", e); }
    return null;
  };

  const storedData = getStoredState();

  // --- Global App State ---
  
  const [screens, setScreens] = useState<Screen[]>(() => {
    if (storedData?.screens) return storedData.screens;
    return [{
       id: 'screen_1',
       name: 'Main Screen',
       backgroundColor: DEFAULT_CANVAS_SETTINGS.defaultBackgroundColor,
       widgets: [],
       layers: [{ id: 'layer_1', name: 'Base Layer', visible: true, locked: false }]
    }];
  });
  
  const [activeScreenId, setActiveScreenId] = useState<string>(() => {
    if (storedData?.activeScreenId && storedData.screens?.some((s: Screen) => s.id === storedData.activeScreenId)) {
      return storedData.activeScreenId;
    }
    return 'screen_1';
  });

  const [activeLayerId, setActiveLayerId] = useState<string>('layer_1'); // Corrected via useEffect later

  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(() => {
     return storedData?.settings || DEFAULT_CANVAS_SETTINGS;
  });

  const [zoom, setZoom] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // UI State
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('c');
  
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
     return storedData?.aiSettings || {
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      model: 'gemini-2.5-flash'
    };
  });

  // Presets
  const [stylePresets, setStylePresets] = useState<StylePreset[]>(() => {
    if (storedData?.stylePresets) return storedData.stylePresets;
    return [
      { id: 'p1', name: 'Primary', style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 8, borderWidth: 0 } },
      { id: 'p2', name: 'Outline', style: { backgroundColor: 'transparent', textColor: '#3b82f6', borderColor: '#3b82f6', borderWidth: 2, borderRadius: 8 } },
      { id: 'p3', name: 'Dark Card', style: { backgroundColor: '#1e293b', textColor: '#e2e8f0', borderColor: '#334155', borderWidth: 1, borderRadius: 12 } },
      { id: 'p4', name: 'Alert', style: { backgroundColor: '#ef4444', textColor: '#ffffff', borderRadius: 4, borderWidth: 0 } },
      { id: 'p5', name: 'Success', style: { backgroundColor: '#22c55e', textColor: '#ffffff', borderRadius: 6, borderWidth: 0 } },
      { id: 'p6', name: 'Warning', style: { backgroundColor: '#f59e0b', textColor: '#ffffff', borderRadius: 6, borderWidth: 0 } },
      { id: 'p7', name: 'Glass', style: { backgroundColor: '#ffffff20', textColor: '#ffffff', borderColor: '#ffffff40', borderWidth: 1, borderRadius: 16 } },
      { id: 'p8', name: 'Pill', style: { borderRadius: 999, backgroundColor: '#6366f1', textColor: '#ffffff', borderWidth: 0 } },
      { id: 'p9', name: 'Minimal', style: { backgroundColor: 'transparent', borderWidth: 0, textColor: '#94a3b8' } },
    ];
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // --- Auto-Save Effect ---
  useEffect(() => {
    const data = {
      screens,
      settings: canvasSettings,
      stylePresets,
      aiSettings,
      activeScreenId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [screens, canvasSettings, stylePresets, aiSettings, activeScreenId]);

  // Derived State Helpers
  const currentScreen = useMemo(() => screens.find(s => s.id === activeScreenId)!, [screens, activeScreenId]);
  
  // When switching screens, if the active layer doesn't exist on the new screen, reset it
  useEffect(() => {
     const layerExists = currentScreen.layers.find(l => l.id === activeLayerId);
     if (!layerExists && currentScreen.layers.length > 0) {
        setActiveLayerId(currentScreen.layers[0].id);
     }
  }, [activeScreenId, currentScreen]);

  // --- File I/O (Save/Load Project) ---

  const handleSaveProject = () => {
    const projectData: ProjectFile = {
      version: '1.0.0',
      timestamp: Date.now(),
      settings: canvasSettings,
      screens,
      stylePresets
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${canvasSettings.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const projectData = JSON.parse(json) as ProjectFile;
        
        // Basic Validation
        if (!projectData.screens || !Array.isArray(projectData.screens) || !projectData.settings) {
          throw new Error("Invalid project file structure.");
        }

        setConfirmDialog({
           isOpen: true,
           title: 'Import Project',
           message: `Load "${projectData.settings.projectName}"? This will overwrite your current workspace.`,
           onConfirm: () => {
              setCanvasSettings(projectData.settings);
              setScreens(projectData.screens);
              if (projectData.stylePresets) setStylePresets(projectData.stylePresets);
              
              // Reset Selection & Active Screen
              if (projectData.screens.length > 0) {
                 setActiveScreenId(projectData.screens[0].id);
                 setActiveLayerId(projectData.screens[0].layers[0].id);
              }
              setSelectedIds([]);
           }
        });
      } catch (err) {
        alert("Failed to load project: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // --- Sample Loading ---
  const handleLoadSample = (sample: SampleProject) => {
    // Confirm overwrite if current project is not empty (simple check: more than 0 widgets)
    const hasWork = screens.some(s => s.widgets.length > 0);
    
    const loadLogic = () => {
       // Deep copy to avoid reference issues
       const screensCopy = JSON.parse(JSON.stringify(sample.screens));
       const settingsCopy = JSON.parse(JSON.stringify(sample.settings));
       
       setScreens(screensCopy);
       setCanvasSettings(settingsCopy);
       setActiveScreenId(screensCopy[0].id);
       setActiveLayerId(screensCopy[0].layers[0].id);
       setSelectedIds([]);
       setShowSamples(false);
    };

    if (hasWork) {
       setConfirmDialog({
          isOpen: true,
          title: 'Overwrite Project?',
          message: 'Loading this template will discard your current project. Are you sure?',
          onConfirm: loadLogic
       });
    } else {
       loadLogic();
    }
  };

  // --- Screen Management ---

  const handleAddScreen = () => {
     const newId = `screen_${Date.now()}`;
     const newScreen: Screen = {
        id: newId,
        name: `Screen ${screens.length + 1}`,
        backgroundColor: canvasSettings.defaultBackgroundColor,
        widgets: [],
        layers: [{ id: `layer_${Date.now()}`, name: 'Base Layer', visible: true, locked: false }]
     };
     setScreens(prev => [...prev, newScreen]);
     setActiveScreenId(newId);
     setActiveLayerId(newScreen.layers[0].id);
     setSelectedIds([]);
  };

  const performDeleteScreen = (id: string) => {
     if (screens.length <= 1) return;
     const remaining = screens.filter(s => s.id !== id);
     setScreens(remaining);
     if (activeScreenId === id) {
        setActiveScreenId(remaining[0].id);
        setActiveLayerId(remaining[0].layers[0].id);
     }
  };

  const handleDeleteScreen = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Screen',
      message: 'Are you sure you want to delete this screen? All widgets inside it will be permanently lost.',
      onConfirm: () => performDeleteScreen(id)
    });
  };

  const handleUpdateScreen = (updates: Partial<Screen>) => {
     setScreens(prev => prev.map(s => s.id === activeScreenId ? { ...s, ...updates } : s));
  };

  // --- Layer Management (Scoped to Active Screen) ---

  const handleAddLayer = () => {
    if (currentScreen.layers.length >= 5) return;
    const newLayerId = `layer_${Date.now()}`;
    const newLayer: Layer = { id: newLayerId, name: `Layer ${currentScreen.layers.length + 1}`, visible: true, locked: false };
    
    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          return { ...s, layers: [...s.layers, newLayer] };
       }
       return s;
    }));
    setActiveLayerId(newLayerId);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (currentScreen.layers.length <= 1) return;
    
    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          // Remove widgets on this layer
          const newWidgets = s.widgets.filter(w => w.layerId !== layerId);
          // Remove layer
          const newLayers = s.layers.filter(l => l.id !== layerId);
          return { ...s, widgets: newWidgets, layers: newLayers };
       }
       return s;
    }));
    
    if (activeLayerId === layerId) {
       // Find previous layer to set active
       const remaining = currentScreen.layers.filter(l => l.id !== layerId);
       if (remaining.length > 0) setActiveLayerId(remaining[remaining.length - 1].id);
    }
  };

  const handleToggleLayerVisible = (layerId: string) => {
     setScreens(prev => prev.map(s => {
        if (s.id === activeScreenId) {
           return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l) };
        }
        return s;
     }));
     // If hiding, deselect widgets on that layer
     const layerWidgets = currentScreen.widgets.filter(w => w.layerId === layerId).map(w => w.id);
     setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  const handleToggleLayerLock = (layerId: string) => {
     setScreens(prev => prev.map(s => {
        if (s.id === activeScreenId) {
           return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l) };
        }
        return s;
     }));
     // If locking, deselect
     const layerWidgets = currentScreen.widgets.filter(w => w.layerId === layerId).map(w => w.id);
     setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  const handleRenameLayer = (layerId: string, newName: string) => {
     setScreens(prev => prev.map(s => {
        if (s.id === activeScreenId) {
           return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, name: newName } : l) };
        }
        return s;
     }));
  };

  const handleReorderLayers = (draggedId: string, targetId: string) => {
     setScreens(prev => prev.map(s => {
        if (s.id === activeScreenId) {
           const layers = [...s.layers];
           const fromIndex = layers.findIndex(l => l.id === draggedId);
           const toIndex = layers.findIndex(l => l.id === targetId);

           if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return s;

           // Move the layer
           const [movedLayer] = layers.splice(fromIndex, 1);
           layers.splice(toIndex, 0, movedLayer);

           return { ...s, layers };
        }
        return s;
     }));
  };

  // --- Widget Management (Scoped to Active Screen) ---

  const handleAddWidget = (type: WidgetType, x?: number, y?: number) => {
    const defaultProps = DEFAULT_WIDGET_PROPS[type];
    
    let posX = x !== undefined ? x : 20;
    let posY = y !== undefined ? y : 20;

    // Smart offset if placing via click
    if (x === undefined && currentScreen.widgets.length > 0) {
       posX += 10;
       posY += 10;
    }

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      layerId: activeLayerId,
      type,
      name: `${type}_${currentScreen.widgets.filter(w => w.type === type).length + 1}`,
      x: posX,
      y: posY,
      ...defaultProps,
      style: { ...defaultProps.style } 
    };

    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          return { ...s, widgets: [...s.widgets, newWidget] };
       }
       return s;
    }));
    setSelectedIds([newWidget.id]);
  };

  const handleUpdateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          return {
             ...s,
             widgets: s.widgets.map(w => {
               if (w.id === id) {
                 const newStyle = updates.style ? { ...w.style, ...updates.style } : w.style;
                 return { ...w, ...updates, style: newStyle };
               }
               return w;
             })
          };
       }
       return s;
    }));
  }, [activeScreenId]);

  const handleUpdateWidgets = useCallback((updates: {id: string, changes: Partial<Widget>}[]) => {
    setScreens(prev => prev.map(s => {
      if (s.id === activeScreenId) {
         const updateMap = new Map(updates.map(u => [u.id, u.changes]));
         return {
            ...s,
            widgets: s.widgets.map(w => {
               if (updateMap.has(w.id)) {
                 const changes = updateMap.get(w.id)!;
                 const newStyle = changes.style ? { ...w.style, ...changes.style } : w.style;
                 return { ...w, ...changes, style: newStyle };
               }
               return w;
            })
         };
      }
      return s;
    }));
  }, [activeScreenId]);

  const performDeleteWidgets = (ids: string[]) => {
    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          return { ...s, widgets: s.widgets.filter(w => !ids.includes(w.id)) };
       }
       return s;
    }));
    setSelectedIds([]);
  };

  const handleDeleteWidgets = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Widgets',
      message: `Are you sure you want to delete ${ids.length} widget${ids.length > 1 ? 's' : ''}?`,
      onConfirm: () => performDeleteWidgets(ids)
    });
  }, [activeScreenId]); // Add dependency if performDeleteWidgets depends on it (it doesn't directly but uses setState callback, but safe to include or useCallback properly)

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
      changes: { groupId: undefined } 
    })));
  };

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length === 0) return;
    
    setScreens(prev => prev.map(s => {
       if (s.id === activeScreenId) {
          let newWidgets = [...s.widgets];
          
          if (action === 'front') {
             const selected = newWidgets.filter(w => selectedIds.includes(w.id));
             const unselected = newWidgets.filter(w => !selectedIds.includes(w.id));
             return { ...s, widgets: [...unselected, ...selected] };
          }
          if (action === 'back') {
             const selected = newWidgets.filter(w => selectedIds.includes(w.id));
             const unselected = newWidgets.filter(w => !selectedIds.includes(w.id));
             return { ...s, widgets: [...selected, ...unselected] };
          }
          // Implementation for forward/backward bubbling (simplified for brevity, previous logic applies)
          if (action === 'forward') {
            for (let i = newWidgets.length - 2; i >= 0; i--) {
                const current = newWidgets[i];
                const next = newWidgets[i+1];
                if (selectedIds.includes(current.id) && !selectedIds.includes(next.id)) {
                    newWidgets[i] = next;
                    newWidgets[i+1] = current;
                }
            }
          }
          if (action === 'backward') {
            for (let i = 1; i < newWidgets.length; i++) {
                const current = newWidgets[i];
                const prev = newWidgets[i-1];
                if (selectedIds.includes(current.id) && !selectedIds.includes(prev.id)) {
                    newWidgets[i] = prev;
                    newWidgets[i-1] = current;
                }
            }
          }
          return { ...s, widgets: newWidgets };
       }
       return s;
    }));
  };

  // --- Theme Application ---
  const handleApplyTheme = (themeId: string) => {
     const theme = PROJECT_THEMES[themeId];
     if (!theme) return;

     // 1. Update Global Settings
     setCanvasSettings(prev => ({
        ...prev,
        theme: themeId,
        defaultBackgroundColor: theme.colors.background
     }));

     // 2. Update All Screens
     setScreens(prevScreens => {
        return prevScreens.map(screen => ({
           ...screen,
           backgroundColor: theme.colors.background,
           widgets: screen.widgets.map(widget => {
              const newStyle = { ...widget.style };
              
              // Apply theme based on widget type
              switch (widget.type) {
                 case WidgetType.BUTTON:
                    newStyle.backgroundColor = theme.colors.primary;
                    newStyle.textColor = theme.colors.textInvert;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.LABEL:
                    newStyle.textColor = theme.colors.text;
                    break;
                 case WidgetType.SLIDER:
                    newStyle.backgroundColor = theme.colors.secondary;
                    newStyle.borderColor = theme.colors.primary;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.SWITCH:
                    // Only update the 'off' state background. Checked state handled by logic usually, 
                    // but here we just set the default 'off' style. 
                    newStyle.backgroundColor = theme.colors.secondary;
                    newStyle.borderColor = theme.colors.primary; // Active color storage
                    break;
                 case WidgetType.CHECKBOX:
                    newStyle.textColor = theme.colors.text;
                    newStyle.borderColor = theme.colors.primary;
                    break;
                 case WidgetType.ARC:
                    newStyle.borderColor = theme.colors.primary;
                    newStyle.backgroundColor = theme.colors.secondary;
                    break;
                 case WidgetType.CONTAINER:
                    newStyle.backgroundColor = theme.colors.surface;
                    newStyle.borderColor = theme.colors.border;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.CONTAINER:
                    newStyle.backgroundColor = theme.colors.surface;
                    newStyle.borderColor = theme.colors.border;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.TEXT_AREA:
                    newStyle.backgroundColor = theme.colors.surface;
                    newStyle.textColor = theme.colors.text;
                    newStyle.borderColor = theme.colors.border;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.CHART:
                    newStyle.backgroundColor = theme.colors.surface;
                    newStyle.borderColor = theme.colors.border;
                    newStyle.borderRadius = theme.borderRadius;
                    break;
                 case WidgetType.ICON:
                    newStyle.textColor = theme.colors.text;
                    break;
              }
              return { ...widget, style: newStyle };
           })
        }));
     });
  };

  // --- Selection Logic ---

  const handleSelectWidget = (id: string | null, isShift: boolean) => {
    if (id === null) {
      if (!isShift) setSelectedIds([]);
      return;
    }

    const targetWidget = currentScreen.widgets.find(w => w.id === id);
    if (!targetWidget) return;

    const layer = currentScreen.layers.find(l => l.id === targetWidget.layerId);
    if (layer?.locked) return;

    let idsToToggle = [id];
    if (targetWidget.groupId) {
      idsToToggle = currentScreen.widgets.filter(w => w.groupId === targetWidget.groupId).map(w => w.id);
    }

    if (isShift) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        const allPresent = idsToToggle.every(tid => newSet.has(tid));
        if (allPresent) idsToToggle.forEach(tid => newSet.delete(tid));
        else idsToToggle.forEach(tid => newSet.add(tid));
        return Array.from(newSet);
      });
    } else {
      const isAlreadySelected = idsToToggle.every(tid => selectedIds.includes(tid));
      if (!isAlreadySelected) setSelectedIds(idsToToggle);
    }
  };

  // --- Rendering Prep ---
  const visibleSortedWidgets = useMemo(() => {
    return currentScreen.widgets
      .filter(w => {
        const layer = currentScreen.layers.find(l => l.id === w.layerId);
        return layer && layer.visible;
      })
      .sort((a, b) => {
        const layerIndexA = currentScreen.layers.findIndex(l => l.id === a.layerId);
        const layerIndexB = currentScreen.layers.findIndex(l => l.id === b.layerId);
        if (layerIndexA !== layerIndexB) return layerIndexA - layerIndexB;
        return 0; // Maintain array order (Z-index)
      });
  }, [currentScreen]);
  
  const selectedWidgets = useMemo(() => 
    currentScreen.widgets.filter(w => selectedIds.includes(w.id)), 
  [currentScreen, selectedIds]);


  // --- Code Gen ---
  const handleGenerateCode = async () => {
    setShowCode(true);
    setIsGenerating(true);
    const generated = await generateLVGLCode(screens, canvasSettings, codeLanguage, aiSettings);
    setCode(generated);
    setIsGenerating(false);
  };

  // --- Keyboard ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIds.length === 0) return;
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
          handleDeleteWidgets(selectedIds);
          return;
      }

      let dx = 0;
      let dy = 0;
      const step = e.shiftKey ? 10 : 1; 

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      const updates: {id: string, changes: Partial<Widget>}[] = [];
      selectedIds.forEach(id => {
        const widget = currentScreen.widgets.find(w => w.id === id);
        if (widget) {
           const layer = currentScreen.layers.find(l => l.id === widget.layerId);
           if (layer && !layer.locked) {
             updates.push({ id, changes: { x: Math.round(widget.x + dx), y: Math.round(widget.y + dy) } });
           }
        }
      });
      if (updates.length > 0) handleUpdateWidgets(updates);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, currentScreen, handleUpdateWidgets, handleDeleteWidgets]);


  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Hidden Input for Open Project */}
      <input 
         type="file" 
         ref={fileInputRef} 
         onChange={handleFileChange} 
         accept=".json" 
         className="hidden" 
      />

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
            {currentScreen.name} • {canvasSettings.width}x{canvasSettings.height}
          </div>

          <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>
          
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
             <button 
               onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} 
               className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded"
               title="Zoom Out"
             >
               <ZoomOut size={14} />
             </button>
             <button
               onClick={() => setZoom(1)}
               className="text-xs font-mono w-10 text-center hover:text-white text-slate-300"
               title="Reset Zoom"
             >
               {Math.round(zoom * 100)}%
             </button>
             <button 
               onClick={() => setZoom(z => Math.min(3, z + 0.1))} 
               className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded"
               title="Zoom In"
             >
               <ZoomIn size={14} />
             </button>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>
          
          {/* Open / Save Buttons */}
          <div className="flex items-center gap-1">
             <button 
                onClick={handleOpenProjectClick}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-700"
                title="Open Project (.json)"
             >
                <FolderOpen size={16} className="text-amber-500" /> <span className="hidden sm:inline">Open</span>
             </button>
             <button 
                onClick={handleSaveProject}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-700"
                title="Save Project (.json)"
             >
                <Download size={16} className="text-green-500" /> <span className="hidden sm:inline">Save</span>
             </button>
          </div>

          <button 
            onClick={() => setShowSamples(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-700"
            title="Browse Templates"
          >
            <FileJson size={16} className="text-blue-400" /> Templates
          </button>

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
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="AI Settings"
          >
             <SettingsIcon size={20} />
          </button>

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
          // Screen Props
          screens={screens}
          activeScreenId={activeScreenId}
          onSetActiveScreen={setActiveScreenId}
          onAddScreen={handleAddScreen}
          onDeleteScreen={handleDeleteScreen}
          // Note: Layers removed from here, moved to PropertiesPanel
        />
        
        <Canvas 
          widgets={visibleSortedWidgets} 
          layers={currentScreen.layers}
          // We override the background color from settings with the screen specific one
          settings={{...canvasSettings, backgroundColor: currentScreen.backgroundColor, name: currentScreen.name }}
          zoom={zoom}
          selectedIds={selectedIds}
          onSelectWidget={handleSelectWidget}
          onUpdateWidgets={handleUpdateWidgets}
          onAddWidget={handleAddWidget}
        />
        
        <PropertiesPanel 
          selectedWidgets={selectedWidgets}
          settings={canvasSettings}
          currentScreen={currentScreen}
          allScreens={screens}
          onUpdateWidget={handleUpdateWidget}
          onUpdateSettings={setCanvasSettings}
          onUpdateScreen={handleUpdateScreen}
          onDeleteWidgets={handleDeleteWidgets}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          onLayerAction={handleLayerAction}
          stylePresets={stylePresets}
          onAddPreset={(name, style) => setStylePresets(prev => [...prev, { id: `preset_${Date.now()}`, name, style }])}
          onDeletePreset={(id) => setStylePresets(prev => prev.filter(p => p.id !== id))}
          onApplyTheme={handleApplyTheme}
          // Layer Props (Now passed here)
          layers={currentScreen.layers}
          activeLayerId={activeLayerId}
          onSetActiveLayer={setActiveLayerId}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onToggleLayerVisible={handleToggleLayerVisible}
          onToggleLayerLock={handleToggleLayerLock}
          onRenameLayer={handleRenameLayer}
          onReorderLayers={handleReorderLayers}
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
          onLanguageChange={(lang) => {
             setCodeLanguage(lang);
             // Re-trigger in useEffect logic or manually here if needed, but simplistic re-click is fine
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsDialog 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={aiSettings}
        onSave={setAiSettings}
      />

      {/* Sample Catalogue Modal */}
      <SampleCatalogue 
        isOpen={showSamples}
        onClose={() => setShowSamples(false)}
        onSelectSample={handleLoadSample}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;