import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://localhost:8000";

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "👋 Hi! I'm your Airport Lounge AI assistant with **live** access to your inventory and orders.\n\nTry asking:\n• *Which items are critically low?*\n• *How many pending orders are there?*\n• *What does peak hour mode do?*",
        },
    ]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || streaming) return;

        // Add user message
        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        setStreaming(true);

        // Add empty AI message placeholder that we'll fill token by token
        setMessages((prev) => [...prev, { role: "ai", text: "" }]);

        try {
            const controller = new AbortController();
            abortRef.current = controller;

            const res = await fetch(`${API_BASE}/chat/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
                signal: controller.signal,
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") break;

                    try {
                        const { token } = JSON.parse(data);
                        // Append token to the last AI message
                        setMessages((prev) => {
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                ...updated[updated.length - 1],
                                text: updated[updated.length - 1].text + token,
                            };
                            return updated;
                        });
                    } catch {
                        // skip malformed chunks
                    }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        text: "⚠️ Could not connect to the AI. Is the backend running?",
                    };
                    return updated;
                });
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderText = (text) =>
        text.split("\n").map((line, i) => {
            const parts = line.split(/\*\*([^*]+)\*\*|\*([^*]+)\*/g);
            return (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                    {parts.map((part, j) => {
                        if (j % 3 === 1) return <strong key={j}>{part}</strong>;
                        if (j % 3 === 2) return <em key={j}>{part}</em>;
                        return part;
                    })}
                </p>
            );
        });

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

            {/* ── CHAT PANEL ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            width: "370px",
                            maxHeight: "540px",
                            background: "rgba(10, 18, 35, 0.92)",
                            backdropFilter: "blur(28px)",
                            border: "1px solid rgba(148, 163, 184, 0.15)",
                            borderRadius: "20px",
                            boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 38, height: 38,
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 20,
                                }}>🤖</div>
                                <div>
                                    <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>
                                        Lounge AI Assistant
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                                        {/* live indicator */}
                                        <span style={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: "#4ade80",
                                            boxShadow: "0 0 6px #4ade80",
                                            display: "inline-block",
                                            animation: "pulse 2s infinite",
                                        }} />
                                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, margin: 0 }}>
                                            Live data · Groq LLaMA 3.3
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    color: "rgba(255,255,255,0.8)", background: "none",
                                    border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 4,
                                }}
                            >×</button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1, overflowY: "auto",
                            padding: "14px 14px 6px",
                            display: "flex", flexDirection: "column", gap: 10,
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(148,163,184,0.2) transparent",
                        }}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18 }}
                                    style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                                >
                                    {msg.role === "ai" && (
                                        <div style={{
                                            width: 26, height: 26, borderRadius: "50%",
                                            background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 13, flexShrink: 0, marginRight: 7, marginTop: 2,
                                        }}>🤖</div>
                                    )}
                                    <div style={{
                                        maxWidth: "78%",
                                        padding: "9px 13px",
                                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                                        background: msg.role === "user"
                                            ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                                            : "rgba(255,255,255,0.07)",
                                        color: "white",
                                        fontSize: 13,
                                        lineHeight: 1.55,
                                        border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
                                        wordBreak: "break-word",
                                    }}>
                                        {renderText(msg.text)}
                                        {/* blinking cursor while this message is streaming */}
                                        {streaming && i === messages.length - 1 && msg.role === "ai" && (
                                            <span style={{
                                                display: "inline-block",
                                                width: 2, height: "1em",
                                                background: "#94a3b8",
                                                marginLeft: 2,
                                                verticalAlign: "text-bottom",
                                                animation: "blink 0.8s step-start infinite",
                                            }} />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: "10px 12px 12px",
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                            display: "flex", gap: 8, flexShrink: 0,
                            background: "rgba(0,0,0,0.25)",
                        }}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about inventory, orders..."
                                rows={1}
                                style={{
                                    flex: 1,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 12,
                                    color: "white",
                                    padding: "8px 12px",
                                    fontSize: 13,
                                    resize: "none",
                                    outline: "none",
                                    fontFamily: "inherit",
                                    lineHeight: 1.4,
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={streaming || !input.trim()}
                                title={streaming ? "Generating..." : "Send"}
                                style={{
                                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                                    background: streaming || !input.trim()
                                        ? "rgba(255,255,255,0.08)"
                                        : "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                    border: "none",
                                    cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
                                    color: "white", fontSize: 16,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s",
                                }}
                            >
                                {streaming ? (
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        style={{ display: "inline-block" }}
                                    >⟳</motion.span>
                                ) : "➤"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS keyframes injected once */}
            <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

            {/* ── FLOATING BUBBLE ── */}
            <motion.button
                onClick={() => setOpen((v) => !v)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
                style={{
                    width: 58, height: 58, borderRadius: "50%",
                    background: open
                        ? "linear-gradient(135deg,#6366f1,#0ea5e9)"
                        : "linear-gradient(135deg,#0ea5e9,#6366f1)",
                    border: "none", cursor: "pointer", fontSize: 26,
                    boxShadow: "0 8px 32px rgba(99,102,241,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", transition: "background 0.3s",
                }}
                title="Chat with AI Assistant"
            >
                {open ? "✕" : "💬"}
            </motion.button>
        </div>
    );
}
