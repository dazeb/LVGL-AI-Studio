
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
  ICON = 'lv_icon', // Renders as label with symbol in LVGL
  // Layouts
  TABVIEW = 'lv_tabview',
  TILEVIEW = 'lv_tileview',
  WIN = 'lv_win',
  MENU = 'lv_menu',
  // Interaction
  BUTTONMATRIX = 'lv_buttonmatrix',
  IMAGEBUTTON = 'lv_imagebutton',
  MSGBOX = 'lv_msgbox',
  // Visualization
  LINE = 'lv_line',
  SCALE = 'lv_scale',
  ANIMIMG = 'lv_animimg',
  LOTTIE = 'lv_lottie',
  TEXTURE3D = 'lv_3dtexture',
  // Utilities
  CANVAS = 'lv_canvas',
  ARCLABEL = 'lv_arclabel',
  SPANGROUP = 'lv_spangroup',
  IMEPINYIN = 'ime_pinyin',
  // New Widgets
  BAR = 'lv_bar',
  ROLLER = 'lv_roller',
  DROPDOWN = 'lv_dropdown',
  LED = 'lv_led',
  KEYBOARD = 'lv_keyboard',
  // Visuals
  CALENDAR = 'lv_calendar',
  COLORWHEEL = 'lv_colorwheel',
  SPINNER = 'lv_spinner',
  // Data & Input
  LIST = 'lv_list',
  TABLE = 'lv_table',
  SPINBOX = 'lv_spinbox'
}

export interface WidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  // Common Features
  padding?: number;
  shadowColor?: string;
  shadowWidth?: number;
  shadowSpread?: number;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
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

export interface WidgetState {
  disabled?: boolean;
}

export interface WidgetFlags {
  hidden?: boolean;
  clickable?: boolean;
  scrollable?: boolean;
  // Interaction
  checkable?: boolean;
  press_lock?: boolean; // Keep pressed state even if sliding out
  adv_hittest?: boolean; // Exact shape hit testing
  // Layout
  floating?: boolean; // Ignore parent layout
  ignore_layout?: boolean; // Exclude from layout calculations
  overflow_visible?: boolean;
  // Scrolling
  scroll_elastic?: boolean;
  scroll_momentum?: boolean;
  scroll_one?: boolean; // Snapping
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
  contentMode?: 'text' | 'icon'; // For Button: toggle text vs icon
  value?: number; // For slider/arc/bar/roller/spinbox
  checked?: boolean; // For switch/checkbox
  style: WidgetStyle;
  // Animation
  animation?: WidgetAnimation;
  // specific properties
  min?: number;
  max?: number;
  step?: number; // For Spinbox
  placeholder?: string; // For Text Area
  chartType?: 'line' | 'bar'; // For Chart
  src?: string; // For Image (symbol or path)
  imageData?: string; // Base64 string for image preview
  symbol?: string; // For Icon
  options?: string; // For Roller/Dropdown/List/Table (newline separated)
  // Navigation & Events
  events: WidgetEvent[];
  // Common Features
  flags?: WidgetFlags;
  state?: WidgetState;
  // Rich Text
  spans?: Span[];
}

export interface Span {
  id: string;
  text: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'bold' | 'normal';
  fontStyle?: 'italic' | 'normal';
  textDecoration?: 'underline' | 'line-through' | 'none';
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
  rotation: 0 | 90 | 180 | 270;
}

export type CodeLanguage = 'c' | 'micropython';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'custom';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ProjectFile {
  version: string;
  timestamp: number;
  settings: CanvasSettings;
  screens: Screen[];
  stylePresets: StylePreset[];
}

export type AnimationType =
  'NONE' |
  'FADE_IN' |
  'SLIDE_IN_LEFT' |
  'SLIDE_IN_RIGHT' |
  'SLIDE_IN_TOP' |
  'SLIDE_IN_BOTTOM' |
  'SCALE_UP' |
  'SCALE_DOWN' |
  'BOUNCE_IN' |
  'FADE_OUT' |
  'SLIDE_OUT_LEFT' |
  'SLIDE_OUT_RIGHT' |
  'SLIDE_OUT_TOP' |
  'SLIDE_OUT_BOTTOM' |
  'BOUNCE_OUT';

export interface WidgetAnimation {
  type: AnimationType;
  duration: number; // ms
  delay: number; // ms
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

// Project Export Manifest Types
export interface ManifestAction {
  toReplace: string;
  newContent: string;
  filePath: string;
}

export interface ManifestOption {
  name: string;
  value: string;
  default?: string;
}

export interface ManifestUIField {
  type: 'dropdown' | 'text'; // Simplified
  label: string;
  options?: ManifestOption[];
  actions: ManifestAction[];
}

export interface ManifestBoard {
  name: string;
  maintenance?: string;
  hostOperatingsystem?: string[];
  environment?: string[];
  description?: string;
  shortDescription?: string;
  urlToClone: string;
  logo?: string;
  ui?: ManifestUIField[];
}
