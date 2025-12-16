
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
  SkipForward,
  ChevronDown,
  Cloud,
  Server,
  Database,
  Network,
  Globe,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Info,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Search,
  Filter,
  File,
  Folder,
  FolderOpen,
  FileText,
  Mail,
  MessageSquare,
  Send,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Music,
  Video,
  List,
  RefreshCcw,
  Palette,
  Scissors,
  Copy,
  Clipboard,
  Delete,
  CornerDownLeft,
  LayoutGrid,
  Box,
  Film
} from 'lucide-react';

interface CanvasProps {
  widgets: Widget[];
  layers: Layer[];
  settings: CanvasSettings & { backgroundColor: string };
  zoom: number;
  selectedIds: string[];
  onSelectWidget: (id: string | string[] | null, isShift: boolean) => void;
  onUpdateWidgets: (updates: { id: string, changes: Partial<Widget> }[]) => void;
  onAddWidget: (type: WidgetType, x?: number, y?: number) => void;
  onContextMenu: (e: React.MouseEvent, widgetId: string) => void;
  isPreview?: boolean;
  onWidgetEvent?: (eventName: string, widgetId: string) => void;
  onZoomChange?: (zoom: number) => void;
}

interface Guideline {
  type: 'vertical' | 'horizontal';
  x?: number;
  y?: number;
  start: number;
  end: number;
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
  'LV_SYMBOL_BATTERY_3': <BatteryFull />,
  'LV_SYMBOL_BATTERY_2': <BatteryMedium />,
  'LV_SYMBOL_BATTERY_1': <BatteryLow />,
  'LV_SYMBOL_BATTERY_EMPTY': <BatteryWarning />,
  'LV_SYMBOL_CHARGE': <Zap />,
  'LV_SYMBOL_CALL': <Phone />,
  'LV_SYMBOL_PLAY': <Play />,
  'LV_SYMBOL_PAUSE': <Pause />,
  'LV_SYMBOL_STOP': <X />,
  'LV_SYMBOL_NEXT': <SkipForward />,
  'LV_SYMBOL_PREV': <SkipBack />,
  'LV_SYMBOL_BELL': <Bell />,
  'LV_SYMBOL_TRASH': <Trash />,
  'LV_SYMBOL_USER': <User />,
  'LV_SYMBOL_POWER': <Power />,
  'LV_SYMBOL_KEYBOARD': <Keyboard />,
  'LV_SYMBOL_UPLOAD': <Upload />,
  'LV_SYMBOL_DOWNLOAD': <Download />,
  'LV_SYMBOL_LEFT': <ChevronLeft />,
  'LV_SYMBOL_RIGHT': <ChevronRight />,
  'LV_SYMBOL_UP': <ChevronUp />,
  'LV_SYMBOL_DOWN': <ChevronDown />,
  'LV_SYMBOL_AUDIO': <Music />,
  'LV_SYMBOL_VIDEO': <Video />,
  'LV_SYMBOL_LIST': <List />,
  'LV_SYMBOL_REFRESH': <RefreshCcw />,
  'LV_SYMBOL_TINT': <Palette />,
  'LV_SYMBOL_DIRECTORY': <Folder />,
  'LV_SYMBOL_CUT': <Scissors />,
  'LV_SYMBOL_COPY': <Copy />,
  'LV_SYMBOL_PASTE': <Clipboard />,
  'LV_SYMBOL_ENVELOPE': <Mail />,
  'LV_SYMBOL_BACKSPACE': <Delete />,
  'LV_SYMBOL_NEW_LINE': <CornerDownLeft />,
  'LV_SYMBOL_DRIVE': <HardDrive />,
  'LV_SYMBOL_WARNING': <AlertTriangle />,
  'LV_SYMBOL_IMAGE': <ImageIcon />,

  // Extras
  'LV_SYMBOL_INFO': <Info />,
  'LV_SYMBOL_ERROR': <AlertCircle />,
  'LV_SYMBOL_FILE': <File />,
  'LV_SYMBOL_CALENDAR': <Calendar />,
  'LV_SYMBOL_CLOCK': <Clock />,
  'LV_SYMBOL_LOCK': <Lock />,
  'LV_SYMBOL_UNLOCK': <Unlock />,
  'LV_SYMBOL_SEARCH': <Search />,
  'LV_SYMBOL_FILTER': <Filter />,
  'LV_SYMBOL_MESSAGE': <MessageSquare />,
  'LV_SYMBOL_SEND': <Send />,
  'LV_SYMBOL_CPU': <Cpu />,
  'LV_SYMBOL_SD_CARD': <HardDrive />, // Mapping SD to drive for now
  'LV_SYMBOL_LOOP': <Repeat />,
  'LV_SYMBOL_SHUFFLE': <Shuffle />,
  'LV_SYMBOL_MUTE': <VolumeX />,
  'LV_SYMBOL_VOLUME_MAX': <Volume2 />,
  'LV_SYMBOL_GRID': <LayoutGrid />,
  'LV_SYMBOL_EYE_OPEN': <Eye />,

  'LV_SYMBOL_CLOUD': <Cloud />,
  'LV_SYMBOL_SERVER': <Server />,
  'LV_SYMBOL_DATABASE': <Database />,
  'LV_SYMBOL_NETWORK': <Network />,
  'LV_SYMBOL_GLOBE': <Globe />,
};

// Helper: Check rectangle intersection
const checkIntersection = (r1: { x: number, y: number, w: number, h: number }, r2: { x: number, y: number, w: number, h: number }) => {
  return !(r2.x > r1.x + r1.w ||
    r2.x + r2.w < r1.x ||
    r2.y > r1.y + r1.h ||
    r2.y + r2.h < r1.y);
};

