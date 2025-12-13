





# Project Context: LVGL Studio AI

This document provides context for AI models (Gemini, GPT, etc.) to understand the codebase structure, data models, and business logic of the **LVGL Studio AI** application.

## 1. Overview
LVGL Studio AI is a React 19 web application that allows users to visually design embedded GUIs for the LVGL (Light and Versatile Graphics Library) framework. It generates C or MicroPython code based on the visual design.

## 2. Tech Stack
- **Frontend**: React 19, TypeScript, TailwindCSS.
- **Icons**: Lucide React.
- **AI SDK**: `@google/genai` (Gemini).
- **Build System**: ES Modules via `importmap` (No bundler required for dev).
- **Persistence**: LocalStorage for auto-save, JSON file Export/Import for projects.

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
  
  // Image Specifics
  src?: string;       // Filename reference (e.g. "icon.png")
  imageData?: string; // Base64 string for Browser Preview ONLY (stripped before sending to AI)
  
  // List Options (Roller/Dropdown)
  options?: string;   // Newline separated string
  
  // ... coordinates (x, y, width, height)
}

interface ProjectFile {
    version: string;
    screens: Screen[];
    settings: CanvasSettings;
    // ... styles, etc
}
```

## 4. Key Components

### `App.tsx`
- Holds the root state: `screens[]`, `activeScreenId`, `canvasSettings`.
- **State Management**: Uses custom `useHistory` hook to manage `past`, `present` (state), and `future` stacks.
- **Persistence**: 
    - Lazily initializes state from `localStorage` on mount.
    - Updates `localStorage` on every state change.
    - Handles JSON file Import/Export logic (`FileReader` / `Blob`).
- Manages global actions (Add Widget, Generate Code, Apply Theme) via `updateProject` wrapper for History tracking.

### `hooks/useHistory.ts`
- Provides generic `undo`, `redo`, `jumpTo`, and `set` capabilities.
- Stores history as `{ state: T, name: string, timestamp: number }` items.

### `components/Canvas.tsx`
- Renders the "Active Screen".
- Handles Drag-and-Drop (creation), Drag-to-Move, and Resizing.
- **Smart Alignment**: Implements a magnetic snap system (5px threshold) that aligns moving widgets to the edges and centers of other widgets. Renders magenta guidelines (`#ec4899`) when snapped.
- Renders LVGL-like HTML approximations of widgets.
- **Slider Orientation**: Automatically renders as **Vertical** if height > width.
- **Image Rendering**: Renders Base64 `imageData` if present, otherwise shows a placeholder.

### `components/PropertiesPanel.tsx`
- **Selection Mode**: Edits properties of selected widget(s).
- **Global Mode**: When nothing is selected, edits Active Screen settings, Global Theme, and **Layer Management** (Reorder, Lock, Hide).
- **Image Upload**: Handles converting `File` inputs to Base64 strings for preview.

### `components/WidgetPalette.tsx`
- Lists available widgets.
- **AI Widget Generator**: Contains an input field to accept natural language prompts. Calls `generateSingleWidget` service to create widget JSON on the fly.

### `services/aiService.ts`
- **Prompt Engineering**: serialized the `screens` array into a simplified JSON format.
- **Optimization**: Specifically filters out `imageData` (Base64) from the JSON payload to prevent token limit exhaustion, sending only the `src` filename to the LLM.
- **Context Injection**: Instructs the LLM to generate:
    - `ui_init()` function.
    - Event callbacks (`ui_event_Button1`).
    - Image references using `src` filename (e.g., `lv_img_set_src(obj, "S:path/" + src)`).
- **Single Widget Gen**: Implements `generateSingleWidget` which prompts the AI to return a single JSON object (Partial Widget) based on a user description.

## 5. Themes (`constants.ts`)
Themes are static configuration objects (`PROJECT_THEMES`) that define color palettes (`primary`, `surface`, `background`, etc.).
When a theme is applied, the App iterates over **all widgets** in **all screens** and mutates their `style` properties to match the theme's palette.

## 6. Code Generation Rules
When generating code for this project:
1.  **C Code**: Must be LVGL v8/v9 compatible. Use `lv_obj_create`, `lv_obj_set_style_*`, `lv_obj_add_event_cb`.
2.  **MicroPython**: Must use the standard `lvgl` module bindings.
3.  **Navigation**: Logic must handle screen loading (e.g., `lv_scr_load_anim`).
4.  **Images**: 
    - Assume images are file-based or pre-declared symbols.
    - Do not try to inline Base64 data in C code.
    - Use the `src` property (filename) to generate the reference.
5.  **Sliders**: 
    - If `height > width`, the slider is vertical. In LVGL this often handles itself via sizing, but check if specific flags/styles are needed for the requested version.
6.  **New Widgets**:
    - `lv_roller` and `lv_dropdown`: Use `lv_roller_set_options` / `lv_dropdown_set_options` with newline separators.
    - `lv_led`: Use `lv_led_set_brightness` or `lv_led_on/off`.
