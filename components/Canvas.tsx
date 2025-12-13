

import React, { useRef, useState, useEffect } from 'react';
import { Widget, CanvasSettings, WidgetType, Layer } from '../types';
import { 
  Image as ImageIcon,
  Home,
  Settings,
  Check,
  X,
  Plus,
  Minus,
  Edit,
  Save,
  Wifi,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
  Play,
  Pause,
  Bell,
  Trash,
  User,
  MapPin,
  Power,
  Bluetooth,
  Phone,
  Keyboard,
  Usb,
  Upload,
  Download,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface CanvasProps {
  widgets: Widget[];
  layers: Layer[];
  settings: CanvasSettings;
  zoom: number;
  selectedIds: string[];
  onSelectWidget: (id: string | null, isShift: boolean) => void;
  onUpdateWidgets: (updates: {id: string, changes: Partial<Widget>}[]) => void;
  onAddWidget: (type: WidgetType, x?: number, y?: number) => void;
}

const LVGL_SYMBOLS: Record<string, React.ReactNode> = {
  'LV_SYMBOL_HOME': <Home />,
  'LV_SYMBOL_SETTINGS': <Settings />,
  'LV_SYMBOL_OK': <Check />,
  'LV_SYMBOL_CLOSE': <X />,
  'LV_SYMBOL_PLUS': <Plus />,
  'LV_SYMBOL_MINUS': <Minus />,
  'LV_SYMBOL_EDIT': <Edit />,
  'LV_SYMBOL_SAVE': <Save />,
  'LV_SYMBOL_WIFI': <Wifi />,
  'LV_SYMBOL_BLUETOOTH': <Bluetooth />,
  'LV_SYMBOL_GPS': <MapPin />,
  'LV_SYMBOL_USB': <Usb />,
  'LV_SYMBOL_BATTERY_FULL': <BatteryFull />,
  'LV_SYMBOL_BATTERY_3': <BatteryFull />, // Reuse full or almost full
  'LV_SYMBOL_BATTERY_2': <BatteryMedium />,
  'LV_SYMBOL_BATTERY_1': <BatteryLow />,
  'LV_SYMBOL_BATTERY_EMPTY': <BatteryWarning />,
  'LV_SYMBOL_CHARGE': <Zap />,
  'LV_SYMBOL_CALL': <Phone />,
  'LV_SYMBOL_PLAY': <Play />,
  'LV_SYMBOL_PAUSE': <Pause />,
  'LV_SYMBOL_STOP': <X />, // Commonly mapped or use square
  'LV_SYMBOL_NEXT': <SkipForward />,
  'LV_SYMBOL_PREV': <SkipBack />,
  'LV_SYMBOL_BELL': <Bell />,
  'LV_SYMBOL_TRASH': <Trash />,
  'LV_SYMBOL_USER': <User />,
  'LV_SYMBOL_POWER': <Power />,
  'LV_SYMBOL_KEYBOARD': <Keyboard />,
  'LV_SYMBOL_UPLOAD': <Upload />,
  'LV_SYMBOL_DOWNLOAD': <Download />,
  'LV_SYMBOL_EYE_OPEN': <Eye />,
  'LV_SYMBOL_EYE_CLOSE': <EyeOff />,
  'LV_SYMBOL_VOLUME_MAX': <Volume2 />,
  'LV_SYMBOL_MUTE': <VolumeX />,
  'LV_SYMBOL_SHUFFLE': <Shuffle />,
  'LV_SYMBOL_LOOP': <Repeat />,
};

const Canvas: React.FC<CanvasProps> = ({ 
  widgets, 
  layers,
  settings, 
  zoom,
  selectedIds, 
  onSelectWidget, 
  onUpdateWidgets,
  onAddWidget
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag state tracks moving widgets
  const [dragState, setDragState] = useState<{
    startMouse: {x: number, y: number};
    initialPositions: Record<string, {x: number, y: number}>;
  } | null>(null);

  // Resize state tracks resizing a single widget
  const [resizeState, setResizeState] = useState<{
    active: boolean;
    direction: string; // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
    startMouse: {x: number, y: number};
    startWidget: {x: number, y: number, width: number, height: number};
    widgetId: string;
    aspectRatio: number;
  } | null>(null);

  const isLayerLocked = (layerId: string) => {
    return layers.find(l => l.id === layerId)?.locked ?? false;
  };

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.stopPropagation();
    
    // Prevent interaction if layer is locked
    if (isLayerLocked(widget.layerId)) return;

    // If we are currently resizing, don't start a drag
    if (resizeState?.active) return;

    // Select widget (with Shift logic)
    onSelectWidget(widget.id, e.shiftKey);
    
    const canvasRect = (e.currentTarget.offsetParent as HTMLElement).getBoundingClientRect();
    
    let effectiveSelectedIds = [...selectedIds];
    const isAlreadySelected = selectedIds.includes(widget.id);
    
    if (!isAlreadySelected && !e.shiftKey) {
        if (widget.groupId) {
            effectiveSelectedIds = widgets.filter(w => w.groupId === widget.groupId).map(w => w.id);
        } else {
            effectiveSelectedIds = [widget.id];
        }
    } else if (!isAlreadySelected && e.shiftKey) {
        effectiveSelectedIds.push(widget.id);
        if (widget.groupId) {
            const peers = widgets.filter(w => w.groupId === widget.groupId).map(w => w.id);
            effectiveSelectedIds = [...new Set([...effectiveSelectedIds, ...peers])];
        }
    }
    
    const initialPos: Record<string, {x: number, y: number}> = {};
    widgets.forEach(w => {
        if (effectiveSelectedIds.includes(w.id)) {
            // Safety check for locking again
            if (!isLayerLocked(w.layerId)) {
                initialPos[w.id] = { x: w.x, y: w.y };
            }
        }
    });

    if (Object.keys(initialPos).length > 0) {
        setDragState({
            startMouse: { x: e.clientX, y: e.clientY },
            initialPositions: initialPos
        });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string, widget: Widget) => {
    e.stopPropagation();
    if (isLayerLocked(widget.layerId)) return;

    setResizeState({
      active: true,
      direction,
      startMouse: { x: e.clientX, y: e.clientY },
      startWidget: { x: widget.x, y: widget.y, width: widget.width, height: widget.height },
      widgetId: widget.id,
      aspectRatio: widget.width / widget.height
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    onSelectWidget(null, false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType') as WidgetType;
    
    if (type && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        // Adjust for Zoom: Scale the difference between mouse and canvas edge
        let x = (e.clientX - canvasRect.left) / zoom;
        let y = (e.clientY - canvasRect.top) / zoom;
        
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;
        onAddWidget(type, x, y);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 1. Handle Resizing
      if (resizeState && resizeState.active) {
        // Adjust delta for zoom
        const deltaX = (e.clientX - resizeState.startMouse.x) / zoom;
        const deltaY = (e.clientY - resizeState.startMouse.y) / zoom;
        
        let newX = resizeState.startWidget.x;
        let newY = resizeState.startWidget.y;
        let newWidth = resizeState.startWidget.width;
        let newHeight = resizeState.startWidget.height;

        const { direction, aspectRatio, widgetId } = resizeState;
        const currentWidget = widgets.find(w => w.id === widgetId);
        // Lock aspect ratio for Icons, Images, or if Shift is held
        const shouldLockAspect = (currentWidget?.type === WidgetType.ICON || currentWidget?.type === WidgetType.IMAGE) || e.shiftKey;

        // --- Standard Calculation ---
        // Horizontal
        if (direction.includes('e')) {
          newWidth = Math.max(10, resizeState.startWidget.width + deltaX);
        } else if (direction.includes('w')) {
          const maxDelta = resizeState.startWidget.width - 10;
          const appliedDelta = Math.min(maxDelta, deltaX); // Cannot shrink past 10 width
          newX = resizeState.startWidget.x + appliedDelta;
          newWidth = resizeState.startWidget.width - appliedDelta;
        }

        // Vertical
        if (direction.includes('s')) {
          newHeight = Math.max(10, resizeState.startWidget.height + deltaY);
        } else if (direction.includes('n')) {
          const maxDelta = resizeState.startWidget.height - 10;
          const appliedDelta = Math.min(maxDelta, deltaY); // Cannot shrink past 10 height
          newY = resizeState.startWidget.y + appliedDelta;
          newHeight = resizeState.startWidget.height - appliedDelta;
        }

        // --- Aspect Ratio Correction ---
        if (shouldLockAspect) {
          if (direction.length === 2) { 
            // Corner Resizing: Drive by width, adjust height
            const calculatedHeight = newWidth / aspectRatio;
            
            // Adjust Y if dragging from top (North)
            if (direction.includes('n')) {
               newY = resizeState.startWidget.y + (resizeState.startWidget.height - calculatedHeight);
            }
            newHeight = calculatedHeight;
          } else {
             // Edge Resizing: Maintain aspect ratio
             if (direction === 'e' || direction === 'w') {
                newHeight = newWidth / aspectRatio;
             } else if (direction === 'n' || direction === 's') {
                newWidth = newHeight * aspectRatio;
             }
          }
        }

        // Snap to grid (optional, can be toggled)
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
        
        // If not locked, snap dimensions. If locked, snap width but let height flow (or vice versa) to be smooth
        if (!shouldLockAspect) {
           newWidth = Math.round(newWidth / 10) * 10;
           newHeight = Math.round(newHeight / 10) * 10;
        } else {
           // Round to nearest integer at least
           newWidth = Math.round(newWidth);
           newHeight = Math.round(newHeight);
        }

        // Ensure min size again after snap
        if (newWidth < 10) newWidth = 10;
        if (newHeight < 10) newHeight = 10;

        onUpdateWidgets([{ 
          id: resizeState.widgetId, 
          changes: { x: newX, y: newY, width: newWidth, height: newHeight }
        }]);
        return;
      }

      // 2. Handle Moving
      if (dragState && canvasRef.current) {
        // Adjust delta for zoom
        const deltaX = (e.clientX - dragState.startMouse.x) / zoom;
        const deltaY = (e.clientY - dragState.startMouse.y) / zoom;

        const updates: {id: string, changes: Partial<Widget>}[] = [];

        Object.entries(dragState.initialPositions).forEach(([id, initPos]) => {
            const pos = initPos as { x: number, y: number };
            let newX = pos.x + deltaX;
            let newY = pos.y + deltaY;

            // Snap to grid
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;

            updates.push({ id, changes: { x: newX, y: newY }});
        });
        
        if (updates.length > 0) {
          onUpdateWidgets(updates);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, resizeState, widgets, onUpdateWidgets, zoom]);


  // Rendering Helpers
  const renderWidget = (widget: Widget) => {
    const isSelected = selectedIds.includes(widget.id);
    const isSingleSelection = selectedIds.length === 1 && isSelected;
    const locked = isLayerLocked(widget.layerId);
    const hasEvents = (widget.events || []).length > 0;

    // Container Style: Positioning and layout
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: widget.x,
      top: widget.y,
      width: widget.width,
      height: widget.height,
      opacity: widget.style.opacity ?? 1,
      cursor: locked ? 'not-allowed' : (dragState && isSelected ? 'grabbing' : 'grab'),
      userSelect: 'none',
      boxSizing: 'border-box',
    };

    // Inner Style: Visuals (bg, border, radius, font)
    const innerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: widget.style.backgroundColor,
      color: widget.style.textColor,
      borderWidth: widget.style.borderWidth,
      borderColor: widget.style.borderColor,
      borderRadius: widget.style.borderRadius,
      fontSize: widget.style.fontSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden', // Clip content that spills out
      pointerEvents: 'none', // Let clicks pass to container (except specific interactive parts if needed)
    };

    // Selection Ring (applied to container)
    const selectionRing = isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'z-0';
    
    const renderInner = () => {
        switch (widget.type) {
          case WidgetType.BUTTON:
            const isIconMode = widget.contentMode === 'icon';
            return (
              <div className="w-full h-full flex items-center justify-center shadow-md relative overflow-hidden group">
                 {/* Gradient sheen effect simulation */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                 {isIconMode ? (
                     // Render Icon
                     (() => {
                        const IconComp = LVGL_SYMBOLS[widget.symbol || 'LV_SYMBOL_HOME'] || <Home />;
                        // Scale icon relative to button height/width but keep it contained
                        const iconSize = Math.min(widget.width, widget.height) * 0.6;
                        return React.cloneElement(IconComp as React.ReactElement, { size: iconSize });
                     })()
                 ) : (
                     // Render Text
                     <span className="relative font-medium">{widget.text}</span>
                 )}
              </div>
            );
          
          case WidgetType.LABEL:
            return (
              <div 
                className="w-full h-full flex items-center justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ lineHeight: 1.2 }}
              >
                {widget.text}
              </div>
            );
          
          case WidgetType.SLIDER:
             const sliderVal = widget.value || 0;
             const sliderMin = widget.min || 0;
             const sliderMax = widget.max || 100;
             const sliderPercent = Math.min(100, Math.max(0, ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * 100));
             
             // Detect Orientation
             const isVertical = widget.height > widget.width;

             if (isVertical) {
                return (
                   <div className="w-full h-full flex items-center justify-center py-1">
                     <div className="relative h-full w-2 rounded-full overflow-visible" style={{ backgroundColor: widget.style.backgroundColor || '#e5e7eb' }}>
                        {/* Indicator (Bottom up) */}
                        <div 
                          className="absolute left-0 bottom-0 w-full rounded-full" 
                          style={{ height: `${sliderPercent}%`, backgroundColor: widget.style.borderColor || '#3b82f6' }}
                        ></div>
                        {/* Knob */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md border border-slate-200"
                          style={{ 
                            bottom: `calc(${sliderPercent}% - 10px)`, 
                            cursor: 'pointer' 
                          }}
                        ></div>
                     </div>
                   </div>
                );
             }

             return (
               <div className="w-full h-full flex items-center justify-center px-1">
                 <div className="relative w-full h-2 rounded-full overflow-visible" style={{ backgroundColor: widget.style.backgroundColor || '#e5e7eb' }}>
                    {/* Indicator */}
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full" 
                      style={{ width: `${sliderPercent}%`, backgroundColor: widget.style.borderColor || '#3b82f6' }}
                    ></div>
                    {/* Knob - centered on the end of the indicator */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border border-slate-200"
                      style={{ 
                        left: `calc(${sliderPercent}% - 10px)`, // 10px is half of knob width
                        cursor: 'pointer' 
                      }}
                    ></div>
                 </div>
               </div>
             );
          
          case WidgetType.SWITCH:
             return (
              <div className="w-full h-full relative transition-colors duration-200" style={{
                  backgroundColor: widget.checked ? (widget.style.borderColor || '#3b82f6') : (widget.style.backgroundColor || '#e5e7eb'),
                  borderRadius: 999
              }}>
                <div style={{
                  position: 'absolute', 
                  width: widget.height - 6, 
                  height: widget.height - 6, 
                  backgroundColor: '#fff', 
                  borderRadius: '50%',
                  top: 3,
                  left: widget.checked ? `calc(100% - ${widget.height - 3}px)` : 3, 
                  transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            );
          
          case WidgetType.CHECKBOX:
             return (
                <div className="flex items-center gap-3 w-full h-full px-1">
                  <div style={{
                    width: 20, 
                    height: 20, 
                    minWidth: 20,
                    borderRadius: 4,
                    border: `2px solid ${widget.checked ? (widget.style.borderColor || '#3b82f6') : (widget.style.textColor || '#374151')}`, 
                    backgroundColor: widget.checked ? (widget.style.borderColor || '#3b82f6') : 'transparent', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    {widget.checked && <Check size={14} color="white" strokeWidth={3} />}
                  </div>
                  <span className="truncate">{widget.text}</span>
                </div>
             );
          
          case WidgetType.ARC:
             const arcVal = widget.value || 0;
             const arcMin = widget.min || 0;
             const arcMax = widget.max || 100;
             const arcPercent = Math.min(100, Math.max(0, ((arcVal - arcMin) / (arcMax - arcMin)) * 100));
             const trackColor = widget.style.backgroundColor || '#e5e7eb';
             const indicatorColor = widget.style.borderColor || '#3b82f6';
             const width = widget.style.borderWidth || 10;
             
             return (
                <div className="w-full h-full relative rounded-full" style={{
                   background: `conic-gradient(${indicatorColor} ${arcPercent}%, ${trackColor} 0)`
                }}>
                   {/* Inner cutout to make it an arc/ring */}
                   <div className="absolute rounded-full bg-white" 
                        style={{
                           inset: `${width}px`,
                           backgroundColor: settings.backgroundColor // Match canvas bg to simulate transparency
                        }}
                   >
                     {/* Center Value Text (optional but nice) */}
                     <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                       {arcVal}%
                     </div>
                   </div>
                </div>
             );
          
          case WidgetType.CONTAINER:
             return (
               <div className="w-full h-full overflow-hidden shadow-sm" style={{
                 backgroundColor: widget.style.backgroundColor,
                 borderRadius: widget.style.borderRadius,
                 border: `${widget.style.borderWidth}px solid ${widget.style.borderColor}`
               }}>
                 {/* Dotted pattern if transparent, to indicate container area in edit mode */}
                 {widget.style.backgroundColor === 'transparent' && (
                    <div className="w-full h-full opacity-20 border-2 border-dashed border-slate-400"></div>
                 )}
               </div>
             );
          
          case WidgetType.TEXT_AREA:
             return (
               <div className="w-full h-full p-2 flex items-start text-left bg-white relative overflow-hidden">
                  <span className={`${widget.text ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                     {widget.text || widget.placeholder}
                  </span>
                  {/* Blinking Cursor */}
                  <div className="w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse inline-block align-middle"></div>
               </div>
             );
          
          case WidgetType.CHART:
             const gridColor = '#e5e7eb';
             const lineColor = '#3b82f6';
             const barColor = '#3b82f6';
             const isLine = widget.chartType === 'line';
             
             return (
               <div className="w-full h-full p-2 relative bg-white flex items-end justify-between gap-1 overflow-hidden">
                  {/* Background Grid */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      opacity: 0.5
                  }}></div>

                  {/* Dummy Data Points */}
                  {[30, 50, 45, 70, 60, 85, 40].map((h, i) => (
                    isLine ? (
                      // Line Chart Dots
                       <div key={i} style={{
                         position: 'absolute', 
                         left: `${(i / 6) * 80 + 10}%`, 
                         bottom: `${h}%`, 
                         width: 6, 
                         height: 6, 
                         borderRadius: '50%', 
                         backgroundColor: lineColor,
                         border: '1px solid white',
                         zIndex: 2
                       }}></div>
                    ) : (
                      // Bar Chart Bars
                      <div key={i} className="flex-1 rounded-t-sm relative z-10" style={{
                        height: `${h}%`, 
                        backgroundColor: barColor,
                        opacity: 0.8
                      }}></div>
                    )
                  ))}

                  {/* Line Chart Path (SVG) */}
                  {isLine && (
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{padding: '0 10%'}} preserveAspectRatio="none">
                       <polyline 
                          points="0,70 16.6,50 33.3,55 50,30 66.6,40 83.3,15 100,60" // Mapped roughly to 100-h
                          fill="none" 
                          stroke={lineColor} 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                       />
                       {/* Gradient fill below line */}
                       <polyline 
                          points="0,70 16.6,50 33.3,55 50,30 66.6,40 83.3,15 100,60 100,100 0,100" 
                          fill={lineColor} 
                          fillOpacity="0.1"
                          stroke="none"
                       />
                     </svg>
                  )}
               </div>
             );
          
          case WidgetType.IMAGE:
             if (widget.imageData) {
                return (
                   <img 
                      src={widget.imageData} 
                      alt="Widget Preview" 
                      className="w-full h-full object-cover pointer-events-none"
                   />
                );
             }
             return (
               <div className="flex flex-col items-center justify-center w-full h-full bg-slate-100 rounded border border-dashed border-slate-300 overflow-hidden text-slate-400">
                 <ImageIcon size={24} className="mb-1" />
                 <span className="text-[10px] truncate w-full text-center px-1 font-mono">{widget.src || 'No Image'}</span>
               </div>
             );
          
          case WidgetType.ICON:
             const IconComp = LVGL_SYMBOLS[widget.symbol || 'LV_SYMBOL_HOME'] || <Home />;
             // Ensure icon fits but doesn't overflow
             const iconSize = Math.min(widget.width, widget.height); 
             
             return (
                <div className="flex items-center justify-center w-full h-full text-center">
                   {React.cloneElement(IconComp as React.ReactElement, { size: iconSize })}
                </div>
             );
          
          default: return null;
        }
    }

    // Resize Handles
    const handles = [
       { cursor: 'nw-resize', pos: 'top-0 left-0', dir: 'nw' },
       { cursor: 'n-resize',  pos: 'top-0 left-1/2 -translate-x-1/2', dir: 'n' },
       { cursor: 'ne-resize', pos: 'top-0 right-0', dir: 'ne' },
       { cursor: 'e-resize',  pos: 'top-1/2 right-0 -translate-y-1/2', dir: 'e' },
       { cursor: 'se-resize', pos: 'bottom-0 right-0', dir: 'se' },
       { cursor: 's-resize',  pos: 'bottom-0 left-1/2 -translate-x-1/2', dir: 's' },
       { cursor: 'sw-resize', pos: 'bottom-0 left-0', dir: 'sw' },
       { cursor: 'w-resize',  pos: 'top-1/2 left-0 -translate-y-1/2', dir: 'w' },
    ];

    return (
      <div 
        key={widget.id} 
        style={containerStyle}
        className={`${selectionRing}`}
        onMouseDown={(e) => handleMouseDown(e, widget)}
      >
        <div style={innerStyle}>
           {renderInner()}
        </div>
        
        {/* Event Indicator Badge */}
        {hasEvents && !isSelected && (
           <div className="absolute top-0 right-0 p-0.5 bg-yellow-500 rounded-bl-md z-10 shadow-sm pointer-events-none">
              <Zap size={8} className="text-white fill-current" />
           </div>
        )}

        {/* Render Handles only for single selection and if NOT locked */}
        {isSingleSelection && !locked && handles.map(h => (
            <div 
               key={h.dir}
               className={`absolute w-2.5 h-2.5 bg-white border border-blue-500 z-20 ${h.pos}`}
               style={{ 
                  cursor: h.cursor,
                  // Position handles slightly outside so they are visible even with overflow:hidden
                  marginTop: h.dir.includes('n') ? '-5px' : undefined,
                  marginBottom: h.dir.includes('s') ? '-5px' : undefined,
                  marginLeft: h.dir.includes('w') ? '-5px' : undefined,
                  marginRight: h.dir.includes('e') ? '-5px' : undefined,
                  borderRadius: '50%', // Round handles look nicer
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
               }}
               onMouseDown={(e) => handleResizeMouseDown(e, h.dir, widget)}
            />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden p-8">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '20px 20px'
       }}></div>

       {/* Screen Area */}
       <div 
         ref={canvasRef}
         onMouseDown={handleCanvasMouseDown}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
         className="relative shadow-2xl transition-all duration-300 origin-center"
         style={{
           width: settings.width,
           height: settings.height,
           backgroundColor: settings.backgroundColor,
           border: '1px solid #334155',
           transform: `scale(${zoom})`,
         }}
       >
         {widgets.map(renderWidget)}
       </div>
       
       <div className="absolute top-4 right-4 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
         {settings.width} x {settings.height}
       </div>
    </div>
  );
};

export default Canvas;