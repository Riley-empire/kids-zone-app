import React, { useState, useEffect, useRef, useCallback } from "react";

/* ---------------------------------------------------------
   KID ZONE — a playful multi-activity hub for kids
   Map-style home, games, drawing, stories, jokes,
   a sticker/behaviour chart, Buddy helper, and a
   parent-gated Parent Corner with a premium unlock.
--------------------------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');`;

const PALETTE = {
  cream: "#FFF8ED",
  sky: "#6EC6E8",
  coral: "#FF6B6B",
  sun: "#FFD166",
  grass: "#06D6A0",
  plum: "#3A2E5C",
};

const STRINGS = {
  en: {
    appName: "Kid Zone",
    subtitle: "Pick a stop on the map!",
    stories: "Stories", games: "Games", draw: "Draw & Color",
    jokes: "Jokes & Facts", chart: "Sticker Chart", parent: "Parent Corner",
    back: "Back to map", stickers: "stars", name: "Explorer",
    stickerBook: "Sticker Book", helper: "Buddy",
    locked: "Locked", askParent: "Ask a parent to unlock this in Parent Corner.",
  },
  es: {
    appName: "Zona Infantil",
    subtitle: "¡Elige una parada en el mapa!",
    stories: "Cuentos", games: "Juegos", draw: "Dibujar y Colorear",
    jokes: "Chistes y Datos", chart: "Tabla de Estrellas", parent: "Rincón de Padres",
    back: "Volver al mapa", stickers: "estrellas", name: "Explorador",
    stickerBook: "Libro de Pegatinas", helper: "Buddy",
    locked: "Bloqueado", askParent: "Pide a un padre que lo desbloquee en el Rincón de Padres.",
  },
  fr: {
    appName: "Zone Enfants",
    subtitle: "Choisis un arrêt sur la carte !",
    stories: "Histoires", games: "Jeux", draw: "Dessiner et Colorier",
    jokes: "Blagues et Faits", chart: "Tableau d'Étoiles", parent: "Coin Parents",
    back: "Retour à la carte", stickers: "étoiles", name: "Explorateur",
    stickerBook: "Livre d'Autocollants", helper: "Buddy",
    locked: "Verrouillé", askParent: "Demande à un parent de déverrouiller dans le Coin Parents.",
  },
};

const STORAGE_KEY = "kidzone-profile-v1";
const FREE_STORIES = 3;
const FREE_JOKES = 8;
const FREE_FACTS = 8;
const FREE_TEMPLATES = 3;

const DEFAULT_TASKS = [
  { id: "t1", label: "Brushed teeth" },
  { id: "t2", label: "Tidied toys" },
  { id: "t3", label: "Kind words today" },
  { id: "t4", label: "Read a story" },
];

const DEFAULT_REWARDS = [
  { id: "r1", name: "Extra bedtime story", cost: 5 },
  { id: "r2", name: "Pick the family dinner", cost: 10 },
  { id: "r3", name: "Stay up 15 minutes late", cost: 15 },
];

const BUDDY_ICONS = ["🦉","🐻","🦊","🐰","🐼","🦁","🐸","🐶","🐢","🦄"];

const STORIES = [
  { title: "The Kite That Wouldn't Fly", emoji: "🪁", pages: [
    "Milo made a bright red kite, but every time he ran, it flopped to the ground.",
    "\"Maybe I need more wind,\" he said, and climbed the hill behind his house.",
    "He tried again near the top, arms tired, sure it would flop just like before.",
    "A gust swept in — and the kite lifted, dipped, then soared straight up!",
    "Milo laughed as it danced above the trees, tugging gently at the string.",
    "Some things just need the right moment — and a little patience to find it.",
  ]},
  { title: "The Smallest Seed", emoji: "🌱", pages: [
    "Nia planted the tiniest seed in the garden. Her brother planted a huge one.",
    "His grew fast, tall and proud within a week. Hers barely poked through the soil.",
    "She watered it anyway, every single day, even when nothing seemed to happen.",
    "Weeks later, his plant wilted in the hot sun, its roots too shallow to hold on.",
    "Hers had grown deep, strong roots instead, quietly working underground.",
    "Then it bloomed — the tallest sunflower on the block. Patience had paid off.",
  ]},
  { title: "Boots and the Thunderstorm", emoji: "🐾", pages: [
    "Boots the puppy was scared of thunder and hid under the bed every time.",
    "One stormy night, his friend Sam sat beside him with a flashlight and a song.",
    "Boots peeked out. The thunder still rumbled, but it didn't feel so big anymore.",
    "Sam counted seconds between the flash and the boom, like a little game.",
    "Slowly, Boots' tail started to wag again, even as rain tapped the window.",
    "By morning, Boots learned storms pass — and friends make the waiting easier.",
  ]},
  { title: "The Lighthouse Keeper's Cat", emoji: "🐈", pages: [
    "Pepper the cat lived atop a tall lighthouse with her keeper, old Mr. Finn.",
    "Every night she watched the great light spin, sweeping over the dark sea.",
    "One foggy evening, a small boat lost its way, unable to see the shore.",
    "Pepper knocked a bell off the shelf, again and again, until Mr. Finn woke up.",
    "He lit the fog bell just in time, and the boat turned safely toward the light.",
    "The sailors never knew a cat had saved them — but Pepper always did.",
  ]},
  { title: "Mira and the Missing Sock", emoji: "🧦", pages: [
    "Mira could only ever find one sock from every pair. It drove her crazy.",
    "One day she followed a trail of fuzzy lint behind the dryer, curious.",
    "There, in a cozy nest, lived a tiny mouse wrapped in her missing socks!",
    "\"I was cold,\" the mouse squeaked shyly, peeking out from the pile.",
    "Mira smiled and left one old sock behind on purpose, as a soft blanket.",
    "From then on, she never minded a missing sock — she knew where it went.",
  ]},
  { title: "The Robot Who Learned to Laugh", emoji: "🤖", pages: [
    "Bolt the robot could calculate anything, but he had never once laughed.",
    "\"What is funny?\" he asked the children at the science fair, tilting his head.",
    "A girl told him a silly joke about a cookie feeling crummy at the doctor.",
    "Bolt's circuits whirred. He didn't understand — but everyone else giggled.",
    "He tried again and again, collecting jokes like data, until one just clicked.",
    "Then his speaker crackled out a real, warm laugh. Bolt had found something new.",
  ]},
  { title: "Under the Old Oak Tree", emoji: "🌳", pages: [
    "Every summer, the cousins gathered under the same old oak tree to trade stories.",
    "This year, Grandpa Theo brought a wooden box full of photos no one had seen.",
    "One showed him as a boy, climbing that very tree with his own grandfather.",
    "\"The tree remembers more than I do,\" he laughed, running a hand over the bark.",
    "The cousins carved their initials gently into a low branch, just like he once had.",
    "Someday, they realized, someone else would sit here and hear about them too.",
  ]},
  { title: "The Little Boat That Could", emoji: "⛵", pages: [
    "The little red sailboat was the smallest in the harbor, easy to overlook.",
    "When the big race began, the tall yachts sped off, leaving her far behind.",
    "But a storm rolled in, and the big boats struggled against the heavy wind.",
    "The little boat, light and nimble, slipped through gaps the others couldn't.",
    "She wasn't the fastest in calm water — but she knew how to handle rough seas.",
    "She crossed the line first, proving size was never really the point.",
  ]},
  { title: "Stars for Luna", emoji: "⭐", pages: [
    "Luna was afraid of the dark, so her mom gave her a jar to catch starlight.",
    "Each night, she'd hold it up to the window and imagine a star sliding in.",
    "Soon the jar glowed faintly — or maybe that was just her imagination growing.",
    "One night the power went out, and the whole house went completely dark.",
    "Luna grabbed her jar without thinking, and somehow, the dark felt smaller.",
    "She realized the light had been inside her all along, jar or no jar.",
  ]},
  { title: "The Garden of Whispers", emoji: "🌷", pages: [
    "Behind Grandma's house was a garden where she swore the flowers could listen.",
    "\"Tell the roses your worries,\" she'd say, \"and they'll carry them away.\"",
    "At first it felt silly, but the boy whispered about his first day of school anyway.",
    "The roses swayed gently, though it might have just been the breeze.",
    "Somehow, walking back inside, his worry felt lighter than it had all morning.",
    "He never knew if the flowers really listened — but he kept telling them anyway.",
  ]},
];

const JOKES = [
  { q: "Why did the cookie go to the doctor?", a: "Because it felt crummy!" },
  { q: "What do you call a bear with no teeth?", a: "A gummy bear!" },
  { q: "Why can't a bicycle stand up by itself?", a: "It's two tired!" },
  { q: "What do you call a fish with no eyes?", a: "A fsh!" },
  { q: "Why did the math book look sad?", a: "It had too many problems." },
  { q: "What do you call cheese that isn't yours?", a: "Nacho cheese!" },
  { q: "Why did the scarecrow win an award?", a: "He was outstanding in his field!" },
  { q: "What do you call a sleeping dinosaur?", a: "A dino-snore!" },
  { q: "Why don't eggs tell jokes?", a: "They'd crack each other up!" },
  { q: "What do you call a can opener that doesn't work?", a: "A can't opener!" },
  { q: "Why did the banana go to the doctor?", a: "It wasn't peeling well!" },
  { q: "What do you call a boomerang that won't come back?", a: "A stick!" },
  { q: "Why did the picture go to jail?", a: "It was framed!" },
  { q: "What do you call a dinosaur that crashes his car?", a: "Tyrannosaurus wrecks!" },
  { q: "Why couldn't the pony sing a lullaby?", a: "It was a little hoarse!" },
  { q: "What do you call a pig that does karate?", a: "A pork chop!" },
  { q: "Why did the golfer bring two pairs of pants?", a: "In case he got a hole in one!" },
  { q: "What do you call a snowman in July?", a: "A puddle!" },
  { q: "Why was the belt arrested?", a: "For holding up a pair of pants!" },
  { q: "What do you call a bear with no ears?", a: "B!" },
];

const FACTS = [
  "Octopuses have three hearts.",
  "Honey never spoils — archaeologists have found edible honey in ancient tombs.",
  "A group of flamingos is called a flamboyance.",
  "Bananas are berries, but strawberries aren't!",
  "Sea otters hold hands while sleeping so they don't drift apart.",
  "A single cloud can weigh more than a million pounds.",
  "Butterflies taste with their feet.",
  "A shrimp's heart is in its head.",
  "Wombat poop is cube-shaped.",
  "Sharks existed before trees did.",
  "A group of pandas is called an embarrassment.",
  "The Eiffel Tower can grow taller in summer heat.",
  "Some turtles can breathe through their bottoms.",
  "A snail can sleep for three years.",
  "Elephants can't jump.",
  "There are more stars in the sky than grains of sand on Earth.",
  "Koalas have fingerprints almost identical to humans.",
  "A bolt of lightning is hotter than the surface of the sun.",
  "Cows have best friends and get stressed when separated.",
  "The shortest war in history lasted about 38 minutes.",
];

/* ---------- Storage helpers (browser localStorage) ---------- */
async function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // best-effort
  }
}

