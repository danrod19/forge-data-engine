"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Terminal, SkipForward } from "lucide-react";
import {
  highlightCliLine,
  extractDeviceName,
} from "@/components/ticket/cli-highlight";

interface TerminalCLIProps {
  output: string;
  /** ms between character batches — lower is faster */
  typeSpeed?: number;
  /** When true, shows full output immediately */
  skipAnimation?: boolean;
}

export function TerminalCLI({
  output,
  typeSpeed = 8,
  skipAnimation = false,
}: TerminalCLIProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(false);
  const [displayed, setDisplayed] = useState(skipAnimation ? output : "");
  const [done, setDone] = useState(!!skipAnimation);
  const deviceName = useMemo(() => extractDeviceName(output), [output]);

  useEffect(() => {
    skipRef.current = false;

    if (skipAnimation) {
      setDisplayed(output);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);

    let i = 0;
    let raf = 0;
    let last = performance.now();
    let cancelled = false;

    const charsPerTick =
      output.length > 400 ? 3 : output.length > 200 ? 2 : 1;

    const finish = () => {
      setDisplayed(output);
      setDone(true);
    };

    const tick = (now: number) => {
      if (cancelled) return;

      if (skipRef.current) {
        finish();
        return;
      }

      if (now - last >= typeSpeed) {
        last = now;
        i = Math.min(i + charsPerTick, output.length);
        setDisplayed(output.slice(0, i));
        if (i >= output.length) {
          setDone(true);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [output, typeSpeed, skipAnimation]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayed]);

  const handleSkip = useCallback(() => {
    skipRef.current = true;
    setDisplayed(output);
    setDone(true);
  }, [output]);

  const lines = displayed.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl border border-slate-700/90 bg-[#010409] shadow-[0_0_0_1px_rgba(34,197,94,0.12),0_8px_32px_rgba(0,0,0,0.45)]"
    >
      {/* CRT scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
        }}
      />

      {/* Title bar — macOS traffic lights */}
      <div className="relative z-20 flex items-center gap-2 border-b border-slate-800/90 bg-gradient-to-b from-slate-900 to-slate-950 px-3 py-2">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.5)] ring-1 ring-black/20" />
          <span className="size-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.4)] ring-1 ring-black/20" />
          <span className="size-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)] ring-1 ring-black/20" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          <Terminal className="size-3 shrink-0 text-slate-500" />
          <span className="truncate text-center text-[10px] font-medium tracking-wide text-slate-400 sm:text-[11px]">
            <span className="text-neon-green">{deviceName}</span>
            <span className="text-slate-600"> — </span>
            <span className="text-slate-500">IOS CLI · privileged EXEC</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!done && (
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5 text-[9px] text-slate-400 opacity-0 transition-opacity hover:border-neon-green/40 hover:text-neon-green group-hover:opacity-100 focus:opacity-100"
              title="Pular animação"
            >
              <SkipForward className="size-2.5" />
              Skip
            </button>
          )}
          <span
            className={`text-[9px] font-medium uppercase tracking-wider ${
              done ? "text-neon-green/80" : "text-amber-400/80"
            }`}
          >
            {done ? "● online" : "◌ dumping…"}
          </span>
        </div>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="relative z-20 max-h-60 overflow-y-auto overflow-x-hidden p-3 font-mono text-[11px] leading-[1.65] sm:max-h-72 sm:text-xs sm:leading-[1.7]"
        role="log"
        aria-label="Saída do terminal CLI"
        aria-live="polite"
      >
        <div className="mb-2 select-none border-b border-slate-900 pb-2 text-[10px] text-slate-600">
          <span className="text-neon-cyan">root@ccna-forge</span>
          <span className="text-slate-700">:</span>
          <span className="text-violet-400/80">~/labs</span>
          <span className="text-slate-500">$ </span>
          <span className="text-slate-500">
            ssh engineer@{deviceName.toLowerCase()}
          </span>
          <br />
          <span className="text-slate-600">
            Connected to {deviceName}. Hover →{" "}
            <kbd className="rounded border border-slate-800 bg-slate-900 px-1 text-[9px] text-slate-400">
              Skip
            </kbd>{" "}
            to fast-forward.
          </span>
        </div>

        {lines.map((line, i) => highlightCliLine(line, i))}

        <span className="inline-flex items-center">
          {done && (
            <span className="text-neon-green">
              {deviceName}
              <span className="text-neon-cyan">#</span>
            </span>
          )}
          <motion.span
            className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-0.5 bg-neon-green/90 align-middle shadow-[0_0_6px_rgba(34,197,94,0.7)]"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              times: [0, 0.45, 0.5, 1],
            }}
            aria-hidden
          />
        </span>
      </div>

      {/* Status bar */}
      <div className="relative z-20 flex items-center justify-between border-t border-slate-800/80 bg-slate-950/90 px-3 py-1 text-[9px] text-slate-600">
        <span>
          {displayed.length}
          <span className="text-slate-700">/</span>
          {output.length} bytes
        </span>
        <span className="text-slate-600">UTF-8 · 80 cols</span>
      </div>
    </motion.div>
  );
}
