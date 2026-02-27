import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SUGGESTIONS = [
  "What's running low today?",
  "Will we have enough beer for tonight's peak?",
  "Show me all critical items",
  "What orders were placed today?",
  "Are we ready for the evening peak?",
  "Which liquors need restocking?",
  "Give me a full inventory summary",
  "Override the reorder for champagne",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#63b3ed",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

export default function AIChat({ inventory, orders }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your Lounge AI Assistant. I have live access to your inventory data. Ask me anything — stock levels, peak hour readiness, restock recommendations, or anything else!",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${BASE}/ai/chat`, { message: msg });
      setMessages(prev => [...prev, {
        role: "assistant",
        text: res.data.reply,
        time: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Connection error. Make sure the backend is running.",
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Pulse badge count
  const alertCount = inventory.filter(i => i.status !== "ok").length;

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .chat-input:focus { outline: none; border-color: rgba(99,179,237,0.5) !important; }
        .suggestion-btn:hover { background: rgba(99,179,237,0.15) !important; border-color: rgba(99,179,237,0.4) !important; }
        .send-btn:hover { opacity: 0.85; transform: scale(0.97); }
        .msg-user { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
        .msg-ai { background: #0d1321; border: 1px solid rgba(255,255,255,0.06); }
      `}</style>

      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 8px 32px rgba(59,130,246,0.5)",
          animation: "pulse2 3s ease-in-out infinite",
          transition: "all 0.2s"
        }}
      >
        <span style={{ fontSize: 26 }}>{open ? "✕" : "🤖"}</span>
        {!open && alertCount > 0 && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 22, height: 22, borderRadius: "50%",
            background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "white",
            border: "2px solid #080c14"
          }}>{alertCount}</div>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 100, right: 28, zIndex: 999,
          width: 420, height: 580,
          background: "#080c14",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.2)",
          animation: "slideUp 0.25s ease",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0d1321, #111827)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 12px rgba(59,130,246,0.4)"
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>Lounge AI Assistant</div>
              <div style={{ fontSize: 11, color: "#22d3ee", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block" }}></span>
                Live inventory access · {inventory.length} items
              </div>
            </div>
            {alertCount > 0 && (
              <div style={{
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600
              }}>
                {alertCount} alerts
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: 12
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 10, alignItems: "flex-end",
                animation: "fadeIn 0.2s ease"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
                  }}>🤖</div>
                )}
                <div style={{ maxWidth: "78%" }}>
                  <div className={msg.role === "user" ? "msg-user" : "msg-ai"} style={{
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding: "10px 14px",
                    fontSize: 13, color: "#e2e8f0", lineHeight: 1.6,
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 10, color: "#374151", marginTop: 4,
                    textAlign: msg.role === "user" ? "right" : "left", paddingX: 4
                  }}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13
                }}>🤖</div>
                <div style={{
                  background: "#0d1321", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px 16px 16px 4px"
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{
              padding: "0 16px 12px",
              display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0
            }}>
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="suggestion-btn"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "5px 10px",
                    color: "#63b3ed", fontSize: 11, cursor: "pointer",
                    transition: "all 0.15s"
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 10, flexShrink: 0,
            background: "#080c14"
          }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about inventory..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "10px 14px",
                color: "#e2e8f0", fontSize: 13,
                transition: "border-color 0.2s"
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="send-btn"
              style={{
                width: 42, height: 42, borderRadius: 10, border: "none",
                background: loading || !input.trim()
                  ? "rgba(59,130,246,0.2)"
                  : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white", fontSize: 18, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}