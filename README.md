




# LVGL Studio AI 🎨✨

**LVGL Studio AI** is a professional, browser-based visual interface designer for embedded systems. It empowers developers to visually build complex **Multi-Screen** GUIs for the **Light and Versatile Graphics Library (LVGL)** using a drag-and-drop interface, and instantly generate production-ready C or MicroPython code using **Google's Gemini AI**, **Anthropic Claude**, **OpenAI**, **DeepSeek**, or **Local LLMs**.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![LVGL](https://img.shields.io/badge/LVGL-v8%2Fv9-green) ![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20Claude%20%7C%20DeepSeek%20%7C%20OpenAI-purple)

## 🌟 Key Features

*   **AI Widget Generator** 🆕🧠: Create widgets instantly by describing them in plain English (e.g., "Red round stop button"). The AI infers type, style, and icon automatically.
*   **Smart Alignment** 🆕📏: Magnetic guidelines snap widgets to edges and centers of other elements for pixel-perfect layouts.
*   **Multi-Screen Support**: Create, rename, and manage multiple screens. Visually link buttons to navigate between them.
*   **Time Travel & History**: 
    *   **Undo/Redo**: Full state history support (Ctrl+Z / Ctrl+Y).
    *   **History Menu**: View a timeline of your actions and jump back to any previous state instantly.
*   **Project Persistence**: 
    *   **Auto-Save**: Your work is automatically saved to browser storage (LocalStorage) so you never lose progress.
    *   **Import/Export**: Save your projects to `.json` files and share them or load them later.
*   **Template Library**: Jumpstart development with high-fidelity, pre-configured templates (Thermostats, Dashboards, Audio Players).
*   **Global Theming**: Instantly style your entire project with presets like *Cyberpunk*, *Midnight*, *Retro*, and more.
*   **Event System**: Define logic for Clicked, Pressed, Released, and Value Changed events. Support for Navigation actions or Custom C/Python code.
*   **Visual Drag-and-Drop Editor**: Intuitive canvas to place and arrange UI elements with snapping.
*   **Layer Management**: Create, lock, hide, and **reorder** layers via drag-and-drop to manage complex composite UIs.
*   **Image Uploads**: Upload images to preview them on the canvas and generate correct file-reference code.
*   **Multi-Provider AI**: Generate code using **Gemini (Flash/Pro)**, **DeepSeek V3/R1**, **Claude 3.5**, **GPT-4o**, or local models (Ollama).
*   **Live Properties**: Real-time editing of dimensions, colors, borders, shadows, and logic.

---

## 🖥️ Supported Hardware & Manufacturers

LVGL Studio AI includes preset resolutions for a wide range of popular embedded displays and development boards.

### M5Stack
*   **Core / Core2 / Basic** (320x240)
*   **M5Paper** (960x540)
*   **Cardputer / StickC Plus** (240x135)
*   **M5Dial** (240x240 Round)

### LilyGo
*   **T-Display S3** (320x170)
*   **T-Deck** (320x240)
*   **T-HMI** (320x240)

### Sunton (Makerfabs/Espressif)
*   **ESP32-S3 4.3"** (800x480)
*   **ESP32-S3 5.0"** (800x480)
*   **ESP32-S3 7.0"** (800x480)

### Elecrow
*   **CrowPanel 5.0"** (800x480)
*   **CrowPanel 7.0"** (800x480)

### Riverdi
*   **5.0" STM32 Embedded** (800x480)
*   **7.0" STM32 Embedded** (1024x600)
*   **10.1" STM32 Embedded** (1280x800)

### Waveshare
*   **3.5" IPS LCD** (480x320)
*   **4.3" / 5.0" / 7.0" HDMI** (800x480 - 1024x600)
*   **1.28" Round Touch** (240x240)

### Adafruit
*   **PyPortal / Titano**
*   **TFT FeatherWings** (2.4", 3.5")
*   **1.28" Round IPS**

---

## 🚀 Running Locally

To run the application locally, you need **Node.js** installed.

### Steps

1.  **Clone the repository**.
    ```bash
    git clone https://github.com/yourusername/lvgl-studio-ai.git
    cd lvgl-studio-ai
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173`.

### Environment Variables
To use Gemini API, create a `.env` file in the root directory:
```
API_KEY=your_google_gemini_api_key
```

---

## 📐 Workflow Architecture

```mermaid
graph TD
    User([User Interaction]) -->|Drag & Drop / Keyboard| State[App State Store]
    User -->|Undo / Redo| History[History Stack]
    History --> State
    State -->|Auto-Save| LocalStorage[Local Storage]
    State -->|Export JSON| File[Project File .json]
    State -->|Context Data| AIService{AI Service}
    AIService -->|Cloud| Gemini[Google Gemini]
    AIService -->|Cloud| DeepSeek[DeepSeek V3/R1]
    AIService -->|Cloud| Claude[Anthropic Claude]
    AIService -->|Cloud| OpenAI[OpenAI GPT-4]
    AIService -->|Local| Ollama[Local LLM / Ollama]
    Gemini --> Generator[Code Generator]
    DeepSeek --> Generator
    Claude --> Generator
    OpenAI --> Generator
    Ollama --> Generator
    Generator -->|Export| CFile[ui.c / LVGL C]
    Generator -->|Export| PyFile[ui.py / MicroPython]
```

