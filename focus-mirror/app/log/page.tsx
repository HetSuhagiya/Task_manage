"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useLockedTaskTimer } from "./useLockedTaskTimer";

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

  const {
    activeTaskId,
    elapsed,
    isLocked,
    startTimer,
    stopTimer,
  } = useLockedTaskTimer();

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
    <div className="min-h-screen bg-[#0D0D0D] relative pb-16 w-full">
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
          className="relative z-10 w-full max-w-2xl mt-6 mb-8 p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 flex flex-col gap-4"
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
          className="text-blue-200 text-left italic text-base font-light mt-2 mb-2 pl-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          “{quoteOfTheDay}”
        </motion.div>
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
                    return (
                      <tr
                        key={log.id}
                        className={`transition-all duration-200 border-b border-white/10 hover:bg-blue-900/20 ${isActive ? "ring-2 ring-blue-400/60 bg-blue-900/30" : ""}`}
                      >
                        {/* Task Name with tooltip or input */}
                        <td className="px-4 py-2 max-w-[260px] align-middle">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isActive}
                              disabled={isLocked && !isActive}
                              onChange={() => {
                                if (!isLocked) startTimer(log.id);
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
                            <motion.span
                              className="px-2 py-1 rounded bg-blue-700/60 text-blue-100 font-mono text-xs md:text-sm shadow animate-pulse min-w-[70px] text-center"
                              initial={{ scale: 0.9, opacity: 0.7 }}
                              animate={{ scale: [0.9, 1.05, 0.98, 1], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            >
                              +{Math.floor(elapsed / 60)} min {elapsed % 60 > 0 ? `${elapsed % 60} sec` : "active"}
                            </motion.span>
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
                            <span className="px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-200 font-bold text-xs text-center w-[80px] inline-block truncate" title={log.category}>{log.category}</span>
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
                                  onClick={() => handleDelete(log.id)}
                                  aria-label="Delete entry"
                                  disabled={isActive}
                                >
                                  <FiTrash2 className="text-lg text-red-400" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.15, color: "#60a5fa" }}
                                  className="p-2 rounded-full hover:bg-blue-500/20 transition flex items-center justify-center"
                                  aria-label="Edit entry"
                                  onClick={() => handleEdit(log)}
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
      </div>
    </div>
  );
}
