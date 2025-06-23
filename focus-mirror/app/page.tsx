"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiOutlineDocumentText, HiOutlineAdjustmentsHorizontal, HiOutlineChartBar, HiOutlineArrowPath, HiOutlineArrowRight } from "react-icons/hi2";
import Aurora from "./Aurora";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0D0D0D] overflow-hidden">
      {/* Aurora animated background */}
      <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} blend={0.5} amplitude={1.0} speed={0.5} />

      {/* Brand mark/logo */}
      <div className="fixed bottom-6 left-6 z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg select-none">
          N
        </div>
      </div>

      {/* Hero content */}
      <main className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.h1
          className="text-white font-extrabold text-4xl md:text-6xl tracking-tight mb-4 font-sans"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Where is your time really going?
        </motion.h1>
        <motion.p
          className="text-blue-200 italic text-base md:text-lg mb-4 font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          Even a few mindful minutes a day can reshape your week.
        </motion.p>
        <motion.p
          className="text-[#aaa] text-lg md:text-2xl mb-2 font-sans"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          A calm, private mirror for your week. Track, reflect, and grow.
        </motion.p>
        <motion.p
          className="text-[#888] text-base md:text-lg mb-8 font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          Built for thinkers, students, and early builders who want to reflect instead of rush.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          <Link href="/log" passHref legacyBehavior>
            <motion.a
              className="group inline-block px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-sans font-semibold tracking-tight text-xl shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0D0D0D] relative overflow-hidden border border-white/10"
              style={{ boxShadow: "0 4px 32px 0 #6366f133, 0 1.5px 8px 0 #6366f1aa inset" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glass overlay */}
              <span className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-md pointer-events-none z-0" />
              <motion.span
                className="relative transition-all duration-200 group-hover:opacity-80 group-hover:font-bold drop-shadow-md z-10"
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0.8 }}
              >
                Start Tracking
              </motion.span>
              <motion.span
                className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-2xl text-blue-200 z-10"
                initial={{ opacity: 0, x: 8 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                <HiOutlineArrowRight />
              </motion.span>
              {/* Glassy glow ring on hover */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none z-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "0 0 32px 8px #6366f1cc, 0 0 0 2px #a78bfa88, 0 1.5px 8px 0 #6366f1aa inset",
                  filter: "blur(2px)"
                }}
              />
            </motion.a>
          </Link>
        </motion.div>
        {/* Visual Journey Preview (Animated, Heroicons, Sequential) */}
        <motion.div
          className="flex flex-row items-center justify-center gap-2 md:gap-6 mt-8 mb-2 w-full max-w-2xl"
          variants={{
            visible: { transition: { staggerChildren: 0.22, delayChildren: 1.1 } },
            hidden: {}
          }}
          initial="hidden"
          animate="visible"
        >
          {[{
            icon: HiOutlineDocumentText,
            label: "Log your time"
          }, {
            icon: HiOutlineAdjustmentsHorizontal,
            label: "Measure focus"
          }, {
            icon: HiOutlineChartBar,
            label: "Track patterns"
          }, {
            icon: HiOutlineArrowPath,
            label: "Reflect & reset"
          }].map(({ icon: Icon, label }, idx, arr) => (
            <>
              <motion.div
                key={label}
                className="flex flex-col items-center group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-1 bg-gradient-to-tr from-blue-700/30 via-indigo-500/20 to-purple-700/20 group-hover:shadow-lg border border-blue-900/30"
                  animate={{ boxShadow: [
                    "0 0 0 0 #6366f1aa",
                    "0 0 0 8px #6366f122",
                    "0 0 0 0 #6366f1aa"
                  ] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon className="w-6 h-6 text-blue-300 group-hover:text-blue-400 transition" />
                </motion.div>
                <span className="text-xs md:text-sm text-blue-200 group-hover:text-blue-300 transition font-medium text-center max-w-[90px]">{label}</span>
              </motion.div>
              {/* Connector except after last step */}
              {idx < arr.length - 1 && (
                <motion.div
                  className="h-1 w-6 md:w-12 bg-gradient-to-r from-blue-700/30 via-indigo-500/30 to-purple-700/30 rounded-full relative overflow-hidden"
                  style={{ boxShadow: "0 0 8px 2px #6366f1aa" }}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  <motion.div
                    className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-blue-400/40 via-indigo-400/40 to-purple-400/40 opacity-60"
                    animate={{ x: ["-50%", "100%", "-50%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
