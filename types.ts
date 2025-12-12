

export enum WidgetType {
  BUTTON = 'lv_btn',
  LABEL = 'lv_label',
  SLIDER = 'lv_slider',
  SWITCH = 'lv_switch',
  CHECKBOX = 'lv_checkbox',
  ARC = 'lv_arc',
  CONTAINER = 'lv_obj',
  TEXT_AREA = 'lv_textarea',
  CHART = 'lv_chart',
  IMAGE = 'lv_img',
  ICON = 'lv_icon' // Renders as label with symbol in LVGL
}

export interface WidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  opacity?: number;
}

export interface StylePreset {
  id: string;
  name: string;
  style: WidgetStyle;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export type EventTrigger = 'CLICKED' | 'PRESSED' | 'RELEASED' | 'VALUE_CHANGED' | 'FOCUSED' | 'DEFOCUSED';
export type EventAction = 'NAVIGATE' | 'CUSTOM_CODE';

export interface WidgetEvent {
  id: string;
  trigger: EventTrigger;
  action: EventAction;
  targetScreenId?: string;
  customCode?: string;
}

export interface Widget {
  id: string;
  layerId: string; // The layer this widget belongs to
  groupId?: string; // ID for grouping multiple widgets
  type: WidgetType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  value?: number; // For slider/arc
  checked?: boolean; // For switch/checkbox
  style: WidgetStyle;
  // Specific properties
  min?: number;
  max?: number;
  placeholder?: string; // For Text Area
  chartType?: 'line' | 'bar'; // For Chart
  src?: string; // For Image (symbol or path)
  imageData?: string; // Base64 string for image preview
  symbol?: string; // For Icon
  // Navigation & Events
  events: WidgetEvent[];
}

export interface Screen {
  id: string;
  name: string;
  backgroundColor: string;
  widgets: Widget[];
  layers: Layer[];
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string; // Global Screen BG
    surface: string;    // Container/Card BG
    primary: string;    // Main interaction color (Buttons, Active States)
    secondary: string;  // Secondary elements (Tracks, Inactive)
    text: string;       // Main text color
    textInvert: string; // Text color on top of primary
    border: string;     // Border colors
  };
  borderRadius: number;
}

export interface DevicePreset {
  id: string;
  name: string;
  manufacturer: string;
  width: number;
  height: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  defaultBackgroundColor: string;
  projectName: string;
  theme: string; // ID of the currently active theme
  targetDevice?: string; // ID of the selected DevicePreset
}

export type CodeLanguage = 'c' | 'micropython';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}