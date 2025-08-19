import React, { useEffect, useMemo, useState } from "react";

const BASE = import.meta.env.BASE_URL; // works on GitHub Pages too

export default function Histology() {
  const [files, setFiles] = useState([]);
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timed, setTimed] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  // load manifest
  useEffect(() => {
    fetch(`${BASE}histology/manifest.json?ts=${Date.now()}`)
      .then(r => r.json())
      .then(names => setFiles(names.sort()))
      .catch(() => setFiles([]));
  }, []);

  // reset timer per slide
  useEffect(() => {
    if (!timed) return;
    setTimeLeft(30);
  }, [i, timed]);

  // countdown
  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timed, i]);

  const src = useMemo(() => (files[i] ? `${BASE}histology/${files[i]}` : null), [files, i]);

  const next = () => {
    setReveal(false);
    setI(prev => (files.length ? (prev + 1) % files.length : 0));
  };

  const markCorrect = () => {
    setReveal(true);
    setXp(x => x + 20 + (timed && timeLeft > 0 ? 5 : 0));
    setStreak(s => s + 1);
  };
  const markWrong = () => {
    setReveal(true);
    setStreak(0);
  };

  if (!files.length) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Histology Trainer</h1>
        <p className="text-zinc-300">No images found. Make sure <code>public/histology/manifest.json</code> exists.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700">Slides: {i + 1}/{files.length}</span>
        <span className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700">XP: {xp}</span>
        <span className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700">Streak: {streak}</span>
        <label className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700">
          <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={timed} onChange={e=>setTimed(e.target.checked)} />
          Timed (30s)
        </label>
        {timed && <span className={`px-3 py-1.5 rounded-xl ${timeLeft>10?"bg-zinc-700":"bg-rose-600/70"} text-white`}>⏱ {String(timeLeft).padStart(2,"0")}s</span>}
      </div>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden border border-zinc-700 bg-black">
        {src && <img src={src} alt={files[i]} className="w-full max-h-[70vh] object-contain" />}
      </div>

      {/* Controls */}
      {!reveal ? (
        <div className="flex gap-2">
          <button onClick={markCorrect} className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white">I knew it</button>
          <button onClick={markWrong} className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white">I guessed</button>
          <button onClick={() => setReveal(true)} className="px-4 py-2.5 rounded-2xl bg-zinc-800 border border-zinc-700">Reveal</button>
          <button onClick={next} className="ml-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white">Next →</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700">
            <span className="text-sm text-zinc-300">Filename:</span> <span className="font-mono">{files[i]}</span>
          </div>
          <button onClick={next} className="ml-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white">Next →</button>
        </div>
      )}

      {/* Hint for where to add labels later */}
      <div className="text-sm text-zinc-400">
        Tip: rename files (or keep a CSV/JSON) with the stain/structure (e.g., <code>hepatocyte_he.png</code>) and show it on Reveal.
      </div>
    </div>
  );
}
