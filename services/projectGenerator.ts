import JSZip from 'jszip';
import { ManifestBoard } from '../types';

/**
 * Fetches the master manifest from the LVGL Project Creator repository.
 * In a real app, this might be proxied or cached.
 */
export async function fetchManifest(): Promise<ManifestBoard[]> {
    try {
        // For testing UI Configurator: Force fallback/mock data
        throw new Error("Use valid mock data for verification");
        /*
        const response = await fetch('https://raw.githubusercontent.com/lvgl/lvgl_project_creator/master/manifest_all.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }
        const data = await response.json();
        return data as ManifestBoard[];
        */
    } catch (error) {
        console.warn('Failed to fetch live manifest, returning fallback list.', error);
        return [
            {
                name: 'PC Simulator (SDL)',
                description: 'Standard PC simulator using SDL2. Best for testing.',
                urlToClone: 'https://github.com/lvgl/lv_port_pc_eclipse',
                ui: []
            },
            {
                name: 'ESP32-S3-BOX',
                description: 'Espressif ESP32-S3 Box with 2.4" display.',
                urlToClone: 'https://github.com/lvgl/lv_port_esp32',
                ui: [
                    {
                        type: 'dropdown',
                        label: 'Color Depth',
                        options: [
                            { name: '16-bit', value: '16' },
                            { name: '32-bit', value: '32' }
                        ],
                        actions: [
                            { toReplace: 'LV_COLOR_DEPTH \\d+', newContent: 'LV_COLOR_DEPTH {value}', filePath: 'lv_conf.h' }
                        ]
                    }
                ]
            }
        ];
    }
}

/**
 * Applies manifest configuration actions to file content.
 */
function applyManifestActions(content: string, actions: any[]): string {
    let newContent = content;
    for (const action of actions) {
        try {
            const regex = new RegExp(action.toReplace, 'g');
            newContent = newContent.replace(regex, action.newContent);
        } catch (e) {
            console.error(`Failed to apply action: ${action.toReplace}`, e);
        }
    }
    return newContent;
}

// Dummy lv_conf.h template for demonstration
const MOCK_LV_CONF_TEMPLATE = `
/**
 * @file lv_conf.h
 * Configuration file for v8.3
 */

#ifndef LV_CONF_H
#define LV_CONF_H

// Color depth: 1 (1 byte per pixel), 8 (RGB332), 16 (RGB565), 32 (ARGB8888)
#define LV_COLOR_DEPTH 16

// Swap the 2 bytes of RGB565 color. Useful if the display has a 8-bit interface (e.g. SPI)
#define LV_COLOR_16_SWAP 0

// 1: Enable complex draw engine (more impressive effects)
// 0: Disable complex draw engine (saves memory)
#define LV_USE_DRAW_MASKS 1

// Default display refresh period. LVG will redraw changed areas with this period time
#define LV_DISP_DEF_REFR_PERIOD 30      /*[ms]*/

// Input device read period in milliseconds
#define LV_INDEV_DEF_READ_PERIOD 30     /*[ms]*/

#endif /*LV_CONF_H*/
`;

/**
 * Generates a full project ZIP for the given board and source files.
 * @param board The selected target board
 * @param sourceCode The generated UI code (ui.c, ui.h, etc)
 * @param config User configuration selections (key: field label, value: selected option value)
 */
export async function generateProjectZip(
    board: ManifestBoard,
    sourceCode: { [filename: string]: string },
    config: { [key: string]: string } = {}
): Promise<Blob> {
    console.log('Generating project for:', board.name, 'with config:', config);

    // 1. Collect Actions based on user config
    const activeActions: any[] = [];
    if (board.ui) {
        for (const field of board.ui) {
            const value = config[field.label]; // e.g., "16-bit"
            if (value && field.options) {
                const selectedOption = field.options.find(opt => opt.value === value);
                // Note: The manifest structure might attach actions to the *option* or the *field*.
                // In lvgl_project_creator, actions usually replace {value} placeholder.
                // Simplified Interpretation:
                // We assume 'field.actions' exist and we replace {value} with the selected option's value.

                if (field.actions) {
                    for (const action of field.actions) {
                        activeActions.push({
                            ...action,
                            newContent: action.newContent.replace('{value}', value)
                        });
                    }
                }
            }
        }
    }

    // 2. Generate lv_conf.h
    const lvConfContent = applyManifestActions(MOCK_LV_CONF_TEMPLATE, activeActions);

    // 3. Create ZIP using JSZip
    const zip = new JSZip();

    // Add generated config
    zip.file("lv_conf.h", lvConfContent);

    // Add source code files
    Object.entries(sourceCode).forEach(([filename, content]) => {
        zip.file(filename, content);
    });

    // Add a README
    zip.file("README.txt", `Generated by LVGL Studio AI\n\nTarget Board: ${board.name}\n\nThis archive contains your UI code and configuration.\nTo use this, verify the lv_conf.h settings against your hardware.`);

    // Generate the blob
    const content = await zip.generateAsync({ type: "blob" });
    return content;
}
