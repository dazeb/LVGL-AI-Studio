
import { GoogleGenAI } from "@google/genai";
import { Widget, CanvasSettings, CodeLanguage, AISettings, Screen, WidgetType } from '../types';
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

      Widget Styling & Parts Logic:
      - **Geometry**: Accurately apply x, y, width, height.
      - **Fonts**: Map 'style.fontSize' to the closest standard LVGL font (e.g., 14 -> \`lv_font_montserrat_14\`, 24 -> \`lv_font_montserrat_24\`).
      - **Base Styles**: Apply 'style.backgroundColor', 'style.borderRadius', 'style.borderWidth', 'style.borderColor' (as border color), 'style.textColor'.
      
      - **Advanced Part Styling**:
        1. **Sliders, Bars, Switches**: 
           - The 'style.borderColor' in JSON usually represents the **Active/Indicator** color.
           - Apply 'style.backgroundColor' to \`LV_PART_MAIN\` (the background track).
           - Apply 'style.borderColor' to \`LV_PART_INDICATOR\` (the filled area).
           - For Sliders/Switches, style \`LV_PART_KNOB\` to be white or the indicator color, with a radius to make it round.
        2. **Arcs**:
           - Apply 'style.backgroundColor' to \`LV_PART_MAIN\` (background arc).
           - Apply 'style.borderColor' to \`LV_PART_INDICATOR\` (foreground arc).
           - Remove the knob (\`lv_obj_remove_style(..., NULL, LV_PART_KNOB)\`) unless it's interactive.
        3. **Shadows**:
           - If a Container or Button has a background color and no border, apply a subtle shadow (\`lv_obj_set_style_shadow_width\`, \`lv_obj_set_style_shadow_opa\`) to add depth (e.g., width 20, opacity 30).
      
      - **Specific Widget Logic**:
        - **lv_icon**: Create a Label and set text to the symbol name (e.g., \`LV_SYMBOL_HOME\`). Apply text color.
        - **lv_img**: Use \`lv_img_set_src(img_obj, "S:path/to/" + src_filename)\`.
        - **lv_btn**: 
           - If \`contentMode\` is 'icon', create a child Label with the symbol.
           - If \`contentMode\` is 'text', create a child Label with the text.
           - Center the label on the button.
    `;
};

const constructWidgetPrompt = (description: string) => {
    return `
    You are an expert UI generator.
    Task: Create a single LVGL widget configuration JSON based on this description: "${description}".
    
    Return ONLY a raw JSON object (no markdown, no backticks) matching this Typescript interface:
    
    interface WidgetPartial {
      type: string; // One of: lv_btn, lv_label, lv_slider, lv_switch, lv_checkbox, lv_arc, lv_obj, lv_textarea, lv_chart, lv_img, lv_icon, lv_bar, lv_roller, lv_dropdown, lv_led, lv_keyboard
      name: string; // A short descriptive name (e.g. "RedStopBtn")
      width: number;
      height: number;
      text?: string; // For buttons, labels, checkboxes, textareas
      value?: number; // For sliders, arcs, bars (0-100 usually)
      checked?: boolean; // For switches, checkboxes
      symbol?: string; // For icons or icon-buttons (e.g. LV_SYMBOL_HOME)
      style: {
        backgroundColor?: string; // Hex code
        textColor?: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number;
        fontSize?: number;
      }
    }

    Rules:
    1. Infer the best 'type' based on the description.
    2. Suggest reasonable width/height dimensions.
    3. If color is described, set backgroundColor/textColor/borderColor in hex (e.g. #FF0000).
    4. If 'round' is mentioned for a button, set borderRadius to high value (e.g. 20 or 99).
    5. If it's a specific icon (like 'settings' or 'wifi'), set the 'symbol' property to the closest 'LV_SYMBOL_...' string.
    `;
};

// -- Gemini Implementation --
const generateGemini = async (prompt: string, settings: AISettings): Promise<string> => {
    // Guidelines: Use process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: settings.model || 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text?.trim() || "// No response generated.";
};

// -- OpenAI / Compatible Implementation --
// Handles OpenAI, DeepSeek, and Local LLMs (Ollama)
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
            { role: "system", content: "You are an expert LVGL code generator. Output only code/JSON." },
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

// -- Anthropic Implementation --
const generateAnthropic = async (prompt: string, settings: AISettings): Promise<string> => {
    const key = settings.apiKey;
    const url = settings.baseUrl || 'https://api.anthropic.com/v1';
    
    const headers: Record<string, string> = {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        // Note: 'dangerously-allow-browser': 'true' is implied by user knowing about CORS or using a proxy
    };

    const body = {
        model: settings.model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }]
    };

    const response = await fetch(`${url}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic Request Failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) throw new Error("Invalid response format from Anthropic.");
    
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
    } else if (aiSettings.provider === 'anthropic') {
        return await generateAnthropic(prompt, aiSettings);
    } else {
        // OpenAI, DeepSeek, Custom (Ollama)
        return await generateOpenAICompatible(prompt, aiSettings);
    }

  } catch (error) {
    console.error("Error generating code:", error);
    return `// Error generating code: ${(error as Error).message}\n// Please check your Settings (API Key/Provider).`;
  }
};

export const generateSingleWidget = async (
    description: string,
    aiSettings: AISettings
): Promise<Partial<Widget>> => {
    try {
        const prompt = constructWidgetPrompt(description);
        let jsonStr = '';

        if (aiSettings.provider === 'gemini') {
            jsonStr = await generateGemini(prompt, aiSettings);
        } else if (aiSettings.provider === 'anthropic') {
            jsonStr = await generateAnthropic(prompt, aiSettings);
        } else {
            jsonStr = await generateOpenAICompatible(prompt, aiSettings);
        }

        // Clean potentially leftover markdown
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const widgetData = JSON.parse(jsonStr);
        return widgetData;
    } catch (error) {
        console.error("Error creating widget from AI:", error);
        throw error;
    }
};
