
# Changelog

All notable changes to the **LVGL Studio AI** project will be documented in this file.

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
