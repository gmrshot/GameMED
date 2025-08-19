import React, { useEffect, useMemo, useState, useRef } from "react";

/* =========================================================
   Utilities (no external libs)
========================================================= */
const cx = (...a) => a.filter(Boolean).join(" ");
const randInt = (n) => Math.floor(Math.random() * n);
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(arr, seed){const a=[...arr];const rnd=mulberry32(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()* (i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const now = () => Date.now();
const minutes = (n) => n*60*1000;
const hours = (n) => n*60*60*1000;
const ShakeCSS = () => (<style>{`@keyframes shake{0%{transform:translateX(0)}25%{transform:translateX(-3px)}50%{transform:translateX(3px)}75%{transform:translateX(-2px)}100%{transform:translateX(0)}}`}</style>);

/* =========================================================
   Branding
========================================================= */
const APP_TITLE = "GameMED";

/* =========================================================
   Topic Groups & Subtopics
   - Toggle a group ON to reveal subtopics (e.g., Amino Acids)
========================================================= */
const AMINO_SUBTOPICS = [
  { id: "denaturation", title: "Denaturation & Renaturation", ref: "p.4 Denaturation (melting)", bullets: [
    { color: "blue", text: "High GC = High Tm (stronger glue).", el5: "GC pairs have 3 hooks vs AT 2 hooks. More hooks = needs more heat to split." },
    { color: "blue", text: "Hyperchromic shift at 260 nm when DNA melts.", el5: "Melted DNA looks brighter at 260 — like pages fanned out catching more light." },
    { color: "green", text: "Renaturation needs slow cooling + salt.", el5: "Give exes time and the right vibes (salt) and they get back together correctly." },
  ], terms: [
    { term: "Tm", explain: "Melting temp where ~50% of DNA is unzipped." },
    { term: "GC", explain: "G≡C uses 3 H-bonds vs A=T (2)." },
  ]},
  { id: "hybridization", title: "Hybridization & Stringency", ref: "p.5 Hybridization", bullets: [
    { color: "blue", text: "High stringency = picky match (↑temp, ↓salt).", el5: "Hot + low salt = only soulmates pair up." },
    { color: "green", text: "Low stringency tolerates mismatches.", el5: "Cool + salty = anyone with similar haircut gets a date." },
  ], terms: [{ term: "Stringency", explain: "High stringency = only exact match; low = similar ok." }]},
  { id: "prokDNA", title: "Prokaryotic DNA", ref: "p.6 Prokaryotic DNA", bullets: [
    { color: "blue", text: "Closed circular, negatively supercoiled.", el5: "Bacterial DNA = tiny rubber band, twisted to stay compact." },
    { color: "blue", text: "Gyrase (Topo II) introduces negative supercoils (ATP).", el5: "Gyrase kneads twists in (target of cipro)." },
  ], terms: [{ term: "Gyrase", explain: "Topo II in bacteria; target of ciprofloxacin." }]},
  { id: "eukDNA", title: "Eukaryotic DNA", ref: "p.7 Eukaryotic DNA", bullets: [
    { color: "blue", text: "Linear chromosomes with telomeres (3' overhangs).", el5: "Ends have shoelace tips so they don’t fray." },
    { color: "green", text: "Introns removed; exons expressed.", el5: "Cut the bloopers (introns), keep the scenes (exons)." },
  ], terms: [{ term: "Telomeres", explain: "Shoelace tips; telomerase maintains repeats." }]},
  { id: "repeats", title: "Repetitive DNA", ref: "p.8–9 Repetitive DNA", bullets: [
    { color: "blue", text: "Microsatellites = 2–6 bp; Minisatellites = 10–100 bp.", el5: "Short drum beats vs longer drum loops." },
    { color: "green", text: "LINEs (~5–6 kb) & SINEs (~100–200 nt).", el5: "Long vs short hitchhikers in the genome." },
    { color: "green", text: "Some triplet repeats (CAG/CTG, CGG/CCG) cause disease.", el5: "Triplet tongue-twisters that, when overdone, break stuff." },
  ], terms: [{ term: "VNTR", explain: "Minisatellites used in forensics." }]},
  { id: "chromatin", title: "Chromatin & Nucleosome", ref: "p.10 Chromatin", bullets: [
    { color: "blue", text: "~150 bp wraps histone octamer; H1 guards linker DNA.", el5: "DNA wraps yarn around a spool; H1 clips between spools." },
    { color: "green", text: "Euchromatin = open/active; Heterochromatin = silent.", el5: "Open book vs locked safe." },
  ], terms: [{ term: "H1", explain: "Hall monitor between nucleosomes." }]},
  { id: "epigenetics", title: "Epigenetics: DNA & Histones", ref: "p.11–14 Epigenetic Modifications", bullets: [
    { color: "blue", text: "Promoter CpG methylation → gene OFF.", el5: "Tape over the light switch." },
    { color: "blue", text: "Histone acetylation → open chromatin (ON).", el5: "Loosens DNA’s hug so polymerase can get in." },
    { color: "green", text: "H3K4me3 activates; H3K27me3 represses.", el5: "Depends on the address on histone tails." },
  ], terms: [
    { term: "CpG island", explain: "CG clusters near promoters; methyl marks silence." },
    { term: "HDAC inhibitor", explain: "Takes off the silence muffler → genes speak up." },
  ]},
  { id: "rna-structure", title: "RNA Structure & Functions", ref: "p.15–16 RNA", bullets: [
    { color: "blue", text: "Mostly single-stranded; folds with antiparallel stems.", el5: "One noodle folding on itself." },
    { color: "green", text: "rRNA catalyzes peptide bonds (ribozyme).", el5: "RNA swings the catalytic hammer in the ribosome." },
  ], terms: [{ term: "Ribozyme", explain: "RNA that works as enzyme." }]},
  { id: "rna-types", title: "RNA Types & Key Facts", ref: "p.17–22 Types of RNA", bullets: [
    { color: "blue", text: "Abundance: rRNA ≫ tRNA ≫ mRNA.", el5: "Furniture >> delivery >> guest." },
    { color: "blue", text: "mRNA (euk): 5' cap + poly(A). Prok: often polycistronic.", el5: "Euk message wears CAP & TAIL; bacteria ride a bus." },
    { color: "green", text: "tRNA ends with 3'-CCA (amino acid hook).", el5: "Universal parking spot labeled C-C-A." },
  ], terms: [
    { term: "16S rRNA", explain: "Helps spot first codon." },
    { term: "CCA tail", explain: "3' end of tRNA that binds amino acid." },
  ]},
  { id: "regRNAs", title: "Regulatory RNAs (miRNA, lncRNA)", ref: "p.24 Regulatory RNAs", bullets: [
    { color: "blue", text: "miRNA: post-transcriptional silencing.", el5: "Tiny bouncers: tear up the message or block ribosomes." },
    { color: "blue", text: "Xist lncRNA coats an X → silences it.", el5: "A chromosome-sized blanket." },
  ], terms: [
    { term: "miRNA", explain: "19–25 nt regulators of translation." },
    { term: "Xist", explain: "lncRNA that silences one X." },
  ]},
];

const TOPIC_GROUPS = [
  { id: "amino", title: "Amino Acids", enabledByDefault: true, subtopics: AMINO_SUBTOPICS },
];

/* =========================================================
   Vignettes — (same 50 as before, truncated here for brevity)
   NOTE: Keep RAW_VIGNETTES content identical to your original.
========================================================= */
const RAW_VIGNETTES = [
  { id: 1, stem: "A 24-year-old woman with suspected monogenic hearing loss has a negative hybridization-based screen despite a strong family history. The lab used a low-stringency protocol. Which best explains the false-negative?", choices: ["Hybridization at low stringency tolerates mismatches and may not discriminate single–base changes","Denaturation at high temperature causes DNA depurination","High salt prevents any duplex formation","Only RNA can hybridize under these conditions","Hybridization requires ligase activity to detect variants"], answer: 0, explanation: "Low-stringency (lower temp, higher salt) tolerates mismatches—poor for point mutations." },
  { id: 2, stem: "A researcher compares melting temperatures (Tm) of two DNA fragments. Fragment A is 70% GC; Fragment B is 40% GC. Which is true?", choices: ["Fragment A has a higher Tm due to greater GC content","Fragment B has a higher Tm due to more AT pairs","Tm is independent of base composition","Tm depends only on length, not GC%","Tm only applies to RNA duplexes"], answer: 0, explanation: "Higher GC% raises Tm (3 H-bonds vs 2)." },
  // ... (keep all the way to id:50 unchanged)
  { id: 50, stem: "Euk vs prok mRNA feature:", choices: ["Eukaryotic mRNA has 5' cap (5'–5') and 3' poly(A); prokaryotic often polycistronic and lacks these","Both polycistronic and capped","Prok mRNA has 5' cap and poly(A)","Euk mRNA always polycistronic","Prok mRNA capped via 5'–5'"], answer: 0, explanation: "Euk cap+polyA; prok often no cap/polyA." },
];

/* =========================================================
   Auto-tag vignettes to subtopics for filtering
========================================================= */
const LEVEL_GUESSERS = [
  { re: /(denatur|hyperchrom|Tm|renatur|melting)/i, id: "denaturation" },
  { re: /(hybridiz|stringenc)/i, id: "hybridization" },
  { re: /(gyrase|cipro|prokaryot|supercoil)/i, id: "prokDNA" },
  { re: /(telomer|exon|intron|eukaryot)/i, id: "eukDNA" },
  { re: /(microsatellite|minisatellite|VNTR|LINE|SINE|repeat)/i, id: "repeats" },
  { re: /(nucleosome|histone|H1|chromatin|euchromatin|heterochromatin)/i, id: "chromatin" },
  { re: /(CpG|methyl|acetyl|H3K4|H3K27|HDAC|DNMT|epigenet)/i, id: "epigenetics" },
  { re: /\bRNA\b.*(structure|fold|ribozyme)/i, id: "rna-structure" },
  { re: /\b(rRNA|tRNA|mRNA|poly\(A\)|cap|Shine)/i, id: "rna-types" },
  { re: /(miRNA|lncRNA|Xist|silenc)/i, id: "regRNAs" },
];

const VIGNETTES = RAW_VIGNETTES.map((v) => {
  const idxs = v.choices.map((_, i) => i);
  const shuffledIdxs = seededShuffle(idxs, v.id * 1337);
  const choices = shuffledIdxs.map(i => v.choices[i]);
  const correctIndex = shuffledIdxs.indexOf(v.answer);
  const hit = LEVEL_GUESSERS.find(g => g.re.test(v.stem));
  const topicId = hit ? hit.id : null;
  return { ...v, choices, correctIndex, topicId };
});

/* =========================================================
   Helpers to pull ELI5 lines and subtopic lookup
========================================================= */
function flattenSubtopics(groups){ return groups.flatMap(g=>g.subtopics.map(st=>({ ...st, groupId: g.id, groupTitle: g.title }))); }
const ALL_SUBTOPICS = flattenSubtopics(TOPIC_GROUPS);
function getSubtopicById(id){ return ALL_SUBTOPICS.find(s=>s.id===id) || null; }
function getELI5(id){
  const st = getSubtopicById(id);
  const first = st?.bullets?.find(b=>b.el5)?.el5;
  return first || "ELI5 = a super-simple, friendly explanation.";
}

/* =========================================================
   UI atoms
========================================================= */
const HeartBar = ({ lives }) => (
  <div className="flex gap-1 items-center" title="Lives">
    {Array.from({ length: 3 }).map((_, i) => (
      <span key={i} className={cx("text-2xl", i < lives ? "opacity-100" : "opacity-30")}>❤️</span>
    ))}
  </div>
);
const XpBar = ({ xp }) => (
  <div className="w-full h-4 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden" title="XP toward next level">
    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${Math.min(100, (xp % 100))}%` }} />
  </div>
);
const Button = ({ className="", ...props }) => (
  <button {...props} className={cx("px-4 py-2.5 rounded-2xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-base", className)} />
);
const Primary = ({ className="", ...props }) => (
  <button {...props} className={cx("px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 text-base", className)} />
);

/* =========================================================
   Timer Hook
========================================================= */
function useCountdown(active, seconds, deps = []) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef(null);

  useEffect(() => { setTimeLeft(seconds); }, deps); // reset on deps change

  useEffect(() => {
    if (!active) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active, seconds, ...deps]);
  return timeLeft;
}

/* =========================================================
   Vignette card (ELI5 + Confidence check + optional timer)
========================================================= */
const VignetteCard = ({
  v, initialPick, initialSubmitted,
  onPick, onSubmit, onUnsubmit,
  showConfidence = true,
  onConfidence,               // (knew:boolean)
  timed = false,
  onTimeout,                  // called when timer hits 0 without submission
  bonusForTime = 0,
}) => {
  const [picked, setPicked] = useState(initialPick ?? null);
  const [submitted, setSubmitted] = useState(!!initialSubmitted);
  const [confidence, setConfidence] = useState(null); // 'knew' | 'guessed' | null

  useEffect(() => { setPicked(initialPick ?? null); setSubmitted(!!initialSubmitted); setConfidence(null); }, [v?.id, initialPick, initialSubmitted]);
  if (!v) return null;
  const isCorrect = picked === v.correctIndex;

  const timeLeft = useCountdown(timed && !submitted, 60, [v?.id]); // 60s per vignette
  useEffect(() => {
    if (timed && !submitted && timeLeft === 0) {
      onTimeout?.(); // parent decides hearts/xp penalty
      setSubmitted(true);
    }
  }, [timeLeft, timed, submitted, onTimeout]);

  const submitClick = () => {
    if (picked == null) return;
    setSubmitted(true);
    onSubmit?.(picked, picked === v.correctIndex, (timed && timeLeft>0) ? bonusForTime : 0);
  };

  const clickChoice = (i) => {
    if (submitted) { setSubmitted(false); onUnsubmit?.(); setConfidence(null); }
    setPicked(i); onPick?.(i);
  };

  const setConf = (type) => {
    setConfidence(type);
    onConfidence?.(type === "knew");
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="text-zinc-100 text-xl font-semibold mb-4 leading-relaxed">{v.stem}</div>
        {timed && (
          <div className={cx("px-3 py-1.5 rounded-xl text-sm font-semibold",
            timeLeft>20?"bg-zinc-700 text-white":timeLeft>10?"bg-amber-600/70 text-white":"bg-rose-600/80 text-white")}
            title="Time left"
          >
            ⏱ {String(timeLeft).padStart(2,"0")}s
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {v.choices.map((c, i) => (
          <button key={i} onClick={() => clickChoice(i)}
            className={cx("text-left px-4 py-3.5 rounded-2xl border transition text-[17px] leading-relaxed",
              picked === i ? "bg-zinc-700 border-zinc-500" : "bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800",
              submitted && picked === i && (isCorrect ? "ring-2 ring-emerald-400" : "animate-[shake_0.2s_ease-in-out_2] ring-2 ring-rose-400")
            )}>
            <span className="text-zinc-100">{c}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {!submitted ? (
          <Primary onClick={submitClick} disabled={picked==null}>
            Submit
          </Primary>
        ) : (
          <div className={cx("mt-3 p-4 rounded-xl text-base leading-relaxed", isCorrect ? "bg-emerald-600/20 text-emerald-300" : "bg-rose-600/20 text-rose-300")}>
            {isCorrect ? "Correct!" : "Not quite."}
            <div className="mt-2 text-zinc-200">{v.explanation}</div>

            {showConfidence && (
              <div className="mt-3 flex gap-2">
                <span className="text-zinc-300 mr-1">Confidence:</span>
                <Button className={cx(confidence==="guessed"?"bg-zinc-700 border-zinc-500":"")} onClick={()=>setConf("guessed")}>I guessed</Button>
                <Button className={cx(confidence==="knew"?"bg-zinc-700 border-zinc-500":"")} onClick={()=>setConf("knew")}>I knew it</Button>
              </div>
            )}

            <details className="mt-3 bg-zinc-900/70 border border-zinc-700 rounded-xl p-3 text-zinc-100">
              <summary className="cursor-pointer select-none text-base">
                Explain like I’m 5 <span className="text-xs text-zinc-400">(ELI5)</span>
              </summary>
              <div className="mt-2 text-zinc-300 text-[16px] leading-relaxed">
                {v.topicId ? getELI5(v.topicId) : "ELI5 = a super-simple, friendly explanation."}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Boss Fight — adds Hint/Second Chance + optional timer
========================================================= */
const BossFight = ({
  onClose, onDone, topicFilter,
  timed=false, grantBonusXP=5,
  powerUps, usePowerUp, // {hint:number, second:number}, function(name)
  prioritizeLowConfidenceIds = new Set(), // prefer sampling from these
}) => {
  const pool = useMemo(() => {
    const subset = topicFilter && topicFilter.size
      ? VIGNETTES.filter(v => v.topicId && topicFilter.has(v.topicId))
      : VIGNETTES;

    // prefer low-confidence/incorrect topics if provided
    let weighted = subset;
    if (prioritizeLowConfidenceIds.size) {
      const pri = subset.filter(v => v.topicId && prioritizeLowConfidenceIds.has(v.topicId));
      const rest = subset.filter(v => !v.topicId || !prioritizeLowConfidenceIds.has(v.topicId));
      weighted = [...pri, ...pri, ...rest]; // duplicate pri to weight
    }

    const NEED = 5;
    if (weighted.length === 0) return [];
    if (weighted.length >= NEED) {
      const set = new Set();
      while (set.size < NEED) set.add(weighted[randInt(weighted.length)]);
      return Array.from(set);
    }
    const out = [];
    for (let i=0;i<NEED;i++){ out.push(weighted[randInt(weighted.length)]); }
    return out;
  }, [topicFilter, prioritizeLowConfidenceIds]);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [usedSecondChance, setUsedSecondChance] = useState(false);
  const [eliminated, setEliminated] = useState(new Set()); // indices eliminated by hint
  const v = pool[i];
  const correct = picked === (v?.correctIndex);

  const timeLeft = useCountdown(timed && !submitted, 60, [v?.id]);

  useEffect(() => { setEliminated(new Set()); setUsedSecondChance(false); }, [i]);
  useEffect(() => {
    if (timed && !submitted && timeLeft === 0) {
      // time up counts as incorrect unless Second Chance used
      if (powerUps.second > 0 && !usedSecondChance) {
        usePowerUp("second");
        setUsedSecondChance(true);
        // Give another 15 seconds grace
        // eslint-disable-next-line no-undef
        alert("Second Chance! ⏱ +15s");
      } else {
        setSubmitted(true);
      }
    }
  }, [timeLeft, timed, submitted, powerUps, usedSecondChance, usePowerUp]);

  const finish = () => { onClose(); onDone?.(score); };
  if (!pool.length) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="max-w-xl w-full mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-center">
          <div className="text-2xl font-semibold mb-2">No questions in the selected topics yet</div>
          <div className="text-zinc-400 mb-4">Try selecting different subtopics.</div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const useHint = () => {
    if (powerUps.hint <= 0) return;
    const wrongIdxs = v.choices.map((_, idx) => idx).filter(idx => idx !== v.correctIndex && !eliminated.has(idx));
    if (!wrongIdxs.length) return;
    const toEliminate = wrongIdxs[randInt(wrongIdxs.length)];
    const s = new Set(eliminated); s.add(toEliminate); setEliminated(s);
    usePowerUp("hint");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-3xl w-full mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Boss Fight ⚔️</h3>
          <div className="flex items-center gap-2">
            {timed && <div className="px-3 py-1.5 rounded-xl bg-zinc-700 text-white text-sm">⏱ {String(timeLeft).padStart(2,"0")}s</div>}
            <Button onClick={finish}>Exit</Button>
          </div>
        </div>
        <div className="text-base text-zinc-400 mb-3">Question {i+1} / {pool.length} • Score: {score}</div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">🔮 Hint: {powerUps.hint}</span>
          <span className="text-sm px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">🕊 Second Chance: {powerUps.second}</span>
          <Button onClick={useHint} disabled={powerUps.hint<=0}>Use Hint</Button>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700">
          <div className="text-zinc-100 font-semibold mb-3 text-lg leading-relaxed">{v.stem}</div>
          <div className="grid gap-3">
            {v.choices.map((c, idx) => {
              const isEliminated = eliminated.has(idx);
              return (
                <button key={idx}
                        onClick={() => { if (!isEliminated) setPicked(idx); }}
                        className={cx("text-left px-4 py-3.5 rounded-2xl border text-[17px] leading-relaxed",
                          picked === idx ? "bg-zinc-700 border-zinc-500" : "bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800",
                          isEliminated && "opacity-40 line-through pointer-events-none")}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2 items-center">
            {!submitted ? (
              <Primary onClick={() => {
                if (picked==null) return;
                if (picked === v.correctIndex) {
                  setScore(s=>s+1);
                } else {
                  // Wrong → try Second Chance if available and not yet used on this Q
                  if (powerUps.second>0 && !usedSecondChance) {
                    usePowerUp("second");
                    setUsedSecondChance(true);
                    // eslint-disable-next-line no-undef
                    alert("Second Chance used! Try again.");
                    return;
                  }
                }
                setSubmitted(true);
              }} disabled={picked==null}>Submit</Primary>
            ) : (
              <div className={cx("px-3 py-2 rounded-xl text-base", correct?"bg-emerald-600/20 text-emerald-300":"bg-rose-600/20 text-rose-300")}>
                {correct ? `Correct${(timed && timeLeft>0)?` +${grantBonusXP} XP for speed!`:''}` : "Nope"}
              </div>
            )}
            {submitted && (
              <Primary className="bg-sky-600 hover:bg-sky-500" onClick={() => {
                if (i < pool.length - 1){ setI(i+1); setPicked(null); setSubmitted(false); }
                else { finish(); }
              }}>Next</Primary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Topic modal (unchanged)
========================================================= */
const BulletLine = ({ b }) => {
  const [open, setOpen] = useState(false);
  const color = b.color==="blue"?"text-sky-300": b.color==="green"?"text-emerald-300":"text-zinc-300";
  return (
    <li className={cx("text-[16px] leading-relaxed", color)}>
      • {b.text}
      {b.el5 && (
        <>
          <button onClick={()=>setOpen(!open)} className="ml-2 text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">ELI5 <span className="text-[10px] text-zinc-400">(Explain Like I’m 5)</span></button>
          {open && <div className="mt-2 text-zinc-300 bg-zinc-900/70 border border-zinc-700 rounded-xl p-3 text-[16px]">{b.el5}</div>}
        </>
      )}
    </li>
  );
};

const TopicModal = ({ topic, onClose, onDone }) => {
  if (!topic) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-semibold">{topic.title}</h3>
          <div className="flex gap-2">
            <Button onClick={onClose}>Close</Button>
            <Primary onClick={() => { onDone?.(); onClose(); }}>Mark Topic Done ✅</Primary>
          </div>
        </div>
        <div className="text-sm text-zinc-400 mb-4">Reference: {topic.ref}</div>
        <ul className="space-y-2">
          {topic.bullets.map((b, i) => <BulletLine key={i} b={b} />)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {topic.terms?.map((t, i) => (
            <span key={i} className="text-sm px-2.5 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200">
              💭 {t.term}: <span className="text-zinc-400">{t.explain}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Tutorial
========================================================= */
const Tutorial = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-semibold">Quick Tutorial 🚀</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
        <ol className="space-y-3 text-[16px] leading-relaxed text-zinc-200">
          <li>1) Toggle a <b>Topic Group</b> ON to reveal its <b>subtopics</b>.</li>
          <li>2) <b>Progression</b>: open a subtopic and mark done to unlock the next. Winning a <b>Boss Fight</b> also unlocks.</li>
          <li>3) <b>Free Explore</b>: tick subtopic checkboxes, then hit <b>Start Boss</b> to fight from that pool.</li>
          <li>4) <b>ELI5</b> gives simple explanations. Confidence check adapts future difficulty.</li>
          <li>5) <b>Spaced Repetition</b>: missed/guessed topics return in the <b>Due for Review</b> panel.</li>
          <li>6) <b>Power-ups</b>: earn Hint/Second Chance after a 3-question streak; use in Boss fights.</li>
          <li>7) <b>Timed Mode</b>: 60s per question; beat the clock for bonus XP.</li>
        </ol>
      </div>
    </div>
  );
};

/* =========================================================
   Main App
========================================================= */
export default function GameMED() {
  // Global game state
  const [tab, setTab] = useState("vignettes");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Power-ups
  const [powerUps, setPowerUps] = useState({ hint: 0, second: 0 });

  // Timed mode
  const [timedMode, setTimedMode] = useState(false);

  const [showBoss, setShowBoss] = useState(false);
  const [freeExplore, setFreeExplore] = useState(true);

  // Group toggles: which groups are ON to reveal subtopics
  const [groupEnabled, setGroupEnabled] = useState(() => {
    const init = {};
    TOPIC_GROUPS.forEach(g => init[g.id] = !!g.enabledByDefault);
    return init;
  });

  // Progression unlock per group
  const [unlockedMap, setUnlockedMap] = useState(() => {
    const m = {};
    TOPIC_GROUPS.forEach(g => m[g.id] = 0);
    return m;
  });

  // Selected subtopics for Boss + Vignette filtering
  const [selectedTopicIds, setSelectedTopicIds] = useState(() => new Set());

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(() => true);

  // ===== Spaced Repetition (SR) review queue per subtopicId
  // Map: topicId -> { level:number, dueAt:number }
  const [reviewQueue, setReviewQueue] = useState({});
  const dueTopicIds = useMemo(() => {
    const s = new Set();
    Object.entries(reviewQueue).forEach(([topicId, rec]) => {
      if (rec && rec.dueAt != null && rec.dueAt <= now()) s.add(topicId);
    });
    return s;
  }, [reviewQueue]);

  // ==== Vignette state (tied to master VIGNETTES via __seqIndex) ====
  const pool = filteredVignettes(selectedTopicIds);
  const [idx, setIdx] = useState(0);
  const v = pool[idx] || null;
  const [answers, setAnswers] = useState(() => VIGNETTES.map(() => ({ picked: null, submitted: false, gotCorrect: false, awarded: false, confidence: null })));
  const a = v ? answers[v.__seqIndex] : { picked: null, submitted: false, gotCorrect: false, awarded: false, confidence: null };

  // Track "low-confidence topics" = incorrect OR guessed
  const lowConfidenceTopics = useMemo(() => {
    const set = new Set();
    answers.forEach((ans, i) => {
      const topicId = VIGNETTES[i]?.topicId;
      if (!topicId) return;
      if (!ans) return;
      if (ans.gotCorrect && ans.confidence === "knew") return;
      if (ans.submitted && (!ans.gotCorrect || ans.confidence === "guessed")) set.add(topicId);
    });
    return set;
  }, [answers]);

  // Lives refill
  useEffect(() => {
    if (lives === 0) {
      setGameOver(true);
      const t = setTimeout(() => { setLives(3); setGameOver(false); }, 1200);
      return () => clearTimeout(t);
    }
  }, [lives]);

  // ======= Helpers bound to state =======
  function toggleGroup(id){
    setGroupEnabled(prev => ({ ...prev, [id]: !prev[id] }));
    const g = TOPIC_GROUPS.find(x=>x.id===id);
    if (g && groupEnabled[id]) {
      setSelectedTopicIds(prev => {
        const s = new Set(prev);
        g.subtopics.forEach(st => s.delete(st.id));
        return s;
      });
    }
  }

  function canOpenSubtopic(groupId, i){
    if (freeExplore) return true;
    return i <= (unlockedMap[groupId] ?? 0);
  }

  function onSubtopicDone(groupId, i){
    setUnlockedMap(prev => ({
      ...prev,
      [groupId]: Math.min((prev[groupId] ?? 0)+1, (TOPIC_GROUPS.find(g=>g.id===groupId)?.subtopics.length ?? 1)-1)
    }));
  }

  function toggleSubtopicSelected(id){
    setSelectedTopicIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
    setIdx(0);
  }

  function startBossWithSelection(filterSet){
    const active = (filterSet && filterSet.size) ? new Set(filterSet) : (selectedTopicIds.size ? new Set(selectedTopicIds) : null);
    set_BossTopicFilter(active);
    setShowBoss(true);
  }

  // topicFilter for Boss modal
  const [bossTopicFilter, set_BossTopicFilter] = useState(null);

  // ======= Filtering (hide vignettes until at least one subtopic is selected) =======
  function filteredVignettes(selSet){
    if (!selSet || selSet.size === 0) return [];
    const pool = VIGNETTES.filter(q => q.topicId && selSet.has(q.topicId));
    return pool.map(q => ({ ...q, __seqIndex: VIGNETTES.findIndex(orig => orig.id === q.id) }));
  }
  const totalShown = pool.length;

  // ======= Submit/score handlers =======
  const awardPowerUpIfStreak = () => {
    // Every 3 correct in a row grants a power-up (alternating Hint/Second)
    if (streak > 0 && streak % 3 === 0) {
      setPowerUps(prev => {
        const giveHint = ((streak/3) % 2 === 1); // 3,9,15... hint; 6,12,18... second
        return giveHint ? { ...prev, hint: prev.hint + 1 } : { ...prev, second: prev.second + 1 };
      });
    }
  };

  const scheduleReview = (topicId, success, confident) => {
    if (!topicId) return;
    setReviewQueue(prev => {
      const rec = prev[topicId] || { level: 0, dueAt: now() };
      let level = rec.level;
      let dueAt = now();
      if (!success) {
        level = Math.max(0, level - 1); // miss → drop a level
        dueAt = now() + minutes(10);    // resurface soon
      } else if (confident) {
        level = level + 1;              // knew it → space out more
        const steps = [minutes(30), hours(8), hours(24), hours(48), hours(96)];
        dueAt = now() + (steps[Math.min(level, steps.length-1)]);
      } else {
        // correct but "guessed"
        dueAt = now() + minutes(30);
      }
      return { ...prev, [topicId]: { level, dueAt } };
    });
  };

  const submit = (picked, correct, timeBonusXP=0) => {
    if (!v) return;
    const absoluteIdx = v.__seqIndex;
    setAnswers(prev => {
      const c=[...prev];
      c[absoluteIdx] = { ...c[absoluteIdx], picked, submitted:true, gotCorrect: correct || c[absoluteIdx].gotCorrect };
      return c;
    });
    if (correct && !answers[absoluteIdx]?.awarded) {
      setXp(x => x + 25 + timeBonusXP);
      setStreak(s => s + 1);
      setAnswers(prev => { const c=[...prev]; c[absoluteIdx] = { ...c[absoluteIdx], awarded:true }; return c; });
      awardPowerUpIfStreak();
    }
    if (!correct) { setStreak(0); setLives(l => Math.max(0, l-1)); scheduleReview(v.topicId, false, false); }
  };
  const unsubmit = () => {
    if (!v) return;
    const absoluteIdx = v.__seqIndex;
    setAnswers(prev => { const c=[...prev]; c[absoluteIdx] = { ...c[absoluteIdx], submitted:false }; return c; });
  };
  const pick = (picked) => {
    if (!v) return;
    const absoluteIdx = v.__seqIndex;
    setAnswers(prev => { const c=[...prev]; c[absoluteIdx] = { ...c[absoluteIdx], picked }; return c; });
  };

  const setConfidenceForCurrent = (knew) => {
    if (!v) return;
    const absoluteIdx = v.__seqIndex;
    const topicId = v.topicId;
    setAnswers(prev => {
      const c=[...prev];
      c[absoluteIdx] = { ...c[absoluteIdx], confidence: knew ? "knew" : "guessed" };
      return c;
    });
    // schedule spaced repetition based on confidence if submitted
    const ans = answers[absoluteIdx];
    const success = ans?.submitted ? (ans?.picked === v.correctIndex) : false;
    scheduleReview(topicId, success, knew);
  };

  const mastered = answers.filter(q => q.gotCorrect).length;
  const progressPct = VIGNETTES.length ? Math.round((mastered / VIGNETTES.length) * 100) : 0;

  const stepVignette = (dir) => {
    if (!totalShown) return;
    setIdx(i => {
      let n = i + dir;
      if (n < 0) n = 0;
      if (n >= totalShown) n = totalShown - 1;
      return n;
    });
  };

  const usePowerUp = (type) => {
    setPowerUps(prev => ({ ...prev, [type]: Math.max(0, prev[type]-1) }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-5 sm:p-7 text-[17px]">
      <ShakeCSS />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">{APP_TITLE} — Study Game</h1>
            <p className="text-zinc-400 text-base">Vignettes • XP & Streak • Boss • ELI5 • SR • Timed</p>
          </div>
          <div className="flex items-center gap-3">
            <HeartBar lives={lives} />
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-base">Streak: <span className="font-semibold">{streak}</span></span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-base">XP: <span className="font-semibold">{xp}</span></span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-base">🔮 {powerUps.hint} | 🕊 {powerUps.second}</span>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-base cursor-pointer select-none">
              <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={timedMode} onChange={e=>setTimedMode(e.target.checked)} />
              <span>Timed Mode ⏱️</span>
            </label>
            <Button onClick={() => setShowTutorial(true)} title="Open tutorial">Tutorial ❓</Button>
          </div>
        </header>

        {/* Progress */}
        <XpBar xp={xp} />
        <div className="text-sm text-zinc-500">Vignettes mastered: {mastered}/{VIGNETTES.length} • Overall Progress: {progressPct}%</div>

        {/* Due for Review (Spaced Repetition) */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900">
          <div className="p-4 flex items-center justify-between">
            <div className="text-lg font-semibold">🗓️ Due for Review</div>
            <div className="text-sm text-zinc-400">Resurfaces missed/guessed topics using spaced repetition</div>
          </div>
          <div className="p-4 pt-0">
            {dueTopicIds.size === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700 text-zinc-300">Nothing due yet. Keep practicing!</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from(dueTopicIds).map(tid => {
                  const st = getSubtopicById(tid);
                  const rec = reviewQueue[tid];
                  return (
                    <div key={tid} className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{st?.title ?? tid}</div>
                        <div className="text-xs text-zinc-400">Level {rec?.level ?? 0} • Ready now</div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => {
                          // start boss only with this topic
                          const setOnly = new Set([tid]);
                          startBossWithSelection(setOnly);
                        }}>Review</Button>
                        <Button onClick={() => {
                          // snooze 10m
                          setReviewQueue(prev => ({ ...prev, [tid]: { ...(prev[tid]||{level:0}), dueAt: now() + minutes(10) } }));
                        }}>Snooze 10m</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab("vignettes")} className={cx("px-4 py-2 rounded-2xl text-base", tab === "vignettes" ? "bg-indigo-600" : "bg-zinc-800")}>Patient Vignettes</button>
          <button onClick={() => setTab("topics")} className={cx("px-4 py-2 rounded-2xl text-base", tab === "topics" ? "bg-indigo-600" : "bg-zinc-800")}>Topics</button>
        </div>

        {/* TOPICS TAB */}
        {tab === "topics" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base text-zinc-300">Mode:</span>
                <button onClick={()=>setFreeExplore(false)} className={cx("px-3 py-1.5 rounded-xl border border-zinc-700 text-base", !freeExplore?"bg-indigo-600":"bg-zinc-800")}>Progression 🔒</button>
                <button onClick={()=>setFreeExplore(true)} className={cx("px-3 py-1.5 rounded-xl border border-zinc-700 text-base", freeExplore?"bg-indigo-600":"bg-zinc-800")}>Free Explore 📖</button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base text-zinc-300">Boss Fight:</span>
                <button
                  onClick={()=>startBossWithSelection(null)}
                  className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 text-base"
                  disabled={selectedTopicIds.size===0}
                >
                  Start Boss (Selected) ⚔️
                </button>
              </div>
            </div>

            {/* GROUP tiles */}
            <div className="space-y-4">
              {TOPIC_GROUPS.map((G) => {
                const enabled = !!groupEnabled[G.id];
                const unlockedUpTo = unlockedMap[G.id] ?? 0;
                return (
                  <div key={G.id} className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-5 h-5 accent-indigo-600"
                                 checked={enabled} onChange={() => toggleGroup(G.id)} />
                          <span className="text-xl font-bold">{G.title}</span>
                        </label>
                        {!enabled && <span className="text-sm text-zinc-400">Toggle ON to reveal subtopics</span>}
                      </div>
                      {!freeExplore && enabled && <span className="text-xs px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">Unlocked up to #{unlockedUpTo+1}</span>}
                    </div>

                    {/* SUBTOPIC tiles */}
                    {enabled && (
                      <div className="grid sm:grid-cols-2 gap-4 p-4 pt-0">
                        {G.subtopics.map((T, i) => {
                          const locked = !canOpenSubtopic(G.id, i);
                          const selected = selectedTopicIds.has(T.id);
                          const due = !!dueTopicIds.has(T.id);
                          return (
                            <div key={T.id}
                              className={cx("text-left p-4 rounded-2xl border transition relative",
                                locked?"bg-zinc-900/40 border-zinc-800 opacity-50 pointer-events-none":"bg-zinc-900 border-zinc-700 hover:bg-zinc-800")}
                            >
                              <label className="absolute top-3 left-3 flex items-center gap-2 select-none">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 rounded-md accent-indigo-600"
                                  checked={selected}
                                  onChange={() => toggleSubtopicSelected(T.id)}
                                />
                                <span className="text-sm text-zinc-300">Include</span>
                              </label>

                              <div className="flex items-center justify-between mb-2 pt-7">
                                <h3 className="text-xl font-bold">{T.title}</h3>
                                <div className="flex items-center gap-2">
                                  {due && <span className="text-xs px-2 py-1 rounded-lg bg-amber-700/40 border border-amber-700 text-amber-200">Due for review</span>}
                                  <span className="text-xs text-zinc-400">Ref: {T.ref}</span>
                                </div>
                              </div>

                              <ul className="space-y-1 mt-2">
                                {T.bullets.map((b, j) => (<BulletLine key={j} b={b} />))}
                              </ul>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex gap-2">
                                  <Button onClick={() => setModalTopic({ ...T, groupId: G.id, indexInGroup: i })}>Open Topic</Button>
                                  {!freeExplore && i < unlockedUpTo && <span className="px-2 py-1 rounded-lg text-xs bg-emerald-700/30 border border-emerald-700 text-emerald-300">Cleared</span>}
                                  {!freeExplore && i === unlockedUpTo && <span className="px-2 py-1 rounded-lg text-xs bg-sky-700/30 border border-sky-700 text-sky-300">Next</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIGNETTES TAB */}
        {tab === "vignettes" && (
          <div className="space-y-5">
            {/* Filter UI */}
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900">
              <div className="p-4 border-b border-zinc-800">
                <div className="text-lg font-semibold">Vignette Topic Filter</div>
                <div className="text-sm text-zinc-400">
                  {selectedTopicIds.size===0 ? "Select at least one subtopic to begin." : `Selected: ${selectedTopicIds.size} • Showing ${totalShown} question(s)`}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {TOPIC_GROUPS.map(g => (
                  <div key={g.id} className="space-y-2">
                    <div className="text-base font-bold">{g.title}</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {g.subtopics.map(st => {
                        const selected = selectedTopicIds.has(st.id);
                        const due = !!dueTopicIds.has(st.id);
                        return (
                          <label key={st.id} className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5 accent-indigo-600"
                                   checked={selected}
                                   onChange={() => toggleSubtopicSelected(st.id)} />
                            <span className="text-base">{st.title}</span>
                            {due && <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-700/40 border border-amber-700 text-amber-200">Due</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice panel */}
            {selectedTopicIds.size === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300">
                Pick one or more subtopics above to start the vignette practice.
              </div>
            ) : totalShown > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Case {idx + 1} / {totalShown}</h2>
                  <div className="flex gap-2">
                    <Button onClick={() => stepVignette(-1)} disabled={idx===0}>← Prev</Button>
                    <Primary onClick={() => stepVignette(+1)} disabled={idx+1>=totalShown}>
                      {idx + 1 < totalShown ? "Next →" : "Next →"}
                    </Primary>
                  </div>
                </div>
                <VignetteCard
                  v={v}
                  initialPick={a.picked}
                  initialSubmitted={a.submitted}
                  onPick={(picked) => pick(picked)}
                  onSubmit={(picked, correct, timeBonusXP) => submit(picked, correct, timeBonusXP)}
                  onUnsubmit={() => unsubmit()}
                  showConfidence={true}
                  onConfidence={(knew) => setConfidenceForCurrent(knew)}
                  timed={timedMode}
                  onTimeout={() => { setLives(l => Math.max(0, l-1)); setStreak(0); }}
                  bonusForTime={5}
                />
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300">
                No questions match your current subtopic selection. Try selecting different subtopics above.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlays */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-center max-w-sm w-full">
            <div className="text-5xl mb-3">🧬💥</div>
            <div className="text-2xl font-semibold mb-2">Game Over</div>
            <div className="text-zinc-300 text-base">Hearts refilling…</div>
          </div>
        </div>
      )}

      {/* Boss modal */}
      {showBoss && (
        <BossFight
          topicFilter={bossTopicFilter ?? (selectedTopicIds.size ? selectedTopicIds : null)}
          onClose={() => setShowBoss(false)}
          onDone={(score)=>{
            setShowBoss(false);
            // Unlock next subtopic in any enabled group on pass (>=3/5)
            if (score >= 3) {
              setUnlockedMap(prev => {
                const next = { ...prev };
                Object.keys(groupEnabled).forEach(gid => {
                  if (groupEnabled[gid]) {
                    const len = (TOPIC_GROUPS.find(g=>g.id===gid)?.subtopics.length) || 1;
                    next[gid] = Math.min((next[gid] ?? 0)+1, len-1);
                  }
                });
                return next;
              });
              setXp(x => x + 20); // small bonus for winning
            }
          }}
          timed={timedMode}
          grantBonusXP={5}
          powerUps={powerUps}
          usePowerUp={usePowerUp}
          prioritizeLowConfidenceIds={lowConfidenceTopics}
        />
      )}

      {/* Topic modal bridge */}
      <TopicModalBridge onSubtopicDone={(gid, i)=>onSubtopicDone(gid, i)} />

      {/* Tutorial */}
      <Tutorial open={showTutorial} onClose={()=>setShowTutorial(false)} />
    </div>
  );
}

/* =========================================================
   Modal bridge (so we can open TopicModal from tile button)
========================================================= */
function TopicModalBridge({ onSubtopicDone }) {
  const [topic, setTopic] = useState(null);
  useEffect(() => { window.setModalTopic = setTopic; }, []);
  if (!topic) return null;
  return (
    <TopicModal
      topic={topic}
      onClose={()=>setTopic(null)}
      onDone={()=>{
        if (topic.groupId && typeof topic.indexInGroup === "number") {
          onSubtopicDone(topic.groupId, topic.indexInGroup);
        }
      }}
    />
  );
}