---

## 🛠️ User Guide

### 1. Saving & Loading 💾
*   **Auto-Save**: The app automatically saves your workspace state (screens, widgets, settings, AI config) to your browser's Local Storage.
*   **Save Project**: Click the **Save** (Download) icon in the header to download a `.json` file containing your entire project.
*   **Open Project**: Click the **Open** (Folder) icon to upload a previously saved `.json` file. This will overwrite your current workspace.

### 2. Multi-Screen & Navigation 🧭
1.  **Add Screen**: Go to the **Screens** tab in the left sidebar and click `+`.
2.  **Switching**: Click a screen name in the list to edit it.
3.  **Linking**: Select a Button or Icon, go to **Properties > Events**, add an event, set Action to `NAVIGATE`, and select the target screen.

### 3. Event Logic ⚡
Widgets support a robust event system. In the **Properties Panel**:
1.  Click **Add Event**.
2.  Select Trigger (e.g., `CLICKED`, `VALUE_CHANGED`).
3.  Select Action:
    *   **NAVIGATE**: Switches screens using `lv_scr_load_anim`.
    *   **CUSTOM CODE**: Injects raw C or Python code (e.g., `printf("Hello");` or `led.on()`).
4.  Widgets with events display a small yellow "Zap" badge on the canvas.

### 4. AI Widget Generator 🧠
1.  In the **Widgets** sidebar, look for the "AI Generator" input at the top.
2.  Type a description like *"A large red stop button with round corners"* or *"Blue WiFi icon"*.
3.  Press Enter. The AI will construct the widget JSON and add it to your canvas automatically.

### 5. Image Handling 🖼️
1.  Add an **Image Widget**.
2.  In the Properties Panel, click **Upload Image**.
3.  The image is Base64 encoded for the browser preview.
4.  The generated code will reference the filename (e.g., `lv_img_set_src(ui_img, "S:my_image.png")`).

### 6. AI Configuration ⚙️
Click the **Settings Icon** in the top header to configure your AI provider.
*   **Google Gemini**: Default. Supports **Google AI Studio** account integration (via "Connect Google Account") to access **Gemini 3.0 Pro** and **Thinking** models with higher limits.
*   **DeepSeek**: Enter your API key. Supports **DeepSeek V3** and **R1** (Reasoner).
*   **Anthropic Claude**: Enter your API key to generate high-quality code using **Claude 3.5 Sonnet** or **Opus**.
*   **OpenAI**: Requires `sk-...` key.
*   **Local LLM**: Connect to local endpoints (e.g., Ollama at `http://localhost:11434/v1`).

### 7. AI Code Generation 🤖
1.  Design your UI.
2.  Select your **Target Device** (e.g., M5Stack Core2) in Global Settings for optimized resolution.
3.  Click **Generate Code**.
4.  The AI receives a structured JSON payload describing all screens, widgets, themes, and events.
5.  It produces fully functional C (LVGL v8/v9) or MicroPython code.

---

## 📦 Supported Widgets

| Widget | Icon | Configurable Properties |
| :--- | :---: | :--- |
| **Button** | ⏹️ | Text, Color, Radius, Gradient sheen |
| **Label** | 🔤 | Text content, Font size, Text Color |
| **Slider** | 🎚️ | Value, Min/Max, Colors. **Auto-vertical orientation** if H > W. |
| **Switch** | 🔛 | Checked state, Pill styling, Animation timing |
| **Checkbox** | ☑️ | Label text, Checked state |
| **Arc** | ⭕ | Value, Range, Track/Indicator colors, Thickness |
| **Container** | 📦 | Background (Solid/Transparent), Borders, Radius |
| **Text Area** | 📝 | Placeholder, Text, Cursor blink simulation |
| **Chart** | 📊 | Line vs Bar mode, Data points simulation, Grid lines |
| **Image** | 🖼️ | Source path/upload, Placeholder visualization |
| **Icon** | ⭐ | Built-in LVGL Symbols (Home, Wifi, Battery, etc.) |
| **Bar** | 📊 | Similar to slider but for display only |
| **Roller** | 📜 | Scrollable option selector |
| **Dropdown** | 🔽 | Collapsible list |
| **LED** | 💡 | Circular indicator with gloss effect |
| **Keyboard** | ⌨️ | Visual keyboard placeholder |

---

## 📝 License

This project is open-source under the MIT License. Generated code belongs to the user.
