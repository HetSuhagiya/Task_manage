"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const COLORS = ["#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#34d399", "#f87171", "#818cf8"];
const categories = [
  "Study",
  "Job Search",
  "Passive",
  "Creative",
  "Fitness",
  "Admin",
  "Other",
];
const focusEmojis = ["😐", "🙂", "😌", "💪", "🔥"];

const COLOR_SCALE = [
  "bg-gray-800", // no entry
  "bg-blue-200", // low
  "bg-blue-400", // moderate
  "bg-indigo-500", // high
  "bg-purple-700" // deep
];

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getDateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("productivity");
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem('focusmirror-logs');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Build heatmap data for the past 365 days
    const days = 365;
    const today = new Date();
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = getDateNDaysAgo(days - 1 - i);
      const dateStr = getDateString(date);
      const dayLogs = logs.filter(l => getDateString(new Date(l.id)) === dateStr);
      const totalMinutes = dayLogs.reduce((a, b) => a + Number(b.duration), 0);
      const avgFocus = dayLogs.length ? (dayLogs.reduce((a, b) => a + Number(b.focus), 0) / dayLogs.length) : 0;
      let value = 0;
      if (totalMinutes === 0) value = 0;
      else if (totalMinutes < 30) value = 1;
      else if (totalMinutes < 90) value = 2;
      else if (totalMinutes >= 90 && avgFocus >= 4) value = 4;
      else value = 3;
      data.push({ date: dateStr, count: value, totalMinutes, avgFocus, logs: dayLogs });
    }
    setHeatmapData(data);
    // Monthly summary
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const monthLogs = logs.filter(l => {
      const d = new Date(l.id);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    if (monthLogs.length) {
      // Most focused day
      const byDay: {[k: string]: {total: number, focus: number, count: number}} = {};
      monthLogs.forEach(l => {
        const d = getDateString(new Date(l.id));
        if (!byDay[d]) byDay[d] = { total: 0, focus: 0, count: 0 };
        byDay[d].total += Number(l.duration);
        byDay[d].focus += Number(l.focus);
        byDay[d].count++;
      });
      let maxFocus = 0, maxDay = "";
      Object.entries(byDay).forEach(([d, v]) => {
        const avg = v.focus / v.count;
        if (avg > maxFocus) {
          maxFocus = avg;
          maxDay = d;
        }
      });
      const daysLogged = Object.keys(byDay).length;
      setSummary(`Your most focused day this month was ${maxDay ? new Date(maxDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "-"}. You logged time for ${daysLogged} of ${new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()} days this month.`);
    } else {
      setSummary("No logs yet this month. Start tracking your day to see this fill up.");
    }
  }, [logs, filter]);

  // Filter logs to this week
  const weekStart = getWeekStart();
  const weekLogs = logs.filter(log => {
    const d = new Date(log.id);
    return d >= weekStart;
  });

  // Pie: category breakdown
  const categoryData = categories.map(cat => ({
    name: cat,
    value: weekLogs.filter(l => l.category === cat).reduce((a, b) => a + Number(b.duration), 0)
  })).filter(d => d.value > 0);

  // Bar: time per day
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayData = days.map((day, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    return {
      day,
      value: weekLogs.filter(l => {
        const d = new Date(l.id);
        return d.getDay() === i;
      }).reduce((a, b) => a + Number(b.duration), 0)
    };
  });

  // Focus/Value: average per day
  const focusData = days.map((day, i) => {
    const logsForDay = weekLogs.filter(l => {
      const d = new Date(l.id);
      return d.getDay() === i;
    });
    return {
      day,
      focus: logsForDay.length ? (logsForDay.reduce((a, b) => a + Number(b.focus), 0) / logsForDay.length).toFixed(2) : 0,
      value: logsForDay.length ? (logsForDay.reduce((a, b) => a + (b.value === "High" ? 3 : b.value === "Medium" ? 2 : 1), 0) / logsForDay.length).toFixed(2) : 0
    };
  });

  // Summary
  const totalTime = weekLogs.reduce((a, b) => a + Number(b.duration), 0);
  const mostFocusedDayIdx = focusData.reduce((maxIdx, d, i, arr) => d.focus > arr[maxIdx].focus ? i : maxIdx, 0);
  const mostCommonCategory = categoryData.length ? categoryData.reduce((a, b) => a.value > b.value ? a : b).name : "-";

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-16 px-2 md:px-0">
      <motion.div
        className="max-w-5xl mx-auto pt-10 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Dashboard</h1>
          <div className="text-gray-400 text-base md:text-lg">See your week at a glance. Trends, patterns, and progress.</div>
        </div>
        <Link href="/log" passHref legacyBehavior>
          <a className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
            Log More Time
          </a>
        </Link>
      </motion.div>
      {/* Productivity Heatmap Calendar */}
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/10 mt-6 mb-10">
        <div className="flex items-center gap-4 mb-4 w-full justify-between">
          <div className="text-blue-200 font-semibold">Productivity Heatmap</div>
          <select className="bg-black/40 text-blue-200 rounded px-3 py-1 border border-blue-900" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="productivity">Productivity (time × focus)</option>
            <option value="time">Total Time</option>
            <option value="focus">Focus Score</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto">
          <CalendarHeatmap
            startDate={getDateNDaysAgo(364)}
            endDate={new Date()}
            values={heatmapData}
            classForValue={v => v ? COLOR_SCALE[v.count] + " rounded" : "bg-gray-800 rounded"}
            tooltipDataAttrs={v => {
              if (!v || !v.date) return { 'data-tip': "No entry" };
              const h = Math.floor((v.totalMinutes || 0) / 60);
              const m = (v.totalMinutes || 0) % 60;
              return {
                'data-tip': `${new Date(v.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${h ? h + 'h ' : ''}${m}m logged · Focus: ${v.avgFocus ? v.avgFocus.toFixed(1) : '-'} / 5`
              };
            }}
            showWeekdayLabels={true}
          />
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-6 mb-2 text-xs text-blue-200">
          <span>Less</span>
          <span className="w-5 h-5 rounded bg-gray-800 border border-gray-700 inline-block" />
          <span className="w-5 h-5 rounded bg-blue-200 border border-blue-100 inline-block" />
          <span className="w-5 h-5 rounded bg-blue-400 border border-blue-300 inline-block" />
          <span className="w-5 h-5 rounded bg-indigo-500 border border-indigo-400 inline-block" />
          <span className="w-5 h-5 rounded bg-purple-700 border border-purple-600 inline-block" />
          <span>More</span>
        </div>
        <div className="text-xs text-blue-300 mb-2">Based on time logged × focus level</div>
        <div className="text-blue-200 text-sm mt-4 text-center w-full">{summary}</div>
      </div>
      {weekLogs.length === 0 ? (
        <motion.div
          className="max-w-2xl mx-auto mt-20 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-5xl mb-2">🪞</div>
          <div className="text-white text-2xl font-semibold text-center">Nothing to reflect on yet.</div>
          <div className="text-blue-200 text-base text-center">Log your first entry to see insights and trends for your week.</div>
          <Link href="/log" passHref legacyBehavior>
            <a className="mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">
              Go to Log
            </a>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Summary Card */}
          <div className="col-span-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col gap-4 items-center border border-white/10">
            <div className="text-lg text-blue-200 font-semibold mb-2">This Week</div>
            <div className="flex flex-col gap-2 items-center">
              <div className="text-4xl font-bold text-white">{totalTime} min</div>
              <div className="text-blue-300 text-sm">Total logged</div>
            </div>
            <div className="flex flex-col gap-1 items-center mt-2">
              <div className="text-base text-white">Most focused: <span className="font-bold text-blue-400">{days[mostFocusedDayIdx]}</span></div>
              <div className="text-base text-white">Top category: <span className="font-bold text-blue-400">{mostCommonCategory}</span></div>
            </div>
          </div>
          {/* Pie Chart */}
          <div className="col-span-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/10">
            <div className="text-lg text-blue-200 font-semibold mb-2">Category Breakdown</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Bar Chart */}
          <div className="col-span-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/10">
            <div className="text-lg text-blue-200 font-semibold mb-2">Time per Day</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="day" stroke="#a5b4fc" />
                <YAxis stroke="#a5b4fc" />
                <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                <ReTooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Focus/Value Chart */}
          <div className="col-span-1 md:col-span-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center border border-white/10">
            <div className="text-lg text-blue-200 font-semibold mb-2">Focus & Value by Day</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={focusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="day" stroke="#a5b4fc" />
                <YAxis stroke="#a5b4fc" />
                <Bar dataKey="focus" fill="#818cf8" radius={[6, 6, 0, 0]} name="Focus" />
                <Bar dataKey="value" fill="#f472b6" radius={[6, 6, 0, 0]} name="Value" />
                <Legend />
                <ReTooltip />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-blue-300 mt-2">Focus: 1-5, Value: 1-3 (High/Med/Low)</div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 