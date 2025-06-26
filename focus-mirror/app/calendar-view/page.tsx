"use client";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { FiInfo } from "react-icons/fi";
import { format } from "date-fns";

// Category color mapping (copied from log/page.tsx)
const categoryColorMap: Record<string, { bg: string; text: string; shadow: string; hex: string }> = {
  "Study":      { bg: "bg-blue-500/20",    text: "text-blue-300",    shadow: "shadow-blue-400/40", hex: "#3B82F6" },
  "Job Search": { bg: "bg-purple-500/20",  text: "text-purple-300",  shadow: "shadow-purple-400/40", hex: "#8B5CF6" },
  "Passive":    { bg: "bg-slate-500/20",   text: "text-slate-300",   shadow: "shadow-slate-400/40", hex: "#64748B" },
  "Creative":   { bg: "bg-pink-500/20",    text: "text-pink-300",    shadow: "shadow-pink-400/40", hex: "#EC4899" },
  "Fitness":    { bg: "bg-green-500/20",   text: "text-green-300",   shadow: "shadow-green-400/40", hex: "#10B981" },
  "Admin":      { bg: "bg-amber-500/20",   text: "text-amber-300",   shadow: "shadow-amber-400/40", hex: "#F59E0B" },
  "Other":      { bg: "bg-gray-500/20",    text: "text-gray-300",    shadow: "shadow-gray-400/40", hex: "#6B7280" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 6;
const END_HOUR = 22;

function getStartOfWeek(date: Date) {
  // Monday as first day
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  d.setDate(diff);
  d.setHours(0,0,0,0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const valueTags = ["High", "Medium", "Low"];
const focusLevels = [
  { icon: "😐", label: "1 – Distracted" },
  { icon: "🙂", label: "2 – Unsettled" },
  { icon: "😌", label: "3 – Present" },
  { icon: "💪", label: "4 – Engaged" },
  { icon: "🔥", label: "5 – Deep Focus" },
];

export default function CalendarView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [addModal, setAddModal] = useState<{ open: boolean, dayIdx?: number, hour?: number } | null>(null);
  const [addForm, setAddForm] = useState<any>({
    task: "",
    duration: "60",
    category: "Study",
    focus: 3,
    value: "Medium",
  });
  const [hoveredTask, setHoveredTask] = useState<any | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const [editModal, setEditModal] = useState<{ open: boolean, log?: any } | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("focusmirror-logs");
      if (stored) {
        try {
          setLogs(JSON.parse(stored));
        } catch {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs for the current week
  const weekLogs = logs.filter(log => {
    if (!log.start) return false;
    const start = new Date(log.start);
    return start >= weekStart && start < new Date(weekStart.getTime() + 7*24*60*60*1000);
  });

  // Week navigation handlers
  const goPrevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const goNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  // Week range label
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;

  // Current time indicator logic
  const isCurrentWeek = now >= weekStart && now < addDays(weekStart, 7);
  const currentDayIdx = ((now.getDay() + 6) % 7);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTop = ((currentHour + currentMinute/60) - START_HOUR) * 4; // 4rem per hour

  // Change tooltipPos to store relative coordinates to the grid container
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number, placement: 'top' | 'bottom' } | null>(null);

  // Tooltip positioning logic (now relative to grid)
  useLayoutEffect(() => {
    if (!hoveredTask || !tooltipRef.current || !calendarGridRef.current || !tooltipPos) return;
    const tooltip = tooltipRef.current;
    const grid = calendarGridRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    let x = tooltipPos.x;
    let y = tooltipPos.y;
    let placement: 'top' | 'bottom' = 'top';
    // Default: above, centered
    let left = x - tooltipRect.width / 2;
    let top = y - 12 - tooltipRect.height;
    // Flip below if not enough space above
    if (top < 8) {
      top = y + 12 + 32; // 32 = block height padding
      placement = 'bottom';
    }
    // Shift horizontally if overflowing
    if (left < 8) left = 8;
    if (left + tooltipRect.width > gridRect.width - 8) left = gridRect.width - tooltipRect.width - 8;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = `translateY(${placement === 'top' ? '-8px' : '8px'})`;
  }, [hoveredTask, tooltipPos]);

  // Add task modal handlers
  function openAddModal(dayIdx: number, hour: number) {
    setAddForm({
      task: "",
      duration: "60",
      category: "Study",
      focus: 3,
      value: "Medium",
    });
    setAddModal({ open: true, dayIdx, hour });
  }
  function handleAddFormChange(e: any) {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  }
  function handleAddFormFocusChange(v: number) {
    setAddForm({ ...addForm, focus: v });
  }
  function handleAddSubmit(e: any) {
    e.preventDefault();
    if (!addModal) return;
    // Compose start time from weekStart + dayIdx + hour
    const date = new Date(weekStart);
    date.setDate(date.getDate() + addModal.dayIdx!);
    date.setHours(addModal.hour!, 0, 0, 0);
    const start = date.toISOString();
    const newTask = {
      ...addForm,
      id: Date.now(),
      start,
    };
    const updatedLogs = [...logs, newTask];
    setLogs(updatedLogs);
    localStorage.setItem("focusmirror-logs", JSON.stringify(updatedLogs));
    setAddModal(null);
  }

  function handleDeleteTask(taskId: number) {
    const updatedLogs = logs.filter((log) => log.id !== taskId);
    setLogs(updatedLogs);
    localStorage.setItem("focusmirror-logs", JSON.stringify(updatedLogs));
    setHoveredTask(null);
  }

  function openEditModal(log: any) {
    setEditForm({ ...log });
    setEditModal({ open: true, log });
    setHoveredTask(null);
  }

  function handleEditFormChange(e: any) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleEditFormFocusChange(v: number) {
    setEditForm({ ...editForm, focus: v });
  }

  function handleEditSubmit(e: any) {
    e.preventDefault();
    if (!editModal?.log) return;
    const updatedLogs = logs.map((log) =>
      log.id === editModal.log.id ? { ...editForm, id: log.id, start: log.start } : log
    );
    setLogs(updatedLogs);
    localStorage.setItem("focusmirror-logs", JSON.stringify(updatedLogs));
    setEditModal(null);
  }

  // Build grid: days as columns, hours as rows
  return (
    <div className="min-h-screen bg-[#0D0D0D] relative w-full flex flex-col items-center pb-8">
      <div className="w-full max-w-6xl px-2 md:px-8 mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-4">
          Weekly Calendar
          <span className="text-sm font-normal text-blue-300 bg-white/5 rounded-md px-2 py-1 ml-2" style={{letterSpacing: '0.02em'}}>
            Now: {format(now, 'HH:mm')}
          </span>
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={goPrevWeek} className="px-3 py-1 rounded-full bg-black/40 border border-blue-700 text-blue-200 hover:bg-blue-900/40 transition shadow">← Prev</button>
          <span className="text-blue-300 font-semibold text-base">{weekLabel}</span>
          <button onClick={goNextWeek} className="px-3 py-1 rounded-full bg-black/40 border border-blue-700 text-blue-200 hover:bg-blue-900/40 transition shadow">Next →</button>
        </div>
        <div className="text-blue-300 mb-6">Time-blocked view of your week. Tasks are placed by start time and duration.</div>
        {/* Calendar grid container */}
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md relative" style={{ minHeight: 600 }} ref={calendarGridRef}>
          <div className="flex w-[900px] md:w-full">
            {/* Day headers */}
            <div className="w-16 flex-shrink-0" />
            {DAYS.map((day, i) => (
              <div key={day} className="flex-1 text-center py-3 font-semibold text-blue-200 text-sm border-b border-white/10">
                {day}
              </div>
            ))}
          </div>
          <div className="flex w-[900px] md:w-full relative" style={{ minHeight: 600 }}>
            {/* Horizontal grid lines */}
            <div className="absolute left-16 right-0 top-0 bottom-0 z-0 pointer-events-none" style={{height: '100%'}}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: `calc(${(i)/(END_HOUR-START_HOUR)*100}% )`,
                    left: 0,
                    right: 0,
                    borderTop: '1px solid #ffffff12',
                    width: '100%',
                    zIndex: 0,
                  }}
                />
              ))}
            </div>
            {/* Time labels */}
            <div className="w-16 flex-shrink-0 flex flex-col">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <div key={i} className="h-16 text-xs text-blue-400 pl-1 pt-2 border-t border-white/5">
                  {String(START_HOUR + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {/* Calendar columns */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex-1 border-l border-white/10 relative">
                {/* Render clickable empty cells */}
                {Array.from({ length: END_HOUR - START_HOUR }, (_, hourIdx) => {
                  const hour = START_HOUR + hourIdx;
                  // Check if a task block already covers this slot
                  const hasTask = weekLogs.some(log => {
                    const d = new Date(log.start);
                    const logDay = (d.getDay() + 6) % 7;
                    const logHour = d.getHours();
                    const logMin = d.getMinutes();
                    const logDuration = parseInt(log.duration, 10);
                    const logEnd = new Date(d.getTime() + logDuration*60000);
                    return logDay === dayIdx && hour >= logHour && hour < logEnd.getHours();
                  });
                  if (hasTask) return null;
                  return (
                    <div
                      key={hour}
                      className="absolute left-2 right-2 cursor-pointer z-10"
                      style={{
                        top: `${(hour-START_HOUR)*4}rem`,
                        height: `4rem`,
                        background: 'transparent',
                      }}
                      onClick={() => openAddModal(dayIdx, hour)}
                    />
                  );
                })}
                {/* Place tasks for this day */}
                {weekLogs.filter(log => {
                  const d = new Date(log.start);
                  return d.getDay() === ((dayIdx + 1) % 7); // Monday=0, Sunday=6
                }).map(log => {
                  const d = new Date(log.start);
                  const hour = d.getHours();
                  const minute = d.getMinutes();
                  const top = ((hour + minute/60) - START_HOUR) * 4; // 4rem per hour
                  const height = (parseInt(log.duration, 10) / 60) * 4; // 4rem per hour
                  const color = categoryColorMap[log.category]?.hex || '#6366f1';
                  const end = new Date(d.getTime() + parseInt(log.duration, 10)*60000);
                  return (
                    <motion.div
                      key={log.id}
                      className="absolute left-2 right-2 rounded-xl shadow-lg cursor-pointer"
                      style={{
                        top: `${top}rem`,
                        height: `${height}rem`,
                        background: `${color}33`,
                        border: `1.5px solid ${color}99`,
                        backdropFilter: 'blur(6px)',
                        boxShadow: `0 4px 24px 0 ${color}44`,
                        transition: 'all 0.2s',
                        zIndex: 2,
                      }}
                      whileHover={{ scale: 1.04, boxShadow: `0 0 0 3px ${color}88, 0 4px 32px ${color}55` }}
                      onClick={() => setSelectedTask(log)}
                      onMouseEnter={e => {
                        setHoveredTask({ ...log, end });
                        if (calendarGridRef.current) {
                          const gridRect = calendarGridRef.current.getBoundingClientRect();
                          const blockRect = (e.target as HTMLElement).getBoundingClientRect();
                          // Center x of block relative to grid
                          let x = blockRect.left - gridRect.left + blockRect.width / 2;
                          // Top of block relative to grid
                          let y = blockRect.top - gridRect.top;
                          setTooltipPos({ x, y, placement: 'top' });
                        }
                      }}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      <div className="p-2 text-xs font-semibold text-white/90 flex items-center gap-2">
                        <span className="truncate">{log.task}</span>
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: color+"22", color }}>{log.category}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
            {/* Tooltip for task hover */}
            {hoveredTask && tooltipPos && (
              <div
                ref={tooltipRef}
                className="absolute z-[120] px-4 py-3 rounded-xl shadow-xl border border-blue-700/40 bg-[#181c2b] text-blue-100 text-xs font-semibold pointer-events-none animate-fadein"
                style={{
                  left: 0,
                  top: 0,
                  opacity: 0,
                  minWidth: 180,
                  maxWidth: 260,
                  boxShadow: '0 0 16px 2px #6366f1aa',
                  background: 'rgba(24,28,43,0.98)',
                  color: '#c7d2fe',
                  borderRadius: 14,
                  border: '1px solid #334155',
                  pointerEvents: 'none',
                  fontSize: 13,
                  zIndex: 120,
                  transition: 'opacity 0.18s, transform 0.18s',
                }}
              >
                <div className="font-bold text-base mb-1 text-blue-200 truncate" style={{fontSize:14}}>{hoveredTask.task}</div>
                <div className="mb-1">{format(new Date(hoveredTask.start), 'EEE, HH:mm')} – {format(new Date(hoveredTask.end), 'HH:mm')}</div>
                <div className="mb-1"><span className="font-semibold">Category:</span> {hoveredTask.category}</div>
                <div className="mb-1"><span className="font-semibold">Value:</span> {hoveredTask.value}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-700/80 text-white text-xs font-semibold shadow hover:bg-blue-600/90 transition"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => openEditModal(hoveredTask)}
                  >Edit</button>
                  <button
                    className="px-3 py-1 rounded bg-red-600/80 text-white text-xs font-semibold shadow hover:bg-red-500/90 transition"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => handleDeleteTask(hoveredTask.id)}
                  >Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Task details modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedTask(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181c2b] rounded-2xl shadow-2xl border border-blue-700/40 p-6 min-w-[320px] max-w-[90vw] text-blue-100 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-lg font-bold text-blue-200 mb-2 flex items-center gap-2"><FiInfo /> Task Details</div>
            <div className="mb-2"><span className="font-semibold">Task:</span> {selectedTask.task}</div>
            <div className="mb-2"><span className="font-semibold">Category:</span> {selectedTask.category}</div>
            <div className="mb-2"><span className="font-semibold">Start:</span> {new Date(selectedTask.start).toLocaleString()}</div>
            <div className="mb-2"><span className="font-semibold">Duration:</span> {selectedTask.duration} min</div>
            {selectedTask.steps && <div className="mb-2"><span className="font-semibold">Steps:</span> {selectedTask.steps}</div>}
            {selectedTask.nextAction && <div className="mb-2"><span className="font-semibold">Next Action:</span> {selectedTask.nextAction}</div>}
            <button
              className="absolute top-2 right-2 text-blue-300 hover:text-blue-100 text-xl font-bold focus:outline-none"
              onClick={() => setSelectedTask(null)}
              aria-label="Close details"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
      {/* Add Task Modal */}
      {addModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setAddModal(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181c2b] rounded-2xl shadow-2xl border border-blue-700/40 p-6 min-w-[320px] max-w-[90vw] text-blue-100 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-lg font-bold text-blue-200 mb-2">Add Task</div>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Task Name</label>
                <input
                  name="task"
                  value={addForm.task}
                  onChange={handleAddFormChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="e.g. Calculus review"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Duration (min)</label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={addForm.duration}
                  onChange={handleAddFormChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="45"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Category</label>
                <select
                  name="category"
                  value={addForm.category}
                  onChange={handleAddFormChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {Object.keys(categoryColorMap).map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Focus</label>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  {focusLevels.map((level, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddFormFocusChange(i + 1)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-all ${addForm.focus === i + 1 ? "bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-400/60" : "bg-black/30 border-gray-700 text-gray-500 hover:bg-gray-700/60"}`}
                      aria-label={`Focus level ${i + 1}`}
                    >
                      {level.icon}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-blue-300 text-center min-h-[1.5em]">{focusLevels[addForm.focus - 1].label}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Value</label>
                <select
                  name="value"
                  value={addForm.value}
                  onChange={handleAddFormChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {valueTags.map((tag) => (
                    <option key={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
              >
                Add Task
              </button>
            </form>
            <button
              className="absolute top-2 right-2 text-blue-300 hover:text-blue-100 text-xl font-bold focus:outline-none"
              onClick={() => setAddModal(null)}
              aria-label="Close add task"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
      {editModal?.open && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditModal(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#181c2b] rounded-2xl shadow-2xl border border-blue-700/40 p-6 min-w-[320px] max-w-[90vw] text-blue-100 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-lg font-bold text-blue-200 mb-2">Edit Task</div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Task Name</label>
                <input
                  name="task"
                  value={editForm.task}
                  onChange={handleEditFormChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="e.g. Calculus review"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Duration (min)</label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={editForm.duration}
                  onChange={handleEditFormChange}
                  required
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-400"
                  placeholder="45"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditFormChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {Object.keys(categoryColorMap).map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Focus</label>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  {focusLevels.map((level, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleEditFormFocusChange(i + 1)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-all ${editForm.focus === i + 1 ? "bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-400/60" : "bg-black/30 border-gray-700 text-gray-500 hover:bg-gray-700/60"}`}
                      aria-label={`Focus level ${i + 1}`}
                    >
                      {level.icon}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-blue-300 text-center min-h-[1.5em]">{focusLevels[editForm.focus - 1].label}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-blue-200 text-xs mb-1">Value</label>
                <select
                  name="value"
                  value={editForm.value}
                  onChange={handleEditFormChange}
                  className="px-3 py-2 rounded-lg bg-black/40 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {valueTags.map((tag) => (
                    <option key={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
              >
                Save Changes
              </button>
            </form>
            <button
              className="absolute top-2 right-2 text-blue-300 hover:text-blue-100 text-xl font-bold focus:outline-none"
              onClick={() => setEditModal(null)}
              aria-label="Close edit task"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
} 