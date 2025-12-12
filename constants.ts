import { WidgetType, CanvasSettings } from './types';

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  width: 480,
  height: 320,
  backgroundColor: '#ffffff',
  name: 'Screen1'
};

export const DEFAULT_WIDGET_PROPS: Record<WidgetType, any> = {
  [WidgetType.BUTTON]: {
    width: 100,
    height: 40,
    text: 'Button',
    style: { backgroundColor: '#2196F3', textColor: '#FFFFFF', borderRadius: 4, borderWidth: 0 }
  },
  [WidgetType.LABEL]: {
    width: 120,
    height: 30,
    text: 'Label Text',
    style: { textColor: '#000000', fontSize: 16, backgroundColor: 'transparent' }
  },
  [WidgetType.SLIDER]: {
    width: 150,
    height: 15,
    value: 30,
    min: 0,
    max: 100,
    style: { backgroundColor: '#E0E0E0', borderColor: '#2196F3' } // Border used for knob color sim
  },
  [WidgetType.SWITCH]: {
    width: 50,
    height: 25,
    checked: false,
    style: { backgroundColor: '#E0E0E0', borderRadius: 20 }
  },
  [WidgetType.CHECKBOX]: {
    width: 150,
    height: 30,
    text: 'Checkbox',
    checked: false,
    style: { textColor: '#000000', fontSize: 16 }
  },
  [WidgetType.ARC]: {
    width: 100,
    height: 100,
    value: 40,
    min: 0,
    max: 100,
    style: { borderColor: '#2196F3', borderWidth: 10, backgroundColor: '#E0E0E0' }
  },
  [WidgetType.CONTAINER]: {
    width: 200,
    height: 150,
    style: { backgroundColor: '#F5F5F5', borderRadius: 4, borderWidth: 1, borderColor: '#CCCCCC' }
  },
  [WidgetType.TEXT_AREA]: {
    width: 180,
    height: 60,
    text: '',
    placeholder: 'Placeholder...',
    style: { backgroundColor: '#FFFFFF', textColor: '#000000', borderRadius: 4, borderWidth: 1, borderColor: '#CCCCCC', fontSize: 14 }
  },
  [WidgetType.CHART]: {
    width: 200,
    height: 150,
    chartType: 'line',
    style: { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD', borderWidth: 1, borderRadius: 0 }
  },
  [WidgetType.IMAGE]: {
    width: 64,
    height: 64,
    src: 'lv_symbol_home',
    style: { backgroundColor: 'transparent' }
  }
};