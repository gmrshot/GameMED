
import React, { useEffect, useRef, useState } from "react";

const BASE = (import.meta?.env?.BASE_URL) || "/";

// deterministic rng for decoys
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}

function withCacheKey(url, key){ const sep = url.includes("?") ? "&" : "?"; return `${url}${sep}v=${key}`; }
async function fetchJSON(paths) {
  for (const p of paths) {
    try {
      const r = await fetch(p, { cache: "no-store" });
      if (r.ok) return await r.json();
      console.warn("Histology fetch miss:", p, r.status);
    } catch (e) {
      console.warn("Histology fetch error:", p, e);
    }
  }
  return null;
}

function guessBases(){
  const bases = new Set([BASE, "/"]);
  const parts = (typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean) : []);
  if (parts.length>0){ bases.add(`/${parts[0]}/`); }
  return Array.from(bases);
}

function nice(name){
  return name.replace(/\.[a-z]+$/i,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim().replace(/\b\w/g,s=>s.toUpperCase());
}

export default function Histology(){
  const [files,setFiles]=useState([]);
  const [occl,setOccl]=useState({});
  const [i,setI]=useState(0);
  const [ready,setReady]=useState(false);
  const [game,setGame]=useState(true);
  const [lockPick,setLockPick]=useState(null);
  const [reveal,setReveal]=useState(false);
  const triedSrcRef = useRef({}); // track fallback attempts per image
  const cacheKeyRef = useRef({}); // per-image stable cache key
  const [imgSrc,setImgSrc]=useState("");

  useEffect(()=>{
    (async()=>{
      const bases = guessBases();
      const manifestPaths = [], occlPaths = [];
      bases.forEach(b=>{
        manifestPaths.push(`${b}histology/manifest.json`);
        occlPaths.push(`${b}histology/occlusions.json`);
      });
      const man = await fetchJSON(manifestPaths);
      const list = Array.isArray(man) ? man : (man?.files || []);
      setFiles(list);
      const occ = await fetchJSON(occlPaths) || {};
      setOccl(occ);
      setReady(true);
    })();
  },[]);

  // set a stable cache key and src per image filename; do not change on answer clicks
  useEffect(()=>{
    const cur = files[i];
    if (!cur) return;
    const bases = guessBases();
    const makeSrc = (base)=> `${base}histology/${cur}`;
    const srcCandidates = bases.map(makeSrc);
    if (!cacheKeyRef.current[cur]) cacheKeyRef.current[cur] = Date.now();
    triedSrcRef.current[cur] = 0;
    setImgSrc(withCacheKey(srcCandidates[0], cacheKeyRef.current[cur]));
  },[files, i]);

  if (!ready) return <div className="p-4 text-zinc-300">Loading slides…</div>;
  if (!files.length) return <div className="p-4 text-zinc-300">No slides found. Ensure <code>public/histology/manifest.json</code> lists your images.</div>;

  const cur = files[i];
  const bases = guessBases();
  const makeSrc = (base)=> `${base}histology/${cur}`;
  const srcCandidates = bases.map(makeSrc);

  const onError = () => {
    const tried = triedSrcRef.current[cur] || 0;
    const next = tried + 1;
    if (next < srcCandidates.length){
      triedSrcRef.current[cur] = next;
      cacheKeyRef.current[cur] = Date.now();
      setImgSrc(withCacheKey(srcCandidates[next], cacheKeyRef.current[cur]));
    } else {
      console.error("All histology src candidates failed for", cur, srcCandidates);
    }
  };

  const label = nice(cur);
  const data = occl[cur] || {};

  // Build 4 options (correct + 3 decoys) without hooks
  function buildOptions(){
    const names = files.map(f=>nice(f));
    const correct = label;
    const pool = names.filter(n=>n!==correct);
    const rng = mulberry32(cur.length * 2025);
    const decoys = [];
    while (decoys.length<3 && pool.length){
      const idx = Math.floor(rng()*pool.length);
      decoys.push(pool.splice(idx,1)[0]);
    }
    const arr = [correct, ...decoys];
    const ix = (i+1) % 3;
    if (ix===1) [arr[0],arr[1]]=[arr[1],arr[0]];
    if (ix===2) [arr[0],arr[2]]=[arr[2],arr[0]];
    return arr;
  }
  const options = buildOptions();
  const correctIndex = options.indexOf(label);

  const pick = (k)=>{ if(reveal) return; setLockPick(k); };
  const lockIn = ()=> setReveal(true);
  const next = ()=>{ setReveal(false); setLockPick(null); setI(v=> (v+1<files.length? v+1 : 0)); };
  const prev = ()=>{ setReveal(false); setLockPick(null); setI(v=> (v>0? v-1 : Math.max(0, files.length-1))); };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={game} onChange={()=>setGame(v=>!v)} />
            Game mode
          </label>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl border bg-white/10" onClick={prev}>← Prev</button>
          <button className="px-3 py-2 rounded-xl border bg-white/10" onClick={next}>Next →</button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div className="w-full max-h-[62vh] overflow-auto">
          <img
            src={imgSrc}
            alt="Histology slide"
            className="block w-full h-auto select-none"
            style={{ imageRendering: "auto", transform: "translateZ(0)" }}
            draggable={false}
            onError={onError}
          />
        </div>

        {/* Footer */}
        <div className="p-3 text-sm text-zinc-300 border-t border-white/10">
          {!game ? (
            <div className="flex items-center justify-between">
              <div>{data?.eli5 ? `ELI5: ${data.eli5}` : " "}</div>
              <div className="text-xs text-zinc-400">Slide {i+1}/{files.length}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Slide {i+1}/{files.length} • Pick the best label</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {options.map((opt,idx)=>{
                  const right = reveal && idx===correctIndex;
                  const wrong = reveal && lockPick===idx && idx!==correctIndex;
                  return (
                    <button key={idx} onClick={()=>pick(idx)}
                      className={
                        "text-left px-3 py-2 rounded-xl border transition " +
                        (lockPick===idx ? "bg-white/10 border-white/20 " : "bg-white/5 border-white/10 hover:bg-white/10 ") +
                        (right ? "ring-2 ring-emerald-400 " : "") +
                        (wrong ? "ring-2 ring-rose-400 " : "")
                      }>
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                {!reveal
                  ? <button className="px-3 py-2 rounded-xl border bg-white/10 disabled:opacity-50" disabled={lockPick==null} onClick={lockIn}>Lock In</button>
                  : <span className={(lockPick===correctIndex?"text-emerald-300":"text-rose-300") + " text-sm"}>
                      Correct: {options[correctIndex]}
                    </span>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
