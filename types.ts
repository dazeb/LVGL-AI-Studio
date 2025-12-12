
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

export interface Widget {
  id: string;
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
  symbol?: string; // For Icon
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  name: string;
}

export type CodeLanguage = 'c' | 'micropython';
