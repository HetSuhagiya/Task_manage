"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { FaFire } from "react-icons/fa";

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

export default function LogPage() {
  const [logs, setLogs] = useState<any[] | undefined>(undefined);
  const [form, setForm] = useState({
    task: "",
    duration: "",
    category: categories[0],
    focus: 3,
    value: valueTags[1],
  });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [addHover, setAddHover] = useState(false);
  const encouragement = encouragements[Math.floor((Date.now() / 1000 / 60) % encouragements.length)];

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
    setLogs([
      ...logs || [],
      { ...form, id: Date.now() },
    ]);
    setForm({ task: "", duration: "", category: categories[0], focus: 3, value: valueTags[1] });
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

  useEffect(() => {
    const stored = localStorage.getItem('focusmirror-logs');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
  }, []);

  useEffect(() => {
    if (logs !== undefined) {
      localStorage.setItem('focusmirror-logs', JSON.stringify(logs));
    }
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative pb-16">
      {/* Blurred gradient background behind card */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-72 bg-gradient-to-tr from-blue-700/30 via-indigo-500/20 to-purple-700/20 blur-3xl rounded-full z-0"
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Top bar */}
      <div className="flex justify-between items-center max-w-3xl mx-auto pt-8 px-4 z-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Time Log</h1>
          <div className="text-gray-400 text-sm md:text-base">Log what you did, how long it took, and how valuable it felt.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" passHref legacyBehavior>
            <a className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
              <motion.span
                whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #6366f1, 0 4px 24px #6366f1aa" }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ display: "inline-block" }}
              >
                See Dashboard
              </motion.span>
            </a>
          </Link>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 0 2px #444" }}
            className="px-4 py-2 rounded-full border border-gray-600 text-gray-200 font-semibold bg-black/30 hover:bg-gray-800/60 transition-all shadow-sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all logs for this week?')) {
                setLogs([]);
              }
            }}
          >
            Clear Week
          </motion.button>
        </div>
      </div>
      {/* Input Card */}
      <motion.form
        onSubmit={handleAdd}
        className="relative z-10 max-w-2xl mx-auto mt-10 mb-6 p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 flex flex-col gap-4"
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
            whileTap={{ scale: 0.97, boxShadow: "0 0 0 4px #6366f1" }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 0 4px #6366f1" }}
            className="md:col-span-2 w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4 md:mt-0 relative"
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
        <div className="text-blue-300 text-sm mt-2 text-center">Nice! Logging focus helps you stay intentional.</div>
      </motion.form>
      <motion.div
        className="text-blue-200 text-center italic text-base font-light mt-4 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        “{quoteOfTheDay}”
      </motion.div>
      {/* Entries */}
      <section className="max-w-2xl mx-auto px-4 z-10 relative">
        <AnimatePresence>
          {logs === undefined ? (
            <div className="text-center text-blue-200 py-12">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="w-full flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-stretch mt-8">
              {/* Left Column */}
              <motion.div
                className="flex-1 min-w-[260px] max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center gap-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                {/* Motivational Section */}
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="text-4xl">🧘</div>
                  <div className="text-white text-lg text-center font-semibold">Your week is a blank canvas.</div>
                  <div className="flex items-center gap-2 text-blue-200 text-base text-center">
                    <span className="text-xl">📊</span>
                    Once you log a few entries, we'll show you trends and patterns.
                  </div>
                  <div className="flex items-center gap-2 text-blue-200 text-base text-center">
                    <span className="text-xl">⏳</span>
                    Time logged here never lies — start tracking with intention.
                  </div>
                </div>
                {/* Progress Ring */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#334155" strokeWidth="10" opacity="0.2" />
                      <circle cx="45" cy="45" r="38" fill="none" stroke="#60a5fa" strokeWidth="10" strokeDasharray="238.76" strokeDashoffset="238.76" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s' }} />
                      <text x="45" y="54" textAnchor="middle" fontSize="26" fill="#60a5fa" fontWeight="bold">0%</text>
                    </svg>
                  </motion.div>
                  <div className="text-blue-300 text-sm">Progress this week</div>
                  <div className="text-xs text-gray-400">Logged: 0 min · Goal: 300 min</div>
                </div>
              </motion.div>
              {/* Right Column */}
              <motion.div
                className="flex-1 min-w-[260px] max-w-md flex flex-col items-center gap-8"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {/* Week Start Marker */}
                <motion.div
                  className="flex flex-col items-center mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 mb-1 shadow-lg animate-pulse" />
                  <div className="w-1 h-16 bg-gradient-to-b from-blue-400/80 to-transparent" />
                  <div className="text-blue-200 text-xs mt-2">Your week starts here…</div>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              {(logs || []).map((log) => (
                <motion.div
                  key={log.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl shadow-md p-4 flex flex-col md:flex-row md:items-center gap-2 border border-white/10 group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 4px 32px #6366f133" }}
                >
                  {editingId === log.id ? (
                    <motion.form
                      className="flex-1 flex flex-col md:flex-row md:items-center flex-wrap gap-2 w-full overflow-x-auto"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={e => { e.preventDefault(); handleEditSave(); }}
                    >
                      <input
                        name="task"
                        value={editValues.task}
                        onChange={handleEditChange}
                        ref={editInputRef}
                        className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[120px] max-w-sm flex-[2]"
                      />
                      <input
                        name="duration"
                        type="number"
                        min="1"
                        value={editValues.duration}
                        onChange={handleEditChange}
                        className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[70px] w-auto flex-1"
                      />
                      <select
                        name="category"
                        value={editValues.category}
                        onChange={handleEditChange}
                        className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[70px] w-auto flex-1"
                      >
                        {categories.map((cat) => (
                          <option key={cat}>{cat}</option>
                        ))}
                      </select>
                      <select
                        name="focus"
                        value={editValues.focus}
                        onChange={handleEditChange}
                        className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[70px] w-auto flex-1"
                      >
                        {[1,2,3,4,5].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <select
                        name="value"
                        value={editValues.value}
                        onChange={handleEditChange}
                        className="px-2 py-1 rounded bg-black/40 text-white border border-gray-700 min-w-[70px] w-auto flex-1"
                      >
                        {valueTags.map((tag) => (
                          <option key={tag}>{tag}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white font-semibold">Save</button>
                        <button type="button" onClick={handleEditCancel} className="px-3 py-1 rounded bg-gray-600 text-white font-semibold">Cancel</button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                      <div className="font-semibold text-lg text-white">{log.task}</div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-300 md:ml-4">
                        <span>⏱ {log.duration} min</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 font-bold">{log.category}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-200 font-bold flex items-center gap-1">{focusEmojis[log.focus - 1]} {log.focus}/5</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${log.value === "High" ? "bg-green-700/40 text-green-200" : log.value === "Medium" ? "bg-yellow-700/40 text-yellow-200" : "bg-red-700/40 text-red-200"}`}>{log.value}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <motion.button
                      whileHover={{ scale: 1.15, color: "#f87171" }}
                      className="p-2 rounded-full hover:bg-red-500/20 transition"
                      onClick={() => handleDelete(log.id)}
                      aria-label="Delete entry"
                    >
                      <FiTrash2 className="text-lg text-red-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15, color: "#60a5fa" }}
                      className="p-2 rounded-full hover:bg-blue-500/20 transition"
                      aria-label="Edit entry"
                      onClick={() => handleEdit(log)}
                    >
                      <FiEdit2 className="text-lg text-blue-300" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
