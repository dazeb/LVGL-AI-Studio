
import { WidgetType, CanvasSettings } from './types';

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  width: 480,
  height: 320,
  backgroundColor: '#f0f2f5', // Slightly off-white for better contrast
  name: 'Screen1'
};

export const DEFAULT_WIDGET_PROPS: Record<WidgetType, any> = {
  [WidgetType.BUTTON]: {
    width: 120,
    height: 40,
    text: 'Button',
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
    style: { backgroundColor: 'transparent' }
  },
  [WidgetType.ICON]: {
    width: 32,
    height: 32,
    symbol: 'LV_SYMBOL_HOME',
    style: { 
        textColor: '#1f2937', 
        fontSize: 24, 
        backgroundColor: 'transparent' 
    }
  }
};
