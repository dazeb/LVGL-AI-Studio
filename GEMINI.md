
# Project Context: LVGL Studio AI

This document provides context for AI models (Gemini, GPT, etc.) to understand the codebase structure, data models, and business logic of the **LVGL Studio AI** application.

## 1. Overview
LVGL Studio AI is a React 19 web application that allows users to visually design embedded GUIs for the LVGL (Light and Versatile Graphics Library) framework. It generates C or MicroPython code based on the visual design.

## 2. Tech Stack
- **Frontend**: React 19, TypeScript, TailwindCSS.
- **Icons**: Lucide React.
- **AI SDK**: `@google/genai` (Gemini).
- **Build System**: ES Modules via `importmap` (No bundler required for dev).

## 3. Data Model (`types.ts`)

The application state is hierarchical:

```typescript
interface Screen {
  id: string;
  name: string;
  backgroundColor: string;
  layers: Layer[];    // Z-index groups
  widgets: Widget[];  // Flat list of widgets for this screen
}

interface Widget {
  id: string;
  type: WidgetType;   // e.g., 'lv_btn', 'lv_label'
  events: WidgetEvent[]; 
  style: WidgetStyle; // CSS-like props mapped to LVGL styles
  // ... coordinates (x, y, width, height)
}

interface WidgetEvent {
  trigger: 'CLICKED' | 'PRESSED' | ...;
  action: 'NAVIGATE' | 'CUSTOM_CODE';
  targetScreenId?: string;
  customCode?: string;
}
```

## 4. Key Components

### `App.tsx`
- Holds the root state: `screens[]`, `activeScreenId`, `canvasSettings`.
- Manages global actions (Add Widget, Generate Code, Apply Theme).

### `components/Canvas.tsx`
- Renders the "Active Screen".
- Handles Drag-and-Drop (creation), Drag-to-Move, and Resizing.
- Renders LVGL-like HTML approximations of widgets.

### `components/PropertiesPanel.tsx`
- **Selection Mode**: Edits properties of selected widget(s).
- **Global Mode**: When nothing is selected, edits Active Screen settings, Global Theme, and Resolution.
- **Events Section**: UI to push objects into the `widget.events` array.

### `services/aiService.ts`
- **Prompt Engineering**: serialized the `screens` array into a simplified JSON format.
- **Context Injection**: Instructs the LLM to generate:
    - `ui_init()` function.
    - `ui_ScreenX_screen_init()` for each screen.
    - Event callbacks (`ui_event_Button1`) linking `LV_EVENT_CLICKED` to `lv_scr_load_anim`.

## 5. Themes (`constants.ts`)
Themes are static configuration objects (`PROJECT_THEMES`) that define color palettes (`primary`, `surface`, `background`, etc.).
When a theme is applied, the App iterates over **all widgets** in **all screens** and mutates their `style` properties to match the theme's palette.

## 6. Code Generation Rules
When generating code for this project:
1.  **C Code**: Must be LVGL v8/v9 compatible. Use `lv_obj_create`, `lv_obj_set_style_*`, `lv_obj_add_event_cb`.
2.  **MicroPython**: Must use the standard `lvgl` module bindings.
3.  **Navigation**: Logic must handle screen loading (e.g., `lv_scr_load_anim`).
4.  **Token Efficiency**: The JSON payload sent to the AI strips unnecessary UI state (like `isSelected`) to focus on data needed for code generation.
