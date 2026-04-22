"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  SendHorizonal,
} from "lucide-react";
import { CssOrb, type OrbState } from "@/components/ui/css-orb";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "agent"; text: string; id: number };

export function CallPanel({ agentId }: { agentId: string }) {
  return (
    <ConversationProvider>
      <CallPanelInner agentId={agentId} />
    </ConversationProvider>
  );
}

function CallPanelInner({ agentId }: { agentId: string }) {
  const [orbState, setOrbState] = useState<OrbState>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "ended"
  >("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setStatus("connected");
      setOrbState("listening");
      setError(null);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    },
    onDisconnect: () => {
      setStatus("ended");
      setOrbState(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (thinkRef.current) clearTimeout(thinkRef.current);
    },
    onMessage: (msg) => {
      if (!msg.message) return;
      if (thinkRef.current) {
        clearTimeout(thinkRef.current);
        thinkRef.current = null;
      }
      const role = msg.source === "ai" ? "agent" : "user";
      setMessages((prev) => [
        ...prev,
        { role, text: msg.message, id: ++idRef.current },
      ]);
      if (role === "agent") {
        setOrbState("talking");
      } else {
        setOrbState("thinking");
        thinkRef.current = setTimeout(() => setOrbState("listening"), 8000);
      }
    },
    onError: (err: unknown) => {
      console.error("Conversation error:", err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Connection error");
      setStatus("idle");
      setOrbState(null);
      if (timerRef.current) clearInterval(timerRef.current);
    },
    micMuted: isMuted,
  });

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (thinkRef.current) clearTimeout(thinkRef.current);
    };
  }, []);

  const startCall = useCallback(async () => {
    try {
      setStatus("connecting");
      setOrbState("thinking");
      setMessages([]);
      setError(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
        onStatusChange: (s) => {
          if (s.status === "connected") setOrbState("listening");
        },
      });
    } catch (err) {
      console.error("Failed to start:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone permission denied. Please allow access and try again.");
      } else {
        setError("Failed to connect. Please try again.");
      }
      setStatus("idle");
      setOrbState(null);
    }
  }, [conversation, agentId]);

  const endCall = useCallback(() => {
    conversation.endSession();
    setStatus("ended");
    setOrbState(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [conversation]);

  const sendText = useCallback(() => {
    if (!textInput.trim() || status !== "connected") return;
    const text = textInput.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", text, id: ++idRef.current },
    ]);
    conversation.sendUserMessage(text);
    setTextInput("");
    setOrbState("thinking");
    if (thinkRef.current) clearTimeout(thinkRef.current);
    thinkRef.current = setTimeout(() => setOrbState("listening"), 8000);
  }, [textInput, status, conversation]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isActive = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              isActive && "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
              isConnecting && "bg-amber-400 animate-pulse",
              status === "idle" && "bg-[var(--text-muted)]",
              status === "ended" && "bg-[var(--text-muted)]"
            )}
          />
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {isActive
              ? "Connected"
              : isConnecting
                ? "Connecting..."
                : status === "ended"
                  ? "Interview ended"
                  : "Ready"}
          </span>
        </div>
        {(isActive || status === "ended") && (
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      {/* Hero section — Orb + controls */}
      <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 shrink-0">
        <CssOrb state={orbState} size={176} />

        {/* State label */}
        <p className="text-sm text-[var(--text-muted)] min-h-[1.25rem] text-center">
          {orbState === "listening"
            ? "Listening..."
            : orbState === "talking"
              ? "Speaking..."
              : orbState === "thinking"
                ? "Processing..."
                : isConnecting
                  ? "Connecting..."
                  : status === "ended"
                    ? "Interview complete"
                    : ""}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {status === "idle" && (
            <button
              onClick={startCall}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-600/25"
            >
              <Phone className="w-4 h-4" />
              Start Interview
            </button>
          )}

          {isConnecting && (
            <button
              disabled
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/80 text-white font-medium text-sm cursor-wait"
            >
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </button>
          )}

          {isActive && (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-all",
                  isMuted
                    ? "bg-red-500/15 text-red-500 hover:bg-red-500/25 ring-1 ring-red-500/30"
                    : "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]"
                )}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={endCall}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/25"
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}

          {status === "ended" && (
            <button
              onClick={() => {
                setStatus("idle");
                setMessages([]);
                setElapsed(0);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-medium text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              New Interview
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>
        )}
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-2 space-y-2 scroll-smooth min-h-0"
      >
        {messages.length === 0 && isActive && (
          <p className="text-center text-xs text-[var(--text-muted)] py-4">
            The conversation will appear here...
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-[var(--bg-surface-alt)] text-[var(--text-primary)] rounded-bl-md"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {orbState === "thinking" && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-surface-alt)] rounded-2xl rounded-bl-md px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Text input (secondary) */}
      {isActive && (
        <div className="shrink-0 border-t border-[var(--border-default)] px-4 py-3 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              placeholder="Or type a message..."
              className="flex-1 h-9 px-3 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            />
            <button
              onClick={sendText}
              disabled={!textInput.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] disabled:opacity-30 hover:bg-[var(--btn-primary-hover)] transition-colors"
            >
              <SendHorizonal className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
