





# Changelog

All notable changes to the **LVGL Studio AI** project will be documented in this file.

## [0.5.0] - 2025-05-25

### Added
- **AI Widget Generator** 🧠: Instantly create fully styled widgets by describing them in plain English (e.g., "Red round stop button" or "Blue progress bar at 75%").
- **Smart Alignment Guidelines** 📏: Visual magenta snap lines appear automatically when dragging widgets to help align edges and centers with other elements on the canvas.

## [0.4.0] - 2025-05-24

### Added
- **History System**: Full Undo/Redo support (`Ctrl+Z`, `Ctrl+Y`) for all canvas operations (Add/Move/Resize/Delete/Style).
- **History Menu**: A dropdown menu in the header allowing users to jump back to any previous project state.
- **Hardware Library**: Added presets for **LilyGo** (T-Display S3, T-HMI), **Sunton** (ESP32-S3 screens), **Elecrow** (CrowPanel), and **Riverdi** (STM32 Embedded) displays.
- **New Widgets**: Added support for **Bar**, **Roller**, **Dropdown**, **LED**, and **Keyboard** widgets to the palette and AI generator.

### Changed
- **State Management**: Refactored the core application state to use a `useHistory` hook, enabling time-travel debugging and state restoration.
- **Project Structure**: Updated `constants.ts` to include a much larger list of manufacturer-specific display resolutions for better SEO and user convenience.

---

## [0.3.2] - 2025-05-23

### Added
- **Project Persistence**: Implemented Auto-save functionality using LocalStorage. The entire workspace state (screens, widgets, settings, AI config) persists across browser reloads.
- **Import/Export**: Added "Save Project" (Download JSON) and "Open Project" (Upload JSON) buttons to the header. Users can now backup and share their designs.
- **Header UI**: Added Open/Save icon buttons next to the Templates button.

### Changed
- **State Initialization**: Refactored `App.tsx` to lazily initialize state from LocalStorage if available.

---

## [0.3.1] - 2025-05-23

### Changed
- **Properties Panel**: Converted Style Presets from pill buttons to a compact Dropdown menu with delete functionality to save vertical space.
- **Template Catalogue**: Redesigned layout for higher density (5 columns) and updated card visuals for a more modern look.
- **Canvas Rendering**: Added support for vertical Sliders. If a slider's height is greater than its width, it automatically renders in vertical mode.
- **Sample Data**: Refined 'Smart Thermostat' and 'E-Bike Dashboard' templates with high-fidelity positioning, colors, and font sizes to match design references.

## [0.3.0] - 2025-05-22

### Added
- **Image Upload Support**: Users can now upload local image files to the Image Widget. The app generates a preview using Base64 and automatically calculates dimensions.
- **Layer Reordering**: Added Drag-and-Drop functionality to the Layers list in the Properties Panel to change Z-index order.
- **Image Code Generation**: The AI Service now intelligently handles images by using the filename reference for code generation while stripping heavy Base64 data from the prompt to save tokens.

### Changed
- **UI Restructuring**: Moved the **Layers Panel** from the Left Sidebar (Widget Palette) to the Right Sidebar (Properties Panel).
- **Layer Access**: Layers are now accessible in the "Screen Settings" view (visible when no specific widget is selected).
- **Canvas Rendering**: Updated Canvas to render uploaded Base64 image data instead of just placeholders.

### Fixed
- Fixed aspect ratio resizing for Images and Icons (or when holding Shift).
- Improved performance by optimizing the AI prompt payload size.

---

## [0.2.0] - 2025-05-20

### Added
- **Multi-Screen Support**: Added ability to create, delete, and switch between multiple screens.
- **Global Themes**: Added a "Theme" selector in the Global Settings (Light, Dark, Midnight, Retro, Cyber). Applying a theme automatically updates styles for all widgets on all screens.
- **Event System**:
    - Added `WidgetEvent` interface in `types.ts`.
    - Added UI in `PropertiesPanel` to manage events (Add, Delete, Edit).
    - Supported Triggers: `CLICKED`, `PRESSED`, `RELEASED`, `VALUE_CHANGED`, `FOCUSED`, `DEFOCUSED`.
    - Supported Actions: `NAVIGATE` (screen switching) and `CUSTOM_CODE` (raw injection).
    - Added visual indicator (Yellow Zap icon) on Canvas for widgets with attached events.
- **Screen Management UI**: Added a "Screens" tab to the `WidgetPalette` sidebar.

### Changed
- **State Management**: Refactored `App.tsx` to move from a flat widget list to a hierarchical `screens[]` array.
- **AI Service**: Updated prompt construction to serialize the entire multi-screen object graph, including event logic and theme context.
- **Canvas Rendering**: Updated `Canvas.tsx` to filter widgets based on the active screen ID.
- **Properties Panel**: Contextually shows Screen Settings when no widget is selected.

### Fixed
- Fixed layer visibility logic ensuring hidden layers are excluded from AI context to save tokens.

---

## [0.1.0] - Initial Beta

### Added
- Basic Canvas with drag-and-drop.
- Layer management (Lock/Hide).
- Basic Widget set (Button, Label, Slider, Switch, Checkbox, Arc, Container, Text Area, Chart, Image, Icon).
- AI Code Generation via Google Gemini.
- Settings dialog for AI Provider configuration.
