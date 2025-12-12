import { GoogleGenAI } from "@google/genai";
import { Widget, CanvasSettings, CodeLanguage } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLVGLCode = async (
  widgets: Widget[],
  settings: CanvasSettings,
  language: CodeLanguage
): Promise<string> => {
  try {
    const ai = getClient();
    
    const widgetJson = JSON.stringify(widgets, null, 2);
    const settingsJson = JSON.stringify(settings, null, 2);

    const prompt = `
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
      5. Output ONLY the code, no markdown backticks, no explanatory text outside comments.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating code:", error);
    return `// Error generating code: ${(error as Error).message}\n// Please check your API Key and try again.`;
  }
};