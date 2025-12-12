
import { GoogleGenAI } from "@google/genai";
import { Widget, CanvasSettings, CodeLanguage, AISettings } from '../types';

const constructPrompt = (widgets: Widget[], settings: CanvasSettings, language: CodeLanguage) => {
    const widgetJson = JSON.stringify(widgets, null, 2);
    const settingsJson = JSON.stringify(settings, null, 2);

    return `
      You are an embedded GUI expert specializing in LVGL (Light and Versatile Graphics Library).
      
      Task: Generate production-ready ${language === 'c' ? 'C (LVGL v8/v9)' : 'MicroPython'} code for the following UI design.
      
      Canvas Settings:
      ${settingsJson}
      
      Widgets (JSON format):
      ${widgetJson}
      
      Requirements:
      1. If C: Include necessary headers ('lvgl/lvgl.h'), create a function 'void create_ui(void)', and handle global styles/declarations if needed to make it standalone-ish or easy to integrate.
      2. If MicroPython: Import 'lvgl as lv', ensure 'lv.init()' is assumed (or comment about it), and create a class or setup function.
      3. Style: Accurately reflect the positions (x, y), sizes (width, height), and simple styles (color, radius) provided in the JSON.
      4. Events: Add empty event handler skeletons (e.g., specific callbacks for Buttons).
      5. Widget Type 'lv_icon': This represents an LVGL Label that displays a symbol. Set its text to the 'symbol' property (e.g., LV_SYMBOL_HOME).
      6. Output ONLY the code, no markdown backticks, no explanatory text outside comments.
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
    
    // For some local LLMs, key might not be needed, but usually a dummy is required.
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
    
    // Cleanup markdown if present (some models love adding ```c ... ```)
    const cleanContent = content.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
    return cleanContent;
};

export const generateLVGLCode = async (
  widgets: Widget[],
  settings: CanvasSettings,
  language: CodeLanguage,
  aiSettings: AISettings
): Promise<string> => {
  try {
    const prompt = constructPrompt(widgets, settings, language);
    
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
