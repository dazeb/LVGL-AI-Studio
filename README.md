# LVGL Studio AI

**LVGL Studio AI** is a professional, browser-based visual interface designer for embedded systems. It allows developers to visually build GUIs for the **Light and Versatile Graphics Library (LVGL)** using a drag-and-drop interface and instantly generate production-ready code using Google's Gemini AI.

![LVGL Studio AI](https://raw.githubusercontent.com/google/generative-ai-docs/main/site/en/images/gemini_logo_lockup.png)

## 🚀 Key Features

*   **Visual Drag-and-Drop Editor**: Intuitive canvas to place and arrange UI elements.
*   **Multi-Language Support**: Generate code for **C (LVGL v8/v9)** or **MicroPython**.
*   **AI-Powered Generation**: Uses **Gemini 2.5 Flash** to convert visual layouts into clean, idiomatic, and functioning code.
*   **Real-time Customization**: detailed property inspector for styling (colors, borders, radius) and logic (values, ranges, checked states).
*   **Canvas Management**: Adjustable screen resolution, landscape/portrait toggling, and background styling.
*   **Instant Export**: Copy code to clipboard or download `.c` / `.py` files directly.

## 🛠️ How to Use

### 1. The Workspace
The interface is divided into three main sections:
*   **Left (Toolbox)**: Contains the palette of available LVGL widgets.
*   **Center (Canvas)**: Your active design area representing the embedded screen.
*   **Right (Properties)**: Context-aware panel for editing settings.

### 2. Building your Interface
*   **Add Widgets**: Click a widget in the Toolbox or drag it onto the Canvas.
*   **Positioning**: Drag widgets around the canvas. They snap to a 10px grid for alignment.
*   **Selection**: Click any widget to select it. Click the canvas background to deselect.

### 3. Customizing Properties
When a widget is selected, the right panel shows its specific properties:
*   **Layout**: X, Y, Width, Height.
*   **Content**: Text labels, placeholder text, image sources.
*   **Logic**: Slider/Arc values, min/max ranges, checkbox states, chart types.
*   **Style**: Background colors, text colors, border styles, radius, and font sizes.

### 4. Canvas Settings
Click on the empty background area to view **Canvas Settings** in the right panel:
*   **Resolution**: Set custom dimensions (e.g., 480x320).
*   **Orientation**: Quickly toggle between Portrait and Landscape modes.
*   **Screen Name**: Name your screen (useful for code generation).
*   **Background**: Set the global background color of the screen.

### 5. Generating Code
1.  Click the **Generate Code** button in the top header.
2.  Select your target language: **C** or **MicroPython**.
3.  The AI will analyze your layout and generate the corresponding code.
4.  **Review**: See the code in the syntax-highlighted viewer.
5.  **Export**: Click **Download** to save the file or **Copy** to paste it into your IDE.

---

## 🤖 How it Works

LVGL Studio AI bridges the gap between visual design and coding implementation using Generative AI.

1.  **State Serialization**: As you design, the application maintains a structured JSON representation of your interface, including every widget's type, position, style, and unique properties.
2.  **Prompt Engineering**: When you click "Generate", this JSON data is embedded into a specialized prompt sent to the **Gemini 2.5 Flash** model.
3.  **AI Processing**: Gemini acts as an expert embedded engineer. It interprets the JSON structure and writes the corresponding C or MicroPython code, handling boilerplates, imports, style definitions, and object creation.
4.  **Output**: The result is clean, human-readable code that you can drop directly into your LVGL project.

## 📦 Supported Widgets

| Widget | Description | Configurable Properties |
| :--- | :--- | :--- |
| **Button** | Clickable action element | Text, Dimensions, Colors, Radius |
| **Label** | Static text display | Text content, Font size, Color |
| **Slider** | Select a value from a range | Value, Min, Max, Knob colors |
| **Switch** | Binary toggle state | Checked state, Dimensions |
| **Checkbox** | Box with label | Text, Checked state |
| **Arc** | Circular progress/loader | Value, Range, Arc color |
| **Container** | Grouping element | Border, Background, Dimensions |
| **Text Area** | Input field | Placeholder, Text, Cursor simulation |
| **Chart** | Data visualization | Type (Bar/Line), Dimensions |
| **Image** | Graphic display | Source path (or LVGL symbol) |

## 🔧 Setup & Configuration

This project requires a Google Cloud API Key with access to the Gemini API.

1.  Ensure the application is running in an environment where `process.env.API_KEY` is available.
2.  The app uses `@google/genai` SDK to communicate with the model.

## 📝 License

This project is open-source. Generated code belongs to the user.