/* ---------- Shared UI bits ---------- */
function ScreenShell({ title, emoji, onBack, labels, children }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={onBack} className="text-sm font-semibold px-3 py-2 rounded-full"
          style={{ background: PALETTE.cream, color: PALETTE.plum, fontFamily: "Nunito" }}>
          ← {labels.back}
        </button>
      </div>
      <div className="px-5 pb-2 flex items-center gap-2">
        <span className="text-3xl">{emoji}</span>
        <h2 className="text-2xl" style={{ fontFamily: "Fredoka", color: PALETTE.plum }}>{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
    </div>
  );
}

function LockedCard({ title, labels }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#EFEAE0" }}>
      <div>
        <p className="font-semibold" style={{ color: PALETTE.plum, opacity: 0.6 }}>🔒 {title}</p>
        <p className="text-xs mt-1" style={{ color: PALETTE.plum, opacity: 0.5 }}>{labels.askParent}</p>
      </div>
    </div>
  );
}

/* ---------- Games ---------- */
function MemoryMatch({ onWin }) {
  const emojis = ["🐶","🐱","🦊","🐻","🐸","🦁"];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const shuffle = useCallback(() => {
    const deck = [...emojis, ...emojis].map((e, i) => ({ id: i, e })).sort(() => Math.random() - 0.5);
    setCards(deck); setFlipped([]); setMatched([]);
  }, []);
  useEffect(() => { shuffle(); }, [shuffle]);
  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a].e === cards[b].e) { setMatched((m) => [...m, a, b]); setFlipped([]); }
      else setTimeout(() => setFlipped([]), 700);
    }
  }, [flipped, cards]);
  useEffect(() => { if (cards.length && matched.length === cards.length) onWin?.(); }, [matched, cards, onWin]);
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 max-w-sm">
        {cards.map((c, i) => {
          const isUp = flipped.includes(i) || matched.includes(i);
          return (
            <button key={c.id} onClick={() => { if (!isUp && flipped.length < 2 && !flipped.includes(i)) setFlipped((f) => [...f, i]); }}
              className="aspect-square rounded-2xl text-2xl flex items-center justify-center active:scale-95"
              style={{ background: isUp ? PALETTE.sun : PALETTE.sky, color: PALETTE.plum }}>
              {isUp ? c.e : "?"}
            </button>
          );
        })}
      </div>
      {cards.length > 0 && matched.length === cards.length && <p className="mt-3 font-bold" style={{ color: PALETTE.grass }}>Matched them all! 🎉</p>}
      <button onClick={shuffle} className="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>New game</button>
    </div>
  );
}

function TicTacToe({ onWin }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("🐵");
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = lines.map(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c] ? board[a] : null).find(Boolean);
  useEffect(() => { if (winner) onWin?.(); }, [winner, onWin]);
  const play = (i) => { if (board[i] || winner) return; const next = [...board]; next[i] = turn; setBoard(next); setTurn(turn === "🐵" ? "🦄" : "🐵"); };
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 max-w-[220px]">
        {board.map((v, i) => (
          <button key={i} onClick={() => play(i)} className="w-16 h-16 rounded-2xl text-3xl flex items-center justify-center"
            style={{ background: PALETTE.cream, border: `3px solid ${PALETTE.sky}` }}>{v}</button>
        ))}
      </div>
      <p className="mt-3 text-sm" style={{ color: PALETTE.plum }}>{winner ? `${winner} wins! 🎉` : `Turn: ${turn}`}</p>
      <button onClick={() => setBoard(Array(9).fill(null))} className="mt-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>Reset</button>
    </div>
  );
}

