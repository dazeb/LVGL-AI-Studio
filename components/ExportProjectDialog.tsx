
import React, { useState, useEffect } from 'react';
import { X, Download, Server, Loader2, FileArchive, Settings as SettingsIcon } from 'lucide-react';
import { ManifestBoard } from '../types';
import { fetchManifest, generateProjectZip } from '../services/projectGenerator';

interface ExportProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // We'll pass the current code inputs eventually, currently unused in mock
    sourceCode?: { [filename: string]: string };
}

const ExportProjectDialog: React.FC<ExportProjectDialogProps> = ({ isOpen, onClose, sourceCode }) => {
    const [boards, setBoards] = useState<ManifestBoard[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<ManifestBoard | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    // Config state: key=label, value=selected option
    const [config, setConfig] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchManifest()
                .then(data => {
                    setBoards(data);
                    if (data.length > 0) handleSelectBoard(data[0]);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleSelectBoard = (board: ManifestBoard) => {
        setSelectedBoard(board);
        // Initialize default config
        const initialConfig: { [key: string]: string } = {};
        if (board.ui) {
            board.ui.forEach(field => {
                if (field.options && field.options.length > 0) {
                    initialConfig[field.label] = field.options[0].value;
                }
            });
        }
        setConfig(initialConfig);
    };

    const handleExport = async () => {
        if (!selectedBoard) return;
        setGenerating(true);
        try {
            // In real implementation, we'd pass the actual generated C code here
            const zipBlob = await generateProjectZip(selectedBoard, sourceCode || {}, config);

            // Trigger download
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lvgl_project_${selectedBoard.name.replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onClose();
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to allow project generation. See console.");
        } finally {
            setGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col border border-slate-700 max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Server size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Export Project</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-400">
                            <Loader2 className="animate-spin w-8 h-8" />
                            <p>Fetching Board Manifest...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Board Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Board / Platform</label>
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-slate-700 rounded-lg p-1 bg-slate-950">
                                    {boards.map(board => (
                                        <button
                                            key={board.name}
                                            onClick={() => handleSelectBoard(board)}
                                            className={`flex items-start gap-3 p-3 rounded-md text-left transition-colors border ${selectedBoard?.name === board.name ? 'bg-indigo-900/30 border-indigo-500/50' : 'border-transparent hover:bg-slate-800'}`}
                                        >
                                            <div className="mt-1">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedBoard?.name === board.name ? 'border-indigo-400' : 'border-slate-600'}`}>
                                                    {selectedBoard?.name === board.name && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200">{board.name}</div>
                                                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{board.shortDescription || board.description}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-70 truncate">{board.urlToClone}</div>
                                            </div>
                                        </button>
                                    ))}
                                    {boards.length === 0 && <div className="p-4 text-center text-slate-500">No boards found in manifest.</div>}
                                </div>
                            </div>

                            {/* Dynamic Configuration */}
                            {selectedBoard && (
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><SettingsIcon size={12} /> Configuration</h3>

                                    <div className="space-y-4">
                                        {/* Static Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Project Name</label>
                                                <input type="text" value={selectedBoard.name.replace(/\s+/g, '_')} disabled className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-400 font-mono opacity-50 cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">Build System</label>
                                                <div className="text-xs text-slate-300 py-1.5 px-2 bg-slate-900 rounded border border-slate-600">CMake / PlatformIO</div>
                                            </div>
                                        </div>

                                        {/* Dynamic Manifest Fields */}
                                        {selectedBoard.ui && selectedBoard.ui.map((field, idx) => (
                                            <div key={idx}>
                                                <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                                                {field.type === 'dropdown' ? (
                                                    <select
                                                        value={config[field.label] || ''}
                                                        onChange={(e) => setConfig({ ...config, [field.label]: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                    >
                                                        {field.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input type="text" disabled placeholder="Text input not supported yet" className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-[10px] text-slate-500 mt-4 flex items-center gap-1 border-t border-slate-700 pt-2">
                                        <FileArchive size={10} /> This will download a project configured for this board.
                                    </p>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-900 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={handleExport}
                        disabled={!selectedBoard || loading || generating}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {generating ? 'Generating...' : 'Download Project'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExportProjectDialog;