const Canvas: React.FC<CanvasProps> = ({
  widgets,
  layers,
  settings,
  zoom,
  selectedIds,
  onSelectWidget,
  onUpdateWidgets,
  onAddWidget,
  onContextMenu,
  isPreview = false,
  onWidgetEvent,
  onZoomChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag state tracks moving widgets
  const [dragState, setDragState] = useState<{
    startMouse: { x: number, y: number };
    initialPositions: Record<string, { x: number, y: number }>;
  } | null>(null);

  // Resize state tracks resizing widgets (single or group)
  const [resizeState, setResizeState] = useState<{
    active: boolean;
    direction: string; // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
    startMouse: { x: number, y: number };
    startWidget: { x: number, y: number, width: number, height: number }; // The bounding box being resized
    widgetId: string | 'GROUP';
    aspectRatio: number;
    // For Group Scaling
    initialWidgetStates: Record<string, { x: number, y: number, width: number, height: number }>;
  } | null>(null);

  // Marquee Selection State
  const [selectionBox, setSelectionBox] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Guideline Alignment State
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const snapLinesRef = useRef<{
    vertical: { pos: number, min: number, max: number }[],
    horizontal: { pos: number, min: number, max: number }[]
  }>({ vertical: [], horizontal: [] });

  // Transient state for smooth rendering without history spam
  const [transientChanges, setTransientChanges] = useState<Record<string, Partial<Widget>>>({});
  const transientChangesRef = useRef<Record<string, Partial<Widget>>>({});

  const isLayerLocked = (layerId: string) => {
    return layers.find(l => l.id === layerId)?.locked ?? false;
  };

  const getGroupBounds = () => {
    if (selectedIds.length === 0) return null;
    const selected = widgets.filter(w => selectedIds.includes(w.id));
    if (selected.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selected.forEach(w => {
      // Use transient position if available
      const t = transientChanges[w.id] || {};
      const x = t.x !== undefined ? t.x : w.x;
      const y = t.y !== undefined ? t.y : w.y;
      const width = t.width !== undefined ? t.width : w.width;
      const height = t.height !== undefined ? t.height : w.height;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.altKey && onZoomChange) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(3, Math.max(0.2, zoom + delta));
      onZoomChange(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    if (e.button !== 0) return; // Only left click
    if (isPreview) return; // No editing interaction in Preview Mode

    e.stopPropagation();

    // Prevent interaction if layer is locked
    if (isLayerLocked(widget.layerId)) return;

    // If we are currently resizing, don't start a drag
    if (resizeState?.active) return;

    // Logic to handle selection state before dragging
    const isAlreadySelected = selectedIds.includes(widget.id);

    if (!isAlreadySelected && !e.shiftKey) {
      // Single select new item
      onSelectWidget(widget.id, false);
    } else if (e.shiftKey) {
      // Toggle selection
      onSelectWidget(widget.id, true);
    }

    let effectiveSelectedIds = isAlreadySelected
      ? [...selectedIds] // Dragging existing selection
      : e.shiftKey ? [...selectedIds, widget.id] : [widget.id]; // Dragging new selection

    const initialPos: Record<string, { x: number, y: number }> = {};

    // We iterate over ALL widgets to find those that match effective selection
    widgets.forEach(w => {
      if (effectiveSelectedIds.includes(w.id)) {
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

      // Pre-calculate Snap Lines from UNSELECTED widgets
      const unselectedWidgets = widgets.filter(w => !effectiveSelectedIds.includes(w.id));
      snapLinesRef.current = {
        vertical: unselectedWidgets.flatMap(w => [
          { pos: w.x, min: w.y, max: w.y + w.height },             // Left
          { pos: w.x + w.width / 2, min: w.y, max: w.y + w.height }, // Center
          { pos: w.x + w.width, min: w.y, max: w.y + w.height }      // Right
        ]),
        horizontal: unselectedWidgets.flatMap(w => [
          { pos: w.y, min: w.x, max: w.x + w.width },              // Top
          { pos: w.y + w.height / 2, min: w.x, max: w.x + w.width }, // Middle
          { pos: w.y + w.height, min: w.x, max: w.x + w.width }      // Bottom
        ])
      };
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string, id: string | 'GROUP') => {
    e.stopPropagation();

    let startBox: { x: number, y: number, width: number, height: number };
    const initialStates: Record<string, { x: number, y: number, width: number, height: number }> = {};

    if (id === 'GROUP') {
      const bounds = getGroupBounds();
      if (!bounds) return;
      startBox = bounds;

      // Capture state of all selected widgets
      widgets.filter(w => selectedIds.includes(w.id)).forEach(w => {
        initialStates[w.id] = { x: w.x, y: w.y, width: w.width, height: w.height };
      });

    } else {
      const widget = widgets.find(w => w.id === id);
      if (!widget || isLayerLocked(widget.layerId)) return;
      startBox = { x: widget.x, y: widget.y, width: widget.width, height: widget.height };
      initialStates[widget.id] = startBox;
    }

    setResizeState({
      active: true,
      direction,
      startMouse: { x: e.clientX, y: e.clientY },
      startWidget: startBox,
      widgetId: id,
      aspectRatio: startBox.width / startBox.height,
      initialWidgetStates: initialStates
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If clicking on empty canvas
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setSelectionBox({
        active: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y
      });

      // Clear selection unless Shift is held
      if (!e.shiftKey) {
        onSelectWidget(null, false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType') as WidgetType;

    if (type && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
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
      // 1. Handle Selection Marquee
      if (selectionBox?.active && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        setSelectionBox(prev => prev ? ({ ...prev, currentX: x, currentY: y }) : null);
      }

      // 2. Handle Resizing
      if (resizeState && resizeState.active) {
        const deltaX = (e.clientX - resizeState.startMouse.x) / zoom;
        const deltaY = (e.clientY - resizeState.startMouse.y) / zoom;

        // Calculate new Bounds for the object being resized (Widget or Group)
        let newX = resizeState.startWidget.x;
        let newY = resizeState.startWidget.y;
        let newWidth = resizeState.startWidget.width;
        let newHeight = resizeState.startWidget.height;

        const { direction, aspectRatio, widgetId } = resizeState;

        // --- Dimension Calculation ---
        if (direction.includes('e')) {
          newWidth = Math.max(10, resizeState.startWidget.width + deltaX);
        } else if (direction.includes('w')) {
          const maxDelta = resizeState.startWidget.width - 10;
          const appliedDelta = Math.min(maxDelta, deltaX);
          newX = resizeState.startWidget.x + appliedDelta;
          newWidth = resizeState.startWidget.width - appliedDelta;
        }

        if (direction.includes('s')) {
          newHeight = Math.max(10, resizeState.startWidget.height + deltaY);
        } else if (direction.includes('n')) {
          const maxDelta = resizeState.startWidget.height - 10;
          const appliedDelta = Math.min(maxDelta, deltaY);
          newY = resizeState.startWidget.y + appliedDelta;
          newHeight = resizeState.startWidget.height - appliedDelta;
        }

        // --- Aspect Ratio Lock ---
        const currentWidget = widgetId !== 'GROUP' ? widgets.find(w => w.id === widgetId) : null;
        const shouldLockAspect = (currentWidget?.type === WidgetType.ICON || currentWidget?.type === WidgetType.IMAGE) || e.shiftKey;

        if (shouldLockAspect) {
          if (direction.length === 2) {
            const calculatedHeight = newWidth / aspectRatio;
            if (direction.includes('n')) {
              newY = resizeState.startWidget.y + (resizeState.startWidget.height - calculatedHeight);
            }
            newHeight = calculatedHeight;
          } else {
            if (direction === 'e' || direction === 'w') {
              newHeight = newWidth / aspectRatio;
            } else if (direction === 'n' || direction === 's') {
              newWidth = newHeight * aspectRatio;
            }
          }
        }

        // --- Applying Changes ---
        const updates: Record<string, Partial<Widget>> = {};

        if (widgetId === 'GROUP') {
          // Calculate Scale Factors
          const scaleX = newWidth / resizeState.startWidget.width;
          const scaleY = newHeight / resizeState.startWidget.height;

          // Apply to all widgets in group
          Object.entries(resizeState.initialWidgetStates).forEach(([wId, s]) => {
            const startState = s as { x: number, y: number, width: number, height: number };
            const relativeX = startState.x - resizeState.startWidget.x;
            const relativeY = startState.y - resizeState.startWidget.y;

            updates[wId] = {
              x: newX + (relativeX * scaleX),
              y: newY + (relativeY * scaleY),
              width: Math.max(1, startState.width * scaleX),
              height: Math.max(1, startState.height * scaleY)
            };
          });
        } else {
          // Single Widget
          newX = Math.round(newX / 10) * 10;
          newY = Math.round(newY / 10) * 10;
          if (!shouldLockAspect) {
            newWidth = Math.round(newWidth / 10) * 10;
            newHeight = Math.round(newHeight / 10) * 10;
          } else {
            newWidth = Math.round(newWidth);
            newHeight = Math.round(newHeight);
          }

          if (newWidth < 10) newWidth = 10;
          if (newHeight < 10) newHeight = 10;

          updates[widgetId] = { x: newX, y: newY, width: newWidth, height: newHeight };
        }

        setTransientChanges(prev => ({ ...prev, ...updates }));
        transientChangesRef.current = { ...transientChangesRef.current, ...updates };
        return;
      }

      // 3. Handle Moving
      if (dragState && canvasRef.current) {
        const deltaX = (e.clientX - dragState.startMouse.x) / zoom;
        const deltaY = (e.clientY - dragState.startMouse.y) / zoom;

        // --- GUIDELINES & SNAPPING ---
        const SNAP_DIST = 5;
        const newGuidelines: Guideline[] = [];

        // Calculate the bounding box of the MOVING SELECTION
        let selectionMinX = Infinity, selectionMinY = Infinity, selectionMaxX = -Infinity, selectionMaxY = -Infinity;

        Object.entries(dragState.initialPositions).forEach(([id, i]) => {
          const initPos = i as { x: number, y: number };
          const x = initPos.x + deltaX;
          const y = initPos.y + deltaY;
          const w = widgets.find(wi => wi.id === id)?.width || 0;
          const h = widgets.find(wi => wi.id === id)?.height || 0;
          selectionMinX = Math.min(selectionMinX, x);
          selectionMinY = Math.min(selectionMinY, y);
          selectionMaxX = Math.max(selectionMaxX, x + w);
          selectionMaxY = Math.max(selectionMaxY, y + h);
        });

        const selectionWidth = selectionMaxX - selectionMinX;
        const selectionHeight = selectionMaxY - selectionMinY;
        const selectionMidX = selectionMinX + selectionWidth / 2;
        const selectionMidY = selectionMinY + selectionHeight / 2;

        // Check Vertical Snaps (X coordinates)
        let snappedDeltaX = deltaX;
        let isXSnapped = false;

        const checkXSnap = (currentX: number) => {
          if (isXSnapped) return;
          for (const line of snapLinesRef.current.vertical) {
            if (Math.abs(line.pos - currentX) < SNAP_DIST) {
              const snapOffset = line.pos - currentX;
              snappedDeltaX = deltaX + snapOffset;
              isXSnapped = true;
              newGuidelines.push({
                type: 'vertical',
                x: line.pos,
                start: Math.min(line.min, selectionMinY),
                end: Math.max(line.max, selectionMaxY)
              });
              break;
            }
          }
        };

        checkXSnap(selectionMinX);
        checkXSnap(selectionMidX);
        checkXSnap(selectionMaxX);

        // Check Horizontal Snaps (Y coordinates)
        let snappedDeltaY = deltaY;
        let isYSnapped = false;

        const checkYSnap = (currentY: number) => {
          if (isYSnapped) return;
          for (const line of snapLinesRef.current.horizontal) {
            if (Math.abs(line.pos - currentY) < SNAP_DIST) {
              const snapOffset = line.pos - currentY;
              snappedDeltaY = deltaY + snapOffset;
              isYSnapped = true;
              newGuidelines.push({
                type: 'horizontal',
                y: line.pos,
                start: Math.min(line.min, selectionMinX),
                end: Math.max(line.max, selectionMaxX)
              });
              break;
            }
          }
        };

        checkYSnap(selectionMinY);
        checkYSnap(selectionMidY);
        checkYSnap(selectionMaxY);

        setGuidelines(newGuidelines);

        const updates: Record<string, Partial<Widget>> = {};

        Object.entries(dragState.initialPositions).forEach(([id, initPos]) => {
          const pos = initPos as { x: number, y: number };
          let newX = pos.x + snappedDeltaX;
          let newY = pos.y + snappedDeltaY;

          // Apply grid snap ONLY if alignment snap didn't happen
          if (!isXSnapped) newX = Math.round(newX / 10) * 10;
          else newX = Math.round(newX);

          if (!isYSnapped) newY = Math.round(newY / 10) * 10;
          else newY = Math.round(newY);

          updates[id] = { x: newX, y: newY };
        });

        setTransientChanges(prev => ({ ...prev, ...updates }));
        transientChangesRef.current = { ...transientChangesRef.current, ...updates };
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      setGuidelines([]); // Clear guidelines

      // Finalize Selection Box
      if (selectionBox?.active) {
        // Calculate final selection
        const selLeft = Math.min(selectionBox.startX, selectionBox.currentX);
        const selTop = Math.min(selectionBox.startY, selectionBox.currentY);
        const selWidth = Math.abs(selectionBox.currentX - selectionBox.startX);
        const selHeight = Math.abs(selectionBox.currentY - selectionBox.startY);
        const marqueeRect = { x: selLeft, y: selTop, w: selWidth, h: selHeight };

        // Only select if box has some size to prevent clearing on accidental tiny drags
        if (selWidth > 2 || selHeight > 2) {
          const newIds: string[] = [];
          widgets.forEach(w => {
            if (checkIntersection(marqueeRect, { x: w.x, y: w.y, w: w.width, h: w.height })) {
              if (!isLayerLocked(w.layerId)) {
                newIds.push(w.id);
              }
            }
          });

          if (newIds.length > 0) {
            onSelectWidget(newIds, e.shiftKey);
          }
        }

        setSelectionBox(null);
      }

      // Commit changes to history on MouseUp
      const changesToCommit = Object.entries(transientChangesRef.current).map(([id, changes]) => ({
        id,
        changes
      }));

      if (changesToCommit.length > 0) {
        onUpdateWidgets(changesToCommit);
      }

      setDragState(null);
      setResizeState(null);
      setTransientChanges({});
      transientChangesRef.current = {};
    };

    if (dragState || resizeState || selectionBox) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, resizeState, selectionBox, widgets, onUpdateWidgets, zoom, onSelectWidget]);


  // Rendering Helpers
  const renderWidget = (originalWidget: Widget) => {
    // Merge original widget with any transient (in-progress) changes
    const transient = transientChanges[originalWidget.id];
    const widget = transient ? { ...originalWidget, ...transient } : originalWidget;

    const isSelected = selectedIds.includes(widget.id);
    const isSingleSelection = selectedIds.length === 1 && isSelected;
    const locked = isLayerLocked(widget.layerId);
    const hasEvents = (widget.events || []).length > 0;

    const handleWidgetClick = (e: React.MouseEvent) => {
      if (isPreview && onWidgetEvent) {
        e.stopPropagation(); // Stop selection logic
        // For now, simpler widgets trigger 'CLICKED' on click
        // Complex logic (like checking precise hit areas) can be added here
        onWidgetEvent('CLICKED', widget.id);

        // Check for specific event definitions attached to the widget
        // This loop is redundant if we just pass 'CLICKED' and let App handle lookups,
        // but let's fire specifically defined events too if they match 'CLICKED' trigger
        widget.events.forEach(evt => {
          if (evt.trigger === 'CLICKED') {
            // We could pass evt.id but App.handleWidgetEvent is simpler if we just pass 'CLICKED' or use the widget ID to look it up.
            // Current App implementation looks up event by NAME (id).
            // So we should iterate triggers.
            onWidgetEvent(evt.id, widget.id);
          }
        });
      }
    };

    // 1. Wrapper Style: Positioning, Interaction, Animation
    // This element generally does NOT clip overflow so that handles/rings are visible.
    const wrapperStyle: React.CSSProperties = {
      position: 'absolute',
      left: widget.x,
      top: widget.y,
      width: widget.width,
      height: widget.height,
      opacity: (widget.style.opacity ?? 100) / 100,
      pointerEvents: widget.flags?.clickable === false || widget.state?.disabled ? 'none' : 'auto',
      filter: widget.state?.disabled ? 'grayscale(100%) opacity(70%)' : 'none',
      zIndex: isSelected ? 100 : undefined, // Selection z-index handled here or via class

      // Animation
      animationName: (!widget.animation || widget.animation.type === 'NONE') ? 'none' :
        (widget.animation.type === 'FADE_IN' ? 'fadeIn' :
          widget.animation.type === 'SLIDE_IN_LEFT' ? 'slideInLeft' :
            widget.animation.type === 'SLIDE_IN_RIGHT' ? 'slideInRight' :
              widget.animation.type === 'SLIDE_IN_TOP' ? 'slideInTop' :
                widget.animation.type === 'SLIDE_IN_BOTTOM' ? 'slideInBottom' :
                  widget.animation.type === 'SCALE_UP' ? 'scaleUp' :
                    widget.animation.type === 'SCALE_DOWN' ? 'scaleDown' :
                      widget.animation.type === 'BOUNCE_IN' ? 'bounceIn' :
                        widget.animation.type === 'FADE_OUT' ? 'fadeOut' :
                          widget.animation.type === 'SLIDE_OUT_LEFT' ? 'slideOutLeft' :
                            widget.animation.type === 'SLIDE_OUT_RIGHT' ? 'slideOutRight' :
                              widget.animation.type === 'SLIDE_OUT_TOP' ? 'slideOutTop' :
                                widget.animation.type === 'SLIDE_OUT_BOTTOM' ? 'slideOutBottom' :
                                  widget.animation.type === 'BOUNCE_OUT' ? 'bounceOut' : 'none'),
      animationDuration: `${widget.animation?.duration || 0}ms`,
      animationDelay: `${widget.animation?.delay || 0}ms`,
      animationTimingFunction: widget.animation?.easing || 'ease',
      animationFillMode: 'forwards'
    };

    // 2. Visual Style: Appearance (Border, BG, Shadow) within the wrapper
    // This element handles overflow clipping for the content.
    const visualStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: widget.style.backgroundColor || 'transparent',
      borderWidth: widget.style.borderWidth || 0,
      borderColor: widget.style.borderColor || 'transparent',
      borderStyle: 'solid',
      borderRadius: widget.style.borderRadius || 0,
      boxSizing: 'border-box',
      overflow: widget.flags?.overflow_visible ? 'visible' : (widget.flags?.scrollable ? 'auto' : 'hidden'),
      padding: widget.style.padding ?? 0,
      boxShadow: widget.style.shadowColor ? `${widget.style.shadowOffsetX ?? 0}px ${widget.style.shadowOffsetY ?? 0}px ${widget.style.shadowWidth ?? 0}px ${widget.style.shadowSpread ?? 0}px ${widget.style.shadowColor}` : 'none',
    };

    // 3. Content Style: Initial placement of inner content (flex center usually)
    const contentStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: widget.style.textColor,
      fontSize: widget.style.fontSize || 14,
      fontFamily: widget.style.fontFamily || 'Montserrat, sans-serif',
      pointerEvents: 'none', // Pass clicks to parent
    };

    // Selection Ring (applied to container)
    // If we have a group selection, we generally hide individual rings to reduce noise, 
    // unless strictly needed. But keeping them helps know what's in the group.
    // Let's keep a lighter ring for group members.
    const selectionRing = isSelected
      ? (selectedIds.length > 1 ? 'ring-1 ring-blue-300 z-10' : 'ring-2 ring-blue-500 ring-offset-1 z-10')
      : 'z-0';

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
                  return React.cloneElement(IconComp as React.ReactElement<any>, { size: iconSize });
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
        case WidgetType.BAR:
          const isBar = widget.type === WidgetType.BAR;
          const sliderVal = widget.value || 0;
          const sliderMin = widget.min || 0;
          const sliderMax = widget.max || 100;
          const sliderPercent = Math.min(100, Math.max(0, ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * 100));

          // Detect Orientation
          const isVertical = widget.height > widget.width;

          if (isVertical) {
            return (
              <div className={`w-full h-full flex items-center justify-center ${isBar ? '' : 'py-1'}`}>
                <div className={`relative h-full ${isBar ? 'w-full' : 'w-2'} rounded-full overflow-hidden`}
                  style={{
                    backgroundColor: widget.style.backgroundColor || '#e5e7eb',
                    borderRadius: widget.style.borderRadius
                  }}>
                  {/* Indicator (Bottom up) */}
                  <div
                    className="absolute left-0 bottom-0 w-full"
                    style={{
                      height: `${sliderPercent}%`,
                      backgroundColor: widget.style.borderColor || '#3b82f6',
                      borderRadius: widget.style.borderRadius
                    }}
                  ></div>
                  {/* Knob (only for slider) */}
                  {!isBar && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md border border-slate-200"
                      style={{
                        bottom: `calc(${sliderPercent}% - 10px)`,
                        cursor: 'pointer'
                      }}
                    ></div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className={`w-full h-full flex items-center justify-center ${isBar ? '' : 'px-1'}`}>
              <div className={`relative w-full ${isBar ? 'h-full' : 'h-2'} overflow-hidden`}
                style={{
                  backgroundColor: widget.style.backgroundColor || '#e5e7eb',
                  borderRadius: widget.style.borderRadius
                }}>
                {/* Indicator */}
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${sliderPercent}%`,
                    backgroundColor: widget.style.borderColor || '#3b82f6',
                    borderRadius: widget.style.borderRadius
                  }}
                ></div>
                {/* Knob (only for slider) */}
                {!isBar && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border border-slate-200"
                    style={{
                      left: `calc(${sliderPercent}% - 10px)`, // 10px is half of knob width
                      cursor: 'pointer'
                    }}
                  ></div>
                )}
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

          // Use background color for track ONLY if it's not transparent, otherwise default to gray
          const bgCol = widget.style.backgroundColor;
          const trackColor = (bgCol && bgCol !== 'transparent' && bgCol !== 'rgba(0,0,0,0)') ? bgCol : '#e5e7eb';

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
            <div className="w-full h-full flex flex-col relative">
              {/* Dotted pattern if transparent, to indicate container area in edit mode */}
              {widget.style.backgroundColor === 'transparent' && (
                <div className="w-full h-full opacity-20 border-2 border-dashed border-slate-400 pointer-events-none"></div>
              )}
            </div>
          );

        case WidgetType.TEXT_AREA:
          return (
            <div className="w-full h-full p-2 flex items-start text-left relative">
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
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ padding: '0 10%' }} preserveAspectRatio="none">
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
              {React.cloneElement(IconComp as React.ReactElement<any>, { size: iconSize })}
            </div>
          );

        case WidgetType.ROLLER:
          const rollerOptions = (widget.options || 'Option 1\nOption 2\nOption 3').split('\n');
          return (
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-white overflow-hidden shadow-inner">
              {/* Selected Box Indicator */}
              <div className="absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2 bg-blue-100 border-y border-blue-300 z-0"></div>

              {/* Visual Stack */}
              <div className="flex flex-col items-center gap-2 z-10 w-full">
                <div className="opacity-30 text-sm">{rollerOptions[0]}</div>
                <div className="font-bold text-lg text-blue-800">{rollerOptions[1] || rollerOptions[0]}</div>
                <div className="opacity-30 text-sm">{rollerOptions[2] || rollerOptions[1] || ''}</div>
              </div>
            </div>
          );

        case WidgetType.DROPDOWN:
          const dropdownOptions = (widget.options || 'Option 1').split('\n');
          return (
            <div className="w-full h-full flex items-center justify-between px-3 bg-white shadow-sm">
              <span className="truncate">{dropdownOptions[0]}</span>
              <ChevronDown size={16} className="text-slate-500" />
            </div>
          );

        case WidgetType.LED:
          return (
            <div className="w-full h-full rounded-full relative" style={{
              backgroundColor: widget.style.backgroundColor,
              boxShadow: `0 0 ${widget.width / 2}px ${widget.style.backgroundColor}`,
              border: `${widget.style.borderWidth}px solid ${widget.style.borderColor}`
            }}>
              {/* Reflection/Gloss */}
              <div className="absolute top-[15%] left-[20%] w-[25%] h-[20%] bg-white rounded-full opacity-40"></div>
            </div>
          );

        case WidgetType.KEYBOARD:
          return (
            <div className="w-full h-full bg-slate-200 flex flex-col p-1 gap-1">
              <div className="flex-1 flex gap-1">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(k => (
                  <div key={k} className="flex-1 bg-white rounded shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600">{k}</div>
                ))}
              </div>
              <div className="flex-1 flex gap-1 px-4">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(k => (
                  <div key={k} className="flex-1 bg-white rounded shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600">{k}</div>
                ))}
              </div>
              <div className="flex-1 flex gap-1 px-8">
                <div className="w-8 bg-slate-300 rounded flex items-center justify-center">⇧</div>
                {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(k => (
                  <div key={k} className="flex-1 bg-white rounded shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600">{k}</div>
                ))}
                <div className="w-8 bg-slate-300 rounded flex items-center justify-center">⌫</div>
              </div>
              <div className="flex-1 flex gap-1 px-16">
                <div className="flex-1 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-slate-500">SPACE</div>
              </div>
            </div>
          );

        case WidgetType.SPINNER:
          return (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2
                className="animate-spin"
                size={Math.min(widget.width, widget.height)}
                color={widget.style.borderColor || '#3b82f6'}
                strokeWidth={(widget.style.borderWidth || 5) * 0.5} // Scale lucide stroke
              />
            </div>
          );

        case WidgetType.COLORWHEEL:
          return (
            <div className="w-full h-full rounded-full relative overflow-hidden" style={{
              background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`
            }}>
              {/* Center cutout for ring effect, or solid for knob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg" style={{
                width: widget.width * 0.3,
                height: widget.height * 0.3,
                backgroundColor: widget.style.backgroundColor || '#ffffff'
              }}></div>
              {/* Knob indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border border-slate-300"></div>
            </div>
          );

        case WidgetType.CALENDAR:
          return (
            <div className="w-full h-full flex flex-col relative">
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-700">October 2025</div>
                <div className="flex gap-1">
                  <ChevronLeft size={12} className="text-slate-400" />
                  <ChevronRight size={12} className="text-slate-400" />
                </div>
              </div>
              {/* Days Header */}
              <div className="grid grid-cols-7 text-center p-1 bg-slate-50">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-[8px] font-medium text-slate-500">{d}</div>
                ))}
              </div>
              {/* Calendar Grid (Mock) */}
              <div className="grid grid-cols-7 flex-1 p-1 gap-px bg-slate-100">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className={`bg-white flex items-center justify-center text-[8px] ${i === 14 ? 'bg-blue-500 text-white rounded-full' : 'text-slate-700'}`}>
                    {i + 1 > 31 ? i - 30 : i + 1}
                  </div>
                ))}
              </div>
            </div>
          );

        case WidgetType.LIST:
          const listItems = (widget.options || 'Item 1\nItem 2\nItem 3').split('\n');
          return (
            <div className="w-full h-full flex flex-col relative">
              {listItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <FileText size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-700 truncate">{item}</span>
                </div>
              ))}
            </div>
          );

        case WidgetType.TABLE:
          const rows = (widget.options || '').split('\n').map(r => r.split(','));
          return (
            <div className="w-full h-full relative">
              <div className="grid w-full h-full" style={{
                gridTemplateColumns: rows[0] ? `repeat(${rows[0].length}, 1fr)` : '1fr',
                gridAutoRows: 'min-content'
              }}>
                {rows.map((row, rIdx) => (
                  row.map((cell, cIdx) => (
                    <div key={`${rIdx}-${cIdx}`} className={`p-1 text-[10px] border-r border-b border-slate-100 flex items-center justify-center truncate ${rIdx === 0 ? 'font-bold bg-slate-50 text-slate-700' : 'text-slate-600'}`}>
                      {cell}
                    </div>
                  ))
                ))}
              </div>
            </div>
          );



        case WidgetType.BUTTONMATRIX:
          // Parse rows (newlines) and items
          // LVGL Matrix map is often 1D array with "\n" control char, but users might adhere to Newline = Row
          // Let's assume standard behavior: Flat list, styled as grid?
          // Actually LVGL map is flat, with "\n" marker.
          // For simplicty in Editor: Treat entire string split by newline as items.
          // If the user wants a grid, we can just use flex-wrap.
          const btnLabels = (widget.options || 'Btn').split('\n');
          return (
            <div className="w-full h-full flex flex-wrap gap-1 p-1 bg-transparent overflow-hidden">
              {btnLabels.map((lbl, i) => (
                <div key={i} className="flex-1 min-w-[30%] h-auto flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: widget.style.borderColor || '#3b82f6', // Use border color as fill for buttons
                    borderRadius: widget.style.borderRadius,
                    color: widget.style.textColor,
                    fontSize: widget.style.fontSize
                  }}>
                  {lbl}
                </div>
              ))}
            </div>
          );

        case WidgetType.TABVIEW:
          const tabs = (widget.options || 'Tab').split('\n');
          const activeTab = widget.value || 0;
          return (
            <div className="w-full h-full flex flex-col relative">
              {/* Tab Header */}
              <div className="flex w-full border-b" style={{ borderColor: widget.style.borderColor }}>
                {tabs.map((t, i) => (
                  <div key={i} className="flex-1 py-2 text-center text-sm font-medium cursor-pointer relative"
                    style={{
                      color: widget.style.textColor,
                      backgroundColor: i === activeTab ? 'rgba(0,0,0,0.05)' : 'transparent'
                    }}>
                    {t}
                    {/* Active Indicator */}
                    {i === activeTab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                    )}
                  </div>
                ))}
              </div>
              {/* Tab Content Body (Placeholder) */}
              <div className="flex-1 w-full bg-white/50 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic">
                  Content Area
                </div>
              </div>
            </div>
          );

        case WidgetType.WIN:
          return (
            <div className="w-full h-full flex flex-col relative">
              {/* Window Header */}
              <div className="h-8 px-2 flex items-center justify-between bg-slate-100 border-b"
                style={{ borderColor: widget.style.borderColor }}>
                <span className="text-xs font-bold" style={{ color: widget.style.textColor }}>
                  {widget.text || 'Window Title'}
                </span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 cursor-pointer"></div>
                </div>
              </div>
              {/* Window Content */}
              <div className="flex-1 relative bg-white/50">
                <div className="absolute inset-0 p-2 overflow-auto text-[10px] text-slate-400">
                  Content Area
                </div>
              </div>
            </div>
          );

        case WidgetType.TILEVIEW:
          const tileList = (widget.options || 'Tile 1,1').split('\n');
          return (
            <div className="w-full h-full flex flex-col relative">
              {/* Grid Visualization */}
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(${widget.style.borderColor || '#ccc'} 1px, transparent 1px),
                                      linear-gradient(90deg, ${widget.style.borderColor || '#ccc'} 1px, transparent 1px)`,
                  backgroundSize: '50% 50%' // 2x2 Grid hint
                }}>
              </div>

              {/* Center Badge */}
              <div className="m-auto z-10 bg-white/90 px-3 py-1 rounded-full shadow-sm text-xs border border-slate-200 text-slate-600 font-mono">
                {tileList[0]}
              </div>

              <div className="absolute bottom-1 right-1 text-[9px] text-slate-400">
                {tileList.length} Tiles
              </div>
            </div >
          );

        case WidgetType.MENU:
          const menuItems = (widget.options || 'Page 1').split('\n');
          return (
            <div className="w-full h-full flex flex-row relative">
              {/* Sidebar */}
              <div className="w-1/3 bg-slate-50 border-r flex flex-col p-1" style={{ borderColor: widget.style.borderColor }}>
                {/* Title/Back */}
                <div className="p-1 mb-1 text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full border border-slate-400"></div> Menu
                </div>
                {/* Items */}
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {menuItems.map((item, i) => (
                    <div key={i} className="px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer flex justify-between group">
                      {item}
                      <span className="text-slate-400 opacity-0 group-hover:opacity-100">›</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-white/50 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs italic">
                  Select a page
                </div>
              </div>
            </div>
          );

        case WidgetType.IMAGEBUTTON:
          return (
            <div className="w-full h-full flex items-center justify-center">
              {widget.src && !widget.src.endsWith('.png') ? (
                // Symbol or bad path
                <span style={{ color: widget.style.textColor, fontSize: widget.style.fontSize }}>{widget.text}</span>
              ) : (
                // Placeholder for actual image
                <div className="flex flex-col items-center justify-center text-white/80">
                  <ImageIcon size={24} />
                  <span className="text-[10px] mt-1">{widget.text || 'ImgBtn'}</span>
                </div>
              )}
            </div>
          );

        case WidgetType.MSGBOX:
          const btns = (widget.options || 'OK').split('\n');
          return (
            <div className="w-full h-full flex flex-col relative">
              {/* Title */}
              <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: widget.style.borderColor }}>
                <span className="font-bold text-sm" style={{ color: widget.style.textColor }}>Message</span>
                <div className="cursor-pointer text-slate-400 hover:text-red-500">×</div>
              </div>

              {/* Content */}
              <div className="flex-1 p-3 text-sm text-slate-600 flex items-center justify-center text-center">
                {widget.text}
              </div>

              {/* Buttons */}
              <div className="p-2 flex gap-2 justify-end border-t bg-slate-50/50" style={{ borderColor: widget.style.borderColor }}>
                {btns.map((btn, i) => (
                  <div key={i} className="px-3 py-1 rounded bg-white border shadow-sm text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100">
                    {btn}
                  </div>
                ))}
              </div>
            </div>
          );

        case WidgetType.LINE:
          const points = (widget.options || '0,0\n100,100').split('\n').map(p => {
            const [x, y] = p.split(',').map(Number);
            return `${x},${y}`;
          }).join(' ');

          return (
            <div className="w-full h-full overflow-visible">
              <svg className="w-full h-full overflow-visible">
                <polyline
                  points={points}
                  fill="none"
                  stroke={widget.style.borderColor}
                  strokeWidth={widget.style.borderWidth}
                  strokeLinecap={widget.style.borderRadius ? 'round' : 'butt'}
                />
              </svg>
            </div>
          );

        case WidgetType.SCALE:
          // Simple horizontal linear scale visualization
          const ticks = 11; // 0 to 10
          return (
            <div className="w-full h-full flex flex-col justify-end" style={{
              backgroundColor: widget.style.backgroundColor
            }}>
              {/* Horizontal Bar */}
              <div className="w-full relative h-4 border-t" style={{ borderColor: widget.style.borderColor, borderTopWidth: widget.style.borderWidth }}>
                {Array.from({ length: ticks }).map((_, i) => (
                  <div key={i} className="absolute top-0 h-2 border-l" style={{
                    left: `${(i / (ticks - 1)) * 100}%`,
                    borderColor: widget.style.borderColor,
                    borderLeftWidth: widget.style.borderWidth
                  }}>
                    {/* Check if major tick? For now just all same */}
                  </div>
                ))}
              </div>
              {/* Labels */}
              <div className="w-full relative h-4" style={{ color: widget.style.textColor }}>
                <div className="absolute left-0 transform -translate-x-1/2 text-[10px]">{widget.min || 0}</div>
                <div className="absolute right-0 transform translate-x-1/2 text-[10px]">{widget.max || 100}</div>
              </div>
            </div>
          );

        case WidgetType.ANIMIMG:
          return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-700 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
              <div className="z-10 flex flex-col items-center">
                <ImageIcon size={24} className="text-purple-400 animate-pulse" />
                <span className="text-[9px] text-slate-400 mt-1">Anim Image</span>
              </div>
              <div className="absolute bottom-1 right-1 px-1 bg-slate-800 rounded text-[8px] text-slate-500 font-mono">
                {widget.options?.split('\n')[1] || '16'} f
              </div>
            </div>
          );

        case WidgetType.LOTTIE:
          return (
            <div className="w-full h-full flex items-center justify-center bg-teal-900/20 border border-teal-500/30 overflow-hidden relative rounded-lg">
              <div className="flex flex-col items-center text-teal-400">
                <div className="font-bold text-xs tracking-widest border-2 border-teal-400 rounded px-1 mb-1">JSON</div>
                <span className="text-[9px]">Lottie</span>
              </div>
            </div>
          );

        case WidgetType.TEXTURE3D:
          return (
            <div className="w-full h-full flex items-center justify-center bg-black border border-slate-800 relative overflow-hidden">
              {/* 3D Wireframe Simulation */}
              <div className="w-1/2 h-1/2 border-2 border-indigo-500 transform rotate-45 skew-x-12 opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Box size={32} className="text-indigo-400" />
              </div>
              <span className="absolute bottom-2 text-[9px] text-indigo-300">3D Texture</span>
            </div>
          );

        case WidgetType.CANVAS:
          return (
            <div className="w-full h-full bg-white border border-slate-300 relative overflow-hidden"
              style={{
                borderColor: widget.style.borderColor,
                borderWidth: widget.style.borderWidth,
                borderRadius: widget.style.borderRadius
              }}>
              {/* Checkerboard pattern for transparency indication */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                          linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                          linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                          linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono">
                Canvas Buffer
              </div>
            </div>
          );

        case WidgetType.ARCLABEL:
          return (
            <div className="w-full h-full flex items-center justify-center overflow-visible">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path id={`curve-${widget.id}`} d="M 10,50 Q 50,10 90,50" fill="none" stroke="transparent" />
                <text fill={widget.style.textColor} fontSize="14" textAnchor="middle">
                  <textPath href={`#curve-${widget.id}`} startOffset="50%">
                    {widget.text || 'Arc Label'}
                  </textPath>
                </text>
              </svg>
            </div>
          );

        case WidgetType.SPANGROUP:
          return (
            <div className="w-full h-full p-2 break-words"
              style={{
                color: widget.style.textColor,
                fontSize: widget.style.fontSize
              }}>
              {widget.spans && widget.spans.length > 0 ? (
                widget.spans.map(span => (
                  <span
                    key={span.id}
                    style={{
                      color: span.color || widget.style.textColor,
                      fontSize: span.fontSize ? `${span.fontSize}px` : undefined,
                      fontWeight: span.fontWeight || 'normal',
                      fontStyle: span.fontStyle || 'normal',
                      textDecoration: span.textDecoration || 'none'
                    }}
                  >
                    {span.text}
                  </span>
                ))
              ) : (
                // Fallback if no spans
                <span className="text-slate-400 italic">Empty Span Group</span>
              )}
            </div>
          );

        case WidgetType.IMEPINYIN:
          return (
            <div className="w-full h-full flex flex-col bg-slate-100 border border-slate-300 rounded overflow-hidden">
              {/* Input Area */}
              <div className="h-8 bg-white border-b border-slate-200 flex items-center px-2 text-sm">
                ni hao <span className="ml-1 animate-pulse">|</span>
              </div>
              {/* Candidates */}
              <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-2 gap-2 overflow-x-auto no-scrollbar">
                <span className="px-1 bg-blue-100 text-blue-600 rounded text-xs cursor-pointer">1. 你好</span>
                <span className="px-1 hover:bg-slate-200 rounded text-xs cursor-pointer text-slate-600">2. 泥好</span>
                <span className="px-1 hover:bg-slate-200 rounded text-xs cursor-pointer text-slate-600">3. 拟好</span>
              </div>
              {/* Keyboard Hint */}
              <div className="flex-1 flex items-center justify-center bg-slate-200 text-slate-400 text-[10px] uppercase tracking-wider">
                Keyboard Area
              </div>
            </div>
          );

        case WidgetType.SPINBOX:
          return (
            <div className="w-full h-full flex items-center">
              <div className="flex-1 flex items-center justify-center font-mono font-bold text-slate-800" style={{ fontSize: widget.style.fontSize }}>
                {widget.value || 0}
              </div>
              <div className="flex flex-col border-l border-slate-200 h-full w-8">
                <div className="flex-1 flex items-center justify-center hover:bg-slate-100 cursor-pointer border-b border-slate-200">
                  <Plus size={12} className="text-slate-500" />
                </div>
                <div className="flex-1 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                  <Minus size={12} className="text-slate-500" />
                </div>
              </div>
            </div>
          );

        default: return null;
      }
    }

    // Resize Handles
    const handles = [
      { cursor: 'nw-resize', pos: 'top-0 left-0', dir: 'nw' },
      { cursor: 'n-resize', pos: 'top-0 left-1/2 -translate-x-1/2', dir: 'n' },
      { cursor: 'ne-resize', pos: 'top-0 right-0', dir: 'ne' },
      { cursor: 'e-resize', pos: 'top-1/2 right-0 -translate-y-1/2', dir: 'e' },
      { cursor: 'se-resize', pos: 'bottom-0 right-0', dir: 'se' },
      { cursor: 's-resize', pos: 'bottom-0 left-1/2 -translate-x-1/2', dir: 's' },
      { cursor: 'sw-resize', pos: 'bottom-0 left-0', dir: 'sw' },
      { cursor: 'w-resize', pos: 'top-1/2 left-0 -translate-y-1/2', dir: 'w' },
    ];

    return (
      <div
        key={widget.id}
        className={`${selectionRing}`}
        onMouseDown={(e) => handleMouseDown(e, widget)}
        onClick={handleWidgetClick}
        style={wrapperStyle}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, widget.id);
        }}
      >
        <div style={visualStyle}>
          <div style={contentStyle}>
            {renderInner()}
          </div>
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
            onMouseDown={(e) => handleResizeMouseDown(e, h.dir, widget.id)}
          />
        ))}
      </div>
    );
  };

  // Group Transform Overlay
  const renderGroupOverlay = () => {
    // Only render group overlay for multiple items
    if (selectedIds.length <= 1) return null;

    const bounds = getGroupBounds();
    if (!bounds) return null;

    // Handles for group
    const handles = [
      { cursor: 'nw-resize', pos: 'top-0 left-0', dir: 'nw' },
      { cursor: 'n-resize', pos: 'top-0 left-1/2 -translate-x-1/2', dir: 'n' },
      { cursor: 'ne-resize', pos: 'top-0 right-0', dir: 'ne' },
      { cursor: 'e-resize', pos: 'top-1/2 right-0 -translate-y-1/2', dir: 'e' },
      { cursor: 'se-resize', pos: 'bottom-0 right-0', dir: 'se' },
      { cursor: 's-resize', pos: 'bottom-0 left-1/2 -translate-x-1/2', dir: 's' },
      { cursor: 'sw-resize', pos: 'bottom-0 left-0', dir: 'sw' },
      { cursor: 'w-resize', pos: 'top-1/2 left-0 -translate-y-1/2', dir: 'w' },
    ];

    return (
      <div
        className="absolute z-50 pointer-events-none"
        style={{
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
          border: '1px dashed #3b82f6',
        }}
      >
        {handles.map(h => (
          <div
            key={h.dir}
            className={`absolute w-2.5 h-2.5 bg-white border border-blue-500 pointer-events-auto ${h.pos}`}
            style={{
              cursor: h.cursor,
              marginTop: h.dir.includes('n') ? '-5px' : undefined,
              marginBottom: h.dir.includes('s') ? '-5px' : undefined,
              marginLeft: h.dir.includes('w') ? '-5px' : undefined,
              marginRight: h.dir.includes('e') ? '-5px' : undefined,
              borderRadius: '50%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, h.dir, 'GROUP')}
          />
        ))}
      </div>
    );
  };

  // Guidelines Overlay
  const renderGuidelines = () => {
    if (guidelines.length === 0) return null;
    return (
      <svg className="absolute inset-0 pointer-events-none z-[60] overflow-visible" width="100%" height="100%">
        {guidelines.map((g, i) => {
          if (g.type === 'vertical') {
            return (
              <line
                key={i}
                x1={g.x} y1={g.start}
                x2={g.x} y2={g.end}
                stroke="#ec4899"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            );
          } else {
            return (
              <line
                key={i}
                x1={g.start} y1={g.y}
                x2={g.end} y2={g.y}
                stroke="#ec4899"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            );
          }
        })}
      </svg>
    );
  };

  // Marquee Selection Box
  const renderSelectionBox = () => {
    if (!selectionBox?.active) return null;

    const left = Math.min(selectionBox.startX, selectionBox.currentX);
    const top = Math.min(selectionBox.startY, selectionBox.currentY);
    const width = Math.abs(selectionBox.currentX - selectionBox.startX);
    const height = Math.abs(selectionBox.currentY - selectionBox.startY);

    return (
      <div
        className="absolute z-50 border border-blue-500 bg-blue-500/10 pointer-events-none"
        style={{
          left,
          top,
          width,
          height
        }}
      />
    );
  };

  return (
    <div
      className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden p-8"
      onWheel={handleWheel}
    >
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
        <div
          id="canvas-container"
          className="relative bg-white shadow-sm overflow-hidden"
          style={{
            width: settings.width,
            height: settings.height,
            transform: `scale(${zoom}) rotate(${settings.rotation || 0}deg)`,
            transformOrigin: 'center center',
            backgroundColor: settings.backgroundColor || '#f0f2f5',
            transition: 'width 0.3s, height 0.3s, transform 0.3s' // Smooth rotation
          }}
          onMouseDown={handleCanvasMouseDown}
          onContextMenu={(e) => {
            e.preventDefault();
            onContextMenu(e, 'CANVAS_BACKGROUND');
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Press+Start+2P&display=swap');
            
            /* Animation Keyframes */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideInTop { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideInBottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes scaleDown { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes bounceIn {
              50% { opacity: 1; transform: scale(1.05); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); }
            }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes slideOutLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            @keyframes slideOutTop { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
            @keyframes slideOutBottom { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
            @keyframes bounceOut {
              0% { transform: scale(1); }
              20% { transform: scale(0.9); }
              50% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 0; transform: scale(0.3); }
            }
          `}</style>
          {/* Guidelines */}
          {guidelines.map((g, i) => (
            <div
              key={i}
              className="absolute bg-pink-500 z-50 pointer-events-none"
              style={{
                left: g.type === 'vertical' ? g.x : g.start,
                top: g.type === 'horizontal' ? g.y : g.start,
                width: g.type === 'vertical' ? 1 : (g.end - g.start),
                height: g.type === 'horizontal' ? 1 : (g.end - g.start)
              }}
            />
          ))}

          {/* Widgets */}
          {widgets.map(widget => renderWidget(widget))}
          {renderGroupOverlay()}
          {renderGuidelines()}
          {renderSelectionBox()}
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
        {settings.width} x {settings.height}
      </div>
    </div>
  );
};

export default Canvas;
