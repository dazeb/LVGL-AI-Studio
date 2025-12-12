import React, { useRef, useState, useEffect } from 'react';
import { Widget, CanvasSettings, WidgetType } from '../types';
import { Image as ImageIcon } from 'lucide-react';

interface CanvasProps {
  widgets: Widget[];
  settings: CanvasSettings;
  selectedId: string | null;
  onSelectWidget: (id: string | null) => void;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onAddWidget: (type: WidgetType, x?: number, y?: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  widgets, 
  settings, 
  selectedId, 
  onSelectWidget, 
  onUpdateWidget,
  onAddWidget
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.stopPropagation();
    onSelectWidget(widget.id);
    setIsDragging(true);
    // Offset relative to the widget
    const widgetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - widgetRect.left,
      y: e.clientY - widgetRect.top
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only deselect if the event wasn't stopped by a child widget
    onSelectWidget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType') as WidgetType;
    
    if (type && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        // Calculate drop position relative to canvas
        let x = e.clientX - canvasRect.left;
        let y = e.clientY - canvasRect.top;
        
        // Snap to grid
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;
        
        // Boundaries will be handled by logic or just let user place it 
        // We'll subtract a bit to center the widget on the cursor if we knew its size,
        // but since we don't know the size yet (it's in defaults), top-left is fine.
        
        onAddWidget(type, x, y);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // Using a global mouse move for smoother dragging even if mouse leaves widget momentarily
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedId || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate new widget position based on mouse position relative to canvas
      // minus the initial click offset within the widget.
      let newX = (e.clientX - canvasRect.left) - dragOffset.x;
      let newY = (e.clientY - canvasRect.top) - dragOffset.y;

      // Snap to grid (10px)
      newX = Math.round(newX / 10) * 10;
      newY = Math.round(newY / 10) * 10;

      // Boundaries
      const widget = widgets.find(w => w.id === selectedId);
      if (widget) {
        // Allow widget to slightly overhang but keep mostly in
        // or strictly constrain:
        newX = Math.max(0, Math.min(newX, settings.width - widget.width));
        newY = Math.max(0, Math.min(newY, settings.height - widget.height));
        
        onUpdateWidget(selectedId, { x: newX, y: newY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedId, dragOffset, onUpdateWidget, settings, widgets]);


  // Rendering Helpers
  const renderWidget = (widget: Widget) => {
    const isSelected = selectedId === widget.id;
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
      cursor: isDragging && isSelected ? 'grabbing' : 'grab',
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none',
    };

    const selectionRing = isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'z-0';

    switch (widget.type) {
      case WidgetType.BUTTON:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}
            className={`shadow-sm ${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            {widget.text}
          </div>
        );
      case WidgetType.LABEL:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, justifyContent: 'flex-start'}}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            {widget.text}
          </div>
        );
      case WidgetType.SLIDER:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, backgroundColor: 'transparent', borderWidth: 0}}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            {/* Track */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '30%',
              backgroundColor: widget.style.backgroundColor || '#eee',
              borderRadius: 4,
              top: '35%'
            }}></div>
            {/* Indicator */}
            <div style={{
              position: 'absolute',
              width: `${widget.value || 30}%`,
              height: '30%',
              backgroundColor: widget.style.borderColor || '#2196F3',
              borderRadius: 4,
              left: 0,
              top: '35%'
            }}></div>
            {/* Knob */}
            <div style={{
              position: 'absolute',
              width: widget.height, 
              height: widget.height,
              backgroundColor: '#fff',
              border: `2px solid ${widget.style.borderColor || '#2196F3'}`,
              borderRadius: '50%',
              left: `calc(${widget.value || 30}% - ${widget.height/2}px)`,
              top: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}></div>
          </div>
        );
      case WidgetType.SWITCH:
         return (
          <div 
            key={widget.id} 
            style={{
              ...baseStyle, 
              backgroundColor: widget.checked ? (widget.style.borderColor || '#2196F3') : (widget.style.backgroundColor || '#e0e0e0'),
              borderWidth: 0
            }}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            <div style={{
              position: 'absolute',
              width: widget.height - 4,
              height: widget.height - 4,
              backgroundColor: '#fff',
              borderRadius: '50%',
              left: widget.checked ? `calc(100% - ${widget.height - 2}px)` : 2,
              top: 2,
              transition: 'left 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}></div>
          </div>
        );
      case WidgetType.CHECKBOX:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, justifyContent: 'flex-start', gap: 8}}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            <div style={{
              width: 20, 
              height: 20, 
              border: `2px solid ${widget.style.textColor}`,
              backgroundColor: widget.checked ? widget.style.textColor : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {widget.checked && <span style={{color: '#fff', fontSize: 14}}>✓</span>}
            </div>
            <span>{widget.text}</span>
          </div>
        );
      case WidgetType.ARC:
        return (
          <div 
            key={widget.id} 
            style={{
               ...baseStyle, 
               background: `conic-gradient(${widget.style.borderColor || '#2196F3'} ${(widget.value || 40)}%, ${widget.style.backgroundColor || '#eee'} 0)`,
               borderRadius: '50%',
               borderWidth: 0
            }}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            <div style={{
              width: '80%',
              height: '80%',
              backgroundColor: settings.backgroundColor,
              borderRadius: '50%'
            }}></div>
          </div>
        );
      case WidgetType.CONTAINER:
         return (
          <div 
            key={widget.id} 
            style={baseStyle}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
          </div>
        );
      case WidgetType.TEXT_AREA:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, justifyContent: 'flex-start', alignItems: 'flex-start', padding: 4}}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
             {widget.text ? widget.text : <span className="text-slate-400 italic">{widget.placeholder}</span>}
             {/* Cursor simulation */}
             <div className="w-[1px] h-4 bg-slate-400 ml-1 animate-pulse"></div>
          </div>
        );
      case WidgetType.CHART:
        return (
          <div 
            key={widget.id} 
            style={{...baseStyle, padding: 4, alignItems: 'flex-end', justifyContent: 'space-around', gap: 2}}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
            {/* Simulated Chart Data */}
            {[40, 70, 30, 85, 50, 60].map((h, i) => (
              widget.chartType === 'bar' ? (
                <div key={i} style={{width: '12%', height: `${h}%`, backgroundColor: '#2196F3'}}></div>
              ) : (
                /* Rough line chart visual using a div point for simplicity in this mock */
                <div key={i} style={{
                    position: 'absolute', 
                    left: `${(i/5)*80 + 10}%`, 
                    bottom: `${h}%`, 
                    width: 6, height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: '#2196F3'
                }}></div>
              )
            ))}
             {widget.chartType === 'line' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{padding: '4px 10%'}}>
                   <polyline 
                      points="0,60 20,30 40,70 60,15 80,50 100,40" 
                      fill="none" 
                      stroke="#2196F3" 
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke" 
                    />
                </svg>
             )}
          </div>
        );
      case WidgetType.IMAGE:
        return (
          <div 
            key={widget.id} 
            style={baseStyle}
            className={`${selectionRing}`}
            onMouseDown={(e) => handleMouseDown(e, widget)}
          >
             {/* If it looks like a file path or symbol, just show icon */}
             <ImageIcon className="text-slate-400" size={24} />
             <span className="text-[10px] text-slate-500 absolute bottom-1">{widget.src}</span>
          </div>
        );
      default:
        return null;
    }
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