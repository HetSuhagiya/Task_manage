"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useLockedTaskTimer } from "./useLockedTaskTimer";
import toast, { Toaster } from 'react-hot-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import StickyNotesPanel from "../StickyNotesPanel";

const categories = [
  "Study",
  "Job Search",
  "Passive",
  "Creative",
  "Fitness",
  "Admin",
  "Other",
];
const valueTags = ["High", "Medium", "Low"];
const focusEmojis = ["😐", "🙂", "😌", "💪", "🔥"];

const encouragements = [
  { icon: "✨", text: "Every minute counts." },
  { icon: "🎯", text: "Stay consistent to see your patterns." },
  { icon: "🌱", text: "Small steps, big change." },
];

const quotes = [
  "Small consistent steps make big change.",
  "Don't just be busy. Be intentional.",
  "Reflect, don't just rush.",
  "Your time is your most valuable resource.",
  "Progress, not perfection."
];
const today = new Date();
const quoteOfTheDay = quotes[(today.getFullYear() + today.getMonth() + today.getDate()) % quotes.length];

// Category color mapping for badges
const categoryColorMap: Record<string, { bg: string; text: string; shadow: string; hex: string }> = {
  "Study":      { bg: "bg-blue-500/20",    text: "text-blue-300",    shadow: "shadow-blue-400/40", hex: "#3B82F6" },
  "Job Search": { bg: "bg-purple-500/20",  text: "text-purple-300",  shadow: "shadow-purple-400/40", hex: "#8B5CF6" },
  "Passive":    { bg: "bg-slate-500/20",   text: "text-slate-300",   shadow: "shadow-slate-400/40", hex: "#64748B" },
  "Creative":   { bg: "bg-pink-500/20",    text: "text-pink-300",    shadow: "shadow-pink-400/40", hex: "#EC4899" },
  "Fitness":    { bg: "bg-green-500/20",   text: "text-green-300",   shadow: "shadow-green-400/40", hex: "#10B981" },
  "Admin":      { bg: "bg-amber-500/20",   text: "text-amber-300",   shadow: "shadow-amber-400/40", hex: "#F59E0B" },
  "Other":      { bg: "bg-gray-500/20",    text: "text-gray-300",    shadow: "shadow-gray-400/40", hex: "#6B7280" },
};

// Helper to get current date and time in suitable formats
function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().slice(0,10); // yyyy-mm-dd
}
function getCurrentTimeStr() {
  const now = new Date();
  return now.toTimeString().slice(0,5); // HH:mm
}

