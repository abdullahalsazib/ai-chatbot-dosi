/**
 * Chat input component with send button and mode toggle
 * Uses AI SDK UI patterns for enhanced chat experience
 */

"use client";

import { createStreamReader, StreamChunk } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Loader2, Send, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const abortRef = useRef<(() => void) | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSessionId = useStore((state) => state.currentSessionId);
  const mode = useStore((state) => state.mode);
  const isStreaming = useStore((state) => state.isStreaming);
  const isLoading = useStore((state) => state.isLoading);
  const setMode = useStore((state) => state.setMode);
  const addMessage = useStore((state) => state.addMessage);
  const updateLastMessage = useStore((state) => state.updateLastMessage);
  const updateLastMessageTools = useStore(
    (state) => state.updateLastMessageTools
  );
  const setStreaming = useStore((state) => state.setStreaming);
  const setLoading = useStore((state) => state.setLoading);

  // textarea should be disabled only while loading/streaming
  const inputDisabled = isLoading || isStreaming;
  // send button should be disabled while loading/streaming or when there's no input
  const MAX_CHARS = 2000;
  const charCount = input.length;
  const exceedMax = charCount > MAX_CHARS;
  const sendDisabled = inputDisabled || !input.trim() || exceedMax;

  // Auto-resize textarea with min/max bounds and overflow handling
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      const MIN_HEIGHT = 56; // px - AI SDK style
      const MAX_HEIGHT = 200; // px

      ta.style.boxSizing = "border-box";
      ta.style.height = "0px";
      const scroll = ta.scrollHeight;
      const newHeight = Math.min(Math.max(scroll, MIN_HEIGHT), MAX_HEIGHT);
      ta.style.height = `${newHeight}px`;
      ta.style.overflowY = scroll > MAX_HEIGHT ? "auto" : "hidden";
    }
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, []);

  const handleSend = async () => {
    if (sendDisabled) return;

    const message = input.trim();
    if (!message) return;

    setInput("");
    // keep focus on textarea so user can continue typing
    setTimeout(() => textareaRef.current?.focus(), 0);
    setLoading(true);
    setStreaming(true);

    // Add user message
    addMessage({
      role: "user",
      content: message,
    });

    // Add placeholder assistant message
    addMessage({
      role: "assistant",
      content: "",
    });

    const toolsUsed: string[] = [];
    let hasReceivedContent = false;

    try {
      abortRef.current = createStreamReader(
        {
          message,
          session_id: currentSessionId,
          mode,
        },
        (chunk: StreamChunk) => {
          if (chunk.error) {
            toast.error(chunk.error);
            // Remove empty assistant message on error
            const messages = useStore.getState().messages;
            if (
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              !messages[messages.length - 1].content
            ) {
              useStore.setState({ messages: messages.slice(0, -1) });
            }
            setStreaming(false);
            setLoading(false);
            return;
          }

          if (chunk.tool) {
            toolsUsed.push(chunk.tool);
          }

          if (chunk.chunk) {
            hasReceivedContent = true;
            updateLastMessage(chunk.chunk);
          }

          if (chunk.done) {
            setStreaming(false);
            setLoading(false);

            // Remove empty assistant message if no content was received
            if (!hasReceivedContent) {
              const messages = useStore.getState().messages;
              if (
                messages.length > 0 &&
                messages[messages.length - 1].role === "assistant" &&
                !messages[messages.length - 1].content
              ) {
                useStore.setState({ messages: messages.slice(0, -1) });
              }
            }

            // Update last message with tools used
            if (chunk.tools_used && chunk.tools_used.length > 0) {
              updateLastMessageTools(chunk.tools_used);
            } else if (toolsUsed.length > 0) {
              updateLastMessageTools([...toolsUsed]);
            }
          }
        },
        (error: Error) => {
          toast.error(`Error: ${error.message}`);
          // Remove empty assistant message on error
          const messages = useStore.getState().messages;
          if (
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            !messages[messages.length - 1].content
          ) {
            useStore.setState({ messages: messages.slice(0, -1) });
          }
          setStreaming(false);
          setLoading(false);
        },
        () => {
          setStreaming(false);
          setLoading(false);
        }
      );
    } catch (error) {
      toast.error(
        `Failed to send message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // Remove empty assistant message on error
      const messages = useStore.getState().messages;
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant" &&
        !messages[messages.length - 1].content
      ) {
        useStore.setState({ messages: messages.slice(0, -1) });
      }
      setStreaming(false);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (without Shift) sends. Ctrl/Cmd+Enter also sends.
    if (e.key === "Enter") {
      if ((e.ctrlKey || e.metaKey) && !sendDisabled) {
        e.preventDefault();
        handleSend();
        return;
      }

      if (!e.shiftKey && !sendDisabled) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {/* Mode selector */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
            <button
              onClick={() => setMode("agent")}
              disabled={inputDisabled}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === "agent"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Agent
            </button>
            <button
              onClick={() => setMode("rag")}
              disabled={inputDisabled}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === "rag"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              RAG
            </button>
          </div>
        </div>

        {/* Chat input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={inputDisabled}
              rows={1}
              className="w-full px-4 py-3.5 pr-12 border border-gray-300 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              style={{
                minHeight: "56px",
                maxHeight: "200px",
                boxSizing: "border-box",
              }}
              aria-label="Message input"
            />

            {/* Clear button */}
            {input && !inputDisabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Clear message"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Character counter */}
            {charCount > 0 && (
              <div className="absolute -bottom-5 right-0 text-xs">
                <span
                  className={
                    exceedMax
                      ? "text-red-500 font-medium"
                      : "text-gray-400 dark:text-gray-500"
                  }
                >
                  {charCount}
                </span>
                <span className="text-gray-300 dark:text-gray-600">
                  /{MAX_CHARS}
                </span>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={sendDisabled}
            className="shrink-0 h-14 w-14 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-all shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Send message"
            title={
              sendDisabled
                ? exceedMax
                  ? "Message too long"
                  : "Enter a message to send"
                : "Send message (Enter)"
            }
          >
            {isStreaming || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Keyboard shortcuts hint */}
        <div className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          <span className="hidden sm:inline">
            Press{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
              Shift+Enter
            </kbd>{" "}
            for new line
          </span>
        </div>
      </div>
    </div>
  );
}
