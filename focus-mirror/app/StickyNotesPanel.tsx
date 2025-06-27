"use client";
import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "focusmirror-minimal-sticky-note";

function toBulletedLines(text: string) {
  return text
    .split("\n")
    .map(line => line.trim() ? `• ${line.replace(/^•\s*/, "")}` : "")
    .join("\n");
}

export default function StickyNotesPanel({ className = "" }: { className?: string }) {
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setValue(stored);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, value);
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 320) + 'px';
    }
  }, [value, editing]);

  function handleEdit() {
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleBlur() {
    setEditing(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value;
    const bulleted = toBulletedLines(raw);
    setValue(bulleted);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
  }

  // Render display mode: each line as a bullet
  function renderBulletedList(text: string) {
    return text.split('\n').filter(line => line.trim()).map((line, idx) => (
      <div key={idx} className="flex items-start">
        <span className="mr-2 select-none">•</span>
        <span className="whitespace-pre-line break-words flex-1">{line.replace(/^•\s*/, "")}</span>
      </div>
    ));
  }

  return (
    <div
      className={`w-[340px] bg-[#181c2bcc] border border-blue-700/40 shadow-xl rounded-xl p-2 flex flex-col ${className}`}
      style={{ boxShadow: '0 4px 24px 0 #23294655', backdropFilter: 'blur(10px) saturate(1.1)', maxHeight: 340 }}
    >
      <div className="text-blue-200 font-bold text-sm mb-1 ml-1">Quick Notes</div>
      {editing ? (
        <textarea
          ref={textareaRef}
          value={value.replace(/^•\s*/gm, "")}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Write anything here…"
          className="w-full resize-none bg-transparent text-blue-100 border-none outline-none placeholder:text-blue-300 text-sm font-mono"
          style={{ minHeight: 36, maxHeight: 320, minWidth: 0, overflow: 'hidden' }}
          spellCheck={false}
        />
      ) : (
        <div
          className="w-full min-h-[36px] max-h-[320px] font-mono text-sm text-blue-100 bg-transparent outline-none border-none px-1 py-1 cursor-pointer"
          style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}
          tabIndex={0}
          onClick={handleEdit}
          onFocus={handleEdit}
        >
          {value.trim() ? renderBulletedList(value) : (
            <span className="text-blue-300 opacity-60 italic">Write anything here…</span>
          )}
        </div>
      )}
    </div>
  );
} 