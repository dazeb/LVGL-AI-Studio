
import React from 'react';
import { Screen, CanvasSettings, WidgetType, Layer } from '../types';
import { PROJECT_THEMES } from '../constants';
import { Thermometer, Music, Gauge, Activity, Wifi, Keyboard, Printer, Zap, LayoutTemplate, Layers, Home, Play } from 'lucide-react';

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  color: string;
  settings: CanvasSettings;
  screens: Screen[];
}

const createLayer = (id: string) => ({ id, name: 'Main Layer', visible: true, locked: false });

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'lvgl_widgets_demo',
    name: 'LVGL Widgets Demo',
    description: 'Based on the official lv_demo_widgets. A complex profile dashboard showing layout capabilities.',
    icon: <LayoutTemplate size={24} />,
    image: '/demos/widgets.png',
    color: 'from-blue-600 to-indigo-600',
    settings: {
      width: 480,
      height: 320,
      defaultBackgroundColor: '#f0f2f5',
      projectName: 'LVGL_Demo_Widgets',
      theme: 'light',
      targetDevice: 'wave_35_ips'
    },
    screens: [
      {
        id: 'scr_widgets_1',
        name: 'Profile Tab',
        backgroundColor: '#f0f2f5',
        layers: [createLayer('l_widgets_1')],
        widgets: [
          // Sidebar / Card
          {
            id: 'w_card_1',
            layerId: 'l_widgets_1',
            type: WidgetType.CONTAINER,
            name: 'ProfileCard',
            x: 10, y: 10, width: 160, height: 300,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 0, borderColor: '#e5e7eb' }
          },
          {
            id: 'w_avatar',
            layerId: 'l_widgets_1',
            type: WidgetType.IMAGE,
            name: 'Avatar',
            x: 45, y: 30, width: 90, height: 90,
            src: 'avatar.png',
            events: [],
            style: { backgroundColor: '#e2e8f0', borderRadius: 45, borderWidth: 3, borderColor: '#cbd5e1' }
          },
          {
            id: 'w_lbl_name',
            layerId: 'l_widgets_1',
            type: WidgetType.LABEL,
            name: 'UserName',
            x: 20, y: 130, width: 140, height: 24,
            text: 'Elena Smith',
            events: [],
            style: { textColor: '#1f2937', fontSize: 18, backgroundColor: 'transparent' }
          },
          {
            id: 'w_lbl_role',
            layerId: 'l_widgets_1',
            type: WidgetType.LABEL,
            name: 'Role',
            x: 20, y: 155, width: 140, height: 20,
            text: 'Product Designer',
            events: [],
            style: { textColor: '#6b7280', fontSize: 12, backgroundColor: 'transparent' }
          },
          {
            id: 'w_btn_msg',
            layerId: 'l_widgets_1',
            type: WidgetType.BUTTON,
            name: 'BtnMsg',
            x: 30, y: 190, width: 120, height: 36,
            text: 'Message',
            contentMode: 'text',
            events: [],
            style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 18, borderWidth: 0 }
          },
          {
            id: 'w_btn_logout',
            layerId: 'l_widgets_1',
            type: WidgetType.BUTTON,
            name: 'BtnLogout',
            x: 30, y: 235, width: 120, height: 36,
            text: 'Log Out',
            contentMode: 'text',
            events: [],
            style: { backgroundColor: '#f3f4f6', textColor: '#374151', borderRadius: 18, borderWidth: 0 }
          },

          // Main Content Area
          {
            id: 'w_card_2',
            layerId: 'l_widgets_1',
            type: WidgetType.CONTAINER,
            name: 'StatsCard',
            x: 180, y: 10, width: 290, height: 145,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 0, borderColor: '#e5e7eb' }
          },
          {
            id: 'w_lbl_stats',
            layerId: 'l_widgets_1',
            type: WidgetType.LABEL,
            name: 'StatsTitle',
            x: 195, y: 20, width: 100, height: 20,
            text: 'Activity (24h)',
            events: [],
            style: { textColor: '#6b7280', fontSize: 10, backgroundColor: 'transparent' }
          },
          {
            id: 'w_chart_1',
            layerId: 'l_widgets_1',
            type: WidgetType.CHART,
            name: 'ActivityChart',
            x: 190, y: 40, width: 270, height: 100,
            chartType: 'line',
            events: [],
            style: { backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderRadius: 0 }
          },

          // Bottom Controls
          {
            id: 'w_card_3',
            layerId: 'l_widgets_1',
            type: WidgetType.CONTAINER,
            name: 'ControlsCard',
            x: 180, y: 165, width: 290, height: 145,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 0, borderColor: '#e5e7eb' }
          },
          {
            id: 'w_lbl_vol',
            layerId: 'l_widgets_1',
            type: WidgetType.LABEL,
            name: 'VolLabel',
            x: 195, y: 180, width: 100, height: 20,
            text: 'System Volume',
            events: [],
            style: { textColor: '#374151', fontSize: 12, backgroundColor: 'transparent' }
          },
          {
            id: 'w_slider_vol',
            layerId: 'l_widgets_1',
            type: WidgetType.SLIDER,
            name: 'VolSlider',
            x: 195, y: 210, width: 260, height: 8,
            value: 75,
            events: [],
            style: { backgroundColor: '#e5e7eb', borderColor: '#3b82f6', borderRadius: 4 }
          },
          {
            id: 'w_sw_dnd',
            layerId: 'l_widgets_1',
            type: WidgetType.SWITCH,
            name: 'SwDND',
            x: 195, y: 250, width: 50, height: 28,
            checked: true,
            events: [],
            style: { backgroundColor: '#e5e7eb', borderColor: '#ef4444', borderRadius: 99 }
          },
          {
            id: 'w_lbl_dnd',
            layerId: 'l_widgets_1',
            type: WidgetType.LABEL,
            name: 'DNDLabel',
            x: 255, y: 255, width: 150, height: 20,
            text: 'Do Not Disturb',
            events: [],
            style: { textColor: '#374151', fontSize: 12, backgroundColor: 'transparent' }
          }
        ]
      }
    ]
  },
  {
    id: 'lvgl_keypad',
    name: 'Keypad & Login',
    description: 'Based on lv_demo_keypad. Demonstrates text input handling with a visual keyboard.',
    icon: <Keyboard size={24} />,
    color: 'from-slate-600 to-slate-800',
    settings: {
      width: 480,
      height: 320,
      defaultBackgroundColor: '#111827',
      projectName: 'SecureLogin',
      theme: 'dark',
      targetDevice: 'elecrow_crowpanel_50'
    },
    screens: [
      {
        id: 'scr_login',
        name: 'Login Screen',
        backgroundColor: '#111827',
        layers: [createLayer('l_login')],
        widgets: [
          {
            id: 'w_hdr',
            layerId: 'l_login',
            type: WidgetType.CONTAINER,
            name: 'Header',
            x: 0, y: 0, width: 480, height: 40,
            events: [],
            style: { backgroundColor: '#1f2937', borderRadius: 0, borderWidth: 0 }
          },
          {
            id: 'w_lbl_hdr',
            layerId: 'l_login',
            type: WidgetType.LABEL,
            name: 'Title',
            x: 15, y: 10, width: 200, height: 20,
            text: 'Secure Terminal Access',
            events: [],
            style: { textColor: '#9ca3af', fontSize: 14, backgroundColor: 'transparent' }
          },
          {
            id: 'w_ta_pass',
            layerId: 'l_login',
            type: WidgetType.TEXT_AREA,
            name: 'PasswordInput',
            x: 90, y: 60, width: 300, height: 40,
            text: '******',
            placeholder: 'Enter Password',
            events: [{ id: 'evt_focus', trigger: 'FOCUSED', action: 'CUSTOM_CODE', customCode: 'lv_keyboard_set_textarea(ui_Keyboard1, ui_PasswordInput);' }],
            style: { backgroundColor: '#374151', textColor: '#ffffff', borderColor: '#4b5563', borderWidth: 1, borderRadius: 4, fontSize: 16 }
          },
          {
            id: 'w_kb',
            layerId: 'l_login',
            type: WidgetType.KEYBOARD,
            name: 'Keyboard',
            x: 0, y: 140, width: 480, height: 180,
            events: [],
            style: { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1, borderRadius: 0 }
          },
          {
            id: 'w_btn_connect',
            layerId: 'l_login',
            type: WidgetType.BUTTON,
            name: 'BtnConnect',
            x: 395, y: 60, width: 40, height: 40,
            text: '',
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_OK',
            events: [],
            style: { backgroundColor: '#22c55e', textColor: '#fff', borderRadius: 4, borderWidth: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'thermostat',
    name: 'Smart Thermostat',
    description: 'A modern, round interface for HVAC control with temperature arc and mode switching.',
    icon: <Thermometer size={24} />,
    color: 'from-orange-500 to-red-500',
    settings: {
      width: 240,
      height: 240,
      defaultBackgroundColor: '#1a1a1a',
      projectName: 'Thermostat_V1',
      theme: 'dark',
      targetDevice: 'm5_dial'
    },
    screens: [
      {
        id: 'scr_therm_1',
        name: 'Main Control',
        backgroundColor: '#1a1a1a',
        layers: [createLayer('l_therm_1')],
        widgets: [
          {
            id: 'w_arc_temp',
            layerId: 'l_therm_1',
            type: WidgetType.ARC,
            name: 'TempArc',
            x: 20, y: 20, width: 200, height: 200,
            value: 75, min: 50, max: 90,
            events: [],
            style: { borderColor: '#f97316', backgroundColor: '#262626', borderWidth: 20, borderRadius: 0 }
          },
          {
            id: 'w_lbl_val',
            layerId: 'l_therm_1',
            type: WidgetType.LABEL,
            name: 'TempLabel',
            x: 75, y: 75, width: 90, height: 50,
            text: '72°',
            events: [],
            style: { textColor: '#ffffff', fontSize: 52, backgroundColor: 'transparent' }
          },
          {
            id: 'w_lbl_status',
            layerId: 'l_therm_1',
            type: WidgetType.LABEL,
            name: 'Status',
            x: 92, y: 130, width: 60, height: 20,
            text: 'HEATING',
            events: [],
            style: { textColor: '#f97316', fontSize: 12, backgroundColor: 'transparent' }
          },
          {
            id: 'w_btn_cool',
            layerId: 'l_therm_1',
            type: WidgetType.BUTTON,
            name: 'BtnHome',
            x: 55, y: 155, width: 44, height: 44,
            text: '',
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_HOME',
            events: [],
            style: { backgroundColor: '#3b82f6', borderRadius: 22, textColor: '#fff', borderWidth: 0 }
          },
          {
            id: 'w_btn_heat',
            layerId: 'l_therm_1',
            type: WidgetType.BUTTON,
            name: 'BtnPower',
            x: 141, y: 155, width: 44, height: 44,
            text: '',
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_CHARGE',
            events: [],
            style: { backgroundColor: '#ef4444', borderRadius: 22, textColor: '#fff', borderWidth: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'printer_hmi',
    name: '3D Printer HMI',
    description: 'Control interface for 3D printers with temperature curves and axis control.',
    icon: <Printer size={24} />,
    color: 'from-amber-500 to-orange-600',
    settings: {
      width: 480,
      height: 320,
      defaultBackgroundColor: '#1c1917', // Warm dark
      projectName: 'Printer_UI',
      theme: 'dark',
      targetDevice: 'elecrow_crowpanel_50'
    },
    screens: [
      {
        id: 'scr_print_1',
        name: 'Status Monitor',
        backgroundColor: '#1c1917',
        layers: [createLayer('l_print')],
        widgets: [
          // Header
          { id: 'w_p_hdr', layerId: 'l_print', type: WidgetType.CONTAINER, name: 'Header', x: 0, y: 0, width: 480, height: 50, events: [], style: { backgroundColor: '#292524', borderWidth: 0, borderRadius: 0 } },
          { id: 'w_p_title', layerId: 'l_print', type: WidgetType.LABEL, name: 'Title', x: 20, y: 15, width: 200, height: 20, text: 'Printing: Benchy.gcode', events: [], style: { textColor: '#fbbf24', fontSize: 16, backgroundColor: 'transparent' } },
          { id: 'w_p_time', layerId: 'l_print', type: WidgetType.LABEL, name: 'Time', x: 380, y: 15, width: 80, height: 20, text: '01:45 left', events: [], style: { textColor: '#a8a29e', fontSize: 14, backgroundColor: 'transparent' } },

          // Nozzle Temp
          { id: 'w_arc_nozzle', layerId: 'l_print', type: WidgetType.ARC, name: 'NozzleArc', x: 30, y: 80, width: 140, height: 140, value: 85, min: 0, max: 280, events: [], style: { borderColor: '#ef4444', backgroundColor: '#44403c', borderWidth: 12, borderRadius: 0 } },
          { id: 'w_lbl_nozzle', layerId: 'l_print', type: WidgetType.LABEL, name: 'NozzleLbl', x: 80, y: 130, width: 40, height: 20, text: '210°', events: [], style: { textColor: '#fff', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_lbl_n_txt', layerId: 'l_print', type: WidgetType.LABEL, name: 'NozzleTxt', x: 82, y: 160, width: 40, height: 20, text: 'Nozzle', events: [], style: { textColor: '#a8a29e', fontSize: 12, backgroundColor: 'transparent' } },

          // Bed Temp
          { id: 'w_arc_bed', layerId: 'l_print', type: WidgetType.ARC, name: 'BedArc', x: 190, y: 80, width: 140, height: 140, value: 60, min: 0, max: 110, events: [], style: { borderColor: '#3b82f6', backgroundColor: '#44403c', borderWidth: 12, borderRadius: 0 } },
          { id: 'w_lbl_bed', layerId: 'l_print', type: WidgetType.LABEL, name: 'BedLbl', x: 245, y: 130, width: 40, height: 20, text: '60°', events: [], style: { textColor: '#fff', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_lbl_b_txt', layerId: 'l_print', type: WidgetType.LABEL, name: 'BedTxt', x: 248, y: 160, width: 40, height: 20, text: 'Bed', events: [], style: { textColor: '#a8a29e', fontSize: 12, backgroundColor: 'transparent' } },

          // Progress
          { id: 'w_bar_prog', layerId: 'l_print', type: WidgetType.BAR, name: 'ProgressBar', x: 30, y: 250, width: 300, height: 16, value: 45, events: [], style: { backgroundColor: '#44403c', borderColor: '#22c55e', borderRadius: 8 } },

          // Controls
          { id: 'w_btn_pause', layerId: 'l_print', type: WidgetType.BUTTON, name: 'Pause', x: 360, y: 80, width: 90, height: 60, text: 'PAUSE', events: [], style: { backgroundColor: '#f59e0b', textColor: '#000', borderRadius: 8, borderWidth: 0 } },
          { id: 'w_btn_stop', layerId: 'l_print', type: WidgetType.BUTTON, name: 'Stop', x: 360, y: 160, width: 90, height: 60, text: 'STOP', events: [], style: { backgroundColor: '#dc2626', textColor: '#fff', borderRadius: 8, borderWidth: 0 } },
        ]
      }
    ]
  },
  {
    id: 'ev_charger',
    name: 'EV Charger',
    description: 'Modern HMI for electric vehicle charging stations.',
    icon: <Zap size={24} />,
    color: 'from-emerald-400 to-teal-600',
    settings: {
      width: 800,
      height: 480,
      defaultBackgroundColor: '#0f172a',
      projectName: 'EV_Station',
      theme: 'midnight',
      targetDevice: 'sunton_esp32_50'
    },
    screens: [
      {
        id: 'scr_ev',
        name: 'Charging',
        backgroundColor: '#0f172a',
        layers: [createLayer('l_ev')],
        widgets: [
          // Center Visualization
          { id: 'w_arc_pwr', layerId: 'l_ev', type: WidgetType.ARC, name: 'PowerArc', x: 250, y: 60, width: 300, height: 300, value: 72, min: 0, max: 100, events: [], style: { borderColor: '#34d399', backgroundColor: '#1e293b', borderWidth: 30, borderRadius: 0 } },
          { id: 'w_lbl_kwh', layerId: 'l_ev', type: WidgetType.LABEL, name: 'KwhVal', x: 320, y: 160, width: 160, height: 80, text: '42.5', events: [], style: { textColor: '#fff', fontSize: 64, backgroundColor: 'transparent' } },
          { id: 'w_lbl_unit', layerId: 'l_ev', type: WidgetType.LABEL, name: 'KwhUnit', x: 365, y: 230, width: 80, height: 30, text: 'kWh Delivered', events: [], style: { textColor: '#94a3b8', fontSize: 16, backgroundColor: 'transparent' } },

          // Left Details
          { id: 'w_card_1', layerId: 'l_ev', type: WidgetType.CONTAINER, name: 'Card1', x: 40, y: 100, width: 180, height: 100, events: [], style: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' } },
          { id: 'w_lbl_d1', layerId: 'l_ev', type: WidgetType.LABEL, name: 'LblD1', x: 60, y: 120, width: 140, height: 20, text: 'Current Power', events: [], style: { textColor: '#94a3b8', fontSize: 14, backgroundColor: 'transparent' } },
          { id: 'w_val_d1', layerId: 'l_ev', type: WidgetType.LABEL, name: 'ValD1', x: 60, y: 150, width: 140, height: 30, text: '11.2 kW', events: [], style: { textColor: '#34d399', fontSize: 28, backgroundColor: 'transparent' } },

          { id: 'w_card_2', layerId: 'l_ev', type: WidgetType.CONTAINER, name: 'Card2', x: 40, y: 220, width: 180, height: 100, events: [], style: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' } },
          { id: 'w_lbl_d2', layerId: 'l_ev', type: WidgetType.LABEL, name: 'LblD2', x: 60, y: 240, width: 140, height: 20, text: 'Time Elapsed', events: [], style: { textColor: '#94a3b8', fontSize: 14, backgroundColor: 'transparent' } },
          { id: 'w_val_d2', layerId: 'l_ev', type: WidgetType.LABEL, name: 'ValD2', x: 60, y: 270, width: 140, height: 30, text: '00:45:12', events: [], style: { textColor: '#38bdf8', fontSize: 28, backgroundColor: 'transparent' } },

          // Right Details
          { id: 'w_card_3', layerId: 'l_ev', type: WidgetType.CONTAINER, name: 'Card3', x: 580, y: 100, width: 180, height: 100, events: [], style: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' } },
          { id: 'w_lbl_d3', layerId: 'l_ev', type: WidgetType.LABEL, name: 'LblD3', x: 600, y: 120, width: 140, height: 20, text: 'Cost', events: [], style: { textColor: '#94a3b8', fontSize: 14, backgroundColor: 'transparent' } },
          { id: 'w_val_d3', layerId: 'l_ev', type: WidgetType.LABEL, name: 'ValD3', x: 600, y: 150, width: 140, height: 30, text: '$ 8.50', events: [], style: { textColor: '#fbbf24', fontSize: 28, backgroundColor: 'transparent' } },

          { id: 'w_btn_stop', layerId: 'l_ev', type: WidgetType.BUTTON, name: 'StopBtn', x: 580, y: 240, width: 180, height: 80, text: 'STOP CHARGING', events: [], style: { backgroundColor: '#ef4444', textColor: '#fff', borderRadius: 12, borderWidth: 0 } },

          // Bottom Bar
          { id: 'w_bar_soc', layerId: 'l_ev', type: WidgetType.BAR, name: 'SoCBar', x: 200, y: 400, width: 400, height: 30, value: 80, events: [], style: { backgroundColor: '#334155', borderColor: '#34d399', borderRadius: 15 } },
          { id: 'w_lbl_soc', layerId: 'l_ev', type: WidgetType.LABEL, name: 'SoCLbl', x: 380, y: 375, width: 50, height: 20, text: '80%', events: [], style: { textColor: '#fff', fontSize: 16, backgroundColor: 'transparent' } }
        ]
      }
    ]
  },
  {
    id: 'ebike_dash',
    name: 'E-Bike Dashboard',
    description: 'Digital instrument cluster showing speed, battery, and trip info.',
    icon: <Gauge size={24} />,
    color: 'from-blue-500 to-cyan-500',
    settings: {
      width: 480,
      height: 320,
      defaultBackgroundColor: '#000000',
      projectName: 'EBike_Cluster',
      theme: 'cyber',
      targetDevice: 'wave_35_ips'
    },
    screens: [
      {
        id: 'scr_dash_1',
        name: 'Dashboard',
        backgroundColor: '#000000',
        layers: [createLayer('l_dash_1')],
        widgets: [
          // Center Arc (Speed)
          {
            id: 'w_arc_speed',
            layerId: 'l_dash_1',
            type: WidgetType.ARC,
            name: 'SpeedArc',
            x: 140, y: 40, width: 240, height: 240,
            value: 65, min: 0, max: 100,
            events: [],
            style: { borderColor: '#06b6d4', backgroundColor: '#111', borderWidth: 16, borderRadius: 0 }
          },
          {
            id: 'w_lbl_speed',
            layerId: 'l_dash_1',
            type: WidgetType.LABEL,
            name: 'SpeedVal',
            x: 215, y: 110, width: 100, height: 60,
            text: '42',
            events: [],
            style: { textColor: '#ffffff', fontSize: 64, backgroundColor: 'transparent' }
          },
          {
            id: 'w_lbl_unit',
            layerId: 'l_dash_1',
            type: WidgetType.LABEL,
            name: 'Unit',
            x: 235, y: 175, width: 50, height: 20,
            text: 'KM/H',
            events: [],
            style: { textColor: '#06b6d4', fontSize: 16, backgroundColor: 'transparent' }
          },

          // Left Sidebar (Battery Slider)
          {
            id: 'w_bar_batt',
            layerId: 'l_dash_1',
            type: WidgetType.SLIDER,
            name: 'Battery',
            x: 50, y: 80, width: 24, height: 160,
            value: 60, max: 100,
            events: [],
            style: { backgroundColor: '#1f2937', borderColor: '#ffffff', borderRadius: 12 }
          },
          {
            id: 'w_icon_batt',
            layerId: 'l_dash_1',
            type: WidgetType.ICON,
            name: 'IconBatt',
            x: 47, y: 250, width: 30, height: 30,
            symbol: 'LV_SYMBOL_BATTERY_3',
            events: [],
            style: { textColor: '#22c55e', fontSize: 24, backgroundColor: 'transparent' }
          },

          // Right Sidebar (Buttons)
          {
            id: 'w_btn_mode',
            layerId: 'l_dash_1',
            type: WidgetType.BUTTON,
            name: 'ModeEco',
            x: 390, y: 100, width: 70, height: 45,
            text: 'ECO',
            events: [],
            style: { backgroundColor: '#22c55e', textColor: '#000000', borderRadius: 6, borderWidth: 0 }
          },
          {
            id: 'w_btn_sport',
            layerId: 'l_dash_1',
            type: WidgetType.BUTTON,
            name: 'ModeSport',
            x: 390, y: 160, width: 70, height: 45,
            text: 'SPORT',
            events: [],
            style: { backgroundColor: '#333333', textColor: '#6b7280', borderRadius: 6, borderWidth: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'audio_player',
    name: 'HiFi Audio Player',
    description: 'Music playback controls with album art placeholder and progress slider.',
    icon: <Music size={24} />,
    color: 'from-purple-500 to-indigo-500',
    settings: {
      width: 320,
      height: 240,
      defaultBackgroundColor: '#0f172a',
      projectName: 'AudioPlayer',
      theme: 'midnight',
      targetDevice: 'm5_core'
    },
    screens: [
      {
        id: 'scr_audio_1',
        name: 'Now Playing',
        backgroundColor: '#0f172a',
        layers: [createLayer('l_audio_1')],
        widgets: [
          {
            id: 'w_cover_bg',
            layerId: 'l_audio_1',
            type: WidgetType.CONTAINER,
            name: 'CoverArt',
            x: 110, y: 15, width: 100, height: 100,
            events: [],
            style: { backgroundColor: '#1e293b', borderRadius: 8, borderColor: '#334155', borderWidth: 1 }
          },
          {
            id: 'w_icon_note',
            layerId: 'l_audio_1',
            type: WidgetType.ICON,
            name: 'NoteIcon',
            x: 148, y: 50, width: 24, height: 24,
            symbol: 'LV_SYMBOL_SHUFFLE',
            events: [],
            style: { textColor: '#475569', fontSize: 24, backgroundColor: 'transparent' }
          },
          {
            id: 'w_lbl_song',
            layerId: 'l_audio_1',
            type: WidgetType.LABEL,
            name: 'SongTitle',
            x: 60, y: 125, width: 200, height: 24,
            text: 'Midnight Synthwave',
            events: [],
            style: { textColor: '#f8fafc', fontSize: 16, backgroundColor: 'transparent' }
          },
          {
            id: 'w_lbl_artist',
            layerId: 'l_audio_1',
            type: WidgetType.LABEL,
            name: 'Artist',
            x: 60, y: 148, width: 200, height: 20,
            text: 'Neon Dreams',
            events: [],
            style: { textColor: '#94a3b8', fontSize: 12, backgroundColor: 'transparent' }
          },
          {
            id: 'w_slider_prog',
            layerId: 'l_audio_1',
            type: WidgetType.SLIDER,
            name: 'Progress',
            x: 30, y: 175, width: 260, height: 6,
            value: 45, max: 100,
            events: [],
            style: { backgroundColor: '#334155', borderColor: '#6366f1', borderRadius: 3 }
          },
          {
            id: 'w_btn_prev',
            layerId: 'l_audio_1',
            type: WidgetType.BUTTON,
            name: 'Prev',
            x: 90, y: 195, width: 32, height: 32,
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_PREV',
            events: [],
            style: { backgroundColor: 'transparent', textColor: '#cbd5e1', borderRadius: 16, borderWidth: 0 }
          },
          {
            id: 'w_btn_play',
            layerId: 'l_audio_1',
            type: WidgetType.BUTTON,
            name: 'Play',
            x: 140, y: 190, width: 42, height: 42,
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_PLAY',
            events: [],
            style: { backgroundColor: '#6366f1', textColor: '#ffffff', borderRadius: 21, borderWidth: 0 }
          },
          {
            id: 'w_btn_next',
            layerId: 'l_audio_1',
            type: WidgetType.BUTTON,
            name: 'Next',
            x: 200, y: 195, width: 32, height: 32,
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_NEXT',
            events: [],
            style: { backgroundColor: 'transparent', textColor: '#cbd5e1', borderRadius: 16, borderWidth: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'wifi_settings',
    name: 'Settings Menu',
    description: 'Nested navigation example with toggle switches and list items.',
    icon: <Wifi size={24} />,
    color: 'from-slate-500 to-slate-700',
    settings: {
      width: 320,
      height: 240,
      defaultBackgroundColor: '#f0f2f5',
      projectName: 'Settings_Menu',
      theme: 'light',
      targetDevice: 'm5_core'
    },
    screens: [
      {
        id: 'scr_set_1',
        name: 'Main Menu',
        backgroundColor: '#f0f2f5',
        layers: [createLayer('l_set_1')],
        widgets: [
          {
            id: 'w_hdr_1',
            layerId: 'l_set_1',
            type: WidgetType.CONTAINER,
            name: 'Header',
            x: 0, y: 0, width: 320, height: 40,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 0, borderWidth: 0 }
          },
          {
            id: 'w_lbl_title',
            layerId: 'l_set_1',
            type: WidgetType.LABEL,
            name: 'Title',
            x: 10, y: 10, width: 100, height: 20,
            text: 'Settings',
            events: [],
            style: { textColor: '#1f2937', fontSize: 16, backgroundColor: 'transparent' }
          },
          {
            id: 'w_cont_wifi',
            layerId: 'l_set_1',
            type: WidgetType.BUTTON,
            name: 'BtnWifi',
            x: 10, y: 50, width: 300, height: 50,
            text: '       Wi-Fi Networks',
            events: [{ id: 'evt_nav_wifi', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_set_2' }],
            style: { backgroundColor: '#ffffff', borderRadius: 8, textColor: '#1f2937', borderWidth: 1, borderColor: '#e5e7eb' }
          },
          {
            id: 'w_icon_wifi',
            layerId: 'l_set_1',
            type: WidgetType.ICON,
            name: 'IconWifi',
            x: 25, y: 65, width: 20, height: 20,
            symbol: 'LV_SYMBOL_WIFI',
            events: [],
            style: { textColor: '#2196F3', fontSize: 18, backgroundColor: 'transparent' }
          },
          {
            id: 'w_cont_bt',
            layerId: 'l_set_1',
            type: WidgetType.BUTTON,
            name: 'BtnBT',
            x: 10, y: 110, width: 300, height: 50,
            text: '       Bluetooth',
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 8, textColor: '#1f2937', borderWidth: 1, borderColor: '#e5e7eb' }
          },
          {
            id: 'w_icon_bt',
            layerId: 'l_set_1',
            type: WidgetType.ICON,
            name: 'IconBT',
            x: 25, y: 125, width: 20, height: 20,
            symbol: 'LV_SYMBOL_BLUETOOTH',
            events: [],
            style: { textColor: '#2196F3', fontSize: 18, backgroundColor: 'transparent' }
          }
        ]
      },
      {
        id: 'scr_set_2',
        name: 'Wi-Fi Networks',
        backgroundColor: '#f0f2f5',
        layers: [createLayer('l_set_2')],
        widgets: [
          {
            id: 'w_hdr_2',
            layerId: 'l_set_2',
            type: WidgetType.CONTAINER,
            name: 'Header2',
            x: 0, y: 0, width: 320, height: 40,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 0, borderWidth: 0 }
          },
          {
            id: 'w_btn_back',
            layerId: 'l_set_2',
            type: WidgetType.BUTTON,
            name: 'Back',
            x: 5, y: 5, width: 40, height: 30,
            contentMode: 'icon',
            symbol: 'LV_SYMBOL_PREV',
            events: [{ id: 'evt_back', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_set_1' }],
            style: { backgroundColor: 'transparent', textColor: '#1f2937' }
          },
          {
            id: 'w_lbl_title2',
            layerId: 'l_set_2',
            type: WidgetType.LABEL,
            name: 'Title2',
            x: 50, y: 10, width: 100, height: 20,
            text: 'Wi-Fi',
            events: [],
            style: { textColor: '#1f2937', fontSize: 16, backgroundColor: 'transparent' }
          },
          {
            id: 'w_sw_wifi',
            layerId: 'l_set_2',
            type: WidgetType.SWITCH,
            name: 'Toggle',
            x: 250, y: 5, width: 50, height: 25,
            checked: true,
            events: [],
            style: { backgroundColor: '#e5e7eb', borderColor: '#22c55e', borderRadius: 99 }
          },
          {
            id: 'w_lbl_scan',
            layerId: 'l_set_2',
            type: WidgetType.LABEL,
            name: 'Scan',
            x: 20, y: 60, width: 200, height: 20,
            text: 'Searching for networks...',
            events: [],
            style: { textColor: '#6b7280', fontSize: 12, backgroundColor: 'transparent' }
          }
        ]
      }
    ]
  },
  {
    id: 'lvgl_benchmark',
    name: 'LVGL Benchmark',
    description: 'Official benchmark demo to test display performance and FPS.',
    icon: <Activity size={24} />,
    image: '/demos/benchmark.png',
    color: 'from-pink-500 to-rose-500',
    settings: { width: 480, height: 320, defaultBackgroundColor: '#ffffff', projectName: 'Benchmark', theme: 'light', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_bench',
        name: 'Benchmark',
        backgroundColor: '#f0f0f0',
        layers: [createLayer('l_bench')],
        widgets: [
          {
            id: 'w_bench_hdr',
            layerId: 'l_bench',
            type: WidgetType.CONTAINER,
            name: 'Header',
            x: 0, y: 0, width: 480, height: 40,
            events: [],
            style: { backgroundColor: '#2196F3', borderRadius: 0, borderWidth: 0 }
          },
          {
            id: 'w_bench_title',
            layerId: 'l_bench',
            type: WidgetType.LABEL,
            name: 'Title',
            x: 10, y: 10, width: 200, height: 20,
            text: 'LVGL Benchmark',
            events: [],
            style: { textColor: '#ffffff', fontSize: 16, backgroundColor: 'transparent' }
          },
          {
            id: 'w_bench_card',
            layerId: 'l_bench',
            type: WidgetType.CONTAINER,
            name: 'ResultCard',
            x: 140, y: 80, width: 200, height: 160,
            events: [],
            style: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }
          },
          {
            id: 'w_bench_res_lbl',
            layerId: 'l_bench',
            type: WidgetType.LABEL,
            name: 'ResultLbl',
            x: 190, y: 100, width: 100, height: 20,
            text: 'Weighted FPS',
            events: [],
            style: { textColor: '#666', fontSize: 14, backgroundColor: 'transparent' }
          },
          {
            id: 'w_bench_val',
            layerId: 'l_bench',
            type: WidgetType.LABEL,
            name: 'FPSVal',
            x: 200, y: 140, width: 80, height: 40,
            text: '32',
            events: [],
            style: { textColor: '#2196F3', fontSize: 40, backgroundColor: 'transparent' }
          },
          {
            id: 'w_bench_run',
            layerId: 'l_bench',
            type: WidgetType.BUTTON,
            name: 'RunBtn',
            x: 180, y: 260, width: 120, height: 40,
            text: 'Run Test',
            events: [],
            style: { backgroundColor: '#4RAF50', textColor: '#ffffff', borderRadius: 20, borderWidth: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'lvgl_stress',
    name: 'Stress Test',
    description: 'Stress test demo to verify stability under heavy load.',
    icon: <Activity size={24} />,
    image: '/demos/stress.png',
    color: 'from-red-600 to-orange-600',
    settings: { width: 480, height: 320, defaultBackgroundColor: '#ffffff', projectName: 'StressTest', theme: 'light', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_stress',
        name: 'Stress',
        backgroundColor: '#ffffff',
        layers: [createLayer('l_stress')],
        widgets: [
          { id: 'w_s_1', layerId: 'l_stress', type: WidgetType.BUTTON, name: 'B1', x: 20, y: 20, width: 100, height: 40, text: 'Click Me', events: [], style: { backgroundColor: '#f44336', textColor: '#fff', borderRadius: 4 } },
          { id: 'w_s_2', layerId: 'l_stress', type: WidgetType.BUTTON, name: 'B2', x: 130, y: 20, width: 100, height: 40, text: 'Click Me', events: [], style: { backgroundColor: '#E91E63', textColor: '#fff', borderRadius: 4 } },
          { id: 'w_s_3', layerId: 'l_stress', type: WidgetType.BUTTON, name: 'B3', x: 240, y: 20, width: 100, height: 40, text: 'Click Me', events: [], style: { backgroundColor: '#9C27B0', textColor: '#fff', borderRadius: 4 } },
          { id: 'w_s_4', layerId: 'l_stress', type: WidgetType.BUTTON, name: 'B4', x: 350, y: 20, width: 100, height: 40, text: 'Click Me', events: [], style: { backgroundColor: '#673AB7', textColor: '#fff', borderRadius: 4 } },

          { id: 'w_s_5', layerId: 'l_stress', type: WidgetType.SLIDER, name: 'S1', x: 20, y: 80, width: 200, height: 10, value: 30, events: [], style: { backgroundColor: '#eee', borderColor: '#3F51B5', borderRadius: 5 } },
          { id: 'w_s_6', layerId: 'l_stress', type: WidgetType.SWITCH, name: 'Sw1', x: 250, y: 70, width: 50, height: 25, checked: true, events: [], style: { backgroundColor: '#eee', borderColor: '#2196F3', borderRadius: 99 } },

          { id: 'w_s_7', layerId: 'l_stress', type: WidgetType.ARC, name: 'Spin1', x: 350, y: 80, width: 40, height: 40, value: 75, events: [], style: { borderColor: '#009688', borderWidth: 4, backgroundColor: 'transparent' } },

          { id: 'w_s_res', layerId: 'l_stress', type: WidgetType.TEXT_AREA, name: 'Log', x: 20, y: 140, width: 440, height: 160, text: 'System load: 12%\nMemory: 45MB free\nTask: rendering...', events: [], style: { backgroundColor: '#000', textColor: '#0f0', fontSize: 12, borderColor: '#333', borderWidth: 1 } }
        ]
      }
    ]
  },
  {
    id: 'lvgl_keypad_encoder',
    name: 'Keypad Encoder',
    description: 'Demonstration of keypad and encoder input handling.',
    icon: <Keyboard size={24} />,
    image: '/demos/keypad_demo.png',
    color: 'from-gray-600 to-slate-600',
    settings: { width: 480, height: 272, defaultBackgroundColor: '#ffffff', projectName: 'KeypadDemo', theme: 'light', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_kp',
        name: 'Keypad',
        backgroundColor: '#ffffff',
        layers: [createLayer('l_kp')],
        widgets: [
          {
            id: 'w_kp_ta',
            layerId: 'l_kp',
            type: WidgetType.TEXT_AREA,
            name: 'TextArea',
            x: 20, y: 20, width: 200, height: 230,
            text: 'Type here...',
            events: [],
            style: { borderColor: '#ccc', borderWidth: 1, borderRadius: 4, backgroundColor: '#f0f0f0', textColor: '#333', fontSize: 16 }
          },
          {
            id: 'w_kp_kb',
            layerId: 'l_kp',
            type: WidgetType.KEYBOARD,
            name: 'Keyboard',
            x: 230, y: 20, width: 230, height: 230,
            events: [],
            style: { backgroundColor: '#ddd', borderColor: '#bbb', borderRadius: 4, borderWidth: 1 }
          },
          {
            id: 'w_kp_enc_lbl',
            layerId: 'l_kp',
            type: WidgetType.LABEL,
            name: 'EncLabel',
            x: 20, y: 260, width: 200, height: 20,
            text: 'Encoder Mode: NAV',
            events: [],
            style: { textColor: '#555', fontSize: 14, backgroundColor: 'transparent' }
          }
        ]
      }
    ]
  },
  {
    id: 'setup_wizard',
    name: 'Setup Wizard',
    description: 'A linear step-by-step configuration flow (Welcome -> WiFi -> Finish).',
    icon: <Layers size={24} />,
    color: 'from-indigo-500 to-purple-600',
    settings: { width: 480, height: 320, defaultBackgroundColor: '#f8fafc', projectName: 'SetupWizard', theme: 'light', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_wiz_1',
        name: 'Step 1: Welcome',
        backgroundColor: '#f8fafc',
        layers: [createLayer('l_wiz_1')],
        widgets: [
          { id: 'w_w1_img', layerId: 'l_wiz_1', type: WidgetType.ICON, name: 'HeroIcon', x: 190, y: 30, width: 100, height: 100, symbol: 'LV_SYMBOL_SETTINGS', events: [], style: { textColor: '#6366f1', fontSize: 60, backgroundColor: 'transparent' } },
          { id: 'w_w1_title', layerId: 'l_wiz_1', type: WidgetType.LABEL, name: 'Title', x: 140, y: 140, width: 200, height: 30, text: 'Device Setup', events: [], style: { textColor: '#1e293b', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_w1_desc', layerId: 'l_wiz_1', type: WidgetType.LABEL, name: 'Desc', x: 90, y: 180, width: 300, height: 40, text: 'Welcome! This wizard will help you\nconfigure your new device.', events: [], style: { textColor: '#64748b', fontSize: 14, backgroundColor: 'transparent' } },
          { id: 'w_w1_next', layerId: 'l_wiz_1', type: WidgetType.BUTTON, name: 'NextBtn', x: 340, y: 260, width: 120, height: 40, text: 'Start Setup', events: [{ id: 'evt_w1_next', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_wiz_2' }], style: { backgroundColor: '#4f46e5', textColor: '#ffffff', borderRadius: 8 } }
        ]
      },
      {
        id: 'scr_wiz_2',
        name: 'Step 2: WiFi',
        backgroundColor: '#f8fafc',
        layers: [createLayer('l_wiz_2')],
        widgets: [
          { id: 'w_w2_hdr', layerId: 'l_wiz_2', type: WidgetType.LABEL, name: 'Title', x: 20, y: 20, width: 200, height: 30, text: 'Connect to Wi-Fi', events: [], style: { textColor: '#1e293b', fontSize: 20, backgroundColor: 'transparent' } },
          { id: 'w_w2_list', layerId: 'l_wiz_2', type: WidgetType.ROLLER, name: 'WifiList', x: 40, y: 60, width: 400, height: 160, options: 'Home Network\nOffice Guest\nFree WiFi\nHidden Network', events: [], style: { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 8 } },
          { id: 'w_w2_back', layerId: 'l_wiz_2', type: WidgetType.BUTTON, name: 'BackBtn', x: 20, y: 260, width: 100, height: 40, text: 'Back', events: [{ id: 'evt_w2_back', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_wiz_1' }], style: { backgroundColor: '#cbd5e1', textColor: '#475569', borderRadius: 8 } },
          { id: 'w_w2_next', layerId: 'l_wiz_2', type: WidgetType.BUTTON, name: 'NextBtn', x: 360, y: 260, width: 100, height: 40, text: 'Next', events: [{ id: 'evt_w2_next', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_wiz_3' }], style: { backgroundColor: '#4f46e5', textColor: '#ffffff', borderRadius: 8 } }
        ]
      },
      {
        id: 'scr_wiz_3',
        name: 'Step 3: Finish',
        backgroundColor: '#f8fafc',
        layers: [createLayer('l_wiz_3')],
        widgets: [
          { id: 'w_w3_icon', layerId: 'l_wiz_3', type: WidgetType.ICON, name: 'CheckIcon', x: 210, y: 50, width: 60, height: 60, symbol: 'LV_SYMBOL_OK', events: [], style: { textColor: '#22c55e', fontSize: 48, backgroundColor: 'transparent' } },
          { id: 'w_w3_title', layerId: 'l_wiz_3', type: WidgetType.LABEL, name: 'Title', x: 160, y: 120, width: 160, height: 30, text: 'All Done!', events: [], style: { textColor: '#1e293b', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_w3_desc', layerId: 'l_wiz_3', type: WidgetType.LABEL, name: 'Desc', x: 100, y: 160, width: 280, height: 40, text: 'Your device is successfully configured\nand ready to use.', events: [], style: { textColor: '#64748b', fontSize: 14, backgroundColor: 'transparent' } },
          { id: 'w_w3_done', layerId: 'l_wiz_3', type: WidgetType.BUTTON, name: 'FinishBtn', x: 160, y: 240, width: 160, height: 50, text: 'Finish Setup', events: [{ id: 'evt_w3_fin', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_wiz_1' }], style: { backgroundColor: '#22c55e', textColor: '#ffffff', borderRadius: 25 } }
        ]
      }
    ]
  },
  {
    id: 'smart_home_hub',
    name: 'Smart Home Hub',
    description: 'Central dashboard with navigation to sub-screens (Living Room, Kitchen).',
    icon: <Home size={24} />,
    color: 'from-emerald-500 to-teal-700',
    settings: { width: 480, height: 320, defaultBackgroundColor: '#ecfdf5', projectName: 'SmartHome', theme: 'light', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_home',
        name: 'Dashboard',
        backgroundColor: '#ecfdf5',
        layers: [createLayer('l_home')],
        widgets: [
          { id: 'w_h_title', layerId: 'l_home', type: WidgetType.LABEL, name: 'Title', x: 20, y: 15, width: 200, height: 30, text: 'My Home', events: [], style: { textColor: '#0f766e', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_h_temp', layerId: 'l_home', type: WidgetType.LABEL, name: 'AvgTemp', x: 380, y: 15, width: 80, height: 20, text: '72°F', events: [], style: { textColor: '#0f766e', fontSize: 18, backgroundColor: 'transparent' } },

          { id: 'w_h_btn_living', layerId: 'l_home', type: WidgetType.BUTTON, name: 'LivingBtn', x: 20, y: 60, width: 210, height: 100, text: 'Living Room\nLights: ON\nTemp: 74°', events: [{ id: 'evt_h_living', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_living' }], style: { backgroundColor: '#ffffff', textColor: '#0f766e', borderRadius: 12, borderWidth: 1, borderColor: '#ccfbf1' } },
          { id: 'w_h_btn_kitchen', layerId: 'l_home', type: WidgetType.BUTTON, name: 'KitchenBtn', x: 250, y: 60, width: 210, height: 100, text: 'Kitchen\nLights: OFF\nFridge: 38°', events: [{ id: 'evt_h_kitchen', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_kitchen' }], style: { backgroundColor: '#ffffff', textColor: '#0f766e', borderRadius: 12, borderWidth: 1, borderColor: '#ccfbf1' } },
          { id: 'w_h_btn_bed', layerId: 'l_home', type: WidgetType.BUTTON, name: 'BedBtn', x: 20, y: 180, width: 210, height: 100, text: 'Bedroom\nLights: OFF\nAlarm: 7:00', events: [], style: { backgroundColor: '#ffffff', textColor: '#94a3b8', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' } },
          { id: 'w_h_btn_garage', layerId: 'l_home', type: WidgetType.BUTTON, name: 'GarageBtn', x: 250, y: 180, width: 210, height: 100, text: 'Garage\nDoor: CLOSED', events: [], style: { backgroundColor: '#ffffff', textColor: '#94a3b8', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' } }
        ]
      },
      {
        id: 'scr_living',
        name: 'Living Room',
        backgroundColor: '#ffffff',
        layers: [createLayer('l_living')],
        widgets: [
          { id: 'w_l_back', layerId: 'l_living', type: WidgetType.BUTTON, name: 'BackBtn', x: 10, y: 10, width: 80, height: 30, text: 'Back', events: [{ id: 'evt_l_back', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_home' }], style: { backgroundColor: '#ccfbf1', textColor: '#0f766e', borderRadius: 6 } },
          { id: 'w_l_title', layerId: 'l_living', type: WidgetType.LABEL, name: 'Title', x: 100, y: 10, width: 200, height: 30, text: 'Living Room', events: [], style: { textColor: '#0f766e', fontSize: 20, backgroundColor: 'transparent' } },

          { id: 'w_l_light', layerId: 'l_living', type: WidgetType.SWITCH, name: 'MainLight', x: 40, y: 70, width: 60, height: 30, checked: true, events: [], style: { backgroundColor: '#e2e8f0', borderColor: '#0f766e', borderRadius: 99 } },
          { id: 'w_l_lbl', layerId: 'l_living', type: WidgetType.LABEL, name: 'LightLbl', x: 110, y: 75, width: 100, height: 20, text: 'Main Lights', events: [], style: { textColor: '#334155', fontSize: 16, backgroundColor: 'transparent' } },

          { id: 'w_l_slider', layerId: 'l_living', type: WidgetType.SLIDER, name: 'Dimmer', x: 40, y: 120, width: 300, height: 10, value: 80, events: [], style: { backgroundColor: '#e2e8f0', borderColor: '#0f766e', borderRadius: 5 } }
        ]
      },
      {
        id: 'scr_kitchen',
        name: 'Kitchen',
        backgroundColor: '#ffffff',
        layers: [createLayer('l_kitchen')],
        widgets: [
          { id: 'w_k_back', layerId: 'l_kitchen', type: WidgetType.BUTTON, name: 'BackBtn', x: 10, y: 10, width: 80, height: 30, text: 'Back', events: [{ id: 'evt_k_back', trigger: 'CLICKED', action: 'NAVIGATE', targetScreenId: 'scr_home' }], style: { backgroundColor: '#ccfbf1', textColor: '#0f766e', borderRadius: 6 } },
          { id: 'w_k_title', layerId: 'l_kitchen', type: WidgetType.LABEL, name: 'Title', x: 100, y: 10, width: 200, height: 30, text: 'Kitchen', events: [], style: { textColor: '#0f766e', fontSize: 20, backgroundColor: 'transparent' } },

          { id: 'w_k_light', layerId: 'l_kitchen', type: WidgetType.SWITCH, name: 'MainLight', x: 40, y: 70, width: 60, height: 30, checked: false, events: [], style: { backgroundColor: '#e2e8f0', borderColor: '#0f766e', borderRadius: 99 } },
          { id: 'w_k_lbl', layerId: 'l_kitchen', type: WidgetType.LABEL, name: 'LightLbl', x: 110, y: 75, width: 100, height: 20, text: 'Ceiling Lights', events: [], style: { textColor: '#334155', fontSize: 16, backgroundColor: 'transparent' } }
        ]
      }
    ]
  },
  {
    id: 'lvgl_music',
    name: 'Music Player',
    description: 'Advanced audio player UI with spectrum analyzer and album art.',
    icon: <Play size={24} />,
    image: '/demos/music_demo.gif',
    color: 'from-blue-600 to-indigo-900',
    settings: { width: 480, height: 272, defaultBackgroundColor: '#1e1e2e', projectName: 'MusicPlayer', theme: 'dark', targetDevice: 'custom' },
    screens: [
      {
        id: 'scr_music',
        name: 'Player',
        backgroundColor: '#1e1e2e',
        layers: [createLayer('l_music')],
        widgets: [
          // Album Art
          { id: 'w_m_art', layerId: 'l_music', type: WidgetType.CONTAINER, name: 'AlbumArt', x: 20, y: 36, width: 140, height: 140, events: [], style: { backgroundColor: '#313244', borderRadius: 140, borderWidth: 4, borderColor: '#45475a' } },
          { id: 'w_m_icon', layerId: 'l_music', type: WidgetType.ICON, name: 'NoteIcon', x: 65, y: 81, width: 50, height: 50, symbol: 'LV_SYMBOL_BELL', events: [], style: { textColor: '#cba6f7', fontSize: 40, backgroundColor: 'transparent' } },

          // Track Info
          { id: 'w_m_title', layerId: 'l_music', type: WidgetType.LABEL, name: 'Title', x: 180, y: 40, width: 200, height: 30, text: 'Midnight City', events: [], style: { textColor: '#cdd6f4', fontSize: 24, backgroundColor: 'transparent' } },
          { id: 'w_m_artist', layerId: 'l_music', type: WidgetType.LABEL, name: 'Artist', x: 180, y: 70, width: 200, height: 20, text: 'M83 - Hurry Up, We\'re Dreaming', events: [], style: { textColor: '#a6adc8', fontSize: 16, backgroundColor: 'transparent' } },

          // Controls
          { id: 'w_m_prev', layerId: 'l_music', type: WidgetType.BUTTON, name: 'Prev', x: 180, y: 110, width: 50, height: 50, text: '', symbol: 'LV_SYMBOL_PREV', events: [], style: { backgroundColor: '#313244', textColor: '#cdd6f4', borderRadius: 25 } },
          { id: 'w_m_play', layerId: 'l_music', type: WidgetType.BUTTON, name: 'Play', x: 250, y: 100, width: 70, height: 70, text: '', symbol: 'LV_SYMBOL_PLAY', events: [], style: { backgroundColor: '#cba6f7', textColor: '#1e1e2e', borderRadius: 35 } },
          { id: 'w_m_next', layerId: 'l_music', type: WidgetType.BUTTON, name: 'Next', x: 340, y: 110, width: 50, height: 50, text: '', symbol: 'LV_SYMBOL_NEXT', events: [], style: { backgroundColor: '#313244', textColor: '#cdd6f4', borderRadius: 25 } },

          // Progress
          { id: 'w_m_prog', layerId: 'l_music', type: WidgetType.SLIDER, name: 'Progress', x: 20, y: 220, width: 440, height: 8, value: 45, events: [], style: { backgroundColor: '#45475a', borderColor: '#cba6f7', borderRadius: 4 } },
          { id: 'w_m_time', layerId: 'l_music', type: WidgetType.LABEL, name: 'Time', x: 20, y: 235, width: 60, height: 20, text: '1:45', events: [], style: { textColor: '#bac2de', fontSize: 12, backgroundColor: 'transparent' } },
          { id: 'w_m_dur', layerId: 'l_music', type: WidgetType.LABEL, name: 'Dur', x: 420, y: 235, width: 60, height: 20, text: '4:03', events: [], style: { textColor: '#bac2de', fontSize: 12, backgroundColor: 'transparent' } },

          // Spectrum (Visual)
          { id: 'w_m_spec1', layerId: 'l_music', type: WidgetType.BAR, name: 'Spec1', x: 420, y: 50, width: 8, height: 40, value: 60, events: [], style: { backgroundColor: '#313244', borderColor: '#f38ba8', borderRadius: 4 } },
          { id: 'w_m_spec2', layerId: 'l_music', type: WidgetType.BAR, name: 'Spec2', x: 432, y: 60, width: 8, height: 30, value: 40, events: [], style: { backgroundColor: '#313244', borderColor: '#fab387', borderRadius: 4 } },
          { id: 'w_m_spec3', layerId: 'l_music', type: WidgetType.BAR, name: 'Spec3', x: 444, y: 40, width: 8, height: 50, value: 80, events: [], style: { backgroundColor: '#313244', borderColor: '#a6e3a1', borderRadius: 4 } },
          { id: 'w_m_spec4', layerId: 'l_music', type: WidgetType.BAR, name: 'Spec4', x: 456, y: 55, width: 8, height: 35, value: 50, events: [], style: { backgroundColor: '#313244', borderColor: '#89b4fa', borderRadius: 4 } }
        ]
      }
    ]
  }
];
