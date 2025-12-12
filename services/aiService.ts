
import { GoogleGenAI } from "@google/genai";
import { Widget, CanvasSettings, CodeLanguage, AISettings, Screen } from '../types';
import { DEVICE_PRESETS } from '../constants';

const constructPrompt = (screens: Screen[], settings: CanvasSettings, language: CodeLanguage) => {
    // We send only necessary data to save tokens
    const projectData = {
        project: settings.projectName,
        width: settings.width,
        height: settings.height,
        theme: settings.theme,
        screens: screens.map(s => ({
            id: s.id,
            name: s.name,
            backgroundColor: s.backgroundColor,
            layers: s.layers.filter(l => l.visible).map(l => l.id), // Only visible layers
            widgets: s.widgets
                .filter(w => {
                    const layer = s.layers.find(l => l.id === w.layerId);
                    return layer && layer.visible;
                })
                .map(w => {
                    // Create a copy to remove heavy data
                    const { imageData, ...rest } = w;
                    return {
                        ...rest,
                        events: w.events // Include the events array
                    };
                })
        }))
    };
    
    // Find device name if set
    const selectedDevice = DEVICE_PRESETS.find(d => d.id === settings.targetDevice);
    const deviceName = selectedDevice ? `${selectedDevice.manufacturer} ${selectedDevice.name}` : 'Generic Custom Display';

    const projectJson = JSON.stringify(projectData, null, 2);

    return `
      You are an embedded GUI expert specializing in LVGL (Light and Versatile Graphics Library).
      
      Task: Generate production-ready ${language === 'c' ? 'C (LVGL v8/v9)' : 'MicroPython'} code for a multi-screen UI project.
      
      Target Hardware: ${deviceName}
      Display Dimensions: ${settings.width}x${settings.height}
      
      Project Data (JSON):
      ${projectJson}
      
      General Requirements:
      1. Output ONLY valid code. No markdown backticks (unless requested), no explanations.
      2. Support LVGL v8/v9 API standards.
      3. Global dimensions: ${settings.width}x${settings.height}.
      
      Specific ${language === 'c' ? 'C' : 'MicroPython'} Requirements:
      
      ${language === 'c' ? `
      - Include "lvgl/lvgl.h".
      - Declare global variables for all screen objects (e.g., \`lv_obj_t * ui_Screen1;\`) and widget objects so they are accessible.
      - Create a function \`void ui_init(void)\` that calls setup functions for all screens.
      - Create separate setup functions for each screen (e.g., \`void ui_Screen1_screen_init(void)\`).
      - In each screen setup:
        - Create the screen object.
        - Create all widgets.
      - Events:
        - For each widget event, generate a callback function (e.g., \`void ui_event_Button1(lv_event_t * e)\`).
        - Attach it using \`lv_obj_add_event_cb(widget, ui_event_Button1, LV_EVENT_..., NULL);\`.
        - Inside the callback:
          - If action is 'NAVIGATE', use \`lv_scr_load_anim(target_screen_obj, LV_SCR_LOAD_ANIM_FADE_ON, 500, 0, false);\`.
          - If action is 'CUSTOM_CODE', insert the code snippet directly.
      ` : `
      - Import \`lvgl as lv\`.
      - Assume \`lv.init()\` and display driver setup are done externally.
      - Create a class or global dictionary to hold screen objects.
      - Create a function \`ui_init()\` to build all screens.
      - Events:
        - Define a callback function for each event.
        - Attach using \`widget.add_event_cb(callback, lv.EVENT...., None)\`.
        - If action is 'NAVIGATE', use \`lv.scr_load_anim(...)\`.
        - If action is 'CUSTOM_CODE', insert the code snippet.
      `}

      Widget Styling:
      - Accurately apply x, y, width, height.
      - Apply styles (radius, bg color, text color, border) using local styles or direct style modification functions (e.g., \`lv_obj_set_style_bg_color\`).
      - For 'lv_icon', create a Label and set text to the symbol name (e.g., \`LV_SYMBOL_HOME\`).
      - For 'lv_img' (Image Widgets):
        - The 'src' property contains the filename (e.g., "my_image.png").
        - Assume the image is a file.
        - In C: Use \`lv_img_set_src(img_obj, "S:path/to/" + src_filename)\` or refer to a declared image descriptor pointer if common (e.g. \`&ui_img_filename_png\`). Prefer the declared pointer variable style \`&ui_img_FILENAME_png\` for standard converted images.
        - In MicroPython: Use \`img.set_src("path/to/" + src_filename)\`.
    `;
};

// -- Gemini Implementation --
const generateGemini = async (prompt: string, settings: AISettings): Promise<string> => {
    const key = settings.apiKey || process.env.API_KEY;
    if (!key) throw new Error("Missing API Key for Gemini. Please set it in Settings or Environment.");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
        model: settings.model || 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text?.trim() || "// No response generated.";
};

// -- OpenAI / Compatible Implementation --
const generateOpenAICompatible = async (prompt: string, settings: AISettings): Promise<string> => {
    const key = settings.apiKey;
    const url = settings.baseUrl || 'https://api.openai.com/v1';
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (key) {
        headers['Authorization'] = `Bearer ${key}`;
    }

    const body = {
        model: settings.model,
        messages: [
            { role: "system", content: "You are an expert LVGL code generator. Output only code." },
            { role: "user", content: prompt }
        ],
        temperature: 0.2
    };

    const response = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI Request Failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("Invalid response format from AI provider.");
    
    const cleanContent = content.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
    return cleanContent;
};

export const generateLVGLCode = async (
  screens: Screen[],
  settings: CanvasSettings,
  language: CodeLanguage,
  aiSettings: AISettings
): Promise<string> => {
  try {
    const prompt = constructPrompt(screens, settings, language);
    
    if (aiSettings.provider === 'gemini') {
        return await generateGemini(prompt, aiSettings);
    } else {
        return await generateOpenAICompatible(prompt, aiSettings);
    }

  } catch (error) {
    console.error("Error generating code:", error);
    return `// Error generating code: ${(error as Error).message}\n// Please check your Settings (API Key/Provider).`;
  }
};