function WordScramble({ onWin }) {
  const words = ["APPLE","OCEAN","PUPPY","SMILE","CLOUD","MUSIC","TIGER","PLANT"];
  const [word, setWord] = useState(""); const [scrambled, setScrambled] = useState(""); const [guess, setGuess] = useState(""); const [msg, setMsg] = useState("");
  const next = useCallback(() => {
    const w = words[Math.floor(Math.random() * words.length)];
    let s = w; while (s === w) s = w.split("").sort(() => Math.random() - 0.5).join("");
    setWord(w); setScrambled(s); setGuess(""); setMsg("");
  }, []);
  useEffect(() => { next(); }, [next]);
  const check = () => {
    if (guess.trim().toUpperCase() === word) { setMsg("Correct! 🌟"); onWin?.(); setTimeout(next, 1200); }
    else setMsg("Try again!");
  };
  return (
    <div className="max-w-xs">
      <p className="text-3xl tracking-widest font-bold mb-3" style={{ color: PALETTE.plum }}>{scrambled}</p>
      <input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()}
        className="w-full px-3 py-2 rounded-xl border-2 outline-none" style={{ borderColor: PALETTE.sky }} placeholder="Type your guess" />
      <div className="flex gap-2 mt-3">
        <button onClick={check} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Check</button>
        <button onClick={next} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.sun, color: PALETTE.plum }}>Skip</button>
      </div>
      {msg && <p className="mt-2 font-semibold" style={{ color: PALETTE.coral }}>{msg}</p>}
    </div>
  );
}

function SlidingPuzzle({ onWin }) {
  const solved = [1,2,3,4,5,6,7,8,null];
  const [tiles, setTiles] = useState(solved); const [won, setWon] = useState(false);
  const shuffle = useCallback(() => {
    let arr = [...solved];
    for (let i = 0; i < 200; i++) {
      const blank = arr.indexOf(null);
      const neighbors = [blank-1,blank+1,blank-3,blank+3].filter((n) => {
        if (n < 0 || n > 8) return false;
        if ((blank%3===0 && n===blank-1) || (blank%3===2 && n===blank+1)) return false;
        return true;
      });
      const swap = neighbors[Math.floor(Math.random()*neighbors.length)];
      [arr[blank], arr[swap]] = [arr[swap], arr[blank]];
    }
    setTiles(arr); setWon(false);
  }, []);
  useEffect(() => { shuffle(); }, [shuffle]);
  useEffect(() => { if (tiles.every((v,i)=>v===solved[i]) && !won) { setWon(true); onWin?.(); } }, [tiles]);
  const move = (i) => {
    const blank = tiles.indexOf(null);
    const isNeighbor = [blank-1,blank+1,blank-3,blank+3].includes(i) && !((blank%3===0 && i===blank-1) || (blank%3===2 && i===blank+1));
    if (!isNeighbor) return;
    const next = [...tiles]; [next[blank], next[i]] = [next[i], next[blank]]; setTiles(next);
  };
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 max-w-[220px]">
        {tiles.map((v,i) => (
          <button key={i} onClick={() => move(i)} className="w-16 h-16 rounded-2xl text-xl font-bold flex items-center justify-center"
            style={{ background: v ? PALETTE.sun : "transparent", color: PALETTE.plum, border: v ? "none" : `2px dashed ${PALETTE.sky}` }}>{v || ""}</button>
        ))}
      </div>
      {won && <p className="mt-3 font-bold" style={{ color: PALETTE.grass }}>Solved it! 🧩</p>}
      <button onClick={shuffle} className="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>New puzzle</button>
    </div>
  );
}

function MathQuiz({ onWin }) {
  const [q, setQ] = useState(null); const [msg, setMsg] = useState("");
  const gen = useCallback(() => {
    const a = 1 + Math.floor(Math.random()*10), b = 1 + Math.floor(Math.random()*10);
    const op = Math.random() > 0.5 ? "+" : "-";
    const [x,y] = op === "-" && a < b ? [b,a] : [a,b];
    const answer = op === "+" ? x+y : x-y;
    const choices = new Set([answer]);
    while (choices.size < 4) choices.add(Math.max(0, answer + Math.floor(Math.random()*7) - 3));
    setQ({ x, y, op, answer, choices: [...choices].sort(() => Math.random()-0.5) }); setMsg("");
  }, []);
  useEffect(() => { gen(); }, [gen]);
  if (!q) return null;
  return (
    <div className="max-w-xs">
      <p className="text-2xl font-bold mb-3" style={{ color: PALETTE.plum }}>{q.x} {q.op} {q.y} = ?</p>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map((c) => (
          <button key={c} onClick={() => { if (c===q.answer) { setMsg("Correct! 🎉"); onWin?.(); setTimeout(gen, 900); } else setMsg("Try again!"); }}
            className="py-3 rounded-xl text-lg font-bold" style={{ background: PALETTE.sky, color: "white" }}>{c}</button>
        ))}
      </div>
      {msg && <p className="mt-2 font-semibold" style={{ color: PALETTE.coral }}>{msg}</p>}
    </div>
  );
}

function ColorMatch({ onWin }) {
  const colors = [{n:"Red",v:PALETTE.coral},{n:"Yellow",v:PALETTE.sun},{n:"Green",v:PALETTE.grass},{n:"Blue",v:PALETTE.sky}];
  const [target, setTarget] = useState(colors[0]); const [msg, setMsg] = useState("");
  const next = useCallback(() => { setTarget(colors[Math.floor(Math.random()*colors.length)]); setMsg(""); }, []);
  useEffect(() => { next(); }, [next]);
  return (
    <div className="max-w-xs">
      <p className="text-xl font-bold mb-3" style={{ color: PALETTE.plum }}>Tap the color: {target.n}</p>
      <div className="grid grid-cols-2 gap-2">
        {colors.sort(() => Math.random()-0.5).map((c) => (
          <button key={c.n} onClick={() => { if (c.n===target.n) { setMsg("Yes! 🌟"); onWin?.(); setTimeout(next, 800); } else setMsg("Not quite, try again!"); }}
            className="h-16 rounded-xl" style={{ background: c.v }} />
        ))}
      </div>
      {msg && <p className="mt-2 font-semibold" style={{ color: PALETTE.plum }}>{msg}</p>}
    </div>
  );
}

function RockPaperScissors({ onWin }) {
  const opts = [{k:"rock",e:"✊"},{k:"paper",e:"✋"},{k:"scissors",e:"✌️"}];
  const [result, setResult] = useState("");
  const play = (mine) => {
    const cpu = opts[Math.floor(Math.random()*3)];
    let outcome;
    if (mine.k === cpu.k) outcome = "It's a tie!";
    else if ((mine.k==="rock"&&cpu.k==="scissors")||(mine.k==="paper"&&cpu.k==="rock")||(mine.k==="scissors"&&cpu.k==="paper")) { outcome = "You win! 🎉"; onWin?.(); }
    else outcome = "Buddy wins this round!";
    setResult(`You: ${mine.e}  Buddy: ${cpu.e} — ${outcome}`);
  };
  return (
    <div className="max-w-xs">
      <div className="flex gap-2">
        {opts.map((o) => <button key={o.k} onClick={() => play(o)} className="text-3xl px-4 py-3 rounded-xl" style={{ background: PALETTE.sun }}>{o.e}</button>)}
      </div>
      {result && <p className="mt-3 font-semibold text-sm" style={{ color: PALETTE.plum }}>{result}</p>}
    </div>
  );
}

function SimonSays({ onWin }) {
  const colors = [PALETTE.coral, PALETTE.sun, PALETTE.grass, PALETTE.sky];
  const [seq, setSeq] = useState([0]); const [userSeq, setUserSeq] = useState([]); const [flash, setFlash] = useState(null); const [msg, setMsg] = useState("Watch Buddy's pattern!");
  const playSeq = useCallback((s) => {
    s.forEach((c, i) => setTimeout(() => { setFlash(c); setTimeout(() => setFlash(null), 300); }, i*500));
  }, []);
  useEffect(() => { playSeq(seq); }, [seq]);
  const tap = (i) => {
    const next = [...userSeq, i];
    if (seq[next.length-1] !== i) { setMsg("Oops, let's try again!"); setUserSeq([]); setSeq([Math.floor(Math.random()*4)]); return; }
    if (next.length === seq.length) {
      if (seq.length >= 5) { setMsg("Amazing memory! 🎉"); onWin?.(); setUserSeq([]); setSeq([Math.floor(Math.random()*4)]); return; }
      setMsg("Great! Next round..."); setUserSeq([]);
      setTimeout(() => setSeq((s) => [...s, Math.floor(Math.random()*4)]), 700);
    } else setUserSeq(next);
  };
  return (
    <div className="max-w-xs">
      <p className="text-sm mb-3" style={{ color: PALETTE.plum }}>{msg}</p>
      <div className="grid grid-cols-2 gap-2">
        {colors.map((c, i) => (
          <button key={i} onClick={() => tap(i)} className="h-16 rounded-xl" style={{ background: c, opacity: flash===i ? 1 : 0.5, border: flash===i ? `3px solid ${PALETTE.plum}` : "none" }} />
        ))}
      </div>
    </div>
  );
}

