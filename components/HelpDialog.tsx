
import React from 'react';
import { X, Keyboard, Zap, MousePointerClick, Layers, Code, Command } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        {icon} {title}
      </h3>
      <div className="text-sm text-slate-300 space-y-2">
        {children}
      </div>
    </div>
  );

  const HotkeyRow = ({ keys, action }: { keys: string[], action: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
      <span className="text-slate-400">{action}</span>
      <div className="flex gap-1">
        {keys.map((k, i) => (
          <span key={i} className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs font-mono text-white min-w-[20px] text-center shadow-sm">
            {k}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Command className="text-indigo-500" size={28} /> Help & Documentation
             </h2>
             <p className="text-slate-400 text-sm mt-1">
               Master LVGL Studio AI in minutes.
             </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0d1117] grid grid-cols-1 md:grid-cols-2 gap-8">
           
           <div>
              <Section title="Workflow" icon={<MousePointerClick size={16} className="text-blue-400" />}>
                 <p>1. <strong>Drag & Drop</strong> widgets from the left palette onto the canvas.</p>
                 <p>2. <strong>Select</strong> a widget to edit its properties in the right panel.</p>
                 <p>3. <strong>Manage Screens</strong> using the tab on the left. You can link buttons to screens via Events.</p>
                 <p>4. <strong>Generate Code</strong> to get production-ready C or MicroPython code instantly.</p>
              </Section>

              <Section title="Keyboard Shortcuts" icon={<Keyboard size={16} className="text-green-400" />}>
                 <HotkeyRow keys={['Del', 'Backspace']} action="Delete Widget" />
                 <HotkeyRow keys={['Ctrl', 'Z']} action="Undo" />
                 <HotkeyRow keys={['Ctrl', 'Y']} action="Redo" />
                 <HotkeyRow keys={['Shift', 'Click']} action="Multi-select Widgets" />
                 <HotkeyRow keys={['Shift', 'Drag']} action="Resize (Maintain Aspect)" />
                 <HotkeyRow keys={['Drag']} action="Move Widget" />
              </Section>

              <Section title="Layer Management" icon={<Layers size={16} className="text-amber-400" />}>
                 <p>
                    Layers act like Z-index groups. 
                    Widgets at the bottom of the list are "on top".
                 </p>
                 <ul className="list-disc list-inside mt-2 text-slate-400 space-y-1">
                    <li><span className="text-white">Lock</span> layers to prevent accidental edits.</li>
                    <li><span className="text-white">Hide</span> layers to focus on other elements (hidden layers are ignored by AI).</li>
                    <li><span className="text-white">Drag</span> layers in the list to reorder them.</li>
                 </ul>
              </Section>
           </div>

           <div>
              <Section title="AI Code Generation" icon={<Code size={16} className="text-purple-400" />}>
                 <p>
                    The AI engine converts your visual design into code. 
                    Ensure you set your <strong>API Key</strong> in settings for your preferred provider.
                 </p>
                 <div className="bg-slate-800/50 p-3 rounded border border-slate-700 mt-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Tips for best results:</h4>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                       <li>Name your widgets and screens descriptively.</li>
                       <li>Use the <strong>Target Device</strong> setting to match resolution.</li>
                       <li>Images are referenced by filename. Ensure files exist on your embedded FS.</li>
                       <li>Custom code events are injected raw—check your syntax!</li>
                    </ul>
                 </div>
              </Section>

              <Section title="Event System" icon={<Zap size={16} className="text-yellow-400" />}>
                 <p>
                    Add interactivity without writing code.
                 </p>
                 <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                       <span className="text-blue-400 font-bold">NAVIGATE</span>
                       <p className="mt-1 text-slate-400">Switch between screens with animation.</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                       <span className="text-green-400 font-bold">CUSTOM CODE</span>
                       <p className="mt-1 text-slate-400">Run C/Python logic (e.g. toggle LED).</p>
                    </div>
                 </div>
              </Section>
           </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-700 text-center text-xs text-slate-500">
           LVGL Studio AI v0.4.0 • Built for LVGL v8/v9
        </div>

      </div>
    </div>
  );
};

export default HelpDialog;
