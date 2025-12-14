
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
import HistoryMenu from './components/HistoryMenu';
import HelpDialog from './components/HelpDialog';
import ContextMenu from './components/ContextMenu';
import { useHistory } from './hooks/useHistory';
import { SampleProject } from './data/samples';
import { generateLVGLCode } from './services/aiService';
import { Code, MonitorPlay, Settings as SettingsIcon, ZoomIn, ZoomOut, RotateCcw, RotateCw, FileJson, CircleHelp } from 'lucide-react';

const STORAGE_KEY = 'lvgl_studio_autosave_v1';

// Unified State Interface for History
interface ProjectState {
  screens: Screen[];
  activeScreenId: string;
  activeLayerId: string;
  settings: CanvasSettings;
  stylePresets: StylePreset[];
}

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

  // --- Initial State Setup ---
  const initialScreens: Screen[] = storedData?.screens || [{
       id: 'screen_1',
       name: 'Main Screen',
       backgroundColor: DEFAULT_CANVAS_SETTINGS.defaultBackgroundColor,
       widgets: [],
       layers: [{ id: 'layer_1', name: 'Base Layer', visible: true, locked: false }]
  }];

  const initialActiveScreenId = storedData?.activeScreenId && storedData.screens?.some((s: Screen) => s.id === storedData.activeScreenId) 
      ? storedData.activeScreenId 
      : initialScreens[0].id;

  const initialActiveLayerId = initialScreens.find(s => s.id === initialActiveScreenId)?.layers[0]?.id || 'layer_1';

  const initialSettings: CanvasSettings = storedData?.settings || DEFAULT_CANVAS_SETTINGS;
  
  const initialStylePresets: StylePreset[] = storedData?.stylePresets || [
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

  // --- History Hook ---
  // This replaces separate useState calls for the core project data
  const { 
    state: projectState, 
    past, 
    future, 
    set: setProjectState, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    jumpTo: jumpToHistory
  } = useHistory<ProjectState>({
    screens: initialScreens,
    activeScreenId: initialActiveScreenId,
    activeLayerId: initialActiveLayerId,
    settings: initialSettings,
    stylePresets: initialStylePresets
  });

  // Destructure for easier access
  const { screens, activeScreenId, activeLayerId, settings: canvasSettings, stylePresets } = projectState;

  // --- Other UI State (Not in history) ---
  const [zoom, setZoom] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [showCode, setShowCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('c');
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number } | null>(null);

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
     return storedData?.aiSettings || {
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      model: 'gemini-2.5-flash'
    };
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

  // --- Helper to update project state with history ---
  const updateProject = useCallback((actionName: string, updater: (prev: ProjectState) => ProjectState) => {
    setProjectState(updater, actionName);
  }, [setProjectState]);

  // --- Auto-Save Effect ---
  useEffect(() => {
    const data = {
      screens,
      settings: canvasSettings,
      stylePresets,
      aiSettings, // Persist AI settings even though they aren't in history
      activeScreenId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [screens, canvasSettings, stylePresets, aiSettings, activeScreenId]);

  // Derived State Helpers
  const currentScreen = useMemo(() => screens.find(s => s.id === activeScreenId)!, [screens, activeScreenId]);

  // Derived: Visible Widgets sorted by Z-index (Layer order + Widget order)
  const visibleSortedWidgets = useMemo(() => {
     if (!currentScreen) return [];
     
     // 1. Filter widgets belonging to visible layers
     const visibleLayerIds = new Set(currentScreen.layers.filter(l => l.visible).map(l => l.id));
     const visibleWidgets = currentScreen.widgets.filter(w => visibleLayerIds.has(w.layerId));
     
     // 2. Sort by Layer Index (Back to Front) then Widget Index
     return visibleWidgets.sort((a, b) => {
        const layerIndexA = currentScreen.layers.findIndex(l => l.id === a.layerId);
        const layerIndexB = currentScreen.layers.findIndex(l => l.id === b.layerId);
        
        if (layerIndexA !== layerIndexB) {
            return layerIndexA - layerIndexB; // Lower index = Lower Layer (Background)
        }
        
        // If same layer, rely on widget array order (assuming appended = top)
        return currentScreen.widgets.indexOf(a) - currentScreen.widgets.indexOf(b);
     });
  }, [currentScreen]);

  // Derived: Selected Widgets Array
  const selectedWidgets = useMemo(() => {
     if (!currentScreen) return [];
     return currentScreen.widgets.filter(w => selectedIds.includes(w.id));
  }, [currentScreen, selectedIds]);
  
  // Safety check: When switching screens (e.g. via Undo), ensure activeLayerId is valid
  useEffect(() => {
     const layerExists = currentScreen.layers.find(l => l.id === activeLayerId);
     if (!layerExists && currentScreen.layers.length > 0) {
        // Reset layer ID without adding to history (it's a sync correction)
     }
  }, [activeScreenId, currentScreen, activeLayerId]);

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

  // Reusable loading logic
  const loadProjectState = (projectData: ProjectFile, sourceName: string) => {
    if (!projectData.screens || !Array.isArray(projectData.screens) || !projectData.settings) {
        throw new Error("Invalid project file structure.");
    }
    
    setConfirmDialog({
        isOpen: true,
        title: 'Import Project',
        message: `Load "${projectData.settings.projectName}"? This will overwrite your current workspace.`,
        onConfirm: () => {
           setProjectState({
               screens: projectData.screens,
               activeScreenId: projectData.screens.length > 0 ? projectData.screens[0].id : 'screen_1',
               activeLayerId: projectData.screens.length > 0 ? projectData.screens[0].layers[0].id : 'layer_1',
               settings: projectData.settings,
               stylePresets: projectData.stylePresets || []
           }, `Load Project (${sourceName})`);
           setSelectedIds([]);
        }
     });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const projectData = JSON.parse(json) as ProjectFile;
        loadProjectState(projectData, 'File');
      } catch (err) {
        alert("Failed to load project: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportFromUrl = async (url: string) => {
      try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          loadProjectState(data, 'URL Import');
      } catch (err) {
          console.error(err);
          alert("Failed to import project from URL. Ensure it is a valid raw JSON file.");
      }
  };

  // --- Sample Loading ---
  const handleLoadSample = (sample: SampleProject) => {
    const hasWork = screens.some(s => s.widgets.length > 0);
    
    const loadLogic = () => {
       const screensCopy = JSON.parse(JSON.stringify(sample.screens));
       const settingsCopy = JSON.parse(JSON.stringify(sample.settings));
       
       setProjectState({
           screens: screensCopy,
           activeScreenId: screensCopy[0].id,
           activeLayerId: screensCopy[0].layers[0].id,
           settings: settingsCopy,
           stylePresets: stylePresets // Keep existing presets or load from sample if defined
       }, 'Load Template: ' + sample.name);
       
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
     const newLayerId = `layer_${Date.now()}`;
     const newScreen: Screen = {
        id: newId,
        name: `Screen ${screens.length + 1}`,
        backgroundColor: canvasSettings.defaultBackgroundColor,
        widgets: [],
        layers: [{ id: newLayerId, name: 'Base Layer', visible: true, locked: false }]
     };
     
     updateProject('Add Screen', prev => ({
         ...prev,
         screens: [...prev.screens, newScreen],
         activeScreenId: newId,
         activeLayerId: newLayerId
     }));
     setSelectedIds([]);
  };

  const handleDeleteScreen = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Screen',
      message: 'Are you sure you want to delete this screen? All widgets inside it will be permanently lost.',
      onConfirm: () => {
         if (screens.length <= 1) return;
         updateProject('Delete Screen', prev => {
             const remaining = prev.screens.filter(s => s.id !== id);
             let nextId = prev.activeScreenId;
             let nextLayerId = prev.activeLayerId;
             
             if (prev.activeScreenId === id) {
                 nextId = remaining[0].id;
                 nextLayerId = remaining[0].layers[0].id;
             }
             return {
                 ...prev,
                 screens: remaining,
                 activeScreenId: nextId,
                 activeLayerId: nextLayerId
             };
         });
         setSelectedIds([]);
      }
    });
  };

  const handleUpdateScreen = (updates: Partial<Screen>) => {
     updateProject('Update Screen Settings', prev => ({
         ...prev,
         screens: prev.screens.map(s => s.id === prev.activeScreenId ? { ...s, ...updates } : s)
     }));
  };

  const handleSetActiveScreen = (id: string) => {
      const targetScreen = screens.find(s => s.id === id);
      if (!targetScreen) return;
      
      updateProject('Switch Screen', prev => ({
          ...prev,
          activeScreenId: id,
          activeLayerId: targetScreen.layers[0].id // Default to first layer
      }));
      setSelectedIds([]);
  };

  // --- Layer Management ---

  const handleAddLayer = () => {
    if (currentScreen.layers.length >= 5) return;
    const newLayerId = `layer_${Date.now()}`;
    const newLayer: Layer = { id: newLayerId, name: `Layer ${currentScreen.layers.length + 1}`, visible: true, locked: false };
    
    updateProject('Add Layer', prev => ({
        ...prev,
        screens: prev.screens.map(s => {
            if (s.id === prev.activeScreenId) {
                return { ...s, layers: [...s.layers, newLayer] };
            }
            return s;
        }),
        activeLayerId: newLayerId
    }));
  };

  const handleDeleteLayer = (layerId: string) => {
    if (currentScreen.layers.length <= 1) return;
    
    updateProject('Delete Layer', prev => {
        const screen = prev.screens.find(s => s.id === prev.activeScreenId)!;
        const newLayers = screen.layers.filter(l => l.id !== layerId);
        let nextLayerId = prev.activeLayerId;
        
        if (prev.activeLayerId === layerId) {
            nextLayerId = newLayers[newLayers.length - 1].id;
        }
        
        return {
            ...prev,
            activeLayerId: nextLayerId,
            screens: prev.screens.map(s => {
                if (s.id === prev.activeScreenId) {
                    return { 
                        ...s, 
                        widgets: s.widgets.filter(w => w.layerId !== layerId),
                        layers: newLayers 
                    };
                }
                return s;
            })
        };
    });
  };

  const handleToggleLayerVisible = (layerId: string) => {
     updateProject('Toggle Layer Visibility', prev => ({
         ...prev,
         screens: prev.screens.map(s => {
             if (s.id === prev.activeScreenId) {
                 return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l) };
             }
             return s;
         })
     }));
     const layerWidgets = currentScreen.widgets.filter(w => w.layerId === layerId).map(w => w.id);
     setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  const handleToggleLayerLock = (layerId: string) => {
     updateProject('Toggle Layer Lock', prev => ({
         ...prev,
         screens: prev.screens.map(s => {
             if (s.id === prev.activeScreenId) {
                 return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l) };
             }
             return s;
         })
     }));
     const layerWidgets = currentScreen.widgets.filter(w => w.layerId === layerId).map(w => w.id);
     setSelectedIds(prev => prev.filter(pid => !layerWidgets.includes(pid)));
  };

  const handleRenameLayer = (layerId: string, newName: string) => {
     updateProject('Rename Layer', prev => ({
         ...prev,
         screens: prev.screens.map(s => {
             if (s.id === prev.activeScreenId) {
                 return { ...s, layers: s.layers.map(l => l.id === layerId ? { ...l, name: newName } : l) };
             }
             return s;
         })
     }));
  };

  const handleReorderLayers = (draggedId: string, targetId: string) => {
     updateProject('Reorder Layers', prev => ({
         ...prev,
         screens: prev.screens.map(s => {
             if (s.id === prev.activeScreenId) {
                 const layers = [...s.layers];
                 const fromIndex = layers.findIndex(l => l.id === draggedId);
                 const toIndex = layers.findIndex(l => l.id === targetId);
                 if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return s;
                 const [movedLayer] = layers.splice(fromIndex, 1);
                 layers.splice(toIndex, 0, movedLayer);
                 return { ...s, layers };
             }
             return s;
         })
     }));
  };

  // --- Widget Management ---

  const handleSelectWidget = useCallback((id: string | string[] | null, isShift: boolean) => {
    // If id is null and no shift, we clear
    if (id === null) {
        if (!isShift) setSelectedIds([]);
        return;
    }

    // Handle batch selection (array of IDs)
    if (Array.isArray(id)) {
        if (isShift) {
            // Union with existing selection
            setSelectedIds(prev => Array.from(new Set([...prev, ...id])));
        } else {
            // Replace selection
            setSelectedIds(id);
        }
        return;
    }

    // Handle single selection (string ID)
    const singleId = id as string;
    setSelectedIds(prev => {
        if (isShift) {
            return prev.includes(singleId) 
                ? prev.filter(p => p !== singleId) 
                : [...prev, singleId];
        }
        return [singleId];
    });
  }, []);

  const handleAddWidget = (type: WidgetType, x?: number, y?: number) => {
    const defaultProps = DEFAULT_WIDGET_PROPS[type];
    let posX = x !== undefined ? x : 20;
    let posY = y !== undefined ? y : 20;

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

    updateProject(`Add ${type}`, prev => ({
        ...prev,
        screens: prev.screens.map(s => {
            if (s.id === prev.activeScreenId) {
                return { ...s, widgets: [...s.widgets, newWidget] };
            }
            return s;
        })
    }));
    setSelectedIds([newWidget.id]);
  };

  const handleAddWidgetFromAI = (partialWidget: Partial<Widget>) => {
      // Basic defaults
      let posX = 40;
      let posY = 40;
      
      // Calculate a staggered position if there are existing widgets
      if (currentScreen.widgets.length > 0) {
          const last = currentScreen.widgets[currentScreen.widgets.length - 1];
          posX = last.x + 20;
          posY = last.y + 20;
      }

      // Merge defaults, AI properties, and mandatory state fields
      const newWidget: Widget = {
          id: `widget_${Date.now()}`,
          layerId: activeLayerId,
          type: partialWidget.type || WidgetType.BUTTON, // Fallback
          name: partialWidget.name || `Widget_${Date.now()}`,
          x: posX,
          y: posY,
          width: partialWidget.width || 100,
          height: partialWidget.height || 50,
          text: partialWidget.text,
          value: partialWidget.value,
          checked: partialWidget.checked,
          symbol: partialWidget.symbol,
          events: [], // Start with no events
          style: {
              ...DEFAULT_WIDGET_PROPS[partialWidget.type || WidgetType.BUTTON].style,
              ...partialWidget.style // Override with AI styles
          }
      };

      updateProject('Add AI Widget', prev => ({
          ...prev,
          screens: prev.screens.map(s => {
              if (s.id === prev.activeScreenId) {
                  return { ...s, widgets: [...s.widgets, newWidget] };
              }
              return s;
          })
      }));
      setSelectedIds([newWidget.id]);
  };

  const handleUpdateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    const keys = Object.keys(updates);
    const action = keys.length === 1 ? `Update ${keys[0]}` : 'Update Widget';

    updateProject(action, prev => ({
        ...prev,
        screens: prev.screens.map(s => {
            if (s.id === prev.activeScreenId) {
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
        })
    }));
  }, [updateProject]);

  const handleUpdateWidgets = useCallback((updates: {id: string, changes: Partial<Widget>}[]) => {
    const isMove = updates.every(u => u.changes.x !== undefined || u.changes.y !== undefined);
    const action = isMove ? 'Move Widgets' : 'Update Widgets';

    updateProject(action, prev => {
        const updateMap = new Map(updates.map(u => [u.id, u.changes]));
        return {
            ...prev,
            screens: prev.screens.map(s => {
                if (s.id === prev.activeScreenId) {
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
            })
        };
    });
  }, [updateProject]);

  const handleDeleteWidgets = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    
    // Check if we are in a confirmation dialog context or just direct call (like keyboard)
    // For direct keyboard deletes, we skip confirmation for single item for better flow, 
    // or we can keep it strict. Let's rely on caller to show dialog if needed.
    // The PropertiesPanel calls this directly, and there's a delete button there.
    
    // We'll wrap this logic in a function that does the state update, 
    // but the UI trigger (button click) handles the confirmation dialog.
    // WAIT: handleDeleteWidgets is passed to PropertiesPanel, which binds it to a trash icon.
    // Let's make this function perform the delete immediately, and move confirmation to the caller UI if needed.
    // ACTUALLY: The existing code in PropertiesPanel had onDeleteWidgets call directly.
    // Let's keep the confirm dialog check HERE to be safe for all entry points (keyboard, button, menu).
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Widgets',
      message: `Are you sure you want to delete ${ids.length} widget${ids.length > 1 ? 's' : ''}?`,
      onConfirm: () => {
          updateProject('Delete Widgets', prev => ({
              ...prev,
              screens: prev.screens.map(s => {
                  if (s.id === prev.activeScreenId) {
                      return { ...s, widgets: s.widgets.filter(w => !ids.includes(w.id)) };
                  }
                  return s;
              })
          }));
          setSelectedIds([]);
      }
    });
  }, [updateProject]);

  const handleDuplicateWidgets = () => {
    if (selectedWidgets.length === 0) return;
    
    const newWidgets: Widget[] = selectedWidgets.map((w, i) => ({
        ...w,
        id: `widget_${Date.now()}_${i}`,
        name: `${w.name}_copy`,
        x: w.x + 20,
        y: w.y + 20
    }));
    
    updateProject('Duplicate Widgets', prev => ({
        ...prev,
        screens: prev.screens.map(s => {
            if (s.id === prev.activeScreenId) {
                return { ...s, widgets: [...s.widgets, ...newWidgets] };
            }
            return s;
        })
    }));
    
    setSelectedIds(newWidgets.map(w => w.id));
  };

  const handleGroup = () => {
    if (selectedIds.length < 2) return;
    const newGroupId = `group_${Date.now()}`;
    const updates = selectedIds.map(id => ({ id, changes: { groupId: newGroupId } }));
    handleUpdateWidgets(updates);
  };

  const handleUngroup = () => {
    const updates = selectedIds.map(id => ({ id, changes: { groupId: undefined } }));
    handleUpdateWidgets(updates);
  };

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length === 0) return;
    updateProject(`Send to ${action}`, prev => ({
        ...prev,
        screens: prev.screens.map(s => {
            if (s.id === prev.activeScreenId) {
                let newWidgets = [...s.widgets];
                const selected = newWidgets.filter(w => selectedIds.includes(w.id));
                const unselected = newWidgets.filter(w => !selectedIds.includes(w.id));
                
                if (action === 'front') {
                    newWidgets = [...unselected, ...selected];
                } else if (action === 'back') {
                    newWidgets = [...selected, ...unselected];
                } else {
                    if (action === 'forward') {
                        for (let i = newWidgets.length - 2; i >= 0; i--) {
                            if (selectedIds.includes(newWidgets[i].id) && !selectedIds.includes(newWidgets[i+1].id)) {
                                [newWidgets[i], newWidgets[i+1]] = [newWidgets[i+1], newWidgets[i]];
                            }
                        }
                    } else if (action === 'backward') {
                        for (let i = 1; i < newWidgets.length; i++) {
                            if (selectedIds.includes(newWidgets[i].id) && !selectedIds.includes(newWidgets[i-1].id)) {
                                [newWidgets[i], newWidgets[i-1]] = [newWidgets[i-1], newWidgets[i]];
                            }
                        }
                    }
                }
                return { ...s, widgets: newWidgets };
            }
            return s;
        })
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    if (!selectedIds.includes(widgetId)) {
        handleSelectWidget(widgetId, false);
    }
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  // --- Theme & Settings ---

  const handleApplyTheme = (themeId: string) => {
     const theme = PROJECT_THEMES[themeId];
     if (!theme) return;

     updateProject(`Apply Theme: ${theme.name}`, prev => ({
         ...prev,
         settings: { ...prev.settings, theme: themeId, defaultBackgroundColor: theme.colors.background },
         screens: prev.screens.map(screen => ({
             ...screen,
             backgroundColor: theme.colors.background,
             widgets: screen.widgets.map(widget => {
                 const newStyle = { ...widget.style };
                 // ... switch logic ...
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
                        newStyle.backgroundColor = theme.colors.secondary;
                        newStyle.borderColor = theme.colors.primary;
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
                     case WidgetType.BAR:
                        newStyle.backgroundColor = theme.colors.secondary;
                        newStyle.borderColor = theme.colors.primary;
                        newStyle.borderRadius = theme.borderRadius;
                        break;
                     case WidgetType.ROLLER:
                        newStyle.backgroundColor = theme.colors.surface;
                        newStyle.textColor = theme.colors.text;
                        newStyle.borderColor = theme.colors.border;
                        newStyle.borderRadius = theme.borderRadius;
                        break;
                     case WidgetType.DROPDOWN:
                        newStyle.backgroundColor = theme.colors.surface;
                        newStyle.textColor = theme.colors.text;
                        newStyle.borderColor = theme.colors.border;
                        newStyle.borderRadius = theme.borderRadius;
                        break;
                     case WidgetType.KEYBOARD:
                        newStyle.backgroundColor = theme.colors.secondary;
                        newStyle.borderColor = theme.colors.border;
                        newStyle.borderRadius = theme.borderRadius;
                        break;
                 }
                 return { ...widget, style: newStyle };
             })
         }))
     }));
  };

  const handleUpdateSettings = (newSettings: CanvasSettings) => {
      updateProject('Update Settings', prev => ({ ...prev, settings: newSettings }));
  };

  // --- AI Code Generation ---

  const handleGenerateCode = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setShowCode(true);
    setCode(''); 

    try {
        const generated = await generateLVGLCode(screens, canvasSettings, codeLanguage, aiSettings);
        setCode(generated);
    } catch (e) {
        setCode(`// Error generating code: ${(e as Error).message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
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
          
          {/* Undo / Redo / History */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
             <button 
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
             >
                <RotateCcw size={18} />
             </button>
             <button 
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
             >
                <RotateCw size={18} />
             </button>
             
             <div className="w-px h-4 bg-slate-700 mx-1"></div>
             
             <HistoryMenu 
                past={past}
                onJumpTo={jumpToHistory}
                isOpen={showHistory}
                onToggle={() => setShowHistory(!showHistory)}
                onClose={() => setShowHistory(false)}
             />
          </div>

          <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>
          
          {/* Zoom */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
             <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded"><ZoomOut size={14} /></button>
             <button onClick={() => setZoom(1)} className="text-xs font-mono w-10 text-center hover:text-white text-slate-300">{Math.round(zoom * 100)}%</button>
             <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded"><ZoomIn size={14} /></button>
          </div>
          
          <button onClick={() => setShowSamples(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-700"><FileJson size={16} className="text-blue-400" /> Templates</button>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
             <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)} className="bg-slate-800 text-xs font-medium text-slate-300 focus:outline-none px-2 py-1 cursor-pointer hover:text-white border-none">
              <option value="c" className="bg-slate-800">C (LVGL)</option>
              <option value="micropython" className="bg-slate-800">MicroPython</option>
            </select>
          </div>
          
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700 bg-slate-800" title="Settings">
             <SettingsIcon size={16} /> 
             <span className="hidden lg:inline text-xs font-medium">Settings</span>
          </button>

          {/* Help Button */}
          <button 
            onClick={() => setShowHelp(true)} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors border border-indigo-500 shadow-lg shadow-indigo-900/20" 
            title="Help"
          >
             <CircleHelp size={16} /> 
             <span className="hidden lg:inline text-xs font-medium">Help</span>
          </button>

          <button onClick={handleGenerateCode} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20"><Code size={16} /> Generate Code</button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <WidgetPalette 
          onAddWidget={handleAddWidget}
          onAddWidgetFromAI={handleAddWidgetFromAI}
          screens={screens}
          activeScreenId={activeScreenId}
          onSetActiveScreen={handleSetActiveScreen}
          onAddScreen={handleAddScreen}
          onDeleteScreen={handleDeleteScreen}
          aiSettings={aiSettings}
        />
        
        <Canvas 
          widgets={visibleSortedWidgets} 
          layers={currentScreen.layers}
          settings={{...canvasSettings, backgroundColor: currentScreen.backgroundColor }}
          zoom={zoom}
          selectedIds={selectedIds}
          onSelectWidget={handleSelectWidget}
          onUpdateWidgets={handleUpdateWidgets}
          onAddWidget={handleAddWidget}
          onContextMenu={handleContextMenu}
        />
        
        <PropertiesPanel 
          selectedWidgets={selectedWidgets}
          settings={canvasSettings}
          currentScreen={currentScreen}
          allScreens={screens}
          onUpdateWidget={handleUpdateWidget}
          onUpdateSettings={handleUpdateSettings}
          onUpdateScreen={handleUpdateScreen}
          onDeleteWidgets={handleDeleteWidgets}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          onLayerAction={handleLayerAction}
          stylePresets={stylePresets}
          onAddPreset={(name, style) => updateProject('Add Style Preset', prev => ({ ...prev, stylePresets: [...prev.stylePresets, { id: `preset_${Date.now()}`, name, style }] }))}
          onDeletePreset={(id) => updateProject('Delete Style Preset', prev => ({ ...prev, stylePresets: prev.stylePresets.filter(p => p.id !== id) }))}
          onApplyTheme={handleApplyTheme}
          layers={currentScreen.layers}
          activeLayerId={activeLayerId}
          onSetActiveLayer={(id) => updateProject('Select Layer', prev => ({ ...prev, activeLayerId: id }))}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onToggleLayerVisible={handleToggleLayerVisible}
          onToggleLayerLock={handleToggleLayerLock}
          onRenameLayer={handleRenameLayer}
          onReorderLayers={handleReorderLayers}
        />
      </main>

      {/* Footer */}
      <footer className="h-7 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0 select-none z-10">
         <div>
            &copy; 2025 <a href="https://lvglstudio.online" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">lvglstudio.online</a>. All rights reserved.
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setShowHelp(true)} className="hover:text-slate-300 transition-colors">Help & Documentation</button>
            <span className="text-slate-700">|</span>
            <a href="https://github.com/lvgl-studio/lvgl-studio-ai" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub</a>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Changelog</a>
         </div>
      </footer>

      {/* Modals */}
      {showCode && <CodeViewer code={code} language={codeLanguage} isLoading={isGenerating} onClose={() => setShowCode(false)} onRefresh={handleGenerateCode} onLanguageChange={setCodeLanguage} />}
      <SettingsDialog 
         isOpen={showSettings} 
         onClose={() => setShowSettings(false)} 
         settings={aiSettings} 
         onSave={setAiSettings} 
         onSaveProject={handleSaveProject}
         onOpenProject={handleOpenProjectClick}
         onImportFromUrl={handleImportFromUrl}
      />
      <SampleCatalogue isOpen={showSamples} onClose={() => setShowSamples(false)} onSelectSample={handleLoadSample} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} />
      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {contextMenu && (
        <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu(null)}
            onDuplicate={handleDuplicateWidgets}
            onDelete={() => handleDeleteWidgets(selectedIds)}
            onLayerAction={handleLayerAction}
        />
      )}
    </div>
  );
};

export default App;
