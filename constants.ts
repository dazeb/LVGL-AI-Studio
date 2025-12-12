
import { WidgetType, CanvasSettings, Theme, DevicePreset } from './types';

export const PROJECT_THEMES: Record<string, Theme> = {
  light: {
    id: 'light',
    name: 'Standard Light',
    colors: {
      background: '#f0f2f5',
      surface: '#ffffff',
      primary: '#2196F3',
      secondary: '#e5e7eb',
      text: '#1f2937',
      textInvert: '#ffffff',
      border: '#e2e8f0'
    },
    borderRadius: 8
  },
  dark: {
    id: 'dark',
    name: 'Standard Dark',
    colors: {
      background: '#111827',
      surface: '#1f2937',
      primary: '#3b82f6',
      secondary: '#374151',
      text: '#f3f4f6',
      textInvert: '#ffffff',
      border: '#374151'
    },
    borderRadius: 8
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#6366f1', // Indigo
      secondary: '#334155',
      text: '#e2e8f0',
      textInvert: '#ffffff',
      border: '#334155'
    },
    borderRadius: 12
  },
  retro: {
    id: 'retro',
    name: 'Retro Terminal',
    colors: {
      background: '#1a1a1a',
      surface: '#000000',
      primary: '#00ff00',
      secondary: '#333333',
      text: '#00ff00',
      textInvert: '#000000',
      border: '#00ff00'
    },
    borderRadius: 0
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk',
    colors: {
      background: '#09090b',
      surface: '#18181b',
      primary: '#f43f5e', // Rose
      secondary: '#27272a',
      text: '#22d3ee', // Cyan
      textInvert: '#ffffff',
      border: '#22d3ee'
    },
    borderRadius: 2
  }
};

export const AI_MODELS = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast)' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (Thinking/High Quality)' },
    { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash Thinking' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
  ],
  custom: [
    { id: 'llama3', name: 'Llama 3' },
    { id: 'mistral', name: 'Mistral' }
  ]
};

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'custom', name: 'Custom Resolution', manufacturer: 'Generic', width: 480, height: 320 },
  
  // M5Stack
  { id: 'm5_core', name: 'Core / Core2 / Basic', manufacturer: 'M5Stack', width: 320, height: 240 },
  { id: 'm5_stickc_plus', name: 'StickC Plus', manufacturer: 'M5Stack', width: 240, height: 135 },
  { id: 'm5_cardputer', name: 'Cardputer', manufacturer: 'M5Stack', width: 240, height: 135 },
  { id: 'm5_paper', name: 'M5Paper', manufacturer: 'M5Stack', width: 960, height: 540 },
  { id: 'm5_dial', name: 'M5Dial (Round)', manufacturer: 'M5Stack', width: 240, height: 240 },
  
  // Seeed Studio
  { id: 'wio_terminal', name: 'Wio Terminal', manufacturer: 'Seeed Studio', width: 320, height: 240 },
  
  // Adafruit
  { id: 'ada_pyportal', name: 'PyPortal', manufacturer: 'Adafruit', width: 320, height: 240 },
  { id: 'ada_pyportal_titano', name: 'PyPortal Titano', manufacturer: 'Adafruit', width: 480, height: 320 },
  { id: 'ada_tft_24', name: '2.4" TFT FeatherWing', manufacturer: 'Adafruit', width: 320, height: 240 },
  { id: 'ada_tft_35', name: '3.5" TFT Breakout', manufacturer: 'Adafruit', width: 480, height: 320 },
  { id: 'ada_round_128', name: '1.28" Round IPS', manufacturer: 'Adafruit', width: 240, height: 240 },
  
  // Waveshare
  { id: 'wave_35_ips', name: '3.5" IPS LCD', manufacturer: 'Waveshare', width: 480, height: 320 },
  { id: 'wave_40_hdmi', name: '4.0" HDMI LCD', manufacturer: 'Waveshare', width: 800, height: 480 },
  { id: 'wave_50_hdmi', name: '5.0" HDMI LCD', manufacturer: 'Waveshare', width: 800, height: 480 },
  { id: 'wave_70_hdmi', name: '7.0" HDMI LCD', manufacturer: 'Waveshare', width: 1024, height: 600 },
  { id: 'wave_128_round', name: '1.28" Touch LCD', manufacturer: 'Waveshare', width: 240, height: 240 },
  
  // Generic
  { id: 'gen_st7789', name: 'Generic ST7789 (Square)', manufacturer: 'Generic', width: 240, height: 240 },
  { id: 'gen_ili9341', name: 'Generic ILI9341', manufacturer: 'Generic', width: 320, height: 240 },
  { id: 'gen_st7735', name: 'Generic ST7735', manufacturer: 'Generic', width: 160, height: 128 },
];

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  width: 480,
  height: 320,
  defaultBackgroundColor: PROJECT_THEMES.light.colors.background,
  projectName: 'My_LVGL_Project',
  theme: 'light',
  targetDevice: 'custom'
};

