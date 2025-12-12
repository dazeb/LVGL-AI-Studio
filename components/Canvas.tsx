import React, { useRef, useState, useEffect } from 'react';
import { Widget, CanvasSettings, WidgetType } from '../types';
import { Image as ImageIcon } from 'lucide-react';

interface CanvasProps {
  widgets: Widget[];
  settings: CanvasSettings;
  selectedIds: string[];
  onSelectWidget: (id: string | null, isShift: boolean) => void;
  onUpdateWidgets: (updates: {id: string, changes: Partial<Widget>}[]) => void;
  onAddWidget: (type: WidgetType, x?: number, y?: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  widgets, 
  settings, 
  selectedIds, 
  onSelectWidget, 
  onUpdateWidgets,
  onAddWidget
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag state now tracks initial positions of ALL selected widgets
  const [dragState, setDragState] = useState<{
    startMouse: {x: number, y: number};
    initialPositions: Record<string, {x: number, y: number}>;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.stopPropagation();
    
    // Select widget (with Shift logic)
    onSelectWidget(widget.id, e.shiftKey);
    
    // Prepare for drag
    // Note: onSelectWidget might change selectedIds, but react state updates are async.
    // However, if the widget is ALREADY selected, we are good.
    // If it wasn't selected, App.tsx logic selects it.
    // To properly calculate initial positions, we need to know the 'future' selection.
    // For simplicity, we assume if we clicked it, it will be included in selection or replace it.
    
    const canvasRect = (e.currentTarget.offsetParent as HTMLElement).getBoundingClientRect();
    
    // We construct the 'effective' list of IDs that will be dragged. 
    // If widget was already selected, we drag all current selectedIds.
    // If widget was NOT selected, and we didn't Shift-click, we drag ONLY this widget (and its group).
    
    let effectiveSelectedIds = [...selectedIds];
    const isAlreadySelected = selectedIds.includes(widget.id);
    
    if (!isAlreadySelected && !e.shiftKey) {
        // We are selecting a new single item (or group)
        if (widget.groupId) {
            effectiveSelectedIds = widgets.filter(w => w.groupId === widget.groupId).map(w => w.id);
        } else {
            effectiveSelectedIds = [widget.id];
        }
    } else if (!isAlreadySelected && e.shiftKey) {
        // Adding to selection
        effectiveSelectedIds.push(widget.id);
        // Add group peers if any
        if (widget.groupId) {
            const peers = widgets.filter(w => w.groupId === widget.groupId).map(w => w.id);
            effectiveSelectedIds = [...new Set([...effectiveSelectedIds, ...peers])];
        }
    }
    
    // Capture initial positions for the effective selection
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
      if (!dragState || !canvasRef.current) return;

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

          // Find widget dimensions for boundary check (optional/strict)
          const widget = widgets.find(w => w.id === id);
          if (widget) {
             // Optional: Constrain to canvas? 
             // Allowing overhang is usually better UX than hard stuck
             // So we just update
             updates.push({ id, changes: { x: newX, y: newY }});
          }
      });
      
      if (updates.length > 0) {
        onUpdateWidgets(updates);
      }
    };

    const handleGlobalMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, widgets, onUpdateWidgets]);


  // Rendering Helpers
  const renderWidget = (widget: Widget) => {
    const isSelected = selectedIds.includes(widget.id);
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: widget.x,
      top: widget.y,
      width: widget.width,
      height: widget.height,
      backgroundColor: widget.style.backgroundColor,
      color: widget.style.textColor,
      borderWidth: widget.style.borderWidth,
      borderColor: widget.style.borderColor,
      borderRadius: widget.style.borderRadius,
      fontSize: widget.style.fontSize,
      opacity: widget.style.opacity ?? 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: dragState && isSelected ? 'grabbing' : 'grab',
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none',
    };

    // Selection Ring
    // We can add a "Group" indicator here if we wanted, but sticking to simple rings is clean
    const selectionRing = isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'z-0';
    
    // Inner element rendering logic remains same...
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
          default: return null;
        }
    }

    return (
      <div 
        key={widget.id} 
        style={baseStyle}
        className={`${selectionRing}`}
        onMouseDown={(e) => handleMouseDown(e, widget)}
      >
        {renderInner()}
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