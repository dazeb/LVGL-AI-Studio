import React, { useRef, useState, useEffect } from 'react';
import { Widget, CanvasSettings, WidgetType } from '../types';
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
  settings: CanvasSettings;
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
  settings, 
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

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.stopPropagation();
    
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
            initialPos[w.id] = { x: w.x, y: w.y };
        }
    });

    setDragState({
      startMouse: { x: e.clientX, y: e.clientY },
      initialPositions: initialPos
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string, widget: Widget) => {
    e.stopPropagation();
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
        let x = e.clientX - canvasRect.left;
        let y = e.clientY - canvasRect.top;
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
        const deltaX = e.clientX - resizeState.startMouse.x;
        const deltaY = e.clientY - resizeState.startMouse.y;
        
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
        const deltaX = e.clientX - dragState.startMouse.x;
        const deltaY = e.clientY - dragState.startMouse.y;

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
  }, [dragState, resizeState, widgets, onUpdateWidgets]);


  // Rendering Helpers
  const renderWidget = (widget: Widget) => {
    const isSelected = selectedIds.includes(widget.id);
    const isSingleSelection = selectedIds.length === 1 && isSelected;

    // Container Style: Positioning and layout
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: widget.x,
      top: widget.y,
      width: widget.width,
      height: widget.height,
      opacity: widget.style.opacity ?? 1,
      cursor: dragState && isSelected ? 'grabbing' : 'grab',
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
            return <div className="w-full h-full flex items-center justify-center shadow-sm" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>{widget.text}</div>;
          case WidgetType.LABEL:
            return <div className="w-full h-full flex items-center justify-start">{widget.text}</div>;
          case WidgetType.SLIDER:
             return (
               <div className="w-full h-full relative">
                 <div style={{position: 'absolute', width: '100%', height: '30%', backgroundColor: widget.style.backgroundColor || '#eee', borderRadius: 4, top: '35%'}}></div>
                 <div style={{position: 'absolute', width: `${widget.value || 30}%`, height: '30%', backgroundColor: widget.style.borderColor || '#2196F3', borderRadius: 4, left: 0, top: '35%'}}></div>
                 <div style={{position: 'absolute', width: widget.height, height: widget.height, backgroundColor: '#fff', border: `2px solid ${widget.style.borderColor || '#2196F3'}`, borderRadius: '50%', left: `calc(${widget.value || 30}% - ${widget.height/2}px)`, top: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.3)'}}></div>
               </div>
             );
          case WidgetType.SWITCH:
             return (
              <div className="w-full h-full relative" style={{
                  backgroundColor: widget.checked ? (widget.style.borderColor || '#2196F3') : (widget.style.backgroundColor || '#e0e0e0'),
                  borderRadius: 20
              }}>
                <div style={{
                  position: 'absolute', width: widget.height - 4, height: widget.height - 4, backgroundColor: '#fff', borderRadius: '50%',
                  left: widget.checked ? `calc(100% - ${widget.height - 2}px)` : 2, top: 2, transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            );
          case WidgetType.CHECKBOX:
             return (
                <div className="flex items-center gap-2 w-full h-full">
                  <div style={{width: 20, height: 20, border: `2px solid ${widget.style.textColor}`, backgroundColor: widget.checked ? widget.style.textColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {widget.checked && <span style={{color: '#fff', fontSize: 14}}>✓</span>}
                  </div>
                  <span>{widget.text}</span>
                </div>
             );
          case WidgetType.ARC:
             return (
                <div className="w-full h-full relative" style={{
                   background: `conic-gradient(${widget.style.borderColor || '#2196F3'} ${(widget.value || 40)}%, ${widget.style.backgroundColor || '#eee'} 0)`, borderRadius: '50%'
                }}>
                   <div style={{position: 'absolute', inset: '10%', backgroundColor: settings.backgroundColor, borderRadius: '50%'}}></div>
                </div>
             );
          case WidgetType.CONTAINER:
             return <div className="w-full h-full"></div>;
          case WidgetType.TEXT_AREA:
             return (
               <div className="w-full h-full p-1 flex items-start text-left">
                  {widget.text ? widget.text : <span className="text-slate-400 italic">{widget.placeholder}</span>}
                  <div className="w-[1px] h-4 bg-slate-400 ml-1 animate-pulse"></div>
               </div>
             );
          case WidgetType.CHART:
             return (
               <div className="w-full h-full p-1 flex items-end justify-around gap-0.5">
                  {[40, 70, 30, 85, 50, 60].map((h, i) => (
                    widget.chartType === 'bar' ? (
                      <div key={i} style={{width: '12%', height: `${h}%`, backgroundColor: '#2196F3'}}></div>
                    ) : (
                      <div key={i} style={{position: 'absolute', left: `${(i/5)*80 + 10}%`, bottom: `${h}%`, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2196F3'}}></div>
                    )
                  ))}
                  {widget.chartType === 'line' && (
                     <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{padding: '4px 10%'}}>
                       <polyline points="0,60 20,30 40,70 60,15 80,50 100,40" fill="none" stroke="#2196F3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                     </svg>
                  )}
               </div>
             );
          case WidgetType.IMAGE:
             return (
               <div className="flex flex-col items-center justify-center w-full h-full">
                 <ImageIcon className="text-slate-400" size={24} />
                 <span className="text-[10px] text-slate-500 absolute bottom-1">{widget.src}</span>
               </div>
             );
          case WidgetType.ICON:
             const IconComp = LVGL_SYMBOLS[widget.symbol || 'LV_SYMBOL_HOME'] || <Home />;
             // Calculate size based on widget dimensions (min of w/h to fit)
             const iconSize = Math.min(widget.width, widget.height) * 0.8;
             return (
                <div className="flex items-center justify-center w-full h-full">
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

        {/* Render Handles only for single selection */}
        {isSingleSelection && handles.map(h => (
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
         className="relative shadow-2xl transition-all"
         style={{
           width: settings.width,
           height: settings.height,
           backgroundColor: settings.backgroundColor,
           border: '1px solid #334155'
         }}
       >
         {widgets.map(renderWidget)}
       </div>
       
       <div className="absolute top-4 right-4 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700">
         {settings.width} x {settings.height}
       </div>
    </div>
  );
};

export default Canvas;