export const DEFAULT_WIDGET_PROPS: Record<WidgetType, any> = {
  [WidgetType.BUTTON]: {
    width: 120,
    height: 40,
    text: 'Button',
    events: [],
    style: { 
        backgroundColor: '#2196F3', 
        textColor: '#FFFFFF', 
        borderRadius: 8, 
        borderWidth: 0,
        fontSize: 14 
    }
  },
  [WidgetType.LABEL]: {
    width: 120,
    height: 30,
    text: 'Label Text',
    events: [],
    style: { 
        textColor: '#1f2937', // Slate 800
        fontSize: 16, 
        backgroundColor: 'transparent' 
    }
  },
  [WidgetType.SLIDER]: {
    width: 200,
    height: 20, // Thinner visual height footprint
    value: 30,
    min: 0,
    max: 100,
    events: [],
    style: { 
        backgroundColor: '#e5e7eb', // Track color (Gray 200)
        borderColor: '#2196F3',     // Indicator color
        borderRadius: 10
    }
  },
  [WidgetType.SWITCH]: {
    width: 60,
    height: 32,
    checked: false,
    events: [],
    style: { 
        backgroundColor: '#e5e7eb', // Off state (Gray 200)
        borderColor: '#2196F3',     // On state color
        borderRadius: 999 
    }
  },
  [WidgetType.CHECKBOX]: {
    width: 150,
    height: 24,
    text: 'Checkbox',
    checked: false,
    events: [],
    style: { 
        textColor: '#1f2937', 
        fontSize: 16,
        borderColor: '#2196F3' // Checkbox active color
    }
  },
  [WidgetType.ARC]: {
    width: 120,
    height: 120,
    value: 40,
    min: 0,
    max: 100,
    events: [],
    style: { 
        borderColor: '#3b82f6', // Indicator
        backgroundColor: '#e2e8f0', // Track
        borderWidth: 10,
        borderRadius: 0 // Not used for Arc but keeps type happy
    }
  },
  [WidgetType.CONTAINER]: {
    width: 200,
    height: 150,
    events: [],
    style: { 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    }
  },
  [WidgetType.TEXT_AREA]: {
    width: 200,
    height: 80,
    text: '',
    placeholder: 'Enter text...',
    events: [],
    style: { 
        backgroundColor: '#ffffff', 
        textColor: '#1f2937', 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#cbd5e1', 
        fontSize: 14 
    }
  },
  [WidgetType.CHART]: {
    width: 240,
    height: 160,
    chartType: 'line',
    events: [],
    style: { 
        backgroundColor: '#ffffff', 
        borderColor: '#e2e8f0', 
        borderWidth: 1, 
        borderRadius: 8 
    }
  },
  [WidgetType.IMAGE]: {
    width: 64,
    height: 64,
    src: 'lv_symbol_image',
    events: [],
    style: { backgroundColor: 'transparent' }
  },
  [WidgetType.ICON]: {
    width: 32,
    height: 32,
    symbol: 'LV_SYMBOL_HOME',
    events: [],
    style: { 
        textColor: '#1f2937', 
        fontSize: 24, 
        backgroundColor: 'transparent' 
    }
  }
};
