
import React from 'react';
import { X, Keyboard, Zap, MousePointerClick, Layers, Code, Command, Sparkles, Magnet, Palette, Image as ImageIcon } from 'lucide-react';

interface HelpDialogProps {
   isOpen: boolean;
   onClose: () => void;
}

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
   <div className="mb-6 bg-slate-800/40 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
         {icon} {title}
      </h3>
      <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
         {children}
      </div>
   </div>
);

const HotkeyRow = ({ keys, action }: { keys: string[], action: string }) => (
   <div className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-xs">{action}</span>
      <div className="flex gap-1">
         {keys.map((k, i) => (
            <span key={i} className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-mono text-white min-w-[20px] text-center shadow-sm">
               {k}
            </span>
         ))}
      </div>
   </div>
);

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
   if (!isOpen) return null;

   return (
      <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
         <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900 shrink-0">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <Command className="text-indigo-500" size={28} /> Help & Documentation
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                     Comprehensive guide to LVGL Studio AI features and workflow.
                  </p>
               </div>
               <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0d1117] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

               {/* COLUMN 1 */}
               <div className="space-y-6">
                  <Section title="Core Workflow" icon={<MousePointerClick size={16} className="text-blue-400" />}>
                     <p>1. <strong>Setup AI</strong>: Click <span className="inline-block bg-slate-700 px-1 rounded text-xs">Settings</span> to configure your API key (Gemini, DeepSeek, etc).</p>
                     <p>2. <strong>Design</strong>: Drag widgets from the palette or use the AI Generator.</p>
                     <p>3. <strong>Configure</strong>: Select a widget to edit properties (Color, Size, Events) in the right panel.</p>
                     <p>4. <strong>Manage Screens</strong>: Create multiple screens and link them via button events.</p>
                     <p>5. <strong>Generate</strong>: Click <span className="inline-block bg-blue-600 px-1 rounded text-xs text-white">Generate Code</span> to get C or MicroPython.</p>
                  </Section>

                  <Section title="AI Widget Generator" icon={<Sparkles size={16} className="text-purple-400" />}>
                     <p className="mb-2">
                        Instantly create styled widgets using natural language. Located at the top of the Widget Palette.
                     </p>
                     <div className="bg-slate-900 p-2 rounded border border-slate-800 text-xs font-mono text-slate-400">
                        "Round red stop button"<br />
                        "Blue progress bar at 75%"<br />
                        "Green wifi icon"
                     </div>
                     <p className="mt-2 text-xs text-slate-500">
                        The AI infers type, dimensions, colors, and icons automatically.
                     </p>
                  </Section>

                  <Section title="Keyboard Shortcuts" icon={<Keyboard size={16} className="text-green-400" />}>
                     <HotkeyRow keys={['Del', 'Bksp']} action="Delete Selected" />
                     <HotkeyRow keys={['Ctrl', 'Z']} action="Undo" />
                     <HotkeyRow keys={['Ctrl', 'Y']} action="Redo" />
                     <HotkeyRow keys={['Shift', 'Click']} action="Multi-select" />
                     <HotkeyRow keys={['Shift', 'Drag']} action="Resize (Lock Aspect)" />
                     <HotkeyRow keys={['Drag']} action="Move Widget" />
                     <HotkeyRow keys={['Alt', 'Scroll']} action="Zoom Canvas" />
                     <HotkeyRow keys={['Dbl Click']} action="Rename Layer" />
                  </Section>
               </div>

               {/* COLUMN 2 */}
               <div className="space-y-6">
                  <Section title="Smart Alignment" icon={<Magnet size={16} className="text-pink-400" />}>
                     <p>
                        <strong>Magnetic Snapping</strong> helps you create pixel-perfect layouts.
                     </p>
                     <ul className="list-disc list-inside mt-2 text-slate-400 space-y-1 text-xs">
                        <li>Widgets snap to the <strong>edges</strong> and <strong>centers</strong> of other widgets.</li>
                        <li><span className="text-pink-400">Magenta lines</span> appear to indicate alignment.</li>
                        <li>Snap threshold is 5px.</li>
                        <li>Hold <span className="bg-slate-700 px-1 rounded text-white">Shift</span> to disable snapping temporarily (or just drag freely).</li>
                     </ul>
                  </Section>

                  <Section title="Styling & Themes" icon={<Palette size={16} className="text-cyan-400" />}>
                     <p>
                        <strong>Global Themes</strong>: Apply a consistent look (colors, radius) to the entire project via Properties Panel.
                     </p>
                     <div className="mt-3 pt-3 border-t border-slate-700">
                        <strong>Style Presets</strong>:
                        <p className="text-xs text-slate-400 mt-1">
                           Save a widget's style (color, border, font) as a preset to reuse it later on other widgets. Look for the "Style Presets" dropdown.
                        </p>
                     </div>
                  </Section>

                  <Section title="Images & Assets" icon={<ImageIcon size={16} className="text-orange-400" />}>
                     <p>
                        <strong>Upload Image</strong>: You can upload local images to preview them on the canvas.
                     </p>
                     <div className="mt-2 bg-amber-900/20 border border-amber-900/50 p-2 rounded text-xs text-amber-200">
                        <strong>Note:</strong> The uploaded image data is for <em>preview only</em>.
                        The generated code uses the <strong>File Reference</strong> path (e.g. <code>"S:icon.png"</code>).
                        Make sure to upload the actual files to your embedded device's filesystem.
                     </div>
                  </Section>
               </div>

               {/* COLUMN 3 */}
               <div className="space-y-6">
                  <Section title="Layer Management" icon={<Layers size={16} className="text-amber-400" />}>
                     <p>
                        Manage Z-ordering and visibility in the Properties Panel.
                     </p>
                     <ul className="list-disc list-inside mt-2 text-slate-400 space-y-2 text-xs">
                        <li><strong>Drag & Drop</strong> layers to reorder (Top of list = Front).</li>
                        <li><strong>Lock</strong>: Prevents selecting/moving widgets in that layer.</li>
                        <li><strong>Hide</strong>: Makes layer invisible. <span className="text-red-300">Hidden layers are excluded from AI code generation</span> to save tokens.</li>
                     </ul>
                  </Section>

                  <Section title="Event System" icon={<Zap size={16} className="text-yellow-400" />}>
                     <p>
                        Define interactivity without coding manually.
                     </p>
                     <div className="mt-3 space-y-3">
                        <div>
                           <div className="text-xs font-bold text-white mb-1">Triggers</div>
                           <div className="text-xs text-slate-500">Clicked, Pressed, Released, Value Changed, Focused</div>
                        </div>
                        <div>
                           <div className="text-xs font-bold text-white mb-1">Actions</div>
                           <div className="grid grid-cols-1 gap-2 text-xs">
                              <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                 <span className="text-blue-400 font-bold">NAVIGATE</span>
                                 <span className="ml-2 text-slate-400">Switch screen with animation.</span>
                              </div>
                              <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                 <span className="text-green-400 font-bold">CUSTOM CODE</span>
                                 <span className="ml-2 text-slate-400">Execute C/Python snippet.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Section>

                  <Section title="Code Generation Tips" icon={<Code size={16} className="text-gray-400" />}>
                     <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5">
                        <li>Select the correct <strong>Target Device</strong> resolution in settings.</li>
                        <li>Use <strong>Descriptive Names</strong> for widgets so the AI generates readable variable names (e.g., `ui_BtnLogin`).</li>
                        <li><strong>Gemini 2.5 Flash</strong> is fast and free.</li>
                        <li><strong>DeepSeek / Claude</strong> may produce higher quality logic for complex events.</li>
                     </ul>
                  </Section>
               </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-700 text-center text-xs text-slate-500">
               LVGL Studio AI v0.5.0 • Built for LVGL v8/v9 • Open Source
            </div>

         </div>
      </div>
   );
};

export default HelpDialog;