export default function LogPage() {
  const [logs, setLogs] = useState<any[] | undefined>(undefined);
  const [completedLogs, setCompletedLogs] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('focusmirror-completed-logs');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [form, setForm] = useState({
    task: "",
    duration: "",
    category: categories[0],
    focus: 3,
    value: valueTags[1],
    steps: "",
    nextAction: "",
    startDate: getTodayDateStr(),
    startTime: getCurrentTimeStr(),
  });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [addHover, setAddHover] = useState(false);
  const encouragement = encouragements[Math.floor((Date.now() / 1000 / 60) % encouragements.length)];

  const {
    activeTaskId,
    elapsed,
    isLocked,
    startTimer,
    stopTimer,
  } = useLockedTaskTimer();

  const [mute, setMute] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('focusmirror-mute');
      return stored === 'true';
    }
    return false;
  });
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, log?: any }>({ open: false });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocusChange = (v: number) => {
    setForm({ ...form, focus: v });
  };

  const handleAdd = (e: any) => {
    e.preventDefault();
    setAdding(true);
    setTimeout(() => setAdding(false), 400);
    // Combine date and time into ISO string
    const start = new Date(`${form.startDate}T${form.startTime}`).toISOString();
    setLogs([
      ...logs || [],
      { ...form, id: Date.now(), start },
    ]);
    setForm({ task: "", duration: "", category: categories[0], focus: 3, value: valueTags[1], steps: "", nextAction: "", startDate: getTodayDateStr(), startTime: getCurrentTimeStr() });
  };

  const handleDelete = (id: number) => {
    setLogs((logs || []).filter((log) => log.id !== id));
  };

  const handleEdit = (log: any) => {
    setEditingId(log.id);
    setEditValues({ ...log });
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleEditChange = (e: any) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    setLogs((logs || []).map((log) => (log.id === editingId ? { ...editValues, id: editingId } : log)));
    setEditingId(null);
    setEditValues(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const focusLevels = [
    { icon: <FaFire />, label: "1 – Distracted" },
    { icon: <FaFire />, label: "2 – Unsettled" },
    { icon: <FaFire />, label: "3 – Present" },
    { icon: <FaFire />, label: "4 – Engaged" },
    { icon: <FaFire />, label: "5 – Deep Focus" },
  ];

  const notifyTaskComplete = (taskName: string) => {
    toast.custom((t) => (
      <div
        className={`px-6 py-4 rounded-2xl shadow-xl border border-blue-700/40 bg-[#181c2b] text-blue-100 font-semibold flex items-center gap-3 transition-all ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} animate-glow`}
        style={{ minWidth: 260, boxShadow: '0 0 16px 2px #6366f1aa' }}
        onMouseEnter={() => toast.dismiss(t.id)}
      >
        <span className="text-green-400 text-xl">✔️</span>
        <span>Task "{taskName}" completed!</span>
      </div>
    ), { duration: 4000 });
    if (!mute && chimeRef.current) {
      chimeRef.current.currentTime = 0;
      chimeRef.current.play();
    }
  };

  useEffect(() => {
    if (logs && activeTaskId !== null) {
      const activeLog = logs.find((log) => log.id === activeTaskId);
      if (activeLog) {
        const durationSec = parseInt(activeLog.duration, 10) * 60;
        if (elapsed >= durationSec) {
          notifyTaskComplete(activeLog.task);
          stopTimer();
          setLogs((prev) => prev?.filter((log) => log.id !== activeTaskId));
          setCompletedLogs((prev) => [...prev, { ...activeLog, completedAt: Date.now() }]);
        }
      }
    }
  }, [elapsed, logs, activeTaskId, stopTimer]);

  useEffect(() => {
    if (logs !== undefined) {
      localStorage.setItem('focusmirror-logs', JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('focusmirror-completed-logs', JSON.stringify(completedLogs));
  }, [completedLogs]);

  useEffect(() => {
    const stored = localStorage.getItem('focusmirror-logs');
    const storedCompleted = localStorage.getItem('focusmirror-completed-logs');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
    if (storedCompleted) {
      try {
        setCompletedLogs(JSON.parse(storedCompleted));
      } catch {
        setCompletedLogs([]);
      }
    } else {
      setCompletedLogs([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative pb-16 w-full">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#181c2b', color: '#c7d2fe', border: '1px solid #6366f1', boxShadow: '0 0 16px 2px #6366f1aa' },
        duration: 4000,
      }} />
      <audio ref={chimeRef} src="/chime.wav" preload="auto" />
      {/* Mute toggle */}
      <button
        className="absolute top-6 right-6 z-50 px-3 py-2 rounded-full bg-black/40 border border-blue-700 text-blue-200 hover:bg-blue-900/40 transition shadow"
        onClick={() => {
          setMute((m) => {
            localStorage.setItem('focusmirror-mute', (!m).toString());
            return !m;
          });
        }}
        title={mute ? 'Unmute notifications' : 'Mute notifications'}
      >
        {mute ? '🔇 Muted' : '🔔 Sound On'}
      </button>
      {/* Blurred gradient background behind card */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-72 bg-gradient-to-tr from-blue-700/30 via-indigo-500/20 to-purple-700/20 blur-3xl rounded-full z-0"
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Main container for all content */}
      <div className="w-full max-w-[1200px] flex flex-col items-start px-4 md:px-8 mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center w-full pt-8 z-10 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Time Log</h1>
            <div className="text-gray-400 text-sm md:text-base">Log what you did, how long it took, and how valuable it felt.</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Link href="/dashboard" passHref legacyBehavior>
                <a className="px-4 py-2 rounded-lg bg-white border border-[#2a2a2a] text-black font-medium shadow-sm transition-colors duration-150 ease-in-out hover:bg-[#f3f3f3] hover:shadow-lg active:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-blue-700/40"
                  style={{ boxShadow: '0 1px 4px 0 #00000022' }}>
                  See Dashboard
                </a>
              </Link>
              <Link href="/calendar-view" passHref legacyBehavior>
                <a className="px-4 py-2 rounded-lg bg-white border border-[#2a2a2a] text-black font-medium shadow-sm transition-colors duration-150 ease-in-out hover:bg-[#f3f3f3] hover:shadow-lg active:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-blue-700/40"
                  style={{ boxShadow: '0 1px 4px 0 #00000022' }}>
                  Calendar View
                </a>
              </Link>
              <button
                className="px-4 py-2 rounded-lg bg-white border border-[#2a2a2a] text-black font-medium shadow-sm transition-colors duration-150 ease-in-out hover:bg-[#f3f3f3] hover:shadow-lg active:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-blue-700/40"
                style={{ boxShadow: '0 1px 4px 0 #00000022' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all logs for this week?')) {
                    setLogs([]);
                  }
                }}
              >
                Clear Week
              </button>
            </div>
          </div>
        </div>
        {/* Input Card + Sticky Notes Row */}
        <div className="w-full flex flex-col md:flex-row gap-6 items-start mt-6 mb-8">
          <motion.form
            onSubmit={handleAdd}
            className="relative z-10 w-full max-w-2xl p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 flex flex-col gap-4"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Task Name</label>
                <input
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="e.g. Calculus review"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Duration (min)</label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="45"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Start Time</label>
                <input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-200 text-sm mb-1">Focus</label>
                <div className="flex items-center justify-between gap-2 w-full mt-1 mb-2">
                  {focusLevels.map((level, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handleFocusChange(i + 1)}
                      whileTap={{ scale: 0.92 }}
                      className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border transition-all
                        ${form.focus === i + 1
                          ? "bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-400/60"
                          : "bg-black/30 border-gray-700 text-gray-500 hover:bg-gray-700/60"}
                      `}
                      aria-label={`Focus level ${i + 1}`}
                    >
                      <span className="text-lg">
                        {level.icon}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <div className="text-xs text-blue-300 text-center min-h-[1.5em]">{focusLevels[form.focus - 1].label}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-gray-200 text-sm mb-1">Value</label>
                <select
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {valueTags.map((tag) => (
                    <option key={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97, boxShadow: "0 0 0 2px #23272f" }}
                whileHover={{ scale: 1.03, boxShadow: "0 2px 8px 0 #23272f55" }}
                className="md:col-span-2 w-full px-4 py-2 rounded-lg bg-white border border-[#2a2a2a] text-black font-medium shadow-sm transition-colors duration-150 ease-in-out hover:bg-[#f3f3f3] hover:shadow-lg active:bg-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-blue-700/40 mt-4 md:mt-0 relative"
                animate={adding ? { scale: [1, 1.05, 0.98, 1] } : {}}
                transition={{ duration: 0.4 }}
                onMouseEnter={() => setAddHover(true)}
                onMouseLeave={() => setAddHover(false)}
              >
                Add Entry
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={addHover ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-2 text-blue-200 text-sm pointer-events-none whitespace-nowrap"
                  style={{ bottom: '-2.5rem' }}
                >
                  <span className="mr-1">{encouragement.icon}</span>{encouragement.text}
                </motion.div>
              </motion.button>
            </div>
            {/* Collapsible Details Section */}
            <div className="mt-2">
              <button
                type="button"
                className="text-blue-300 text-sm flex items-center gap-1 hover:text-blue-200 focus:outline-none"
                onClick={() => setDetailsOpen((v) => !v)}
                aria-expanded={detailsOpen}
              >
                <span className="text-lg font-bold">{detailsOpen ? "−" : "+"}</span> Add Details
              </button>
              <AnimatePresence initial={false}>
                {detailsOpen && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="flex flex-col gap-3 bg-black/30 rounded-xl p-4 border border-blue-900/30">
                      <label className="text-blue-200 text-xs mb-1">Steps (optional)</label>
                      <textarea
                        name="steps"
                        value={form.steps}
                        onChange={handleChange}
                        rows={3}
                        className="px-3 py-2 rounded-lg bg-black/40 text-blue-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400 resize-y min-h-[60px]"
                        placeholder="Outline steps or intentions for this task..."
                      />
                      <label className="text-blue-200 text-xs mb-1 mt-2">Next Action</label>
                      <input
                        name="nextAction"
                        value={form.nextAction}
                        onChange={handleChange}
                        className="px-3 py-2 rounded-lg bg-black/40 text-blue-100 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                        placeholder="If unfinished, what's the next step?"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-blue-300 text-sm mt-2 text-center">Nice! Logging focus helps you stay intentional.</div>
          </motion.form>
          <div className="w-full md:w-[260px] flex-shrink-0">
            <StickyNotesPanel />
          </div>
        </div>
        <motion.div
          className="text-blue-200 text-left italic text-base font-light mt-2 mb-2 pl-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          “{quoteOfTheDay}”
        </motion.div>
        {/* Category Color Legend */}
        <div className="flex flex-wrap gap-2 justify-center mt-6 mb-2">
          {categories.map(cat => (
            <div key={cat} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${categoryColorMap[cat]?.bg || 'bg-gray-700/30'} ${categoryColorMap[cat]?.text || 'text-gray-200'}`} style={{ minWidth: 0 }}>
              <span className="w-3 h-3 rounded-full inline-block mr-1" style={{ background: categoryColorMap[cat]?.bg.replace('bg-', '').replace('/20', ''), boxShadow: `0 0 6px 1px ${categoryColorMap[cat]?.hex || '#6B7280'}44` }}></span>
              {cat}
            </div>
          ))}
        </div>
        {/* Entries */}
        <section className="w-full max-w-6xl z-10 relative mt-2">
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-white/5 backdrop-blur-md">
            <table className="min-w-full text-left text-sm text-blue-100">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-3 font-semibold tracking-wide">Task</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Timer</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Duration</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Category</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Focus</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Value</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs === undefined ? (
                  <tr><td colSpan={7} className="text-center py-12 text-blue-200">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-blue-200">No logs yet. Start tracking your time!</td></tr>
                ) : (
                  logs.map((log) => {
                    const isActive = activeTaskId === log.id;
                    const isEditing = editingId === log.id;
                    const isCompleted = completedLogs.some((c) => c.id === log.id);
                    const durationSec = parseInt(log.duration, 10) * 60;
                    return (
                      <tr
                        key={log.id}
                        className={`transition-all duration-200 border-b border-white/10 hover:bg-blue-900/20
                          ${isActive ? `ring-2 ${categoryColorMap[log.category]?.shadow || 'ring-blue-400/60'} bg-blue-900/30` : ''}`}
                        onClick={() => (!isEditing && (log.steps || log.nextAction)) ? setDetailsModal({ open: true, log }) : undefined}
                        style={{ cursor: (!isEditing && (log.steps || log.nextAction)) ? 'pointer' : undefined }}
                      >
                        {/* Task Name with tooltip or input */}
                        <td className="px-4 py-2 max-w-[260px] align-middle">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isActive}
                              disabled={isLocked && !isActive || isCompleted}
                              onChange={() => {
                                if (!isLocked && !isCompleted) {
                                  startTimer(log.id, durationSec, () => {
                                    stopTimer();
                                    setLogs((prev) => prev?.filter((l) => l.id !== log.id));
                                    setCompletedLogs((prev) => [...prev, { ...log, completedAt: Date.now() }]);
                                  });
                                }
                              }}
                              className="w-5 h-5 accent-blue-500 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                              aria-label="Mark as currently doing"
                            />
                            {isEditing ? (
                              <input
                                name="task"
                                value={editValues.task}
                                onChange={handleEditChange}
                                ref={editInputRef}
                                className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[120px] max-w-[180px] flex-1 text-sm"
                                style={{ minWidth: 0 }}
                                title={editValues.task}
                              />
                            ) : (
                              <span
                                className={`font-semibold text-sm md:text-base ${isActive ? "text-blue-200" : "text-white"} overflow-hidden text-ellipsis whitespace-nowrap`}
                                style={{ display: 'inline-block', maxWidth: 180 }}
                                title={log.task}
                              >
                                {log.task}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Timer */}
                        <td className="px-2 py-2 text-center align-middle">
                          {isActive && !isEditing && (
                            <div className="flex items-center justify-center gap-2">
                              <svg width="28" height="28" viewBox="0 0 28 28">
                                <defs>
                                  <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#818cf8" />
                                  </linearGradient>
                                </defs>
                                <circle
                                  cx="14" cy="14" r="12"
                                  fill="none"
                                  stroke="#1e293b"
                                  strokeWidth="4"
                                />
                                <circle
                                  cx="14" cy="14" r="12"
                                  fill="none"
                                  stroke="url(#timer-gradient)"
                                  strokeWidth="4"
                                  strokeDasharray={2 * Math.PI * 12}
                                  strokeDashoffset={(1 - Math.min(elapsed / durationSec, 1)) * 2 * Math.PI * 12}
                                  strokeLinecap="round"
                                  style={{ filter: 'drop-shadow(0 0 4px #60a5fa88)' }}
                                />
                              </svg>
                              <motion.span
                                className="px-2 py-1 rounded bg-blue-700/60 text-blue-100 font-mono text-xs md:text-sm shadow animate-pulse min-w-[70px] text-center"
                                initial={{ scale: 0.9, opacity: 0.7 }}
                                animate={{ scale: [0.9, 1.05, 0.98, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                              >
                                +{Math.floor(Math.min(elapsed, durationSec) / 60)} min {Math.min(elapsed, durationSec) % 60 > 0 ? `${Math.min(elapsed, durationSec) % 60} sec` : "active"}
                              </motion.span>
                            </div>
                          )}
                        </td>
                        {/* Duration */}
                        <td className="px-2 py-2 text-center align-middle">
                          {isEditing ? (
                            <input
                              name="duration"
                              type="number"
                              min="1"
                              value={editValues.duration}
                              onChange={handleEditChange}
                              className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 w-[70px] text-xs text-center"
                            />
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 font-bold text-xs text-center w-[80px] inline-block truncate" title={`${log.duration} min`}>⏱ {log.duration} min</span>
                          )}
                        </td>
                        {/* Category */}
                        <td className="px-2 py-2 text-center align-middle">
                          {isEditing ? (
                            <select
                              name="category"
                              value={editValues.category}
                              onChange={handleEditChange}
                              className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 w-[80px] text-xs"
                            >
                              {categories.map((cat) => (
                                <option key={cat}>{cat}</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-xs text-center w-[80px] inline-block truncate
                                ${categoryColorMap[log.category]?.bg || "bg-gray-700/30"}
                                ${categoryColorMap[log.category]?.text || "text-gray-200"}
                                ring-1 ring-inset
                                ${categoryColorMap[log.category]?.shadow || "shadow-none"}
                                shadow-md`}
                              title={log.category}
                              style={{ filter: 'brightness(1.1)' }}
                            >
                              {log.category}
                            </span>
                          )}
                        </td>
                        {/* Focus */}
                        <td className="px-2 py-2 text-center align-middle">
                          {isEditing ? (
                            <select
                              name="focus"
                              value={editValues.focus}
                              onChange={handleEditChange}
                              className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 w-[70px] text-xs"
                            >
                              {[1,2,3,4,5].map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-200 font-bold flex items-center gap-1 text-xs w-[70px] text-center inline-flex truncate" title={`Focus: ${log.focus}`}>{focusEmojis[log.focus - 1]} {log.focus}/5</span>
                          )}
                        </td>
                        {/* Value */}
                        <td className="px-2 py-2 text-center align-middle">
                          {isEditing ? (
                            <select
                              name="value"
                              value={editValues.value}
                              onChange={handleEditChange}
                              className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 w-[70px] text-xs"
                            >
                              {valueTags.map((tag) => (
                                <option key={tag}>{tag}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold w-[70px] text-center inline-block truncate ${log.value === "High" ? "bg-green-700/40 text-green-200" : log.value === "Medium" ? "bg-yellow-700/40 text-yellow-200" : "bg-red-700/40 text-red-200"}`} title={log.value}>{log.value}</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-2 py-2 text-center align-middle">
                          <div className="flex gap-2 items-center justify-center">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="px-3 py-1 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition"
                                  onClick={handleEditSave}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1 rounded bg-gray-600 text-white font-semibold text-xs hover:bg-gray-700 transition"
                                  onClick={handleEditCancel}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.15, color: "#f87171" }}
                                  className="p-2 rounded-full hover:bg-red-500/20 transition flex items-center justify-center"
                                  onClick={e => { e.stopPropagation(); handleDelete(log.id); }}
                                  aria-label="Delete entry"
                                  disabled={isActive}
                                >
                                  <FiTrash2 className="text-lg text-red-400" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.15, color: "#60a5fa" }}
                                  className="p-2 rounded-full hover:bg-blue-500/20 transition flex items-center justify-center"
                                  aria-label="Edit entry"
                                  onClick={e => { e.stopPropagation(); handleEdit(log); }}
                                  disabled={isActive}
                                >
                                  <FiEdit2 className="text-lg text-blue-300" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* Completed Tasks Section */}
        <section className="w-full max-w-6xl z-10 relative mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-blue-200">Completed Tasks</h2>
            <button
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all completed tasks?')) {
                  setCompletedLogs([]);
                  localStorage.setItem('focusmirror-completed-logs', JSON.stringify([]));
                }
              }}
              disabled={completedLogs.length === 0}
              style={{ opacity: completedLogs.length === 0 ? 0.5 : 1 }}
            >
              Clear Completed
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-white/5 backdrop-blur-md">
            <table className="min-w-full text-left text-sm text-blue-100">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-3 font-semibold tracking-wide">Task</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Duration</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Category</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Focus</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Value</th>
                  <th className="px-2 py-3 font-semibold tracking-wide text-center">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {completedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-blue-300">No tasks have been completed yet.</td>
                  </tr>
                ) : (
                  completedLogs.map((log) => (
                    <tr key={log.id} className="transition-all duration-200 border-b border-white/10 hover:bg-blue-900/10">
                      <td className="px-4 py-2 max-w-[260px] align-middle">
                        <span className="font-semibold text-sm md:text-base text-white overflow-hidden text-ellipsis whitespace-nowrap" style={{ display: 'inline-block', maxWidth: 180 }} title={log.task}>{log.task}</span>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 font-bold text-xs text-center w-[80px] inline-block truncate" title={`${log.duration} min`}>⏱ {log.duration} min</span>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-xs text-center w-[80px] inline-block truncate
                            ${categoryColorMap[log.category]?.bg || "bg-gray-700/30"}
                            ${categoryColorMap[log.category]?.text || "text-gray-200"}
                            ring-1 ring-inset
                            ${categoryColorMap[log.category]?.shadow || "shadow-none"}
                            shadow-md`}
                          title={log.category}
                          style={{ filter: 'brightness(1.1)' }}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-200 font-bold flex items-center gap-1 text-xs w-[70px] text-center inline-flex truncate" title={`Focus: ${log.focus}`}>{focusEmojis[log.focus - 1]} {log.focus}/5</span>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold w-[70px] text-center inline-block truncate ${log.value === "High" ? "bg-green-700/40 text-green-200" : log.value === "Medium" ? "bg-yellow-700/40 text-yellow-200" : "bg-red-700/40 text-red-200"}`} title={log.value}>{log.value}</span>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span className="text-xs text-blue-300">{log.completedAt ? new Date(log.completedAt).toLocaleString() : ""}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {/* Details Modal */}
      {detailsModal.open && detailsModal.log && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDetailsModal({ open: false })}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181c2b] rounded-2xl shadow-2xl border border-blue-700/40 p-6 min-w-[320px] max-w-[90vw] text-blue-100 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-lg font-bold text-blue-200 mb-2">Task Details</div>
            {detailsModal.log.steps && (
              <div className="mb-3">
                <div className="text-xs text-blue-300 mb-1 font-semibold">Steps</div>
                <div className="whitespace-pre-line text-blue-100 bg-black/30 rounded p-2 border border-blue-900/30 text-sm">{detailsModal.log.steps}</div>
              </div>
            )}
            {detailsModal.log.nextAction && (
              <div className="mb-2">
                <div className="text-xs text-blue-300 mb-1 font-semibold">Next Action</div>
                <div className="text-blue-100 bg-black/30 rounded p-2 border border-blue-900/30 text-sm">{detailsModal.log.nextAction}</div>
              </div>
            )}
            <button
              className="absolute top-2 right-2 text-blue-300 hover:text-blue-100 text-xl font-bold focus:outline-none"
              onClick={() => setDetailsModal({ open: false })}
              aria-label="Close details"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
      <style jsx global>{`
@keyframes glow {
  0% { box-shadow: 0 0 8px 2px #6366f1aa; }
  50% { box-shadow: 0 0 24px 6px #6366f1cc; }
  100% { box-shadow: 0 0 8px 2px #6366f1aa; }
}
.animate-glow { animation: glow 2s infinite; }
`}</style>
    </div>
  );
}