function WhackAMole({ onWin }) {
  const [active, setActive] = useState(null); const [score, setScore] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(Math.floor(Math.random()*9)), 900);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (score >= 5) onWin?.(); }, [score]);
  return (
    <div>
      <p className="text-sm mb-2" style={{ color: PALETTE.plum }}>Score: {score} {score>=5 && "🎉"}</p>
      <div className="grid grid-cols-3 gap-2 max-w-[220px]">
        {Array.from({length:9}).map((_, i) => (
          <button key={i} onClick={() => { if (i===active) { setScore((s)=>s+1); setActive(null); } }}
            className="w-16 h-16 rounded-2xl text-2xl flex items-center justify-center" style={{ background: PALETTE.cream, border: `2px solid ${PALETTE.sky}` }}>
            {i===active ? "🐹" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

function OddOneOut({ onWin }) {
  const sets = [["🍎","🍌"],["🐶","🐱"],["⚽","🏀"],["🌟","🌙"],["🍓","🫐"]];
  const [round, setRound] = useState(null); const [msg, setMsg] = useState("");
  const gen = useCallback(() => {
    const [common, odd] = sets[Math.floor(Math.random()*sets.length)];
    const oddIdx = Math.floor(Math.random()*9);
    setRound({ common, odd, oddIdx }); setMsg("");
  }, []);
  useEffect(() => { gen(); }, [gen]);
  if (!round) return null;
  return (
    <div>
      <p className="text-sm mb-2" style={{ color: PALETTE.plum }}>Tap the different one!</p>
      <div className="grid grid-cols-3 gap-2 max-w-[220px]">
        {Array.from({length:9}).map((_, i) => (
          <button key={i} onClick={() => { if (i===round.oddIdx) { setMsg("Found it! 🎉"); onWin?.(); setTimeout(gen,900); } else setMsg("Keep looking!"); }}
            className="w-16 h-16 rounded-2xl text-2xl flex items-center justify-center" style={{ background: PALETTE.cream }}>
            {i===round.oddIdx ? round.odd : round.common}
          </button>
        ))}
      </div>
      {msg && <p className="mt-2 font-semibold" style={{ color: PALETTE.coral }}>{msg}</p>}
    </div>
  );
}

function ShapeSort({ onWin }) {
  const shapes = ["⭐","🔺","⬛","⚪","💠"];
  const [target, setTarget] = useState(shapes[0]); const [msg, setMsg] = useState("");
  const next = useCallback(() => { setTarget(shapes[Math.floor(Math.random()*shapes.length)]); setMsg(""); }, []);
  useEffect(() => { next(); }, [next]);
  return (
    <div className="max-w-xs">
      <p className="text-sm mb-2" style={{ color: PALETTE.plum }}>Find the matching shape:</p>
      <p className="text-4xl mb-3">{target}</p>
      <div className="flex gap-2 flex-wrap">
        {[...shapes].sort(() => Math.random()-0.5).map((s, i) => (
          <button key={i} onClick={() => { if (s===target) { setMsg("Match! 🌟"); onWin?.(); setTimeout(next,700); } else setMsg("Not that one!"); }}
            className="text-3xl w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: PALETTE.cream }}>{s}</button>
        ))}
      </div>
      {msg && <p className="mt-2 font-semibold" style={{ color: PALETTE.coral }}>{msg}</p>}
    </div>
  );
}

const GAME_LIST = [
  { id: "memory", title: "Memory Match", free: true, Comp: MemoryMatch },
  { id: "ttt", title: "Tic Tac Toe", free: true, Comp: TicTacToe },
  { id: "scramble", title: "Word Scramble", free: true, Comp: WordScramble },
  { id: "puzzle", title: "Sliding Puzzle", free: true, Comp: SlidingPuzzle },
  { id: "math", title: "Math Quiz", free: false, Comp: MathQuiz },
  { id: "color", title: "Color Match", free: false, Comp: ColorMatch },
  { id: "rps", title: "Rock Paper Scissors", free: false, Comp: RockPaperScissors },
  { id: "simon", title: "Simon Says", free: false, Comp: SimonSays },
  { id: "whack", title: "Whack-a-Mole", free: false, Comp: WhackAMole },
  { id: "odd", title: "Odd One Out", free: false, Comp: OddOneOut },
  { id: "shape", title: "Shape Sort", free: false, Comp: ShapeSort },
];

/* ---------- Draw & Color with templates ---------- */
const TEMPLATES = [
  { id: "star", name: "Star", free: true },
  { id: "heart", name: "Heart", free: true },
  { id: "sun", name: "Sun", free: true },
  { id: "house", name: "House", free: false },
  { id: "flower", name: "Flower", free: false },
  { id: "balloon", name: "Balloon", free: false },
  { id: "fish", name: "Fish", free: false },
  { id: "tree", name: "Tree", free: false },
  { id: "cat", name: "Cat", free: false },
  { id: "rainbow", name: "Rainbow", free: false },
];

function drawTemplateOutline(ctx, id, w, h) {
  ctx.save();
  ctx.strokeStyle = PALETTE.plum;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  const cx = w/2, cy = h/2;
  switch (id) {
    case "star": {
      ctx.beginPath();
      for (let i=0;i<10;i++){
        const r = i%2===0 ? 100 : 45;
        const a = (Math.PI/5)*i - Math.PI/2;
        const x = cx + r*Math.cos(a), y = cy + r*Math.sin(a);
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
      break;
    }
    case "heart": {
      ctx.beginPath();
      ctx.moveTo(cx, cy+70);
      ctx.bezierCurveTo(cx-130, cy-40, cx-40, cy-120, cx, cy-40);
      ctx.bezierCurveTo(cx+40, cy-120, cx+130, cy-40, cx, cy+70);
      ctx.stroke();
      break;
    }
    case "sun": {
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.stroke();
      for (let i=0;i<8;i++){
        const a = (Math.PI/4)*i;
        ctx.beginPath();
        ctx.moveTo(cx+70*Math.cos(a), cy+70*Math.sin(a));
        ctx.lineTo(cx+110*Math.cos(a), cy+110*Math.sin(a));
        ctx.stroke();
      }
      break;
    }
    case "house": {
      ctx.strokeRect(cx-80, cy-10, 160, 110);
      ctx.beginPath(); ctx.moveTo(cx-100, cy-10); ctx.lineTo(cx, cy-100); ctx.lineTo(cx+100, cy-10); ctx.stroke();
      ctx.strokeRect(cx-20, cy+40, 40, 70);
      break;
    }
    case "flower": {
      for (let i=0;i<6;i++){
        const a = (Math.PI/3)*i;
        ctx.beginPath(); ctx.ellipse(cx+40*Math.cos(a), cy+40*Math.sin(a), 30, 18, a, 0, Math.PI*2); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI*2); ctx.stroke();
      break;
    }
    case "balloon": {
      ctx.beginPath(); ctx.ellipse(cx, cy-30, 55, 70, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy+40); ctx.lineTo(cx-8, cy+55); ctx.lineTo(cx+8, cy+55); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy+55); ctx.quadraticCurveTo(cx+20, cy+100, cx, cy+140); ctx.stroke();
      break;
    }
    case "fish": {
      ctx.beginPath(); ctx.ellipse(cx-10, cy, 80, 45, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+65, cy); ctx.lineTo(cx+110, cy-35); ctx.lineTo(cx+110, cy+35); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx-55, cy-8, 6, 0, Math.PI*2); ctx.stroke();
      break;
    }
    case "tree": {
      ctx.beginPath(); ctx.arc(cx, cy-30, 65, 0, Math.PI*2); ctx.stroke();
      ctx.strokeRect(cx-15, cy+30, 30, 70);
      break;
    }
    case "cat": {
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-45,cy-40); ctx.lineTo(cx-25,cy-85); ctx.lineTo(cx-10,cy-45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+45,cy-40); ctx.lineTo(cx+25,cy-85); ctx.lineTo(cx+10,cy-45); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx-20, cy-5, 4, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+20, cy-5, 4, 0, Math.PI*2); ctx.stroke();
      break;
    }
    case "rainbow": {
      const colors = [80,65,50,35,20];
      colors.forEach((r) => { ctx.beginPath(); ctx.arc(cx, cy+60, r+30, Math.PI, Math.PI*2); ctx.stroke(); });
      break;
    }
    default: break;
  }
  ctx.restore();
}

function DrawPad({ premiumUnlocked, labels }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(PALETTE.coral);
  const [size, setSize] = useState(6);
  const [template, setTemplate] = useState(null);
  const colors = [PALETTE.coral, PALETTE.sun, PALETTE.grass, PALETTE.sky, PALETTE.plum, "#FFFFFF"];

  const blankCanvas = () => {
    const c = canvasRef.current; const ctx = c.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0,0,c.width,c.height);
  };

  useEffect(() => { blankCanvas(); }, []);

  const applyTemplate = (tpl) => {
    if (!tpl.free && !premiumUnlocked) return;
    setTemplate(tpl.id);
    blankCanvas();
    drawTemplateOutline(canvasRef.current.getContext("2d"), tpl.id, canvasRef.current.width, canvasRef.current.height);
  };

  const pos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX-rect.left, y: t.clientY-rect.top }; };
  const start = (e) => { drawing.current = true; draw(e); };
  const end = () => { drawing.current = false; canvasRef.current.getContext("2d").beginPath(); };
  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d"); const { x, y } = pos(e);
    ctx.lineWidth = size; ctx.lineCap = "round"; ctx.strokeStyle = color;
    ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
  };

  return (
    <div>
      <p className="text-sm font-semibold mb-2" style={{ color: PALETTE.plum }}>Coloring pages</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {TEMPLATES.map((tpl) => {
          const locked = !tpl.free && !premiumUnlocked;
          return (
            <button key={tpl.id} onClick={() => applyTemplate(tpl)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: template===tpl.id ? PALETTE.coral : "white", color: template===tpl.id ? "white" : PALETTE.plum, opacity: locked ? 0.5 : 1 }}>
              {locked ? "🔒 " : ""}{tpl.name}
            </button>
          );
        })}
      </div>
      <canvas ref={canvasRef} width={320} height={320} className="rounded-2xl touch-none"
        style={{ border: `3px solid ${PALETTE.sky}`, background: "white" }}
        onMouseDown={start} onMouseUp={end} onMouseLeave={end} onMouseMove={draw}
        onTouchStart={start} onTouchEnd={end} onTouchMove={draw} />
      <div className="flex gap-2 mt-3 flex-wrap items-center">
        {colors.map((c) => <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full" style={{ background: c, border: color===c ? `3px solid ${PALETTE.plum}` : "2px solid #ddd" }} />)}
        <input type="range" min="2" max="20" value={size} onChange={(e) => setSize(+e.target.value)} className="ml-2" />
        <button onClick={() => { blankCanvas(); setTemplate(null); }} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: PALETTE.coral, color: "white" }}>Clear</button>
      </div>
    </div>
  );
}

