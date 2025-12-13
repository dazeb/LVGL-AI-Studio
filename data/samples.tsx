
import React from 'react';
import { Screen, CanvasSettings, WidgetType, Layer } from '../types';
import { PROJECT_THEMES } from '../constants';
import { Thermometer, Music, Gauge, Activity, Wifi } from 'lucide-react';

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  settings: CanvasSettings;
  screens: Screen[];
}

const createLayer = (id: string) => ({ id, name: 'Main Layer', visible: true, locked: false });

export const SAMPLE_PROJECTS: SampleProject[] = [
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
  }
];
