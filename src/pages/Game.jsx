
import React, { useEffect, useMemo, useRef, useState } from "react";
import Histology from "./Histology.jsx";
import QUESTIONS from "../data/vignettes.generated.json";

/* ========= helpers ========= */
const cx = (...a) => a.filter(Boolean).join(" ");
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(arr, seed){const a=[...arr];const rnd=mulberry32(seed||1);for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const LETTERS=["A","B","C","D","E","F"];

/* ========= curated groups/subtopics ========= */
const GROUPS=[
  { id:"amino", title:"Amino & Nucleic Acids", sub:[
    {id:"denaturation",title:"Denaturation & Tm",ref:"Nucleic acids_2025.pdf — slide 10",eli5:"More GC → higher melting temp.",mnemo:"GC = 'Gluey Couple' (3 bonds).",teach:[
      "Tm rises with GC content (3 H-bonds vs 2 for AT).",
      "Salt shields negative phosphates → stabilizes duplex; low salt destabilizes.",
      "Denaturation is reversible (renaturation/annealing) if strands are complementary."
    ]},
    {id:"hybridization",title:"Hybridization Stringency",ref:"Nucleic acids_2025.pdf — slide 14",eli5:"High temp/low salt keeps only perfect matches.",mnemo:"High stringency = 'High standards'.",teach:[
      "Stringency ↑ with ↑temp, ↓salt, ↑formamide.",
      "Used in Southern/Northern blots and microarrays to discriminate single-base mismatches."
    ]},
    {id:"prokDNA",title:"Prokaryotic DNA",ref:"Nucleic acids_2025.pdf — slide 22",eli5:"Circular chromosome; supercoils via gyrase.",mnemo:"'Gyrate the ring'.",teach:[
      "Topo I relaxes; gyrase (Topo II) introduces negative supercoils (blocked by quinolones).",
      "Nucleoid-associated proteins compact the chromosome in loops."
    ]},
    {id:"eukDNA",title:"Eukaryotic DNA & Telomeres",ref:"Nucleic acids_2025.pdf — slide 28",eli5:"Linear chromosomes need telomeres.",mnemo:"Shoelace tips on DNA.",teach:[
      "Telomerase extends 3' ends (reverse transcriptase) to solve end-replication problem.",
      "Shelterin protects telomere loops from DNA repair machinery."
    ]},
    {id:"repeats",title:"Repetitive DNA",ref:"Nucleic acids_2025.pdf — slide 33",eli5:"LINEs/SINEs, micro/mini satellites.",mnemo:"'Repeat beats'.",teach:[
      "Microsatellites (1–6 bp) used in forensics; expansion diseases (e.g., Huntington, Fragile X).",
      "LINE-1 can retrotranspose; SINEs (Alu) depend on LINE machinery."
    ]},
    {id:"chromatin",title:"Chromatin & Nucleosome",ref:"Nucleic acids_2025.pdf — slide 40",eli5:"DNA wraps histones; tight wrap silences.",mnemo:"'Tight = quiet'.",teach:[
      "Nucleosome: ~147 bp around H2A/H2B/H3/H4 octamer; H1 seals entry/exit.",
      "Euchromatin = active/light; Heterochromatin = silent/dark; marks: H3K4me3 vs H3K27me3."
    ]},
    {id:"epigenetics",title:"Epigenetics",ref:"Nucleic acids_2025.pdf — slide 47",eli5:"Methylation & acetylation tune genes.",mnemo:"'Methyl mutes; acetyl activates'.",teach:[
      "DNMTs add 5mC at CpG; TET enzymes oxidize 5mC for demethylation.",
      "Histone acetylation (HATs) opens chromatin; HDACs remove acetyl groups."
    ]},
  ]},
  { id:"nucleus", title:"Nucleus & Cell Cycle", sub:[
    {id:"nucleus-envelope",title:"Nuclear Envelope & Lamina",ref:"Nucleus Structure & Cell Cycle_2025.pdf — slide 9",eli5:"Double membrane + lamina scaffold.",mnemo:"'LamIN = INside'.",teach:[
      "Nuclear pores regulate transport via FG-repeats and importins/exportins.",
      "Lamin A/C mutations → laminopathies (e.g., progeria)."
    ]},
    {id:"nucleolus",title:"Nucleolus & rRNA",ref:"Nucleus Structure & Cell Cycle_2025.pdf — slide 16",eli5:"rRNA factory (Pol I).",mnemo:"'Nucleolus = rRNA factory'.",teach:[
      "rDNA repeats form nucleolar organizer regions; ribosome assembly with snoRNAs.",
      "Pol I transcribes 45S pre-rRNA; Pol III makes 5S rRNA outside nucleolus."
    ]},
    {id:"cell-cycle-checkpoints",title:"Cell Cycle Checkpoints",ref:"Nucleus Structure & Cell Cycle_2025.pdf — slide 30",eli5:"Fix problems before division.",mnemo:"'CDKs = traffic lights'.",teach:[
      "G1/S checkpoint (p53/p21) senses DNA damage; G2/M ensures replication complete.",
      "Anaphase checkpoint monitors kinetochore attachment."
    ]},
  ]},
  { id:"replication", title:"DNA Replication & Repair", sub:[
    {id:"replication-enzymes",title:"Replication Enzymes",ref:"DNA Replication & Repair_2025.pdf — slide 12",eli5:"Helicase, polymerase, ligase.",mnemo:"'Unzip, copy, seal'.",teach:[
      "Leading vs lagging strands; Okazaki fragments; primase lays RNA primers.",
      "Clamp loader and sliding clamp increase processivity."
    ]},
    {id:"nucleotide-excision",title:"NER vs BER",ref:"DNA Replication & Repair_2025.pdf — slide 25",eli5:"NER removes bulky adducts; BER swaps damaged bases.",mnemo:"'NER = Nasty bulky; BER = Base swap'.",teach:[
      "NER: TFIIH helicase, endonucleases; defects → xeroderma pigmentosum.",
      "BER: glycosylase → AP endonuclease → Pol β → ligase; base-specific."
    ]},
    {id:"mismatch-repair",title:"Mismatch Repair",ref:"DNA Replication & Repair_2025.pdf — slide 33",eli5:"Corrects post-rep errors.",mnemo:"'MMR = typo fix'.",teach:[
      "MutS/MutL homologs recognize mismatches; HNPCC/Lynch from MMR defects."
    ]},
    {id:"dsb-repair",title:"DSB Repair",ref:"DNA Replication & Repair_2025.pdf — slide 41",eli5:"HR (accurate) vs NHEJ (quick).",mnemo:"'HR heals right'.",teach:[
      "HR uses sister chromatid; BRCA1/2 roles; NHEJ uses Ku70/80 and DNA-PK."
    ]},
  ]},
  { id:"recomb", title:"DNA Recombination", sub:[
    {id:"homologous-recombination",title:"Homologous Recombination",ref:"DNA Recombination_2025.pdf — slide 11",eli5:"Template-guided repair.",mnemo:"'Use the twin'.",teach:[
      "Holliday junctions; strand invasion; resolution crossover vs non-crossover."
    ]},
    {id:"nhej",title:"Non-Homologous End Joining",ref:"DNA Recombination_2025.pdf — slide 18",eli5:"Fast/erroneous.",mnemo:"'Glue and go'.",teach:[
      "Artemis, XRCC4/Ligase IV; common in G1."
    ]},
    {id:"site-specific",title:"Site-Specific Recombination",ref:"DNA Recombination_2025.pdf — slide 26",eli5:"Defined sequences.",mnemo:"'Addresses matter'.",teach:[
      "Integrases/recombinases (Cre-Lox, Flp-FRT)."
    ]},
    {id:"transposition",title:"Transposition",ref:"DNA Recombination_2025.pdf — slide 32",eli5:"Jumping genes.",mnemo:"'Cut & paste or copy & paste'.",teach:[
      "DNA transposons vs retrotransposons; target site duplications."
    ]},
  ]},
  { id:"translation", title:"Genetic Code & Translation", sub:[
    {id:"code-properties",title:"Genetic Code Properties",ref:"Genetic Code & Translation_2025.pdf — slide 7",eli5:"Universal & degenerate.",mnemo:"'Same message, many words'.",teach:[
      "Wobble base pairing; start/stop codons; reading frame integrity."
    ]},
    {id:"initiation",title:"Initiation (Kozak vs SD)",ref:"Genetic Code & Translation_2025.pdf — slide 15",eli5:"Euk: Kozak; Prok: SD.",mnemo:"'Kozak crowns AUG'.",teach:[
      "eIF4F cap-binding; 43S preinitiation complex scans to AUG in Kozak context.",
      "Bacterial 16S rRNA base-pairs with SD sequence."
    ]},
    {id:"elongation",title:"Elongation & rRNAs",ref:"Genetic Code & Translation_2025.pdf — slide 24",eli5:"tRNAs deliver; rRNA catalyzes.",mnemo:"'rRNA = ribozyme'.",teach:[
      "EF-Tu(EF1A) brings aa-tRNA; peptidyl transferase center in 23S/28S rRNA."
    ]},
    {id:"antibiotic-inhibitors",title:"Antibiotic Inhibitors",ref:"Genetic Code & Translation_2025.pdf — slide 33",eli5:"Ribosome blockers.",mnemo:"'Buy AT 30, CELL at 50'.",teach:[
      "30S: Aminoglycosides, Tetracyclines; 50S: Chloramphenicol, Erythromycin, Linezolid, etc."
    ]},
  ]},
  { id:"bacterial", title:"Bacterial Genetics & Virulence", sub:[
    {id:"horizontal-transfer",title:"Horizontal Gene Transfer",ref:"Bacterial Genetics & Virulence Determinants.pdf — slide 10",eli5:"Conjugation, transformation, transduction.",mnemo:"'Share, snatch, ship'.",teach:[
      "Conjugation (pilus, F plasmid), transformation (naked DNA), transduction (phages)."
    ]},
    {id:"operons",title:"Operon Control",ref:"Bacterial Genetics & Virulence Determinants.pdf — slide 20",eli5:"One promoter, many genes.",mnemo:"'One switch, many lights'.",teach:[
      "Lac operon (inducible); trp operon (repressible/attenuation)."
    ]},
    {id:"virulence",title:"Virulence & Toxins",ref:"Bacterial Genetics & Virulence Determinants.pdf — slide 31",eli5:"Exotoxins, adherence, evasion.",mnemo:"'AB toxins = A + B'.",teach:[
      "Adhesins, invasins, immune evasion; superantigens; secretion systems."
    ]},
    {id:"biofilms-quorum",title:"Biofilms & Quorum Sensing",ref:"Bacterial Genetics & Virulence Determinants.pdf — slide 39",eli5:"Signal to act as a community.",mnemo:"'Slime city talks'.",teach:[
      "AHL autoinducers; biofilms resist antibiotics and host defenses."
    ]},
  ]},
  { id:"histology", title:"Histology & Pathology", sub:[
    {id:"hist-epithelium",title:"Epithelium ID",ref:"Fundamentals of Histology & Pathology_2025.pdf — slide 12",eli5:"Shapes/layers define epithelium.",mnemo:"'SS=skin; SCu=cubes; SCol=columns'.",teach:[
      "Simple vs stratified; keratinization; transitional epithelium in urinary tract."
    ]},
    {id:"hist-ct",title:"Connective Tissue",ref:"Fundamentals of Histology & Pathology_2025.pdf — slide 19",eli5:"Collagen, elastin.",mnemo:"'Collagen = cables'.",teach:[
      "Type I–IV collagens; elastic fibers with fibrillin; ground substance (GAGs)."
    ]},
    {id:"hist-muscle",title:"Muscle Types",ref:"Fundamentals of Histology & Pathology_2025.pdf — slide 26",eli5:"Skeletal, cardiac, smooth.",mnemo:"'Cards have discs'.",teach:[
      "Striations; intercalated discs; dense bodies in smooth muscle."
    ]},
    {id:"hist-neuro",title:"Nervous Tissue",ref:"Fundamentals of Histology & Pathology_2025.pdf — slide 33",eli5:"Neurons & glia.",mnemo:"'Neurons talk; glia support'.",teach:[
      "Astrocytes, oligodendrocytes, microglia; gray vs white matter."
    ]},
    {id:"hist-path",title:"Path Basics",ref:"Fundamentals of Histology & Pathology_2025.pdf — slide 40",eli5:"Reversible vs irreversible injury.",mnemo:"'Swelling reversible; rupture not'.",teach:[
      "Atrophy, hypertrophy, hyperplasia, metaplasia; dysplasia → carcinoma in situ."
    ]},
  ]},
];
const ALL_SUBTOPICS = GROUPS.flatMap(g=>g.sub.map(s=>({...s, groupId:g.id, groupTitle:g.title})));

/* ========= tagging ========= */
const TAGS=[
  {re:/(denatur|Tm|renatur)/i, id:"denaturation"},
  {re:/(stringenc|hybridiz)/i, id:"hybridization"},
  {re:/(supercoil|gyrase|prok)/i, id:"prokDNA"},
  {re:/telomer|euk/i, id:"eukDNA"},
  {re:/repeat|LINE|SINE|satellite/i, id:"repeats"},
  {re:/nucleosome|histone|chromatin|euchromatin|heterochromatin/i, id:"chromatin"},
  {re:/methyl|acetyl|epigen/i, id:"epigenetics"},
  {re:/ribosome|Kozak|Shine|elongation|tRNA|rRNA|code/i, id:"elongation"},
  {re:/NER|BER|mismatch|MMR|NHEJ|HR/i, id:"dsb-repair"},
  {re:/homologous recomb|site-specific|transpos/i, id:"transposition"},
  {re:/operon|lac|trp/i, id:"operons"},
  {re:/biofilm|quorum/i, id:"biofilms-quorum"},
  {re:/virulence|toxin/i, id:"virulence"},
  {re:/conjugation|transduction|transformation/i, id:"horizontal-transfer"},
  {re:/epithelium|squamous|columnar/i, id:"hist-epithelium"},
  {re:/collagen|reticulin|connective/i, id:"hist-ct"},
  {re:/skeletal|cardiac|smooth/i, id:"hist-muscle"},
  {re:/neuron|glia|axon/i, id:"hist-neuro"},
  {re:/dysplasia|anaplasia|hyperchromasia/i, id:"hist-path"},
];
function tagToSubtopic(v){
  const hit=TAGS.find(t=>t.re.test(v.stem||""));
  return hit? hit.id : null;
}
function hydrate(list){
  return list.map((v,i)=>{
    const order=[...Array(v.choices.length).keys()];
    const sh=seededShuffle(order,(v.id||i+1)*1337);
    const choices=sh.map(j=>v.choices[j]);
    const correctIndex=sh.indexOf(v.answer);
    const topicId=v.topicId||tagToSubtopic(v);
    return {...v,choices,correctIndex,topicId,__i:i,__id:v.id||i+1};
  });
}
const VIGNETTES = hydrate(QUESTIONS);

/* ========= derived counts ========= */
const SUB_COUNTS = (()=>{
  const m={};
  VIGNETTES.forEach(v=>{ if(v.topicId){ m[v.topicId]=(m[v.topicId]||0)+1; } });
  return m;
})();
function topicCount(topicId){
  const g = GROUPS.find(x=>x.id===topicId);
  if(!g) return 0;
  return g.sub.map(s=>SUB_COUNTS[s.id]||0).reduce((a,b)=>a+b,0);
}

/* ========= UI atoms ========= */
const Glow = ({children,className=""}) => <div className={cx("rounded-3xl border border-white/10 bg-white/5 shadow-glow backdrop-blur-sm",className)}>{children}</div>;
const Pill = ({children,className=""}) => <span className={cx("px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm",className)}>{children}</span>;
const Button = ({className="",...props}) => <button {...props} className={cx("px-4 py-2.5 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition disabled:opacity-50",className)} />;
const Primary = ({className="",...props}) => <button {...props} className={cx("px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 hover:brightness-110 text-white transition disabled:opacity-50 shadow",className)} />;

/* ========= Modal ========= */
function Modal({ open, onClose, children, className="" }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={cx("max-w-4xl w-full", className)}>
        <Glow className="p-4">
          <div className="flex justify-between items-center">
            <div />
            <Button onClick={onClose}>Close ✕</Button>
          </div>
          <div className="mt-2">{children}</div>
        </Glow>
      </div>
    </div>
  );
}

