import React, { useEffect, useMemo, useState } from "react";

/* =========================================================
   Utilities (no external libs)
========================================================= */
const cx = (...a) => a.filter(Boolean).join(" ");
const randInt = (n) => Math.floor(Math.random() * n);
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(arr, seed){const a=[...arr];const rnd=mulberry32(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()* (i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
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
  // Add more groups later (e.g. { id: "enz", title: "Enzymes", enabledByDefault: false, subtopics: [...] })
];

/* =========================================================
   Vignettes — full 50 from your original file
========================================================= */
const RAW_VIGNETTES = [
  { id: 1, stem: "A 24-year-old woman with suspected monogenic hearing loss has a negative hybridization-based screen despite a strong family history. The lab used a low-stringency protocol. Which best explains the false-negative?", choices: ["Hybridization at low stringency tolerates mismatches and may not discriminate single–base changes","Denaturation at high temperature causes DNA depurination","High salt prevents any duplex formation","Only RNA can hybridize under these conditions","Hybridization requires ligase activity to detect variants"], answer: 0, explanation: "Low-stringency (lower temp, higher salt) tolerates mismatches—poor for point mutations." },
  { id: 2, stem: "A researcher compares melting temperatures (Tm) of two DNA fragments. Fragment A is 70% GC; Fragment B is 40% GC. Which is true?", choices: ["Fragment A has a higher Tm due to greater GC content","Fragment B has a higher Tm due to more AT pairs","Tm is independent of base composition","Tm depends only on length, not GC%","Tm only applies to RNA duplexes"], answer: 0, explanation: "Higher GC% raises Tm (3 H-bonds vs 2)." },
  { id: 3, stem: "During a PCR setup, which condition would most favor DNA strand separation (denaturation)?", choices: ["Increased temperature and low ionic strength","Gradual cooling with high salt concentration","Neutral pH and magnesium ions","Addition of histones","Lowering temperature below room temperature"], answer: 0, explanation: "High temp + low ionic strength favor denaturation." },
  { id: 4, stem: "A radiolabeled probe designed for GLUT1 mRNA shows signal for GLUT2 under certain conditions. Which protocol change will make the probe more specific for GLUT1?", choices: ["Increase hybridization temperature and reduce salt concentration","Decrease temperature and increase salt concentration","Add DNA ligase to the hybridization buffer","Use RNA polymerase instead of reverse transcriptase","Increase magnesium concentration to stabilize mismatches"], answer: 0, explanation: "Higher stringency (↑temp, ↓salt) → more specific." },
  { id: 5, stem: "A patient with pyelonephritis is started on ciprofloxacin. The drug stabilizes DNA double-strand breaks created by a bacterial enzyme, preventing resealing. Which enzyme is targeted?", choices: ["DNA gyrase (type II topoisomerase)","DNA polymerase III","Topoisomerase I","Helicase","Ligase"], answer: 0, explanation: "Fluoroquinolones target gyrase (Topo II)." },
  { id: 6, stem: "A cell biologist notes progressive chromosome end shortening in cultured fibroblasts. What best characterizes human telomeres?", choices: ["Hexameric repeats present at both ends of linear DNA with 3' overhangs","Protein-only caps found on circular chromosomes","Random sequences that vary with each cell division","Sites of transcription for rRNA","Regions that encode tRNA genes"], answer: 0, explanation: "Eukaryotic chromosomes have telomeres with 3' overhangs." },
  { id: 7, stem: "A new human gene is found to produce a primary transcript that is processed before translation. Which genomic feature explains this?", choices: ["Presence of introns that are removed and exons that are retained","Operon organization producing polycistronic messages","Circular genomic DNA without proteins","Lack of untranslated regions","Absence of RNA splicing in eukaryotes"], answer: 0, explanation: "Eukaryotic genes have introns/exons; splicing required." },
  { id: 8, stem: "A forensic lab compares DNA from a crime scene with suspects using variable number tandem repeats (VNTRs). VNTRs are best described as:", choices: ["Tandem repeats ~10–100 bp (minisatellites) that vary in copy number among individuals","Single-copy protein-coding genes unique per haploid genome","Mobile LINE elements ~6 kb inserted into coding regions only","CpG islands within promoters that are methylated in active genes","Short 2–6 bp repeats called microsatellites, repeated 2–50 times"], answer: 0, explanation: "VNTRs are minisatellites (~10–100 bp) varying in copy number." },
  { id: 9, stem: "A research study links a trinucleotide-repeat mechanism to human disease. Which repeats are explicitly disease-associated here?", choices: ["CAG/CTG and CGG/CCG repeats","AUG/UGA repeats","AAA/TTT repeats","GUA/UAC repeats","UAA/UAG repeats"], answer: 0, explanation: "CAG/CTG and CGG/CCG highlighted for disease." },
  { id: 10, stem: "An experimental chromatin prep shows ~150 bp DNA protected by a protein core with linker DNA bound by a different histone. Which linker histone binds the spacer DNA between nucleosomes?", choices: ["H1","H2A","H2B","H3","H4"], answer: 0, explanation: "H1 binds linker DNA between nucleosomes." },
  { id: 11, stem: "Which change increases hybridization stringency during a Southern blot?", choices: ["Increase temperature and decrease salt","Decrease temperature and increase salt","Add ligase","Switch to alkaline phosphatase","Increase SDS only"], answer: 0, explanation: "↑Temp + ↓salt makes matching more exact." },
  { id: 12, stem: "A researcher notes that increasing the proportion of GC base pairs in a DNA duplex will:", choices: ["Increase melting temperature (Tm)","Decrease melting temperature (Tm)","Have no effect on Tm","Prevent denaturation entirely","Only affect RNA duplexes"], answer: 0, explanation: "More GC (3 H-bonds) makes denaturation harder → ↑Tm." },
  { id: 13, stem: "In DNA hybridization experiments, lowering the salt concentration while increasing the temperature will:", choices: ["Increase stringency, favoring perfect matches","Decrease stringency, allowing mismatches","Have no effect on stringency","Destabilize only GC base pairs","Stabilize all duplexes"], answer: 0, explanation: "↑Temp + ↓salt increases stringency." },
  { id: 14, stem: "A bacterium treated with ciprofloxacin dies due to failure to resolve DNA topology during replication. The drug likely inhibits:", choices: ["DNA gyrase (Topo II)","DNA polymerase I","Primase","Ligase","Helicase"], answer: 0, explanation: "Fluoroquinolone target = gyrase." },
  { id: 15, stem: "A eukaryotic mRNA includes a 5′ cap and a 3′ poly(A) tail. This is important for:", choices: ["Stability and translation initiation","DNA replication origin recognition","Transcription termination via rho factor","Formation of Holliday junctions","tRNA charging"], answer: 0, explanation: "Cap/tail stabilize and aid translation initiation." },
  { id: 16, stem: "A southern blot uses a probe that binds even to sequences with single-base mismatches. This indicates:", choices: ["Low stringency conditions","High stringency conditions","Over-digestion by restriction enzymes","Probe degradation","Excessive SDS concentration"], answer: 0, explanation: "Low stringency tolerates mismatches." },
  { id: 17, stem: "A nucleosome core protects roughly how many base pairs of DNA?", choices: ["~150 bp","~20 bp","~300 bp","~50 bp","~1000 bp"], answer: 0, explanation: "Around 150 bp per core particle." },
  { id: 18, stem: "Which histone is associated with linker DNA between nucleosomes?", choices: ["H1","H2A","H2B","H3","H4"], answer: 0, explanation: "Linker histone H1." },
  { id: 19, stem: "A DNA sample shows an absorbance increase at 260 nm as temperature rises. This is the:", choices: ["Hyperchromic effect","Hypochromic effect","Fluorescence quenching","Beer's law deviation","Rayleigh scattering"], answer: 0, explanation: "Melting increases A260." },
  { id: 20, stem: "A plasmid becomes negatively supercoiled due to the action of:", choices: ["DNA gyrase","RNA polymerase","Telomerase","Ligase","Topoisomerase I only"], answer: 0, explanation: "Gyrase introduces negative supercoils." },
  { id: 21, stem: "A human fibroblast divides repeatedly in culture until it hits a limit due to telomere shortening. Which enzyme counters this in stem cells?", choices: ["Telomerase","Topoisomerase I","DNA ligase","Exonuclease VII","DNA pol β"], answer: 0, explanation: "Telomerase extends telomeres." },
  { id: 22, stem: "Which RNA is most abundant in the cell?", choices: ["rRNA","mRNA","tRNA","miRNA","snRNA"], answer: 0, explanation: "rRNA >> tRNA >> mRNA." },
  { id: 23, stem: "A lab increases temperature and decreases salt during probe hybridization. Expected result?", choices: ["Only near-perfect matches remain stable","More mismatches tolerated","DNA denaturation is prevented","Probe cannot hybridize to RNA","Selects for A-T rich regions"], answer: 0, explanation: "High stringency selects perfect matches." },
  { id: 24, stem: "A genetic test fails to detect a single-base substitution due to permissive pairing. The protocol likely used:", choices: ["Low stringency","High stringency","Excess EDTA","RNase H treatment","Hybridization at 0 °C"], answer: 0, explanation: "Low stringency = permissive." },
  { id: 25, stem: "Which eukaryotic chromatin state is transcriptionally active?", choices: ["Euchromatin","Heterochromatin","Barr body","Centromeric heterochromatin","Telomeric heterochromatin"], answer: 0, explanation: "Euchromatin is open/active." },
  { id: 26, stem: "A patient’s genome has an expanded CGG repeat leading to disease. This is best described as:", choices: ["Triplet repeat expansion","Frameshift deletion","Nonsense mutation","Missense mutation","Synonymous variant"], answer: 0, explanation: "Triplet repeat diseases include CGG expansions." },
  { id: 27, stem: "Which enzyme introduces negative supercoils into bacterial DNA using ATP?", choices: ["DNA gyrase","Topoisomerase I","Primase","Helicase","Ligase"], answer: 0, explanation: "By definition, gyrase." },
  { id: 28, stem: "The 5′ cap of eukaryotic mRNA is linked via:", choices: ["5′–5′ triphosphate bridge","3′–3′ phosphodiester bond","Peptide bond","Glycosidic bond","Disulfide bond"], answer: 0, explanation: "5′–5′ connection." },
  { id: 29, stem: "A Southern blot probe binds multiple similar sequences unless conditions are very stringent. What variable most directly increases stringency?", choices: ["Temperature","Mg2+ concentration","EDTA","Proteinase K","pH"], answer: 0, explanation: "Higher temperature raises stringency." },
  { id: 30, stem: "Which feature distinguishes prokaryotic from eukaryotic mRNA?", choices: ["Polycistronic transcripts common in prokaryotes","5′ cap present in bacteria","Poly(A) tails universal in bacteria","Eukaryotic mRNA lacks UTRs","Prokaryotic mRNA has introns"], answer: 0, explanation: "Prokaryotes often have polycistronic mRNAs; no 5′ cap." },
  { id: 31, stem: "A DNA melting curve shifts to the right after GC content increases. Interpretation?", choices: ["Higher Tm due to increased stability","Lower Tm due to instability","Unchanged Tm","Only AT-rich regions melt","Instrument error"], answer: 0, explanation: "Right-shift = higher Tm." },
  { id: 32, stem: "Which nucleic acid modification tends to repress transcription?", choices: ["Promoter CpG methylation","Histone acetylation","H3K4me3","H3K36me3","5′ capping"], answer: 0, explanation: "Methylation near promoters = OFF." },
  { id: 33, stem: "A gel shows nucleosomes spaced with short DNA segments bound by a specific histone. Which one?", choices: ["H1","H2A","H2B","H3","H4"], answer: 0, explanation: "Linker histone H1 binds the spacer." },
  { id: 34, stem: "Which RNA has the anticodon loop and 3′-CCA tail?", choices: ["tRNA","rRNA","mRNA","snRNA","miRNA"], answer: 0, explanation: "tRNA has both features." },
  { id: 35, stem: "A probe designed for perfect complementarity fails at low temperature/high salt. Why?", choices: ["Low stringency allows mismatches to remain paired, masking perfect matches","DNA cannot hybridize at low temperature","Salt only dissolves duplexes","Only RNA can hybridize at low salt","Probe needs a 3′ OH to ligate"], answer: 0, explanation: "Low stringency tolerates mismatches; reduces specificity." },
  { id: 36, stem: "A DNA-Protein complex consistent with transcriptional repression is:", choices: ["H3K27me3-marked heterochromatin","H3K4me3-marked promoters","Hyperacetylated histones","TFIID at TATA","Open chromatin DNase hypersensitivity"], answer: 0, explanation: "H3K27me3 is repressive." },
  { id: 37, stem: "A disease caused by CAG repeat expansion primarily affects:", choices: ["Protein function via polyglutamine tracts","rRNA processing","tRNA charging","Spliceosome assembly","mRNA capping"], answer: 0, explanation: "CAG encodes glutamine; polyQ diseases." },
  { id: 38, stem: "A sample shows increased A260 as DNA is heated. This phenomenon is:", choices: ["Hyperchromic shift","Hypochromic shift","Fluorescence resonance","Photobleaching","Quenching"], answer: 0, explanation: "Classic hyperchromic effect." },
  { id: 39, stem: "Which enzyme is targeted by fluoroquinolones?", choices: ["DNA gyrase","DNA pol δ","RNA pol II","Helicase","Topoisomerase I only"], answer: 0, explanation: "Gyrase again." },
  { id: 40, stem: "Eukaryotic chromosomes have repetitive DNA such as LINEs and SINEs. Which is longer?", choices: ["LINEs","SINEs","They are identical length","Neither is repetitive","Only SINEs are in introns"], answer: 0, explanation: "LINEs are long (~5–6 kb) vs SINEs (~100–200 nt)." },
  { id: 41, stem: "Which chromatin state is compact and transcriptionally silent?", choices: ["Heterochromatin","Euchromatin","Acetylated regions","Enhancers","Promoters"], answer: 0, explanation: "Heterochromatin = silent." },
  { id: 42, stem: "Which RNA directly catalyzes peptide bond formation?", choices: ["rRNA","mRNA","tRNA","miRNA","lncRNA"], answer: 0, explanation: "rRNA is the ribozyme." },
  { id: 43, stem: "A telomerase-deficient cell line experiences:", choices: ["Progressive telomere shortening","Increased telomere length","Circular chromosome formation","No change in telomeres","More intron retention"], answer: 0, explanation: "No telomerase → shortening." },
  { id: 44, stem: "Which hybridization condition best detects a single nucleotide difference?", choices: ["High temperature and low salt","Low temperature and high salt","High temperature and high salt","Low temperature and low salt","Room temperature and neutral pH"], answer: 0, explanation: "High stringency needed for SNP detection." },
  { id: 45, stem: "A lab uses minisatellites for forensics. These are best described as:", choices: ["10–100 bp tandem repeats (VNTRs)","2–6 bp tandem repeats (STRs)","Mobile elements that copy-paste","Promoter CpG islands","Triplet repeat expansions only"], answer: 0, explanation: "VNTRs are 10–100 bp." },
  { id: 46, stem: "Which RNA modification typically correlates with transcriptional activation?", choices: ["Histone acetylation","Promoter CpG methylation","H3K27me3","DNA glycosylation","5′ cap removal"], answer: 0, explanation: "Acetylation opens chromatin." },
  { id: 47, stem: "A probe binds only to its exact complement when temperature is raised. This indicates:", choices: ["Increased stringency","Decreased stringency","Probe degradation","RNase contamination","Excessive Mg2+"], answer: 0, explanation: "Higher temp increases stringency." },
  { id: 48, stem: "The least abundant RNA in most cells is:", choices: ["mRNA","rRNA","tRNA","miRNA","snRNA"], answer: 0, explanation: "mRNA is least abundant (rRNA >> tRNA >> mRNA)." },
  { id: 49, stem: "A researcher wants only exact matches to persist in a blot. They should:", choices: ["Raise temperature and lower salt","Lower temperature and raise salt","Add ligase","Use alkaline phosphatase","Add SDS only"], answer: 0, explanation: "Raise stringency." },
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
   UI atoms (larger sizing)
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
   Vignette card (ELI5 visibly explained)
========================================================= */
const VignetteCard = ({ v, initialPick, initialSubmitted, onPick, onSubmit, onUnsubmit }) => {
  const [picked, setPicked] = useState(initialPick ?? null);
  const [submitted, setSubmitted] = useState(!!initialSubmitted);
  useEffect(() => { setPicked(initialPick ?? null); setSubmitted(!!initialSubmitted); }, [v?.id, initialPick, initialSubmitted]);
  if (!v) return null;
  const isCorrect = picked === v.correctIndex;

  const clickChoice = (i) => {
    if (submitted) { setSubmitted(false); onUnsubmit?.(); }
    setPicked(i); onPick?.(i);
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700">
      <div className="text-zinc-100 text-xl font-semibold mb-4 leading-relaxed">{v.stem}</div>
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
          <Primary onClick={() => { if (picked != null) { setSubmitted(true); onSubmit?.(picked, picked === v.correctIndex); } }} disabled={picked==null}>
            Submit
          </Primary>
        ) : (
          <div className={cx("mt-3 p-4 rounded-xl text-base leading-relaxed", isCorrect ? "bg-emerald-600/20 text-emerald-300" : "bg-rose-600/20 text-rose-300")}>
            {isCorrect ? "Correct!" : "Not quite."}
            <div className="mt-2 text-zinc-200">{v.explanation}</div>
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
   Boss Fight — always at least 5 Qs (samples with replacement if needed)
========================================================= */
const BossFight = ({ onClose, onDone, topicFilter }) => {
  const pool = useMemo(() => {
    const subset = topicFilter && topicFilter.size
      ? VIGNETTES.filter(v => v.topicId && topicFilter.has(v.topicId))
      : VIGNETTES;
    const NEED = 5;
    if (subset.length === 0) return [];
    if (subset.length >= NEED) {
      const set = new Set();
      while (set.size < NEED) set.add(subset[randInt(subset.length)]);
      return Array.from(set);
    }
    // subset < 5 → sample with replacement to reach 5
    const out = [];
    for (let i=0;i<NEED;i++){ out.push(subset[randInt(subset.length)]); }
    return out;
  }, [topicFilter]);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const v = pool[i];
  const correct = picked === (v?.correctIndex);
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-3xl w-full mx-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Boss Fight ⚔️</h3>
          <Button onClick={finish}>Exit</Button>
        </div>
        <div className="text-base text-zinc-400 mb-3">Question {i+1} / {pool.length} • Score: {score}</div>
        <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700">
          <div className="text-zinc-100 font-semibold mb-3 text-lg leading-relaxed">{v.stem}</div>
          <div className="grid gap-3">
            {v.choices.map((c, idx) => (
              <button key={idx} onClick={() => { setPicked(idx); }} className={cx("text-left px-4 py-3.5 rounded-2xl border text-[17px] leading-relaxed",
                picked === idx ? "bg-zinc-700 border-zinc-500" : "bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800")}>{c}</button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {!submitted ? (
              <Primary onClick={() => { if (picked!=null){ setSubmitted(true); if (correct) setScore(s=>s+1);} }} disabled={picked==null}>Submit</Primary>
            ) : (
              <div className={cx("px-3 py-2 rounded-xl text-base", correct?"bg-emerald-600/20 text-emerald-300":"bg-rose-600/20 text-rose-300")}>{correct?"Correct":"Nope"}</div>
            )}
            {submitted && (
              <Primary className="bg-sky-600 hover:bg-sky-500" onClick={() => { if (i < pool.length - 1){ setI(i+1); setPicked(null); setSubmitted(false);} else { finish(); } }}>Next</Primary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Topic modal (mark done unlocks next subtopic in that group)
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
          <li>1) This is <b>{APP_TITLE}</b>. Toggle a <b>Topic Group</b> (e.g., <b>Amino Acids</b>) ON to reveal its <b>subtopics</b>.</li>
          <li>2) <b>Progression</b>: open a subtopic and click <b>Mark Topic Done</b> to unlock the next. Winning a <b>Boss Fight</b> also unlocks.</li>
          <li>3) <b>Free Explore</b>: tick subtopic checkboxes, then hit <b>Start Boss</b> to fight from that pool.</li>
          <li>4) <b>ELI5</b> = “Explain Like I’m 5”. Click to see a simple explanation.</li>
          <li>5) <b>Patient Vignettes</b>: first select at least one subtopic. The vignette list will match your selection.</li>
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

  // ==== Vignette state (tied to master VIGNETTES via __seqIndex) ====
  const pool = filteredVignettes(selectedTopicIds);
  const [idx, setIdx] = useState(0);
  const v = pool[idx] || null;
  const [answers, setAnswers] = useState(() => VIGNETTES.map(() => ({ picked: null, submitted: false, gotCorrect: false, awarded: false })));
  const a = v ? answers[v.__seqIndex] : { picked: null, submitted: false, gotCorrect: false, awarded: false };

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
    // Deselect subtopics if group is turned OFF
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
    setIdx(0); // reset to first when selection changes
  }

  function startBossWithSelection(){
    const active = selectedTopicIds.size ? new Set(selectedTopicIds) : null;
    set_BossTopicFilter(active);
    setShowBoss(true);
  }

  // topicFilter for Boss modal
  const [bossTopicFilter, set_BossTopicFilter] = useState(null);

  // ======= Filtering (hide vignettes until at least one subtopic is selected) =======
  function filteredVignettes(selSet){
    if (!selSet || selSet.size === 0) return []; // <- important: nothing shows until filtered
    const pool = VIGNETTES.filter(q => q.topicId && selSet.has(q.topicId));
    return pool.map(q => ({ ...q, __seqIndex: VIGNETTES.findIndex(orig => orig.id === q.id) }));
  }
  const totalShown = pool.length;

  // ======= Submit/score handlers =======
  const submit = (picked, correct) => {
    if (!v) return;
    const absoluteIdx = v.__seqIndex;
    setAnswers(prev => {
      const c=[...prev];
      c[absoluteIdx] = { ...c[absoluteIdx], picked, submitted:true, gotCorrect: correct || c[absoluteIdx].gotCorrect };
      return c;
    });
    if (correct && !answers[absoluteIdx]?.awarded) {
      setXp(x => x + 25);
      setStreak(s => s + 1);
      setAnswers(prev => { const c=[...prev]; c[absoluteIdx] = { ...c[absoluteIdx], awarded:true }; return c; });
    }
    if (!correct) { setStreak(0); setLives(l => Math.max(0, l-1)); }
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-5 sm:p-7 text-[17px]">
      <ShakeCSS />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">{APP_TITLE} — Study Game</h1>
            <p className="text-zinc-400 text-base">Patient Vignettes • XP & Streak • Boss • ELI5</p>
          </div>
          <div className="flex items-center gap-3">
            <HeartBar lives={lives} />
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-base">Streak: <span className="font-semibold">{streak}</span></span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-base">XP: <span className="font-semibold">{xp}</span></span>
            <Button onClick={() => setShowTutorial(true)} title="Open tutorial">Tutorial ❓</Button>
          </div>
        </header>

        {/* Progress */}
        <XpBar xp={xp} />
        <div className="text-sm text-zinc-500">Vignettes mastered: {mastered}/{VIGNETTES.length} • Overall Progress: {progressPct}%</div>

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
                  onClick={startBossWithSelection}
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
                          return (
                            <div key={T.id}
                              className={cx("text-left p-4 rounded-2xl border transition relative",
                                locked?"bg-zinc-900/40 border-zinc-800 opacity-50 pointer-events-none":"bg-zinc-900 border-zinc-700 hover:bg-zinc-800")}
                            >
                              {/* Checkbox to include/exclude this subtopic for Boss + filtering */}
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
                                <span className="text-xs text-zinc-400">Ref: {T.ref}</span>
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
            {/* Grouped filter UI: heading “Amino Acids” then its subtopics */}
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900">
              <div className="p-4 border-b border-zinc-800">
                <div className="text-lg font-semibold">Vignette Topic Filter</div>
                <div className="text-sm text-zinc-400">
                  {selectedTopicIds.size===0 ? "Select at least one subtopic to begin." : `Selected: ${selectedTopicIds.size} subtopic(s) • Showing ${totalShown} question(s)`}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {TOPIC_GROUPS.map(g => (
                  <div key={g.id} className="space-y-2">
                    <div className="text-base font-bold">{g.title}</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {g.subtopics.map(st => {
                        const selected = selectedTopicIds.has(st.id);
                        return (
                          <label key={st.id} className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5 accent-indigo-600"
                                   checked={selected}
                                   onChange={() => toggleSubtopicSelected(st.id)} />
                            <span className="text-base">{st.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* If none selected, show nothing below */}
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
                  onSubmit={(picked, correct) => submit(picked, correct)}
                  onUnsubmit={() => unsubmit()}
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
            }
          }}
        />
      )}

      {/* Topic modal bridge */}
      <TopicModalBridge onSubtopicDone={(gid, i)=>onSubtopicDone(gid, i)} />
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
