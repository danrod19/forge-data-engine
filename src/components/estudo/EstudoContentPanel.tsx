"use client";

import { BookOpen, CheckCircle2, Terminal, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  hasReadableContent,
  type EstudoDidacticContent,
} from "@/data/estudo-content";
import { estudoUiCopy } from "@/data/copy";

interface EstudoContentPanelProps {
  content: EstudoDidacticContent | null;
  contentRead: boolean;
  onMarkRead: () => void;
  accentText?: string;
  accentBorder?: string;
  accentBg?: string;
}

export function EstudoContentPanel({
  content,
  contentRead,
  onMarkRead,
  accentText = "text-neon-green",
  accentBorder = "border-neon-green/30",
  accentBg = "bg-neon-green/10",
}: EstudoContentPanelProps) {
  const readable = hasReadableContent(content);

  if (!readable || !content) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="size-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-300">Sem apostila aqui</p>
        </div>
        <p className="text-[12px] leading-relaxed text-slate-500">
          {estudoUiCopy.emptyContent}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.topic_list.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {estudoUiCopy.topicsHeading}
          </p>
          <ul className="space-y-1.5">
            {content.topic_list.map((t) => (
              <li
                key={t}
                className="flex gap-2 text-[12px] leading-relaxed text-slate-300"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.study_notes.map((note, idx) => (
        <section
          key={`${note.heading}-${idx}`}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
        >
          <h3 className="mb-2 text-sm font-bold text-slate-100">{note.heading}</h3>
          <ul className="space-y-2">
            {note.bullets.map((b, i) => (
              <li
                key={i}
                className="text-[12px] leading-relaxed text-slate-400"
              >
                <span className="mr-1.5 text-slate-600">•</span>
                {b}
              </li>
            ))}
          </ul>
          {note.exam_tips.length > 0 && (
            <div
              className={cn(
                "mt-3 rounded-xl border px-3 py-2.5",
                accentBorder,
                accentBg
              )}
            >
              <p
                className={cn(
                  "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                  accentText
                )}
              >
                <Lightbulb className="size-3" />
                {estudoUiCopy.examTip}
              </p>
              {note.exam_tips.map((tip, i) => (
                <p
                  key={i}
                  className="text-[11px] leading-relaxed text-slate-300"
                >
                  {tip}
                </p>
              ))}
            </div>
          )}
        </section>
      ))}

      {content.must_know.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/90">
            {estudoUiCopy.mustKnowHeading}
          </p>
          <ul className="space-y-1.5">
            {content.must_know.map((m) => (
              <li
                key={m}
                className="text-[12px] leading-relaxed text-slate-300"
              >
                <span className="mr-1.5 text-amber-500/80">★</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.key_commands.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            <Terminal className="size-3" />
            {estudoUiCopy.commandsHeading}
          </p>
          <ul className="space-y-1.5 font-mono text-[11px] text-neon-cyan/90">
            {content.key_commands.map((cmd) => (
              <li
                key={cmd}
                className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-2.5 py-1.5"
              >
                {cmd}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sticky bottom-2 z-10 pt-1">
        {contentRead ? (
          <div
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold",
              accentBorder,
              accentBg,
              accentText
            )}
          >
            <CheckCircle2 className="size-4" />
            {estudoUiCopy.alreadyRead}
          </div>
        ) : (
          <Button
            type="button"
            onClick={onMarkRead}
            className="h-11 w-full gap-2 rounded-xl bg-neon-green font-bold text-slate-950 hover:bg-neon-green/90"
          >
            <CheckCircle2 className="size-4" />
            {estudoUiCopy.markRead}
          </Button>
        )}
      </div>
    </div>
  );
}