/* ========= VignetteCard ========= */
function VignetteCard({ v, seedPick=null, seedSubmitted=false, lastPick, lastSubmitted, showPrevToggle=false, prevNeutral=false, timeLimit=0, onAnswer, showExplanation=false }){
  const [picked,setPicked]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [prevOn,setPrevOn]=useState(false);
  const [timeLeft,setTimeLeft]=useState(timeLimit||0);

  // reset prev toggle on question change (Review request)
  useEffect(()=>{ setPrevOn(false); },[v?.__i]);

  // timer
  useEffect(()=>{ if(timeLimit>0){ const id=setInterval(()=>setTimeLeft(t=>Math.max(0,t-1)),1000); return ()=>clearInterval(id);} },[v?.__i,timeLimit]);
  useEffect(()=>{ if(timeLimit>0 && timeLeft===0 && !submitted && picked!=null){ setSubmitted(true); onAnswer?.(picked); } },[timeLeft,submitted,picked,onAnswer,timeLimit]);

  const st = v.topicId ? ALL_SUBTOPICS.find(s=>s.id===v.topicId) : null;
  const explanation = v.explanation || (st?.eli5 || "");

  // restore prior answer for this session (battle/quiz)
  useEffect(()=>{
    if (seedSubmitted){
      setPicked(seedPick);
      setSubmitted(true);
    }else{
      setPicked(null);
      setSubmitted(false);
    }
  },[v?.__i, seedPick, seedSubmitted]);

  // review-only: show previous when toggled, neutral (no correctness)
  const neutralHighlight = showPrevToggle && prevNeutral && prevOn && lastSubmitted;
  useEffect(()=>{
    if (neutralHighlight){
      setSubmitted(false);
      setPicked(lastPick);
    }
  },[neutralHighlight, lastPick, v?.__i]);

  const correctLetter = LETTERS[v.correctIndex] || "";

  return (
    <Glow className="p-6">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-lg font-semibold text-zinc-100 leading-relaxed">{v.stem}</div>
        <div className="flex items-center gap-2">
          {timeLimit>0 && <Pill>⏱ {String(timeLeft).padStart(2,"0")}s</Pill>}
          {st && <Pill className="truncate max-w-[260px]">Ref: {v.refSlide || st.ref}</Pill>}
        </div>
      </div>
      <div className="grid gap-2">
        {v.choices.map((c,i)=>{
          const right = submitted && i===v.correctIndex;
          const wrong = submitted && i===picked && !right;
          const neutral = neutralHighlight && i===picked;
          const ref = (v.optionRefs && v.optionRefs[i]) || v.refSlide || (st?.ref || "");
          return (
            <button key={i} onClick={()=>{ if(submitted){ setSubmitted(false);} if(!neutralHighlight){ setPicked(i);} }}
              className={cx("text-left px-4 py-3.5 rounded-2xl border transition text-[16.5px] leading-relaxed flex items-center justify-between",
                picked===i ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10",
                right && "ring-2 ring-emerald-400",
                wrong && "ring-2 ring-rose-400",
                neutral && "ring-2 ring-sky-400")}>
              <span className="flex items-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/15 mr-3 text-sm">{LETTERS[i]}</span>
                <span className="text-zinc-100">{c}</span>
              </span>
              <span className="ml-3 text-xs text-zinc-400">Ref: {ref}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {!submitted
          ? <Primary disabled={picked==null} onClick={()=>{ setSubmitted(true); onAnswer?.(picked); }}>Lock In</Primary>
          : <span className={cx("px-3 py-2 rounded-xl text-base", picked===v.correctIndex?"bg-emerald-700/30 text-emerald-300":"bg-rose-700/30 text-rose-300")}>
              Correct answer: <b className="ml-1">{correctLetter}</b> — {v.choices[v.correctIndex]}
            </span>}
        {showPrevToggle && lastSubmitted && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm opacity-90">
            <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={prevOn} onChange={()=>setPrevOn(s=>!s)} />
            Show my previous answer
          </label>
        )}
      </div>
      {submitted && showExplanation && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-zinc-200">{explanation || "Think conceptually: revisit the slide reference above."}</div>
          {st && <div className="mt-1 text-xs text-zinc-400">Slide ref: {v.refSlide || st.ref}</div>}
        </div>
      )}
    </Glow>
  );
}

/* ========= Learn Bubble (inline) ========= */
function LearnBubble({ subtopic }){
  const [eli5,setEli5]=useState(false);
  const [mnemo,setMnemo]=useState(false);
  if(!subtopic) return null;
  return (
    <Glow className="p-3 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{subtopic.title}</div>
          <div className="text-xs text-zinc-400">Slide ref: {subtopic.ref}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={()=>setEli5(v=>!v)}>{eli5?"Hide ELI5":"ELI5"}</Button>
          <Button onClick={()=>setMnemo(v=>!v)}>{mnemo?"Hide Mnemonic":"Mnemonic"}</Button>
        </div>
      </div>
      <ul className="list-disc list-inside text-zinc-200 mt-2">
        {(subtopic.teach||["Key points coming soon."]).map((t,i)=>(<li key={i}>{t}</li>))}
      </ul>
      {eli5 && <div className="mt-2 text-zinc-200">ELI5: {subtopic.eli5}</div>}
      {mnemo && <div className="mt-1 text-zinc-200">Mnemonic: {subtopic.mnemo||"—"}</div>}
    </Glow>
  );
}

/* ========= QuizRunner ========= */
function QuizRunner({ list, index, setIndex, explain, timed, seconds, onRecord, perQuestionShowPrev=false, prevNeutral=false, lastAnswers={}, onNav }){
  const [i,setI]=useState(index||0);
  const [session,setSession]=useState({}); // __i -> {pick, submitted}
  useEffect(()=>{ setI(index||0); },[index]);

  const v=list[i];
  if(!v) return <div>No questions.</div>;

  const last = lastAnswers[String(v.__i)] || null;
  const seed = session[String(v.__i)] || null;

  function record(v,pick){
    const rec={pick,submitted:true};
    setSession(prev=>({...prev,[String(v.__i)]:rec}));
    onRecord?.(v,pick);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-zinc-400">Question {i+1}/{list.length}</div>
        <div className="flex gap-2">
          <Button onClick={()=>{ onNav && onNav("prev"); setI(x=>Math.max(0,x-1)); }} disabled={i===0}>← Prev</Button>
          <Button onClick={()=>{ onNav && onNav("next"); setI(x=>Math.min(list.length-1,x+1)); }} disabled={i===list.length-1}>Next →</Button>
        </div>
      </div>
      <VignetteCard
        v={v}
        seedPick={seed?.pick ?? null}
        seedSubmitted={!!seed?.submitted}
        lastPick={last?.pick ?? null}
        lastSubmitted={!!last?.submitted}
        showPrevToggle={perQuestionShowPrev}
        prevNeutral={prevNeutral}
        timeLimit={timed ? seconds : 0}
        onAnswer={(pick)=> record(v,pick)}
        showExplanation={!!explain}
      />
    </div>
  );
}

/* ========= MAIN ========= */
export default function Game(){
  const [tab,setTab]=useState("vignettes"); // vignettes | topics | histology | review

  /* ----- REVIEW STATE (global) ----- */
  const [reviewAnswers,setReviewAnswers]=useState({}); // q.__i -> {pick,submitted,correct,topicId}
  const recordAnswer=(v,pick)=>{
    const r={pick,submitted:true,correct:pick===v.correctIndex, topicId:v.topicId};
    setReviewAnswers(prev=>({...prev,[String(v.__i)]:r}));
  };

  /* ----- Patient Vignettes: multi-topic subtopic selection (decoupled from Topics) ----- */
  const [builderTopic,setBuilderTopic]=useState(null);
  const [builderSubs,setBuilderSubs]=useState(new Set()); // set of subtopic ids (independent)
  const [builderCount,setBuilderCount]=useState(10);
  const [builderExplain,setBuilderExplain]=useState(true);
  const [builderTimed,setBuilderTimed]=useState(false);
  const [builderSeconds,setBuilderSeconds]=useState(60);
  const [subPickerOpen,setSubPickerOpen]=useState(false);
  const [quizOpen,setQuizOpen]=useState(false);
  const [quizList,setQuizList]=useState([]);
  const [quizIndex,setQuizIndex]=useState(0);

  const selectClass="bg-white/10 border border-white/15 text-white rounded-xl px-3 py-2";

  const ALL = useMemo(()=>VIGNETTES,[/* static */]);

  function poolCountFromSelected(){
    const ids=[...builderSubs];
    return ALL.filter(v=> v.topicId && ids.includes(v.topicId)).length;
  }

  function buildQuizFromBuilder(){
    const ids=[...builderSubs];
    const pool=ALL.filter(v=> v.topicId && ids.includes(v.topicId));
    const N=Math.min(builderCount, pool.length);
    const arr=seededShuffle(pool, 2025).slice(0,N);
    setQuizList(arr);
    setQuizIndex(0);
    setQuizOpen(true);
  }

  /* ----- Topics: Explorer vs Questline (accordion) ----- */
  const [topicsMode,setTopicsMode]=useState("explorer"); // explorer | quest
  const [expanded,setExpanded]=useState(new Set()); // accordion open topics
  const [unlock,setUnlock]=useState(()=>{ const o={}; GROUPS.forEach(g=>o[g.id]=1); return o; });
  const [learnOpen,setLearnOpen]=useState(false);
  const [learnSub,setLearnSub]=useState(null);
  const [battleOpen,setBattleOpen]=useState(false);
  const [battleList,setBattleList]=useState([]);
  const [questStreak,setQuestStreak]=useState({}); // topicId -> current streak
  const [battleBanner,setBattleBanner]=useState(null); // {type:'learn'|'win', text, subtopic?}
  const [battleInlineLearn,setBattleInlineLearn]=useState(null); // subtopic bubble inline

  const openLearn=(sub)=>{ setLearnSub(sub); setLearnOpen(true); };

  function prepareBattleForTopic(topicId){
    const G = GROUPS.find(g=>g.id===topicId);
    if(!G) return;
    const unlocked = unlock[topicId]||1;
    let ids=[];
    if (topicsMode==="explorer"){
      ids = G.sub.map(s=>s.id);
    }else{
      ids = [G.sub[Math.min(unlocked-1, G.sub.length-1)].id];
    }
    const pool=ALL.filter(v=> v.topicId && ids.includes(v.topicId));
    const arr=seededShuffle(pool, 777).slice(0, Math.min(10, pool.length));
    setBattleList(arr);
    setBattleOpen(true);
    setBattleBanner(null);
    setBattleInlineLearn(null);
  }
  function onBattleAnswer(v,pick){
    recordAnswer(v,pick);
    const sub = ALL_SUBTOPICS.find(s=>s.id===v.topicId) || null;
    if (v.correctIndex!==pick){
      setBattleBanner({type:"learn", text:"Keep at it — want to review this concept?", subtopic: sub});
    } else if (topicsMode==="quest"){
      const tid = (GROUPS.find(g=>g.sub.some(s=>s.id===v.topicId))?.id) || null;
      if (!tid) return;
      setQuestStreak(prev=>{
        const cur = (prev[tid]||0) + 1;
        const next = {...prev, [tid]:cur};
        if (cur>=3){
          setUnlock(u=>{
            const current = u[tid]||1;
            const max = GROUPS.find(g=>g.id===tid)?.sub.length||1;
            const newLevel = Math.min(current+1, max);
            setBattleBanner({type:"win", text:`Unlocked next tile in ${GROUPS.find(g=>g.id===tid)?.title}!`});
            return {...u, [tid]: newLevel};
          });
          next[tid]=0;
        }
        return next;
      });
    }
  }

  /* ----- REVIEW aggregation with selectable areas ----- */
  const missedEntries = Object.entries(reviewAnswers).filter(([,r])=>r && r.submitted && !r.correct);
  const missedSubIds = new Set(missedEntries.map(([,r])=>r.topicId).filter(Boolean));
  const missedAreas = Array.from(missedSubIds).map(id=> ALL_SUBTOPICS.find(s=>s.id===id)).filter(Boolean);
  const [reviewSelectedAreas,setReviewSelectedAreas]=useState(new Set());
  useEffect(()=>{
    setReviewSelectedAreas(new Set(missedAreas.map(s=>s.id)));
  },[missedEntries.length]);

  function toggleArea(id){
    setReviewSelectedAreas(prev=>{ const s=new Set(prev); if(s.has(id)) s.delete(id); else s.add(id); return s; });
  }
  function battleMissedAreas(){
    const ids = Array.from(reviewSelectedAreas);
    const pool=ALL.filter(v=> v.topicId && ids.includes(v.topicId));
    const arr=seededShuffle(pool, 1337).slice(0, Math.min(10, pool.length));
    const ev = new CustomEvent("openReviewModal", { detail: { list: arr } });
    window.dispatchEvent(ev);
  }

  /* ----- RENDER ----- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f15] via-[#0a0c12] to-[#0a0a0f] text-zinc-100 p-5 sm:p-7 text-[17px]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <Glow className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">GameMED</h1>
              <p className="text-zinc-400 text-base">Patient Vignettes • Topics • Histology • Review</p>
            </div>
          </div>
        </Glow>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={()=>setTab("vignettes")} className={cx("px-4 py-2 rounded-2xl text-base border", tab==="vignettes"?"bg-white/15 border-white/20":"bg-white/5 border-white/10 hover:bg-white/10")}>Patient Vignettes</button>
          <button onClick={()=>setTab("topics")} className={cx("px-4 py-2 rounded-2xl text-base border", tab==="topics"?"bg-white/15 border-white/20":"bg-white/5 border-white/10 hover:bg-white/10")}>Topics</button>
          <button onClick={()=>setTab("histology")} className={cx("px-4 py-2 rounded-2xl text-base border", tab==="histology"?"bg-white/15 border-white/20":"bg-white/5 border-white/10 hover:bg-white/10")}>Histology</button>
          <button onClick={()=>setTab("review")} className={cx("px-4 py-2 rounded-2xl text-base border", tab==="review"?"bg-white/15 border-white/20":"bg-white/5 border-white/10 hover:bg-white/10")}>Review</button>
        </div>

        {/* -------------------- PATIENT VIGNETTES -------------------- */}
        {tab==="vignettes" && (
          <Glow className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Topic list with total question counts (decoupled) */}
              <div className="lg:col-span-1">
                <div className="text-lg font-semibold mb-2">Select subtopics (from any topics)</div>
                <div className="grid gap-2">
                  {GROUPS.map(g=>{
                    const hasSel = g.sub.some(s=>builderSubs.has(s.id));
                    return (
                      <button key={g.id}
                        className={cx("text-left px-3 py-2 rounded-xl border bg-white/5 hover:bg-white/10",
                          (hasSel ? "outline outline-2 outline-purple-400/60" : "")
                        )}
                        onClick={()=>{ setBuilderTopic(g.id); setSubPickerOpen(true);}}
                      >
                        <div className="font-semibold">{g.title}</div>
                        <div className="text-xs text-zinc-400">{g.sub.length} subtopics • {topicCount(g.id)} questions</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Centered options with summary */}
              <div className="lg:col-span-1 flex items-start justify-center">
                <div className="w-full max-w-md">
                  <div className="text-lg font-semibold mb-2 text-center">Quiz options</div>
                  <Glow className="p-4">
                    <div className="text-sm text-zinc-300 mb-2 text-center">
                      Selected <b>{builderSubs.size}</b> subtopics • Pool size: <b>{poolCountFromSelected()}</b> questions
                    </div>
                    <div className="grid gap-3">
                      <label className="flex items-center justify-between">
                        <span>Number of questions</span>
                        <input type="number" className={selectClass} min={1} max={50} value={builderCount} onChange={e=>setBuilderCount(parseInt(e.target.value||"10"))} />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Include explanations after lock-in</span>
                        <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={builderExplain} onChange={e=>setBuilderExplain(e.target.checked)} />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Timed quiz</span>
                        <input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={builderTimed} onChange={e=>setBuilderTimed(e.target.checked)} />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Seconds per question</span>
                        <input type="number" className={selectClass} min={10} max={180} step={5} value={builderSeconds} onChange={e=>setBuilderSeconds(parseInt(e.target.value||"60"))} />
                      </label>
                      <Primary disabled={builderSubs.size===0} onClick={buildQuizFromBuilder}>Create quiz →</Primary>
                    </div>
                  </Glow>
                </div>
              </div>

              {/* Selected subtopics panel with counts */}
              <div className="lg:col-span-1">
                <div className="text-lg font-semibold mb-2">Selected</div>
                <Glow className="p-3">
                  {builderSubs.size===0 ? (
                    <div className="text-zinc-400 text-sm">Nothing selected yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {[...builderSubs].map(id=>{
                        const s = ALL_SUBTOPICS.find(x=>x.id===id);
                        if(!s) return null;
                        const cnt = SUB_COUNTS[id] || 0;
                        return (
                          <span key={id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
                            {s.groupTitle} — {s.title} ({cnt})
                            <button className="ml-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20" onClick={()=>{
                              setBuilderSubs(prev=>{ const n=new Set(prev); n.delete(id); return n; });
                            }}>✕</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </Glow>
              </div>
            </div>

            {/* Subtopic picker modal with per-subtopic counts */}
            <Modal open={subPickerOpen} onClose={()=>setSubPickerOpen(false)}>
              {!builderTopic ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {GROUPS.map(g=> (
                    <button key={g.id} className="p-3 rounded-xl border bg-white/5 hover:bg-white/10 text-left"
                      onClick={()=>setBuilderTopic(g.id)}>
                      <div className="font-semibold">{g.title}</div>
                      <div className="text-xs text-zinc-400">{g.sub.length} subtopics • {topicCount(g.id)} questions</div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Button onClick={()=>setBuilderTopic(null)}>← Back</Button>
                    <div className="font-semibold">{GROUPS.find(g=>g.id===builderTopic)?.title}</div>
                    <div />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {GROUPS.find(g=>g.id===builderTopic)?.sub.map(s=>{
                      const on=builderSubs.has(s.id);
                      const cnt = SUB_COUNTS[s.id] || 0;
                      return (
                        <button key={s.id}
                          className={cx("text-left p-3 rounded-xl border bg-white/5 hover:bg-white/10 flex flex-col", on && "ring-2 ring-indigo-400")}
                          onClick={()=> setBuilderSubs(prev=>{ const n=new Set(prev); if(n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}
                        >
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-xs text-zinc-400 mt-1">Ref: {s.ref} • {cnt} questions</div>
                          {on && <div className="mt-2 text-xs text-indigo-300">Selected ✓</div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-right">
                    <Primary onClick={()=>{ setSubPickerOpen(false); }}>Confirm selection</Primary>
                  </div>
                </>
              )}
            </Modal>

            {/* Quiz modal */}
            <Modal open={quizOpen} onClose={()=>setQuizOpen(false)}>
              {quizList.length===0 ? <div>No questions in selection.</div> : (
                <QuizRunner
                  list={quizList}
                  index={quizIndex}
                  setIndex={setQuizIndex}
                  explain={builderExplain}
                  timed={builderTimed}
                  seconds={builderSeconds}
                  onRecord={(v,pick)=> recordAnswer(v,pick)}
                  perQuestionShowPrev={false}
                  prevNeutral={false}
                  lastAnswers={{}}
                />
              )}
            </Modal>
          </Glow>
        )}

        {/* -------------------- TOPICS -------------------- */}
        {tab==="topics" && (
          <div className="space-y-4">
            <Glow className="p-4">
              <div className="flex items-center gap-3">
                <div className="font-semibold">Mode:</div>
                <Button className={cx(topicsMode==="explorer" && "ring-2 ring-indigo-400")} onClick={()=>setTopicsMode("explorer")}>Explorer</Button>
                <Button className={cx(topicsMode==="quest" && "ring-2 ring-indigo-400")} onClick={()=>setTopicsMode("quest")}>Questline</Button>
              </div>
            </Glow>

            {GROUPS.map(G=>{
              const open = expanded.has(G.id);
              const unlocked = unlock[G.id]||1;
              return (
                <Glow key={G.id} className="overflow-hidden">
                  <button className="w-full flex items-center justify-between p-4" onClick={()=>setExpanded(prev=>{ const s=new Set(prev); if(s.has(G.id)) s.delete(G.id); else s.add(G.id); return s; })}>
                    <div className="text-xl font-bold">{G.title}</div>
                    <div className="flex items-center gap-2">
                      <Button onClick={(e)=>{ e.stopPropagation(); prepareBattleForTopic(G.id); }}>Battle ⚔️</Button>
                      <span className="text-sm text-zinc-400">{open? "Hide":"Show"}</span>
                    </div>
                  </button>
                  {open && (
                    <div className="grid sm:grid-cols-2 gap-3 p-4 pt-0">
                      {G.sub.map((S,idx)=>{
                        const isLocked = topicsMode==="quest" ? (idx >= unlocked) : false;
                        return (
                          <div key={S.id} className={cx("p-3 rounded-xl border bg-white/5", isLocked && "opacity-55")}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{S.title}</div>
                                <div className="text-xs text-zinc-400">Ref: {S.ref}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={()=>openLearn(S)} disabled={isLocked}>Learn</Button>
                                <Button onClick={()=>{ prepareBattleForTopic(G.id); }} disabled={isLocked}>Battle</Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Glow>
              );
            })}

            {/* Learn modal for topics */}
            <Modal open={learnOpen} onClose={()=>setLearnOpen(false)}>
              {learnSub && (
                <LearnBubble subtopic={learnSub} />
              )}
            </Modal>

            {/* Battle modal with banner + inline learn bubble above question (Explorer & Quest) */}
            <Modal open={battleOpen} onClose={()=>setBattleOpen(false)}>
              {battleBanner && (
                <div className={cx("mb-3 p-3 rounded-xl border",
                  battleBanner.type==="win"?"border-emerald-400/30 bg-emerald-900/20":"border-amber-400/30 bg-amber-900/20")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm">{battleBanner.text}</div>
                    {battleBanner.type==="learn" && battleBanner.subtopic && (
                      <Button onClick={()=>{ setBattleInlineLearn(battleBanner.subtopic); }}>
                        Relearn
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {battleInlineLearn && <LearnBubble subtopic={battleInlineLearn} />}
              {battleList.length===0 ? <div>No mastery questions yet.</div> : (
                <QuizRunner
                  list={battleList}
                  index={0}
                  setIndex={()=>{}}
                  explain={true}
                  timed={false}
                  seconds={0}
                  onRecord={onBattleAnswer}
                  perQuestionShowPrev={false}
                  prevNeutral={false}
                  lastAnswers={{}}
                  onNav={(dir)=>{ if(dir==="next"){ setBattleBanner(null); setBattleInlineLearn(null); } }}
                />
              )}
            </Modal>
          </div>
        )}

        {/* -------------------- HISTOLOGY -------------------- */}
        {tab==="histology" && (<Histology />)}

        {/* -------------------- REVIEW -------------------- */}
        {tab==="review" && (
          <Glow className="p-4">
            <div className="text-lg font-semibold mb-2">Review</div>

            {/* Missed Areas (select to retest subset) */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Missed Areas</div>
              {missedAreas.length===0 ? <div className="text-zinc-400">Miss some questions to see topic/subtopic breakdown.</div> : (
                <div className="flex flex-wrap gap-2">
                  {missedAreas.map(s=>{
                    const on = reviewSelectedAreas.has(s.id);
                    return (
                      <button key={s.id} onClick={()=>toggleArea(s.id)}
                        className={cx("px-3 py-1.5 rounded-full border text-sm",
                          on ? "bg-purple-600/30 border-purple-400/40" : "bg-white/10 border-white/15 hover:bg-white/15")}>
                        {s.groupTitle} — {s.title} {on?"✓":""}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-2">
                <Primary disabled={reviewSelectedAreas.size===0} onClick={battleMissedAreas}>Retest selected areas →</Primary>
              </div>
            </div>

            {/* Missed Questions list */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Missed Questions</div>
              {missedEntries.length===0 && <div className="text-zinc-400">No missed questions yet.</div>}
              <div className="grid gap-2">
                {missedEntries.map(([k,r])=>{
                  const q = VIGNETTES[parseInt(k,10)];
                  const st = q?.topicId ? ALL_SUBTOPICS.find(s=>s.id===q.topicId) : null;
                  return (
                    <Glow key={k} className="p-3">
                      <div className="font-semibold">{q?.stem}</div>
                      <div className="text-xs text-zinc-400 mt-1">Ref: {(q?.refSlide) || (st?.ref || "")}</div>
                    </Glow>
                  );
                })}
              </div>
            </div>

            {/* Practice wrong only (exact misses) */}
            <div>
              <Primary disabled={missedEntries.length===0} onClick={()=>{
                const list = missedEntries.map(([k])=>VIGNETTES[parseInt(k,10)]).filter(Boolean);
                const ev = new CustomEvent("openReviewModal", { detail: { list } });
                window.dispatchEvent(ev);
              }}>Practice wrong only →</Primary>
            </div>
          </Glow>
        )}
      </div>

      {/* Global invisible listener to show review modal (neutral previous-answer highlight) */}
      <ReviewPortal answers={reviewAnswers} onRecord={recordAnswer} />
    </div>
  );
}

/* ========= ReviewPortal ========= */
function ReviewPortal({ answers, onRecord }){
  const [open,setOpen]=useState(false);
  const [list,setList]=useState([]);
  useEffect(()=>{
    const h=(e)=>{ setList(e.detail.list||[]); setOpen(true); };
    window.addEventListener("openReviewModal",h);
    return ()=>window.removeEventListener("openReviewModal",h);
  },[]);
  return (
    <Modal open={open} onClose={()=>setOpen(false)}>
      {list.length===0 ? <div>No misses to practice.</div> : (
        <QuizRunner
          list={list}
          index={0}
          setIndex={()=>{}}
          explain={true}
          timed={false}
          seconds={0}
          onRecord={(v,p)=>onRecord(v,p)}
          perQuestionShowPrev={true}
          prevNeutral={true}  /* show previous answer only, neutral color */
          lastAnswers={answers}
        />
      )}
    </Modal>
  );
}
