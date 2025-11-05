/**
 * Settings panel component for MCP servers and LLM config
 */

'use client';

import {
    addMCPServer,
    deleteMCPServer,
    getToolsInfo,
    LLMConfig,
    MCPServerRequest,
    setLLMConfig,
    ToolsInfo,
    updateMCPServer,
} from '@/lib/api';
import { useStore } from '@/lib/store';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const mcpServers = useStore((state) => state.mcpServers);
    const llmConfig = useStore((state) => state.llmConfig);
    const loadMCPServers = useStore((state) => state.loadMCPServers);
    const loadLLMConfig = useStore((state) => state.loadLLMConfig);

    const [toolsInfo, setToolsInfo] = useState<ToolsInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'mcp' | 'llm' | 'tools'>('mcp');
    const [editingServer, setEditingServer] = useState<string | null>(null);
    const [serverForm, setServerForm] = useState<MCPServerRequest>({ name: '', url: '', api_key: '' });
    const [llmForm, setLlmForm] = useState<LLMConfig>({
        type: 'openai',
        model: '',
        api_key: '',
        base_url: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadMCPServers();
            loadLLMConfig();
            loadToolsInfo();
        }
    }, [isOpen, loadMCPServers, loadLLMConfig]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (llmConfig) {
            setLlmForm({
                type: (llmConfig.type as any) || 'openai',
                model: llmConfig.model || '',
                api_key: '',
                base_url: llmConfig.base_url || '',
                api_base: llmConfig.api_base || '',
            });
        }
    }, [llmConfig]);

    const loadToolsInfo = async () => {
        try {
            const info = await getToolsInfo();
            setToolsInfo(info);
        } catch (error) {
            console.error('Failed to load tools info:', error);
        }
    };

    const handleAddServer = async () => {
        try {
            await addMCPServer(serverForm);
            toast.success('MCP server added');
            setServerForm({ name: '', url: '', api_key: '' });
            loadMCPServers();
        } catch (error) {
            toast.error(`Failed to add server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleUpdateServer = async (name: string) => {
        try {
            await updateMCPServer(name, serverForm);
            toast.success('MCP server updated');
            setEditingServer(null);
            setServerForm({ name: '', url: '', api_key: '' });
            loadMCPServers();
        } catch (error) {
            toast.error(`Failed to update server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteServer = async (name: string) => {
        if (!confirm(`Delete MCP server "${name}"?`)) return;
        try {
            await deleteMCPServer(name);
            toast.success('MCP server deleted');
            loadMCPServers();
        } catch (error) {
            toast.error(`Failed to delete server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleSaveLLMConfig = async () => {
        try {
            await setLLMConfig(llmForm);
            toast.success('LLM configuration saved');
            loadLLMConfig();
        } catch (error) {
            toast.error(`Failed to save config: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const startEditServer = (server: typeof mcpServers[0]) => {
        setEditingServer(server.name);
        setServerForm({
            name: server.name,
            url: server.url,
            api_key: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-semibold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('mcp')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'mcp'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        MCP Servers
                    </button>
                    <button
                        onClick={() => setActiveTab('llm')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'llm'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        LLM Config
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'tools'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Tools
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'mcp' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Add MCP Server</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={serverForm.name}
                                            onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            placeholder="Server name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">URL</label>
                                        <input
                                            type="text"
                                            value={serverForm.url}
                                            onChange={(e) => setServerForm({ ...serverForm, url: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            placeholder="http://localhost:8000/mcp"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">URLs are automatically normalized to /mcp endpoint</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">API Key (optional)</label>
                                        <input
                                            type="password"
                                            value={serverForm.api_key}
                                            onChange={(e) => setServerForm({ ...serverForm, api_key: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            placeholder="Optional API key"
                                        />
                                    </div>
                                    <button
                                        onClick={() => editingServer ? handleUpdateServer(editingServer) : handleAddServer()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        {editingServer ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {editingServer ? 'Update Server' : 'Add Server'}
                                    </button>
                                    {editingServer && (
                                        <button
                                            onClick={() => {
                                                setEditingServer(null);
                                                setServerForm({ name: '', url: '', api_key: '' });
                                            }}
                                            className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Configured Servers</h3>
                                <div className="space-y-2">
                                    {mcpServers.map((server) => (
                                        <div
                                            key={server.name}
                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        >
                                            <div>
                                                <div className="font-medium">{server.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{server.url}</div>
                                                {server.has_api_key && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">Has API key</div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditServer(server)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteServer(server.name)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {mcpServers.length === 0 && (
                                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No MCP servers configured
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'llm' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">LLM Configuration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Type</label>
                                        <select
                                            value={llmForm.type}
                                            onChange={(e) => setLlmForm({ ...llmForm, type: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                            <option value="openai">OpenAI</option>
                                            <option value="groq">Groq</option>
                                            <option value="ollama">Ollama</option>
                                            <option value="gemini">Gemini</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Model</label>
                                        <input
                                            type="text"
                                            value={llmForm.model}
                                            onChange={(e) => setLlmForm({ ...llmForm, model: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            placeholder="gpt-4o, llama3.2, etc."
                                            required
                                        />
                                    </div>
                                    {(llmForm.type === 'openai' || llmForm.type === 'groq' || llmForm.type === 'gemini') && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">API Key</label>
                                            <input
                                                type="password"
                                                value={llmForm.api_key}
                                                onChange={(e) => setLlmForm({ ...llmForm, api_key: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                                placeholder="sk-..."
                                                required
                                            />
                                        </div>
                                    )}
                                    {llmForm.type === 'ollama' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Base URL</label>
                                            <input
                                                type="text"
                                                value={llmForm.base_url}
                                                onChange={(e) => setLlmForm({ ...llmForm, base_url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                                placeholder="http://localhost:11434"
                                            />
                                        </div>
                                    )}
                                    {llmForm.type === 'openai' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">API Base (optional)</label>
                                            <input
                                                type="text"
                                                value={llmForm.api_base || ''}
                                                onChange={(e) => setLlmForm({ ...llmForm, api_base: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                                placeholder="https://api.openai.com/v1"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={handleSaveLLMConfig}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Configuration
                                    </button>
                                </div>
                            </div>

                            {llmConfig && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Type:</span> {llmConfig.type}</div>
                                            <div><span className="font-medium">Model:</span> {llmConfig.model}</div>
                                            {llmConfig.base_url && (
                                                <div><span className="font-medium">Base URL:</span> {llmConfig.base_url}</div>
                                            )}
                                            {llmConfig.has_api_key && (
                                                <div className="text-gray-500 dark:text-gray-400">API key is configured</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Available Tools</h3>
                            {toolsInfo && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Local Tools</h4>
                                        <div className="space-y-2">
                                            {toolsInfo.local_tools.map((tool) => (
                                                <div key={tool.name} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <div className="font-medium">{tool.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Type: {tool.type}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">MCP Servers</h4>
                                        <div className="space-y-2">
                                            {toolsInfo.mcp_servers.map((server) => (
                                                <div key={server.name} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                    <div className="font-medium">{server.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{server.url}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Status: {server.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

