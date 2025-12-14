
import React, { useState, useEffect } from 'react';
import { X, Folder, FileCode, ChevronRight, ChevronDown, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ReferenceViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FileEntry {
    Name: string;
    DirectoryName: string;
    FullName: string; // We'll derive relative path from this
    RelativePath?: string;
}

const ReferenceViewer: React.FC<ReferenceViewerProps> = ({ isOpen, onClose }) => {
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingContent, setLoadingContent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Group files by directory
    const fileTree = React.useMemo(() => {
        const tree: Record<string, FileEntry[]> = {};
        files.forEach(f => {
            // Extract category (folder name)
            // DirectoryName is full path, we need to extract 'widgets/btn' etc.
            // But since we only copied 'widgets', let's just group by immediate parent folder
            const parts = f.DirectoryName.split('\\'); // Windows path
            const parent = parts[parts.length - 1]; // e.g. 'btn'

            if (!tree[parent]) tree[parent] = [];
            tree[parent].push(f);
        });
        return tree;
    }, [files]);

    useEffect(() => {
        if (isOpen && files.length === 0) {
            loadIndex();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedFile) {
            loadFileContent(selectedFile);
        }
    }, [selectedFile]);

    const loadIndex = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/examples/index.json');
            if (!response.ok) throw new Error('Failed to load examples index');

            const data: any[] = await response.json();
            // Need to sanitize paths to construct a fetchable URL
            // Values in index.json are full paths like D:\...\public\examples\widgets\btn\file.c
            // We need to convert to /examples/widgets/btn/file.c

            const processed = data.map(f => ({
                ...f,
                // Very hacky path adjustment since we don't control the PowerShell output format perfectly
                RelativePath: f.FullName.split('public\\')[1]?.replace(/\\/g, '/') || ''
            })).filter(f => f.RelativePath); // Filter out failures

            setFiles(processed);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const loadFileContent = async (file: FileEntry) => {
        setLoadingContent(true);
        setFileContent('');
        try {
            const res = await fetch(`/${file.RelativePath}`);
            if (!res.ok) throw new Error('Failed to load file');
            const text = await res.text();
            setFileContent(text);
        } catch (e) {
            setFileContent('Error loading content');
        } finally {
            setLoadingContent(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 w-[90vw] h-[85vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/10 p-2 rounded-lg">
                            <FileCode className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-200">LVGL Reference</h2>
                            <p className="text-xs text-slate-500">Official Examples & Demos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Sidebar */}
                    <div className="w-64 border-r border-slate-800 bg-slate-900/50 overflow-y-auto p-2">
                        {loading && <div className="text-center p-4 text-slate-500 text-sm">Loading index...</div>}

                        {Object.entries(fileTree).sort().map(([folder, items]) => (
                            <div key={folder} className="mb-2">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Folder size={12} /> {folder}
                                </div>
                                <div className="ml-2 pl-2 border-l border-slate-800 space-y-0.5">
                                    {items.map(file => (
                                        <button
                                            key={file.Name}
                                            onClick={() => setSelectedFile(file)}
                                            className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 truncate transition-colors ${selectedFile?.Name === file.Name ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                        >
                                            <FileCode size={14} className="shrink-0" />
                                            <span className="truncate">{file.Name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {files.length === 0 && !loading && (
                            <div className="p-4 text-center">
                                <p className="text-red-400 text-sm mb-2">{error || "No examples found."}</p>
                                <button onClick={loadIndex} className="text-xs flex items-center gap-1 mx-auto text-indigo-400 hover:text-indigo-300"><RefreshCw size={12} /> Retry</button>
                            </div>
                        )}
                    </div>

                    {/* Code View */}
                    <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col">
                        {selectedFile ? (
                            <>
                                <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526]">
                                    <span className="text-sm font-mono text-slate-300">{selectedFile.Name}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(fileContent)}
                                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <Copy size={12} /> Copy Code
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                    {loadingContent ? (
                                        <div className="text-slate-500 font-mono text-sm">Loading content...</div>
                                    ) : (
                                        <pre className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {fileContent}
                                        </pre>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-4">
                                <FileCode size={48} className="opacity-20" />
                                <p>Select an example file to view its source code.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReferenceViewer;