/* ---------- Sticker Book ---------- */
const STICKER_OPTIONS = ["🌟","🌈","🦄","🐬","🌸","🚀","🍕","🎈","🦋","😄","🐢","🍦"];
const SCENES = [
  { id: "park", label: "Park", bg: "linear-gradient(#BEE3F8,#C6F6D5)" },
  { id: "space", label: "Space", bg: "linear-gradient(#2D2A5C,#1A1638)" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(#90CDF4,#2C7A9C)" },
];
function StickerBook({ placed, setPlaced }) {
  const [selected, setSelected] = useState(STICKER_OPTIONS[0]);
  const [scene, setScene] = useState(SCENES[0]);
  const sceneRef = useRef(null);
  const place = (e) => {
    const rect = sceneRef.current.getBoundingClientRect();
    const x = ((e.clientX-rect.left)/rect.width)*100, y = ((e.clientY-rect.top)/rect.height)*100;
    setPlaced((p) => [...p, { id: `s${Date.now()}`, emoji: selected, x, y }]);
  };
  const remove = (id, e) => { e.stopPropagation(); setPlaced((p) => p.filter((s) => s.id !== id)); };
  return (
    <div className="max-w-md">
      <div className="flex gap-2 mb-3">
        {SCENES.map((s) => <button key={s.id} onClick={() => setScene(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: scene.id===s.id ? PALETTE.plum : "white", color: scene.id===s.id ? "white" : PALETTE.plum }}>{s.label}</button>)}
      </div>
      <div ref={sceneRef} onClick={place} className="relative w-full rounded-2xl cursor-crosshair" style={{ height: 260, background: scene.bg, border: `3px solid ${PALETTE.sky}` }}>
        {placed.map((s) => <span key={s.id} onClick={(e) => remove(s.id, e)} className="absolute text-3xl -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%` }}>{s.emoji}</span>)}
      </div>
      <p className="text-xs mt-1" style={{ color: PALETTE.plum, opacity: 0.6 }}>Tap the scene to place a sticker. Tap a sticker to remove it.</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {STICKER_OPTIONS.map((s) => <button key={s} onClick={() => setSelected(s)} className="w-10 h-10 rounded-xl text-xl flex items-center justify-center" style={{ background: selected===s ? PALETTE.sun : "white", border: selected===s ? `2px solid ${PALETTE.coral}` : "2px solid transparent" }}>{s}</button>)}
      </div>
      <button onClick={() => setPlaced([])} className="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>Clear scene</button>
    </div>
  );
}

/* ---------- Buddy the Helper ---------- */
const BUDDY_PROMPTS = [
  { q: "I feel sad", a: "It's okay to feel sad sometimes. Take a deep breath with me — in... and out. Want to tell a grown-up how you're feeling?" },
  { q: "I'm bored", a: "Let's fix that! You could try a puzzle, draw something silly, or hear a story. Adventure is one tap away." },
  { q: "I'm nervous", a: "Nervous feelings mean you care! Try 3 slow breaths. You've got this, and a grown-up is always nearby if you need them." },
  { q: "How do I earn stars?", a: "Finish tasks on the Sticker Chart — like brushing your teeth or tidying up — and you'll earn a star each time!" },
  { q: "I need help", a: "If something feels wrong or scary, please go find a parent or trusted grown-up right away. I'm just a helper, not a substitute for them." },
];
function BuddyHelper({ buddyName, buddyIcon, premiumUnlocked, buddyPin }) {
  const [reply, setReply] = useState(null);
  const [pinEntered, setPinEntered] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinWrong, setPinWrong] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, thinking]);

  const checkPin = () => {
    if (!buddyPin || pinInput === buddyPin) { setPinEntered(true); setPinWrong(false); }
    else { setPinWrong(true); setPinInput(""); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setThinking(true);
    // NOTE: Real AI chat needs a backend endpoint that holds your Anthropic API key
    // securely (never put an API key in client-side code). Point this fetch at your
    // own server route (e.g. /api/buddy-chat) which calls the Anthropic API and
    // returns the reply. This placeholder just echoes back so the UI still works.
    try {
      await new Promise((r) => setTimeout(r, 600));
      setMessages((m) => [...m, { role: "assistant", content: `(Demo mode) ${buddyName}'s real AI brain isn't connected yet — hook this up to a backend route that calls the Anthropic API to make me smart!` }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Oops, I'm having trouble thinking right now. Try again in a bit!" }]);
    } finally {
      setThinking(false);
    }
  };

  if (premiumUnlocked && !pinEntered) {
    return (
      <div className="max-w-xs p-5 rounded-2xl" style={{ background: "white" }}>
        <p className="font-semibold mb-2" style={{ color: PALETTE.plum }}>{buddyIcon} {buddyName} is ready to chat!</p>
        <p className="text-sm mb-3" style={{ color: PALETTE.plum, opacity: 0.8 }}>Ask a parent for today's code to start chatting.</p>
        <input type="password" inputMode="numeric" value={pinInput} onChange={(e) => setPinInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkPin()}
          className="w-full px-3 py-2 rounded-xl border-2 outline-none mb-2" style={{ borderColor: PALETTE.sky }} placeholder="Enter code" />
        <button onClick={checkPin} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Unlock</button>
        {pinWrong && <p className="text-sm mt-2 font-semibold" style={{ color: PALETTE.coral }}>That's not it — ask a grown-up for help.</p>}
      </div>
    );
  }

  if (premiumUnlocked && pinEntered) {
    return (
      <div className="max-w-md flex flex-col" style={{ height: 420 }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">{buddyIcon}</span>
          <p className="font-semibold" style={{ color: PALETTE.plum }}>Chatting with {buddyName}</p>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 rounded-2xl mb-2 space-y-2" style={{ background: "white" }}>
          {messages.length === 0 && <p className="text-sm" style={{ color: PALETTE.plum, opacity: 0.6 }}>Say hi to {buddyName}!</p>}
          {messages.map((m, i) => (
            <div key={i} className="max-w-[85%] px-3 py-2 rounded-2xl text-sm" style={{ background: m.role === "user" ? PALETTE.sky : PALETTE.sun, color: PALETTE.plum, marginLeft: m.role === "user" ? "auto" : 0 }}>{m.content}</div>
          ))}
          {thinking && <div className="text-sm" style={{ color: PALETTE.plum, opacity: 0.6 }}>{buddyName} is thinking...</div>}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 px-3 py-2 rounded-xl border-2 outline-none text-sm" style={{ borderColor: PALETTE.sky }} placeholder="Type a message..." />
          <button onClick={send} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>Send</button>
        </div>
        <p className="text-xs mt-2" style={{ color: PALETTE.plum, opacity: 0.5 }}>{buddyName} is an AI helper, not a real person — for anything serious, talk to a parent or guardian.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl" style={{ background: "white" }}>
        <span className="text-4xl">{buddyIcon}</span>
        <p className="font-semibold" style={{ color: PALETTE.plum }}>Hi, I'm {buddyName}! Tap what's on your mind.</p>
      </div>
      <div className="flex flex-col gap-2">
        {BUDDY_PROMPTS.map((p) => <button key={p.q} onClick={() => setReply(p.a)} className="text-left px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.sky, color: "white" }}>{p.q}</button>)}
      </div>
      {reply && <div className="mt-4 p-4 rounded-2xl" style={{ background: PALETTE.sun }}><p style={{ color: PALETTE.plum }}>{reply}</p></div>}
      <div className="mt-4 p-3 rounded-2xl text-xs" style={{ background: PALETTE.cream, border: `2px dashed ${PALETTE.sky}`, color: PALETTE.plum }}>
        {buddyName} only gives friendly pre-written tips — for anything serious, please talk to a parent or guardian. Ask a parent about unlocking full AI chat!
      </div>
    </div>
  );
}

/* ---------- Parent Gate ---------- */
function ParentGate({ onUnlock }) {
  const [q] = useState(() => ({ a: 3+Math.floor(Math.random()*6), b: 3+Math.floor(Math.random()*6) }));
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const check = () => {
    if (+answer === q.a + q.b) onUnlock();
    else { setWrong(true); setAnswer(""); }
  };
  return (
    <div className="max-w-xs p-5 rounded-2xl" style={{ background: "white" }}>
      <p className="font-semibold mb-2" style={{ color: PALETTE.plum }}>Parents only</p>
      <p className="text-sm mb-3" style={{ color: PALETTE.plum, opacity: 0.8 }}>To keep this area for grown-ups, solve: {q.a} + {q.b} = ?</p>
      <input type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key==="Enter" && check()}
        className="w-full px-3 py-2 rounded-xl border-2 outline-none mb-2" style={{ borderColor: PALETTE.sky }} />
      <button onClick={check} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Enter</button>
      {wrong && <p className="text-sm mt-2 font-semibold" style={{ color: PALETTE.coral }}>Not quite — try again.</p>}
    </div>
  );
}

/* ---------- Main App ---------- */
export default function KidZone() {
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("en");
  const [kidName, setKidName] = useState("");
  const [stickers, setStickers] = useState(0);
  const [tasksDone, setTasksDone] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [storyIdx, setStoryIdx] = useState(null);
  const [storyPage, setStoryPage] = useState(0);
  const [joke, setJoke] = useState(JOKES[0]);
  const [showFact, setShowFact] = useState(false);
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [redeemedLog, setRedeemedLog] = useState([]);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardCost, setNewRewardCost] = useState(5);
  const [redeemMsg, setRedeemMsg] = useState("");
  const [stickerBook, setStickerBook] = useState([]);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [buddyName, setBuddyName] = useState("Buddy");
  const [buddyIcon, setBuddyIcon] = useState("🦉");
  const [buddyPin, setBuddyPin] = useState("");
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [activeGame, setActiveGame] = useState(null);

  const t = STRINGS[lang];

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      if (p) {
        setLang(p.lang || "en");
        setKidName(p.kidName || "");
        setStickers(p.stickers || 0);
        setTasksDone(p.tasksDone || {});
        setRewards(p.rewards && p.rewards.length ? p.rewards : DEFAULT_REWARDS);
        setRedeemedLog(p.redeemedLog || []);
        setStickerBook(p.stickerBook || []);
        setPremiumUnlocked(!!p.premiumUnlocked);
        setBuddyName(p.buddyName || "Buddy");
        setBuddyIcon(p.buddyIcon || "🦉");
        setBuddyPin(p.buddyPin || "");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveProfile({ lang, kidName, stickers, tasksDone, rewards, redeemedLog, stickerBook, premiumUnlocked, buddyName, buddyIcon, buddyPin });
  }, [lang, kidName, stickers, tasksDone, rewards, redeemedLog, stickerBook, premiumUnlocked, buddyName, buddyIcon, buddyPin, loaded]);

  const addSticker = () => setStickers((s) => s + 1);
  const addReward = () => {
    const name = newRewardName.trim(); if (!name) return;
    setRewards((r) => [...r, { id: `r${Date.now()}`, name, cost: Math.max(1, +newRewardCost || 1) }]);
    setNewRewardName(""); setNewRewardCost(5);
  };
  const deleteReward = (id) => setRewards((r) => r.filter((rw) => rw.id !== id));
  const redeemReward = (reward) => {
    if (stickers < reward.cost) return;
    setStickers((s) => s - reward.cost);
    setRedeemedLog((log) => [{ id: `log${Date.now()}`, name: reward.name, date: new Date().toLocaleDateString() }, ...log].slice(0,20));
    setRedeemMsg(`Redeemed: ${reward.name}! 🎉`); setTimeout(() => setRedeemMsg(""), 2500);
  };
  const toggleTask = (id) => {
    const today = new Date().toDateString(); const key = `${today}:${id}`;
    setTasksDone((prev) => { const next = { ...prev }; if (next[key]) delete next[key]; else { next[key]=true; setStickers((s)=>s+1); } return next; });
  };
  const goHome = () => { setScreen("home"); setStoryIdx(null); setActiveGame(null); setParentGateOpen(false); };

  const stops = [
    { id: "stories", label: t.stories, emoji: "📖", color: PALETTE.coral },
    { id: "games", label: t.games, emoji: "🎮", color: PALETTE.sky },
    { id: "draw", label: t.draw, emoji: "🎨", color: PALETTE.sun },
    { id: "stickerbook", label: t.stickerBook, emoji: "🌟", color: PALETTE.grass },
    { id: "jokes", label: t.jokes, emoji: "😂", color: PALETTE.grass },
    { id: "chart", label: t.chart, emoji: "⭐", color: PALETTE.coral },
    { id: "helper", label: `${buddyIcon} ${buddyName}`, emoji: buddyIcon, color: PALETTE.sky },
    { id: "parent", label: t.parent, emoji: "👪", color: PALETTE.plum },
  ];

  return (
    <div className="w-full h-full min-h-[640px]" style={{ background: PALETTE.cream, fontFamily: "Nunito" }}>
      <style>{`${FONT_IMPORT}\n.kz-title { font-family: 'Fredoka', sans-serif; }`}</style>

      {screen === "home" && (
        <div className="flex flex-col items-center h-full px-6 pt-8 pb-6">
          <div className="flex items-center justify-between w-full max-w-md mb-2">
            <div className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: PALETTE.sun, color: PALETTE.plum }}>⭐ {stickers} {t.stickers}</div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs rounded-full px-2 py-1" style={{ background: "white", color: PALETTE.plum }}>
              <option value="en">EN</option><option value="es">ES</option><option value="fr">FR</option>
            </select>
          </div>
          <h1 className="kz-title text-4xl mt-4 mb-1" style={{ color: PALETTE.plum }}>{t.appName}</h1>
          <p className="text-sm mb-6" style={{ color: PALETTE.plum, opacity: 0.7 }}>{t.subtitle}</p>
          <div className="relative w-full max-w-md">
            <svg viewBox="0 0 300 560" className="absolute inset-0 w-full h-full -z-0" style={{ opacity: 0.5 }}>
              <path d="M50 40 C 200 60, 20 140, 150 160 S 260 260, 100 280 S 40 380, 220 420 S 60 500, 180 520"
                fill="none" stroke={PALETTE.sky} strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" />
            </svg>
            <div className="relative flex flex-col gap-6 py-2">
              {stops.map((s, i) => (
                <button key={s.id} onClick={() => setScreen(s.id)} className="flex items-center gap-3 self-start rounded-full pl-2 pr-5 py-2 shadow-md active:scale-95 transition-transform"
                  style={{ background: "white", marginLeft: i%2===0 ? "0%" : "35%" }}>
                  <span className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: s.color }}>{s.emoji}</span>
                  <span className="kz-title text-lg" style={{ color: PALETTE.plum }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "stories" && (
        <ScreenShell title={t.stories} emoji="📖" labels={t} onBack={goHome}>
          {storyIdx === null ? (
            <div className="grid grid-cols-1 gap-3">
              {STORIES.map((s, i) => {
                const locked = i >= FREE_STORIES && !premiumUnlocked;
                return locked
                  ? <LockedCard key={s.title} title={s.title} labels={t} />
                  : (
                    <button key={s.title} onClick={() => { setStoryIdx(i); setStoryPage(0); }} className="flex items-center gap-3 p-4 rounded-2xl text-left" style={{ background: "white" }}>
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="kz-title" style={{ color: PALETTE.plum }}>{s.title}</span>
                    </button>
                  );
              })}
            </div>
          ) : (
            <div className="max-w-md">
              <div className="text-6xl mb-4 text-center">{STORIES[storyIdx].emoji}</div>
              <p className="text-lg leading-relaxed" style={{ color: PALETTE.plum }}>{STORIES[storyIdx].pages[storyPage]}</p>
              <p className="text-xs mt-2" style={{ color: PALETTE.plum, opacity: 0.5 }}>Page {storyPage+1} of {STORIES[storyIdx].pages.length}</p>
              <div className="flex gap-2 mt-6">
                <button disabled={storyPage===0} onClick={() => setStoryPage((p) => p-1)} className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-30" style={{ background: PALETTE.sky, color: "white" }}>Back</button>
                {storyPage < STORIES[storyIdx].pages.length-1
                  ? <button onClick={() => setStoryPage((p) => p+1)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Next</button>
                  : <button onClick={() => { addSticker(); setStoryIdx(null); }} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>The End 🌟</button>}
              </div>
            </div>
          )}
        </ScreenShell>
      )}

      {screen === "games" && (
        <ScreenShell title={t.games} emoji="🎮" labels={t} onBack={() => { setActiveGame(null); goHome(); }}>
          {activeGame === null ? (
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {GAME_LIST.map((g) => {
                const locked = !g.free && !premiumUnlocked;
                return locked
                  ? <LockedCard key={g.id} title={g.title} labels={t} />
                  : (
                    <button key={g.id} onClick={() => setActiveGame(g.id)} className="p-4 rounded-2xl text-left" style={{ background: "white" }}>
                      <span className="kz-title" style={{ color: PALETTE.plum }}>{g.title}</span>
                    </button>
                  );
              })}
            </div>
          ) : (
            <div>
              <button onClick={() => setActiveGame(null)} className="mb-4 text-sm font-semibold" style={{ color: PALETTE.coral }}>← All games</button>
              {GAME_LIST.filter((g) => g.id === activeGame).map((g) => <g.Comp key={g.id} onWin={addSticker} />)}
            </div>
          )}
        </ScreenShell>
      )}

      {screen === "draw" && (
        <ScreenShell title={t.draw} emoji="🎨" labels={t} onBack={goHome}>
          <DrawPad premiumUnlocked={premiumUnlocked} labels={t} />
        </ScreenShell>
      )}

      {screen === "stickerbook" && (
        <ScreenShell title={t.stickerBook} emoji="🌟" labels={t} onBack={goHome}>
          <StickerBook placed={stickerBook} setPlaced={setStickerBook} />
        </ScreenShell>
      )}

      {screen === "jokes" && (
        <ScreenShell title={t.jokes} emoji="😂" labels={t} onBack={goHome}>
          <div className="max-w-md">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setShowFact(false)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: !showFact ? PALETTE.coral : "white", color: !showFact ? "white" : PALETTE.plum }}>Jokes</button>
              <button onClick={() => setShowFact(true)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: showFact ? PALETTE.coral : "white", color: showFact ? "white" : PALETTE.plum }}>Fun Facts</button>
            </div>
            {!showFact ? (
              <div className="p-5 rounded-2xl" style={{ background: "white" }}>
                <p className="font-semibold text-lg" style={{ color: PALETTE.plum }}>{joke.q}</p>
                <p className="mt-2 text-lg" style={{ color: PALETTE.coral }}>{joke.a}</p>
                <button onClick={() => {
                  const pool = premiumUnlocked ? JOKES : JOKES.slice(0, FREE_JOKES);
                  setJoke(pool[Math.floor(Math.random()*pool.length)]); addSticker();
                }} className="mt-4 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Another one! ⭐</button>
                {!premiumUnlocked && <p className="text-xs mt-3" style={{ color: PALETTE.plum, opacity: 0.6 }}>{FREE_JOKES} of {JOKES.length} jokes unlocked — the rest {t.askParent.toLowerCase()}</p>}
              </div>
            ) : (
              <div className="p-5 rounded-2xl" style={{ background: "white" }}>
                <p className="text-lg" style={{ color: PALETTE.plum }}>{(premiumUnlocked ? FACTS : FACTS.slice(0, FREE_FACTS))[Math.floor(Math.random()*(premiumUnlocked ? FACTS.length : FREE_FACTS))]}</p>
                {!premiumUnlocked && <p className="text-xs mt-3" style={{ color: PALETTE.plum, opacity: 0.6 }}>{FREE_FACTS} of {FACTS.length} facts unlocked — the rest {t.askParent.toLowerCase()}</p>}
              </div>
            )}
          </div>
        </ScreenShell>
      )}

      {screen === "chart" && (
        <ScreenShell title={t.chart} emoji="⭐" labels={t} onBack={goHome}>
          <div className="max-w-md">
            <p className="mb-4 font-semibold" style={{ color: PALETTE.plum }}>Total stars: {stickers} ⭐</p>
            <div className="space-y-2 mb-6">
              {DEFAULT_TASKS.map((task) => {
                const today = new Date().toDateString(); const done = !!tasksDone[`${today}:${task.id}`];
                return (
                  <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left" style={{ background: done ? PALETTE.grass : "white", color: done ? "white" : PALETTE.plum }}>
                    <span className="text-xl">{done ? "✅" : "⬜"}</span><span className="font-semibold">{task.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="kz-title text-lg mb-2" style={{ color: PALETTE.plum }}>Rewards to redeem</p>
            {redeemMsg && <div className="mb-3 p-3 rounded-2xl font-semibold" style={{ background: PALETTE.grass, color: "white" }}>{redeemMsg}</div>}
            <div className="space-y-2">
              {rewards.length === 0 && <p className="text-sm" style={{ color: PALETTE.plum, opacity: 0.7 }}>No rewards set up yet — ask a parent to add some in the Parent Corner.</p>}
              {rewards.map((r) => {
                const canRedeem = stickers >= r.cost;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "white" }}>
                    <div><p className="font-semibold" style={{ color: PALETTE.plum }}>{r.name}</p><p className="text-xs" style={{ color: PALETTE.plum, opacity: 0.6 }}>{r.cost} ⭐</p></div>
                    <button onClick={() => redeemReward(r)} disabled={!canRedeem} className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-30" style={{ background: canRedeem ? PALETTE.coral : PALETTE.sky, color: "white" }}>Redeem</button>
                  </div>
                );
              })}
            </div>
          </div>
        </ScreenShell>
      )}

      {screen === "helper" && (
        <ScreenShell title={buddyName} emoji={buddyIcon} labels={t} onBack={goHome}>
          <BuddyHelper buddyName={buddyName} buddyIcon={buddyIcon} premiumUnlocked={premiumUnlocked} buddyPin={buddyPin} />
        </ScreenShell>
      )}

      {screen === "parent" && (
        <ScreenShell title={t.parent} emoji="👪" labels={t} onBack={goHome}>
          {!parentGateOpen ? <ParentGate onUnlock={() => setParentGateOpen(true)} /> : (
            <div className="max-w-md space-y-5">
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: PALETTE.plum }}>Child's name</label>
                <input value={kidName} onChange={(e) => setKidName(e.target.value)} placeholder={t.name} className="w-full px-3 py-2 rounded-xl border-2 outline-none" style={{ borderColor: PALETTE.sky }} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: PALETTE.plum }}>Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-3 py-2 rounded-xl border-2" style={{ borderColor: PALETTE.sky }}>
                  <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <p className="font-semibold mb-2" style={{ color: PALETTE.plum }}>Customize {buddyName}</p>
                <input value={buddyName} onChange={(e) => setBuddyName(e.target.value || "Buddy")} placeholder="Buddy's name" className="w-full px-3 py-2 rounded-xl border-2 outline-none mb-3 text-sm" style={{ borderColor: PALETTE.sky }} />
                <div className="flex gap-2 flex-wrap">
                  {BUDDY_ICONS.map((ic) => (
                    <button key={ic} onClick={() => setBuddyIcon(ic)} className="w-11 h-11 rounded-xl text-2xl flex items-center justify-center" style={{ background: buddyIcon===ic ? PALETTE.sun : "white", border: buddyIcon===ic ? `2px solid ${PALETTE.coral}` : "2px solid #eee" }}>{ic}</button>
                  ))}
                </div>
                {premiumUnlocked && (
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid #eee` }}>
                    <label className="text-xs font-semibold block mb-1" style={{ color: PALETTE.plum }}>AI chat code (kids need this to unlock full AI chat with {buddyName})</label>
                    <input value={buddyPin} onChange={(e) => setBuddyPin(e.target.value)} placeholder="e.g. 4271 (leave blank for no code)" className="w-full px-3 py-2 rounded-xl border-2 outline-none text-sm" style={{ borderColor: PALETTE.sky }} />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <p className="font-semibold" style={{ color: PALETTE.plum }}>Progress</p>
                <p className="text-sm mt-1" style={{ color: PALETTE.plum, opacity: 0.8 }}>{stickers} stars currently available</p>
              </div>

              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <p className="font-semibold mb-2" style={{ color: PALETTE.plum }}>Manage rewards</p>
                <div className="space-y-2 mb-3">
                  {rewards.map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: PALETTE.plum }}>{r.name} — {r.cost} ⭐</span>
                      <button onClick={() => deleteReward(r.id)} className="text-xs font-semibold" style={{ color: PALETTE.coral }}>Remove</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} placeholder="Reward name" className="flex-1 px-3 py-2 rounded-xl border-2 outline-none text-sm" style={{ borderColor: PALETTE.sky }} />
                  <input type="number" min="1" value={newRewardCost} onChange={(e) => setNewRewardCost(e.target.value)} className="w-16 px-2 py-2 rounded-xl border-2 outline-none text-sm" style={{ borderColor: PALETTE.sky }} />
                  <button onClick={addReward} className="px-3 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.grass, color: "white" }}>Add</button>
                </div>
              </div>

              {redeemedLog.length > 0 && (
                <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                  <p className="font-semibold mb-2" style={{ color: PALETTE.plum }}>Redeemed history</p>
                  <div className="space-y-1">{redeemedLog.map((l) => <p key={l.id} className="text-sm" style={{ color: PALETTE.plum, opacity: 0.8 }}>{l.date} — {l.name}</p>)}</div>
                </div>
              )}

              <div className="p-4 rounded-2xl" style={{ background: premiumUnlocked ? PALETTE.grass : PALETTE.sun }}>
                <p className="font-semibold" style={{ color: premiumUnlocked ? "white" : PALETTE.plum }}>{premiumUnlocked ? "Premium is unlocked ✓" : "Premium is locked"}</p>
                <p className="text-xs mt-1" style={{ color: premiumUnlocked ? "white" : PALETTE.plum, opacity: 0.85 }}>Unlocks the rest of the stories, games, coloring pages, jokes, and facts.</p>
                <button onClick={() => setPremiumUnlocked((v) => !v)} className="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.plum, color: "white" }}>
                  {premiumUnlocked ? "Lock premium" : "Unlock premium (demo)"}
                </button>
                <p className="text-xs mt-2" style={{ color: premiumUnlocked ? "white" : PALETTE.plum, opacity: 0.7 }}>This toggle stands in for a real payment — connect it to Stripe/Paddle when you're ready to charge for real.</p>
              </div>

              <button onClick={() => { setStickers(0); setTasksDone({}); }} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PALETTE.coral, color: "white" }}>Reset progress</button>
            </div>
          )}
        </ScreenShell>
      )}
    </div>
  );
}
