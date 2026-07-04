/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Play, Lock, Unlock, Volume2, VolumeX, RotateCcw, 
  Check, X, ArrowRight, ArrowLeft, Clock, Sparkles, Star, 
  Award, Flame, Zap, RefreshCw, BookOpen, Brain, Info
} from 'lucide-react';

// ==========================================
// SOUND EFFECT MANAGER (Web Audio API)
// ==========================================
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy-initialized on first user interaction to comply with autoplay policy
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Joyful rising major arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0.15, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  playIncorrect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Low buzzing sad sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now); // F3
      osc.frequency.linearRampToValueAtTime(130, now + 0.3); // C3
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Orchestral victory chord
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 1.0);
      });
      
      // Sparkly high-frequency bells
      const bells = [1046.50, 1174.66, 1318.51, 1567.98, 2093.00, 2637.02];
      bells.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.15 + index * 0.07);
        gain.gain.setValueAtTime(0.12, now + 0.15 + index * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + index * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + 0.15 + index * 0.07);
        osc.stop(now + 0.15 + index * 0.07 + 0.3);
      });
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }
}

const sounds = new SoundManager();

// ==========================================
// LEVEL DEFINITIONS
// ==========================================
interface LevelMetadata {
  id: number;
  name: string;
  description: string;
  rangeText: string;
  operationsText: string;
  color: string;
  borderColor: string;
  textColor: string;
}

const LEVELS: LevelMetadata[] = [
  {
    id: 1,
    name: "1-Daraja: Oddiy Boshlanish",
    description: "1 xonali sonlar ustida sodda qo'shish va ayirish mashqlari.",
    rangeText: "1 dan 9 gacha",
    operationsText: "+ , -",
    color: "bg-amber-100 hover:bg-amber-200",
    borderColor: "border-amber-400",
    textColor: "text-amber-800"
  },
  {
    id: 2,
    name: "2-Daraja: Ko'paytirish Sirlari",
    description: "1 xonali sonlarni qo'shish, ayirish va kichik sonlarga ko'paytirish.",
    rangeText: "Ko'paytirish (2, 3, 4, 5 ga)",
    operationsText: "+ , - , ×",
    color: "bg-emerald-100 hover:bg-emerald-200",
    borderColor: "border-emerald-400",
    textColor: "text-emerald-800"
  },
  {
    id: 3,
    name: "3-Daraja: Qoldiqsiz Bo'lish",
    description: "1 xonali sonlarda barcha 4 ta amal va qoldiqsiz bo'lish zanjiri.",
    rangeText: "Barcha 1 xonali amallar",
    operationsText: "+ , - , × , ÷",
    color: "bg-sky-100 hover:bg-sky-200",
    borderColor: "border-sky-400",
    textColor: "text-sky-800"
  },
  {
    id: 4,
    name: "4-Daraja: Ikki Xonali Dunyo",
    description: "2 xonali kattaroq sonlar ustida tezkor qo'shish va ayirish.",
    rangeText: "10 dan 99 gacha sonlar",
    operationsText: "+ , -",
    color: "bg-indigo-100 hover:bg-indigo-200",
    borderColor: "border-indigo-400",
    textColor: "text-indigo-800"
  },
  {
    id: 5,
    name: "5-Daraja: Ko'paytirish Mahorati",
    description: "2 xonali sonlarni qo'shish va ularni 1 xonali songa ko'paytirish.",
    rangeText: "Katta sonlar va ko'paytirish",
    operationsText: "+ , - , ×",
    color: "bg-purple-100 hover:bg-purple-200",
    borderColor: "border-purple-400",
    textColor: "text-purple-800"
  },
  {
    id: 6,
    name: "6-Daraja: Ikki Xonali Chempionat",
    description: "2 xonali sonlar ustida barcha to'rtta matematik amallarni bajarish.",
    rangeText: "2 xonali murakkab zanjirlar",
    operationsText: "+ , - , × , ÷",
    color: "bg-rose-100 hover:bg-rose-200",
    borderColor: "border-rose-400",
    textColor: "text-rose-800"
  },
  {
    id: 7,
    name: "7-Daraja: Uch Xonali Koinot",
    description: "3 xonali ulkan sonlar bilan tezkor qo'shish va ayirish operatsiyalari.",
    rangeText: "100 dan 999 gacha",
    operationsText: "+ , -",
    color: "bg-teal-100 hover:bg-teal-200",
    borderColor: "border-teal-400",
    textColor: "text-teal-800"
  },
  {
    id: 8,
    name: "8-Daraja: Uch Xonali Ko'paytirish",
    description: "Uch xonali sonlar zanjirida qo'shish, ayirish va ko'paytirish integratsiyasi.",
    rangeText: "3 xonali ko'paytirishlar",
    operationsText: "+ , - , ×",
    color: "bg-orange-100 hover:bg-orange-200",
    borderColor: "border-orange-400",
    textColor: "text-orange-800"
  },
  {
    id: 9,
    name: "9-Daraja: Haqiqiy Arifmetika",
    description: "Uch xonali sonlarda barcha to'rt amalni qamrab olgan uzoq zanjirlar.",
    rangeText: "3 xonali barcha amallar",
    operationsText: "+ , - , × , ÷",
    color: "bg-pink-100 hover:bg-pink-200",
    borderColor: "border-pink-400",
    textColor: "text-pink-800"
  },
  {
    id: 10,
    name: "10-Daraja: Super Daho Sinovi",
    description: "3 va 4 xonali sonlar aralashmasidan tashkil topgan o'ta qiyin zanjirlar.",
    rangeText: "Aralash katta sonlar",
    operationsText: "+ , - , × , ÷",
    color: "bg-violet-100 hover:bg-violet-200",
    borderColor: "border-violet-400",
    textColor: "text-violet-800"
  },
  {
    id: 11,
    name: "11-Daraja: Shiddatli Tezlik",
    description: "1 va 2 xonali sonlarda 7 qatorli tezkor zanjir. Tez fikrlash talab etiladi!",
    rangeText: "Vaqtga qarshi tezkor sinov",
    operationsText: "+ , - , × , ÷",
    color: "bg-lime-100 hover:bg-lime-200",
    borderColor: "border-lime-400",
    textColor: "text-lime-800"
  },
  {
    id: 12,
    name: "12-Daraja: Matematika Qiroli 👑",
    description: "Yurtimizning eng kuchli matematik bolajonlari uchun mutloq chempionlik sinovi!",
    rangeText: "Mutloq chempionlik",
    operationsText: "+ , - , × , ÷",
    color: "bg-yellow-100 hover:bg-yellow-200",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-800"
  }
];

// Mascot reactions list
const MASCOT_REACTIONS_CORRECT = [
  "Barakalla! Juda to'g'ri! 🎉",
  "Balli! Siz haqiqiy matematikiz! ⭐",
  "Ajoyib! Shunday davom eting! 🚀",
  "Daxshatli oson bo'ldi-ya! daxshat! ⚡",
  "To'ppa-to'g'ri! Miya zo'r ishlamoqda! 🧠",
  "O'g'il bola! Yaxshi harakat! 👍"
];

const MASCOT_REACTIONS_INCORRECT = [
  "Hechqisi yo'q, keyingi safar o'xshaydi! 😊",
  "Yaqin keldingiz! Diqqatni jamlaymiz! 💡",
  "Yaxshi harakat! Matematika qunt talab etadi! 📚",
  "Xatolar - eng yaxshi ustoz! O'rganishda davom etamiz! ❤️",
  "Hali imkoniyat bor, keyingisida aniq to'g'ri bo'ladi! 💪",
  "Miya biroz dam olmoqda, diqqat qilamiz! 🌟"
];

// ==========================================
// DATA STRUCTURE TYPES
// ==========================================
interface ChainStep {
  operator: '+' | '-' | '×' | '÷';
  operand: number;
  beforeValue: number;
  correctValue: number;
  options: number[];
  userChosenOption?: number;
  isCorrect?: boolean;
}

interface Chain {
  initialValue: number;
  steps: ChainStep[];
}

interface BestScore {
  percent: number;
  correctChains: number;
  timeInSec: number;
  timestamp: number;
}

// ==========================================
// OPTIONS GENERATION LOGIC
// ==========================================
function generateOptions(correctVal: number): number[] {
  const optionsSet = new Set<number>();
  optionsSet.add(correctVal);
  
  // Calculate reasonable variations
  const isLarge = correctVal > 100;
  const isMedium = correctVal > 20;
  
  const possibleOffsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  if (isMedium) {
    possibleOffsets.push(10, -10, 5, -5);
  }
  if (isLarge) {
    possibleOffsets.push(10, -10, 100, -100, 20, -20);
  }
  
  const shuffledOffsets = [...possibleOffsets].sort(() => Math.random() - 0.5);
  
  for (const offset of shuffledOffsets) {
    if (optionsSet.size >= 4) break;
    const candidate = correctVal + offset;
    if (candidate > 0 && candidate !== correctVal) {
      optionsSet.add(candidate);
    }
  }
  
  let attempt = 1;
  while (optionsSet.size < 4) {
    const candidate = correctVal + attempt;
    if (candidate > 0) {
      optionsSet.add(candidate);
    }
    attempt++;
  }
  
  return Array.from(optionsSet).sort(() => Math.random() - 0.5);
}

// ==========================================
// CHAIN GENERATION ENGINE
// ==========================================
function generateChain(level: number): Chain {
  let initialValue = 1;
  let numSteps = 5; // default 5-7 qator
  numSteps = Math.floor(Math.random() * 3) + 5; // 5, 6, or 7 steps

  // Set ranges based on levels
  if (level === 1) {
    initialValue = Math.floor(Math.random() * 9) + 1; // 1 to 9
  } else if (level === 2) {
    initialValue = Math.floor(Math.random() * 9) + 1; // 1 to 9
  } else if (level === 3) {
    initialValue = Math.floor(Math.random() * 9) + 1; // 1 to 9
  } else if (level === 4) {
    initialValue = Math.floor(Math.random() * 41) + 10; // 10 to 50
  } else if (level === 5) {
    initialValue = Math.floor(Math.random() * 21) + 10; // 10 to 30
  } else if (level === 6) {
    initialValue = Math.floor(Math.random() * 41) + 10; // 10 to 50
  } else if (level === 7) {
    initialValue = Math.floor(Math.random() * 401) + 100; // 100 to 500
  } else if (level === 8) {
    initialValue = Math.floor(Math.random() * 201) + 100; // 100 to 300
  } else if (level === 9) {
    initialValue = Math.floor(Math.random() * 301) + 100; // 100 to 400
  } else if (level === 10) {
    initialValue = Math.floor(Math.random() * 801) + 200; // 200 to 1000
    numSteps = Math.floor(Math.random() * 2) + 6; // 6 to 7 steps
  } else if (level === 11) {
    initialValue = Math.floor(Math.random() * 30) + 5;
    numSteps = 7;
  } else {
    // level 12
    initialValue = Math.floor(Math.random() * 800) + 100;
    numSteps = 7;
  }

  let currentValue = initialValue;
  const steps: ChainStep[] = [];

  for (let i = 0; i < numSteps; i++) {
    let operator: '+' | '-' | '×' | '÷' = '+';
    let operand = 1;
    let nextValue = currentValue;
    let attempts = 0;
    
    while (attempts < 100) {
      attempts++;
      
      // Allowed operations per level
      let allowedOps: ('+' | '-' | '×' | '÷')[] = ['+', '-'];
      
      if (level === 2 || level === 5 || level === 8) {
        allowedOps = ['+', '-', '×'];
      } else if (level === 3 || level === 6 || level === 9 || level === 10 || level === 11 || level === 12) {
        allowedOps = ['+', '-', '×', '÷'];
      }
      
      operator = allowedOps[Math.floor(Math.random() * allowedOps.length)];
      
      if (operator === '+') {
        if (level === 1 || level === 2 || level === 3) {
          operand = Math.floor(Math.random() * 9) + 1; // 1-9
          nextValue = currentValue + operand;
          if (nextValue <= (level === 1 ? 15 : 30)) break;
        } else if (level === 4 || level === 5 || level === 6 || level === 11) {
          operand = Math.floor(Math.random() * 40) + 5; // 5-45
          nextValue = currentValue + operand;
          if (nextValue <= 150) break;
        } else {
          operand = Math.floor(Math.random() * 300) + 10; // 10-310
          nextValue = currentValue + operand;
          if (nextValue <= (level === 12 ? 4000 : 999)) break;
        }
      } else if (operator === '-') {
        if (level === 1 || level === 2 || level === 3) {
          operand = Math.floor(Math.random() * 8) + 1; // 1-8
          nextValue = currentValue - operand;
          if (nextValue > 0) break;
        } else if (level === 4 || level === 5 || level === 6 || level === 11) {
          operand = Math.floor(Math.random() * 40) + 5; // 5-45
          nextValue = currentValue - operand;
          if (nextValue >= 10) break;
        } else {
          operand = Math.floor(Math.random() * 300) + 10; // 10-310
          nextValue = currentValue - operand;
          if (nextValue >= 50) break;
        }
      } else if (operator === '×') {
        if (level === 2 || level === 3) {
          operand = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
          nextValue = currentValue * operand;
          if (nextValue <= 40) break;
        } else if (level === 5 || level === 6 || level === 11) {
          operand = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
          nextValue = currentValue * operand;
          if (nextValue <= 200) break;
        } else {
          operand = [2, 3, 4][Math.floor(Math.random() * 3)];
          nextValue = currentValue * operand;
          if (nextValue <= (level === 12 ? 5000 : 999)) break;
        }
      } else if (operator === '÷') {
        const divisors: number[] = [];
        const maxDiv = (level === 3) ? 5 : 10;
        for (let d = 2; d <= maxDiv; d++) {
          if (currentValue % d === 0) {
            divisors.push(d);
          }
        }
        
        if (divisors.length > 0) {
          operand = divisors[Math.floor(Math.random() * divisors.length)];
          nextValue = currentValue / operand;
          break;
        } else {
          continue; 
        }
      }
    }
    
    if (attempts >= 100) {
      operator = '+';
      operand = 1;
      nextValue = currentValue + 1;
    }

    const correctValue = nextValue;
    const options = generateOptions(correctValue);

    steps.push({
      operator,
      operand,
      beforeValue: currentValue,
      correctValue,
      options
    });

    currentValue = correctValue;
  }

  return {
    initialValue,
    steps
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Navigation & Screens state
  const [screen, setScreen] = useState<'home' | 'levels' | 'game' | 'results' | 'achievements'>('home');
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Best scores tracker mapping level id to stats
  const [bestScores, setBestScores] = useState<{ [key: number]: BestScore }>({});

  // Active game play session states
  const [currentChainIndex, setCurrentChainIndex] = useState<number>(0); // 0 to 9 (for 10 chains)
  const [currentChain, setCurrentChain] = useState<Chain | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [levelChainsResults, setLevelChainsResults] = useState<boolean[]>([]); // true for pass, false for fail
  
  const [levelStepsCorrect, setLevelStepsCorrect] = useState<number>(0);
  const [levelStepsTotal, setLevelStepsTotal] = useState<number>(0);
  
  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Interaction feedback states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnsweringTransition, setIsAnsweringTransition] = useState<boolean>(false);
  const [mascotBubbleText, setMascotBubbleText] = useState<string>("Qani, boshladik! Diqqatingizni qarating! 🚀");
  const [mascotAnimation, setMascotAnimation] = useState<'idle' | 'happy' | 'think'>('idle');
  const [confettis, setConfettis] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);

  // Sound manager sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load progress on mount
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('azimjon_qi_unlocked_levels');
      if (savedUnlocked) {
        setUnlockedLevels(JSON.parse(savedUnlocked));
      }
      const savedScores = localStorage.getItem('azimjon_qi_best_scores');
      if (savedScores) {
        setBestScores(JSON.parse(savedScores));
      }
      const savedSound = localStorage.getItem('azimjon_qi_sound_enabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }, []);

  // Timer loop when playing
  useEffect(() => {
    if (screen === 'game') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [screen]);

  // Handle Level Start
  const startLevel = (levelId: number) => {
    sounds.playClick();
    setActiveLevel(levelId);
    setCurrentChainIndex(0);
    const firstChain = generateChain(levelId);
    setCurrentChain(firstChain);
    setCurrentStepIndex(0);
    setLevelChainsResults([]);
    setLevelStepsCorrect(0);
    setLevelStepsTotal(0);
    setSecondsElapsed(0);
    setSelectedOption(null);
    setIsAnsweringTransition(false);
    setMascotBubbleText("Ketdik! Birinchi zanjirni diqqat bilan yeching! 💪");
    setMascotAnimation('idle');
    setConfettis([]);
    setScreen('game');
  };

  // Sound toggle helper
  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('azimjon_qi_sound_enabled', String(newVal));
    sounds.playClick();
  };

  // Option selection logic
  const handleSelectOption = (option: number) => {
    if (isAnsweringTransition || !currentChain) return;

    sounds.playClick();
    setSelectedOption(option);
    setIsAnsweringTransition(true);

    const step = currentChain.steps[currentStepIndex];
    const isCorrect = (option === step.correctValue);
    
    // Update step state
    step.userChosenOption = option;
    step.isCorrect = isCorrect;

    // Adjust step counting
    setLevelStepsTotal(prev => prev + 1);
    if (isCorrect) {
      setLevelStepsCorrect(prev => prev + 1);
      sounds.playCorrect();
      setMascotAnimation('happy');
      // Pick random correct reaction
      const rx = MASCOT_REACTIONS_CORRECT[Math.floor(Math.random() * MASCOT_REACTIONS_CORRECT.length)];
      setMascotBubbleText(rx);
      
      // Trigger a mini sparkle celebration
      triggerMiniConfetti();
    } else {
      sounds.playIncorrect();
      setMascotAnimation('think');
      const rx = MASCOT_REACTIONS_INCORRECT[Math.floor(Math.random() * MASCOT_REACTIONS_INCORRECT.length)];
      setMascotBubbleText(`${rx} (Javob: ${step.correctValue})`);
    }

    // Delay and advance to next step or next chain
    setTimeout(() => {
      setSelectedOption(null);
      setMascotAnimation('idle');

      if (currentStepIndex < currentChain.steps.length - 1) {
        // Go to next row in current zanjir
        setCurrentStepIndex(prev => prev + 1);
        setIsAnsweringTransition(false);
      } else {
        // Completed the current chain! Evaluate if the whole chain is passed (at least 80% correct)
        const correctCount = currentChain.steps.filter(s => s.isCorrect).length;
        const totalCount = currentChain.steps.length;
        const passedChain = (correctCount / totalCount) >= 0.8;

        const updatedChainsResults = [...levelChainsResults, passedChain];
        setLevelChainsResults(updatedChainsResults);

        // Check if there are more chains in this level
        if (currentChainIndex < 9) {
          // Go to next chain
          const nextIndex = currentChainIndex + 1;
          setCurrentChainIndex(nextIndex);
          const nextChain = generateChain(activeLevel);
          setCurrentChain(nextChain);
          setCurrentStepIndex(0);
          setIsAnsweringTransition(false);
          setMascotBubbleText(`Ajoyib, ${nextIndex}-misol tugadi! Keyingisiga o'tamiz! 🚀`);
        } else {
          // All 10 chains complete! Calculate result
          const totalPassedChains = updatedChainsResults.filter(r => r).length;
          const passedLevel = totalPassedChains >= 7;

          // Save scores and unlocks
          if (passedLevel) {
            sounds.playVictory();
            // Unlock next level if not unlocked
            const nextLvl = activeLevel + 1;
            if (nextLvl <= LEVELS.length && !unlockedLevels.includes(nextLvl)) {
              const updatedUnlocked = [...unlockedLevels, nextLvl];
              setUnlockedLevels(updatedUnlocked);
              localStorage.setItem('azimjon_qi_unlocked_levels', JSON.stringify(updatedUnlocked));
            }
          }

          // Update Best Score
          const currentPercent = Math.round((totalPassedChains / 10) * 100);
          const newScore: BestScore = {
            percent: currentPercent,
            correctChains: totalPassedChains,
            timeInSec: secondsElapsed,
            timestamp: Date.now()
          };

          const existingBest = bestScores[activeLevel];
          let updatedScores = { ...bestScores };
          if (!existingBest || currentPercent > existingBest.percent || (currentPercent === existingBest.percent && secondsElapsed < existingBest.timeInSec)) {
            updatedScores[activeLevel] = newScore;
            setBestScores(updatedScores);
            localStorage.setItem('azimjon_qi_best_scores', JSON.stringify(updatedScores));
          }

          // Move to Results screen
          setScreen('results');
          setIsAnsweringTransition(false);
        }
      }
    }, 1500);
  };

  const triggerMiniConfetti = () => {
    const list = [];
    const colors = ['bg-yellow-400', 'bg-emerald-400', 'bg-sky-400', 'bg-rose-400', 'bg-indigo-400', 'bg-purple-400'];
    for (let i = 0; i < 25; i++) {
      list.push({
        id: Math.random() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setConfettis(list);
    setTimeout(() => {
      setConfettis([]);
    }, 3000);
  };

  // Clean achievements / reset progress
  const resetProgress = () => {
    if (confirm("Haqiqatan ham barcha natijalar va ochilgan darajalarni o'chirib yubormoqchimisiz?")) {
      sounds.playClick();
      setUnlockedLevels([1]);
      setBestScores({});
      localStorage.removeItem('azimjon_qi_unlocked_levels');
      localStorage.removeItem('azimjon_qi_best_scores');
      setScreen('home');
    }
  };

  return (
    <div className="min-h-screen grid-pattern text-slate-800 font-sans flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      
      {/* Floating Confettis overlay when winning a step/level */}
      {confettis.map((c) => (
        <div
          key={c.id}
          className={`absolute w-3 h-3 rounded-full ${c.color} animate-confetti z-50`}
          style={{
            left: `${c.left}%`,
            top: `-20px`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* HEADER SECTION */}
      <header className="bg-white border-b-4 border-slate-800 px-4 py-3 sm:px-6 flex justify-between items-center z-10">
        <button 
          onClick={() => { sounds.playClick(); setScreen('home'); }}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-400 border-2 border-slate-800 flex items-center justify-center neo-card-sm">
            <span className="font-bold text-lg text-slate-800">AQ</span>
          </div>
          <span className="font-black text-2xl tracking-wider text-slate-800">AZIMJON QI</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSound}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title={soundEnabled ? "Tovushni o'chirish" : "Tovushni yoqish"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-slate-800" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
          
          {screen !== 'home' && (
            <button 
              onClick={() => { sounds.playClick(); setScreen('home'); }}
              className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Bosh sahifa
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center z-10">
        
        {/* ==========================================
            SCREEN: HOME (BOSH SAHIFA)
            ========================================== */}
        {screen === 'home' && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-pop">
            
            {/* Mascot welcoming */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {/* Speech Bubble */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-64 bg-yellow-100 border-3 border-slate-800 rounded-2xl py-2 px-3 text-sm font-bold text-slate-800 shadow-md animate-bounce-small">
                  Salom! Qani, aqlimizni charxlaymiz! ⚡
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                  <div className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-yellow-100"></div>
                </div>

                {/* Animated Pencil/Robot Avatar */}
                <div className="w-32 h-32 bg-yellow-300 border-4 border-slate-800 rounded-full flex items-center justify-center neo-card animate-float relative">
                  {/* Pencil shape overlay */}
                  <div className="absolute top-0 w-8 h-8 bg-orange-400 border-2 border-slate-800 rotate-45 transform origin-center -translate-y-2 rounded"></div>
                  {/* Eyes */}
                  <div className="flex gap-4 z-10">
                    <div className="w-4 h-5 bg-white border-2 border-slate-800 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-slate-900 rounded-full absolute bottom-1 right-0.5"></div>
                    </div>
                    <div className="w-4 h-5 bg-white border-2 border-slate-800 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-slate-900 rounded-full absolute bottom-1 left-0.5"></div>
                    </div>
                  </div>
                  {/* Smile */}
                  <div className="absolute bottom-6 w-8 h-4 border-b-4 border-slate-800 rounded-b-full"></div>
                  {/* Cute blush cheeks */}
                  <div className="absolute left-6 bottom-8 w-3 h-2 bg-rose-400 rounded-full opacity-60"></div>
                  <div className="absolute right-6 bottom-8 w-3 h-2 bg-rose-400 rounded-full opacity-60"></div>
                  {/* Smart glasses */}
                  <div className="absolute top-10 flex gap-2 w-16 h-6 border-slate-800 z-10">
                    <div className="w-7 h-7 rounded-full border-2 border-slate-800 bg-white/20"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-slate-800 bg-white/20"></div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-800 uppercase drop-shadow-sm">
                AZIMJON QI
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-600 mt-2 max-w-md">
                2-sinf o'quvchilari uchun maxsus "Mental Arifmetika" mashq va o'yin markazi! 🧠✨
              </p>
            </div>

            {/* Core Action Menu */}
            <div className="bg-white border-4 border-slate-800 p-6 sm:p-8 rounded-3xl neo-card max-w-md mx-auto space-y-4">
              <button
                id="btn-play-game"
                onClick={() => { sounds.playClick(); setScreen('levels'); }}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-2xl font-black tracking-wider border-4 border-slate-800 neo-btn flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-8 h-8 fill-slate-900 stroke-slate-900" />
                O'YINNI BOSHLASH
              </button>

              <button
                id="btn-achievements"
                onClick={() => { sounds.playClick(); setScreen('achievements'); }}
                className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-800 text-lg font-black border-4 border-slate-800 neo-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-slate-800" />
                YUTUQLARIMIZ
              </button>
            </div>

            {/* Educational Info badge */}
            <div className="flex justify-center items-center gap-2 bg-white/60 border-2 border-slate-800 rounded-2xl py-2 px-4 max-w-sm mx-auto">
              <Info className="w-5 h-5 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 text-left">
                Zanjirlar sekin-asta murakkablashib boradi, har darajani ochish uchun 10 tadan kamida 7 tasini to'g'ri yeching.
              </span>
            </div>

          </div>
        )}

        {/* ==========================================
            SCREEN: LEVELS (DARAJALAR RO'YXATI)
            ========================================== */}
        {screen === 'levels' && (
          <div className="w-full space-y-6 animate-pop">
            
            {/* Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <Brain className="w-8 h-8 text-indigo-500" />
                  MASHQ DARAJALARI
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  Oldingi bosqichda kamida 7 ball to'plab, yangi daxshat darajalarni oching!
                </p>
              </div>

              <button
                onClick={() => { sounds.playClick(); setScreen('home'); }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" /> Orqaga
              </button>
            </div>

            {/* Levels Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LEVELS.map((level) => {
                const isUnlocked = unlockedLevels.includes(level.id);
                const best = bestScores[level.id];
                
                return (
                  <div
                    key={level.id}
                    className={`rounded-3xl border-4 border-slate-800 p-5 flex flex-col justify-between h-[210px] relative transition-transform ${
                      isUnlocked 
                        ? `${level.color} neo-card` 
                        : 'bg-slate-200 border-slate-400 opacity-75'
                    }`}
                  >
                    {/* Locked overlay lock icon */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-900/10 rounded-2xl flex items-center justify-center z-10">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center shadow-lg">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Level Details */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-slate-800 ${isUnlocked ? 'bg-white' : 'bg-slate-300'}`}>
                          {level.id}-BOSQICH
                        </span>
                        {isUnlocked && best && (
                          <span className="flex items-center gap-0.5 bg-yellow-400 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full border-2 border-slate-800">
                            <Star className="w-3.5 h-3.5 fill-slate-900" />
                            {best.correctChains}/10
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-slate-800 line-clamp-1">{level.name}</h3>
                      <p className="text-xs font-bold text-slate-600 mt-1 line-clamp-2">{level.description}</p>
                    </div>

                    {/* Footer stats or unlock requirements */}
                    <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-800/20 flex justify-between items-center z-10">
                      <div className="text-left">
                        <div className="text-[11px] font-black text-slate-500 uppercase">Foydalaniladigan amallar</div>
                        <div className="text-sm font-black text-slate-800">{level.operationsText}</div>
                      </div>

                      {isUnlocked ? (
                        <button
                          id={`play-level-${level.id}`}
                          onClick={() => startLevel(level.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-md active:scale-95 transition-transform"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> BOSHLASH
                        </button>
                      ) : (
                        <div className="text-right text-[11px] font-black text-slate-500">
                          QULFlANGAN 🔒
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievements shortcut */}
            <div className="bg-white border-4 border-slate-800 p-4 rounded-3xl neo-card flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-800 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-slate-800" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">Yutuqlarni ko'rishni istaysizmi?</h4>
                  <p className="text-xs font-bold text-slate-500">Barcha eng yaxshi natijalar va kuboklar shu yerda saqlanadi.</p>
                </div>
              </div>
              <button
                onClick={() => { sounds.playClick(); setScreen('achievements'); }}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 border-2 border-slate-800 font-black text-xs rounded-xl neo-btn cursor-pointer"
              >
                Yutuqlar Sahifasi 🏆
              </button>
            </div>

          </div>
        )}

        {/* ==========================================
            SCREEN: GAMEPLAY (O'YIN SAHIFASI)
            ========================================== */}
        {screen === 'game' && currentChain && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar / Left Column: Info & Mascot (span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              
              {/* Stats card */}
              <div className="bg-white border-4 border-slate-800 p-5 rounded-3xl neo-card space-y-4 text-left">
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
                  <span className="font-black text-indigo-600 text-sm">
                    {LEVELS[activeLevel - 1].name}
                  </span>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-800" />
                    <span className="font-mono font-bold text-base">
                      {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-slate-600">
                    <span>PROGRESS: {currentChainIndex + 1} / 10 Zanjir</span>
                    <span className="text-emerald-600">O'tish: kamida 7 ta</span>
                  </div>
                  
                  {/* Progress dots bar */}
                  <div className="flex gap-1.5 justify-between w-full pt-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      let bg = "bg-slate-200 border-slate-300";
                      if (idx < levelChainsResults.length) {
                        bg = levelChainsResults[idx] 
                          ? "bg-emerald-400 border-emerald-600 text-white" 
                          : "bg-rose-400 border-rose-600 text-white";
                      } else if (idx === currentChainIndex) {
                        bg = "bg-amber-300 border-amber-600 animate-pulse";
                      }
                      return (
                        <div 
                          key={idx} 
                          className={`w-full h-5 rounded-md border-2 text-[9px] font-black flex items-center justify-center ${bg}`}
                          title={`Chain ${idx + 1}`}
                        >
                          {idx < levelChainsResults.length ? (levelChainsResults[idx] ? "✓" : "✗") : idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Hisoblar to'g'riligi:</span>
                  <span className="font-black text-emerald-600 text-sm">{levelStepsCorrect} / {levelStepsTotal} qadam</span>
                </div>
              </div>

              {/* Mascot & Speech bubble */}
              <div className="flex flex-col items-center bg-white border-4 border-slate-800 p-6 rounded-3xl neo-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -mr-8 -mt-8"></div>
                
                {/* Speech bubble */}
                <div className="relative w-full bg-slate-100 border-3 border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-800 mb-4 shadow-sm text-left">
                  {mascotBubbleText}
                  <div className="absolute bottom-[-11px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-100"></div>
                </div>

                {/* Animated Pencil Character */}
                <div className={`w-28 h-28 bg-yellow-300 border-4 border-slate-800 rounded-full flex items-center justify-center relative transition-transform duration-300 ${
                  mascotAnimation === 'happy' ? 'scale-110 animate-bounce' : mascotAnimation === 'think' ? 'rotate-12 animate-pulse' : 'animate-float'
                }`}>
                  <div className="absolute top-0 w-8 h-8 bg-orange-400 border-2 border-slate-800 rotate-45 transform origin-center -translate-y-2 rounded"></div>
                  {/* Eyes */}
                  <div className="flex gap-4 z-10">
                    <div className="w-4 h-5 bg-white border-2 border-slate-800 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-slate-900 rounded-full absolute bottom-1 right-0.5"></div>
                    </div>
                    <div className="w-4 h-5 bg-white border-2 border-slate-800 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-slate-900 rounded-full absolute bottom-1 left-0.5"></div>
                    </div>
                  </div>
                  {/* Smile / Mouth expression */}
                  {mascotAnimation === 'happy' ? (
                    <div className="absolute bottom-5 w-8 h-6 bg-rose-500 border-3 border-slate-800 rounded-b-full"></div>
                  ) : mascotAnimation === 'think' ? (
                    <div className="absolute bottom-6 w-6 h-1 bg-slate-800 rounded"></div>
                  ) : (
                    <div className="absolute bottom-6 w-8 h-4 border-b-4 border-slate-800 rounded-b-full"></div>
                  )}
                  {/* Blush */}
                  <div className="absolute left-5 bottom-8 w-3 h-2 bg-rose-400 rounded-full opacity-60"></div>
                  <div className="absolute right-5 bottom-8 w-3 h-2 bg-rose-400 rounded-full opacity-60"></div>
                  {/* Eyebrows */}
                  <div className="absolute top-8 flex justify-between w-12 px-1 z-10">
                    <div className={`w-3 h-1 bg-slate-800 rounded transform ${mascotAnimation === 'think' ? 'rotate-12' : '-rotate-6'}`}></div>
                    <div className={`w-3 h-1 bg-slate-800 rounded transform ${mascotAnimation === 'think' ? '-rotate-12' : 'rotate-6'}`}></div>
                  </div>
                </div>

                <span className="font-black text-xs text-slate-400 uppercase mt-2 tracking-widest">
                  Azimjon maslahatchi
                </span>
              </div>

              {/* Stop / Resign button */}
              <button
                onClick={() => {
                  if (confirm("Haqiqatan ham bu bosqichdan chiqib, darajalarga qaytmoqchimisiz? Progress yo'qoladi.")) {
                    sounds.playClick();
                    setScreen('levels');
                  }
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-slate-800 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black cursor-pointer shadow active:scale-95 transition-transform"
              >
                Chiqish va to'xtatish 🚪
              </button>

            </div>

            {/* Main Column: Vertical Chain & Options (span 8) */}
            <div className="lg:col-span-8 bg-white border-4 border-slate-800 p-6 sm:p-8 rounded-3xl neo-card flex flex-col items-center gap-8 min-h-[500px]">
              
              <div className="text-center">
                <span className="px-4 py-1 bg-slate-100 border-2 border-slate-800 rounded-full text-xs font-black text-slate-600">
                  ZANJIR #{currentChainIndex + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-400 mt-1">
                  Miyada ketma-ket hisoblang
                </h3>
              </div>

              {/* THE VERTICAL CHAIN CONTAINER (Matches User Screenshot precisely, but modern & child-friendly) */}
              <div className="flex flex-col items-stretch w-full max-w-sm border-4 border-slate-800 bg-slate-100 rounded-2xl overflow-hidden shadow-md">
                
                {/* Starting value cell (Row 0) */}
                <div className="bg-amber-100 border-b-4 border-slate-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 border-2 border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-800">
                      ★
                    </span>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                      Boshlang'ich son
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-800 mr-2">
                    {currentChain.initialValue}
                  </div>
                </div>

                {/* Operations chain rows */}
                <div className="flex flex-col">
                  {currentChain.steps.map((step, idx) => {
                    const isFuture = idx > currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const isPassed = idx < currentStepIndex;
                    
                    let bgClass = "bg-white";
                    let textClass = "text-slate-800";
                    let statusLabel = "";

                    if (isPassed) {
                      if (step.isCorrect) {
                        bgClass = "bg-emerald-50/60";
                        textClass = "text-emerald-800";
                        statusLabel = "⭐ to'g'ri";
                      } else {
                        bgClass = "bg-rose-50/60";
                        textClass = "text-rose-800";
                        statusLabel = "💡 xato";
                      }
                    } else if (isActive) {
                      bgClass = "bg-indigo-50 border-y-2 border-indigo-400 animate-pulse";
                      textClass = "text-indigo-900";
                    } else {
                      bgClass = "bg-slate-50/30 opacity-40";
                      textClass = "text-slate-400";
                    }

                    // Format operator representation beautifully
                    const formattedOperator = step.operator === '+' ? '+' : step.operator === '-' ? '-' : step.operator === '×' ? '×' : '÷';
                    
                    return (
                      <div 
                        key={idx} 
                        className={`border-b-4 last:border-b-0 border-slate-800 p-4 flex items-center justify-between transition-colors ${bgClass}`}
                      >
                        {/* Operator and Operand badge */}
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl border-2 border-slate-800 flex items-center justify-center font-black text-lg shadow-sm ${
                            isFuture 
                              ? 'bg-slate-100 text-slate-400' 
                              : step.operator === '+' 
                                ? 'bg-emerald-300 text-emerald-900' 
                                : step.operator === '-' 
                                  ? 'bg-rose-300 text-rose-900' 
                                  : step.operator === '×' 
                                    ? 'bg-orange-300 text-orange-900' 
                                    : 'bg-sky-300 text-sky-900'
                          }`}>
                            {formattedOperator}
                          </span>
                          
                          <span className="text-2xl font-extrabold tracking-wide">
                            {step.operand}
                          </span>
                        </div>

                        {/* Result cell */}
                        <div className="flex items-center gap-2">
                          {isPassed && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-800 bg-white shadow-sm">
                              {statusLabel}
                            </span>
                          )}

                          <div className={`w-20 h-10 rounded-xl border-2 border-slate-800 flex items-center justify-center font-black text-xl shadow-inner ${
                            isFuture 
                              ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400' 
                              : isActive 
                                ? 'bg-amber-100 border-amber-500 text-amber-700 animate-bounce-small' 
                                : step.isCorrect 
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                                  : 'bg-rose-100 border-rose-400 text-rose-800'
                          }`}>
                            {isFuture ? (
                              <Lock className="w-4 h-4 text-slate-300" />
                            ) : isActive ? (
                              <span className="animate-pulse">?</span>
                            ) : (
                              step.correctValue
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Final result cell box as requested by screenshot empty state */}
                <div className="bg-slate-200 p-4 border-t-4 border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    YAKUNIY JAVOB
                  </span>
                  <div className="w-24 h-11 bg-white border-3 border-slate-800 rounded-xl flex items-center justify-center font-black text-2xl text-indigo-700 shadow-sm">
                    {currentStepIndex === currentChain.steps.length 
                      ? currentChain.steps[currentChain.steps.length - 1].correctValue 
                      : "???"}
                  </div>
                </div>

              </div>

              {/* THE OPTION SELECTIONS (4 BUTTONS) */}
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-0.5 bg-slate-200 flex-1"></div>
                  <span className="px-4 text-sm font-black text-slate-500 uppercase tracking-widest">
                    To'g'ri natijani tanlang
                  </span>
                  <div className="h-0.5 bg-slate-200 flex-1"></div>
                </div>

                {/* Grid of 4 options */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                  {currentChain.steps[currentStepIndex].options.map((optionValue) => {
                    const isClicked = selectedOption === optionValue;
                    const step = currentChain.steps[currentStepIndex];
                    const isCorrectOption = optionValue === step.correctValue;

                    let btnColor = "bg-white hover:bg-slate-50 border-slate-800 text-slate-800";
                    
                    if (isAnsweringTransition) {
                      if (isCorrectOption) {
                        btnColor = "bg-emerald-400 text-white border-emerald-700 scale-105 shadow-none";
                      } else if (isClicked) {
                        btnColor = "bg-rose-400 text-white border-rose-700 animate-shake shadow-none";
                      } else {
                        btnColor = "bg-slate-100 text-slate-400 border-slate-300 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optionValue}
                        id={`option-btn-${optionValue}`}
                        disabled={isAnsweringTransition}
                        onClick={() => handleSelectOption(optionValue)}
                        className={`py-4 rounded-3xl text-3xl font-black border-4 neo-btn active:scale-95 transition-all cursor-pointer ${btnColor}`}
                      >
                        {optionValue}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SCREEN: RESULTS (NATIJA EKRANI)
            ========================================== */}
        {screen === 'results' && (
          <div className="w-full max-w-xl bg-white border-4 border-slate-800 p-8 rounded-3xl neo-card text-center space-y-8 animate-pop">
            
            {/* Header */}
            <div>
              <span className="px-4 py-1.5 bg-indigo-100 border-2 border-slate-800 rounded-full text-xs font-black text-indigo-700 uppercase">
                {LEVELS[activeLevel - 1].name} YAKUNLANDI
              </span>
              
              {/* Score text */}
              {levelChainsResults.filter(r => r).length >= 7 ? (
                <div className="mt-4 space-y-2">
                  <div className="text-6xl animate-bounce">🏆🎉</div>
                  <h2 className="text-4xl font-black text-emerald-600">Daxshat! G'alaba!</h2>
                  <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
                    Ajoyib natija! Siz 10 tadan {levelChainsResults.filter(r => r).length} ta zanjirni daxshatli aniqlikda yechib, keyingi darajani ochdingiz!
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="text-6xl animate-pulse">🔄💪</div>
                  <h2 className="text-3xl font-black text-rose-500">Yaxshi harakat!</h2>
                  <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
                    Siz 10 tadan {levelChainsResults.filter(r => r).length} ta zanjirni to'g'ri yechdingiz. O'tish uchun kamida 7 ta zanjirni to'g'ri yechish kerak. Yana urinib ko'ramiz!
                  </p>
                </div>
              )}
            </div>

            {/* Score circle visualization */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center bg-slate-50 border-4 border-slate-800 rounded-full shadow-inner">
              <div className="text-center">
                <span className="text-5xl font-black text-slate-800">
                  {levelChainsResults.filter(r => r).length}
                </span>
                <span className="text-2xl font-bold text-slate-400"> / 10</span>
                <div className="text-xs font-black text-slate-500 uppercase mt-1 tracking-wider">
                  Zanjir To'g'ri
                </div>
              </div>
              
              {/* Little absolute star badges */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 border-2 border-slate-800 rounded-xl flex items-center justify-center rotate-12 shadow">
                <Star className="w-5 h-5 text-slate-800 fill-slate-800" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-indigo-400 border-2 border-slate-800 rounded-xl flex items-center justify-center -rotate-12 shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 border-2 border-slate-800 bg-slate-50 p-4 rounded-2xl">
              <div className="text-left border-r-2 border-slate-200 pr-2">
                <span className="text-[10px] font-black text-slate-400 uppercase block">SARFLANGAN VAQT</span>
                <span className="text-xl font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="text-left pl-2">
                <span className="text-[10px] font-black text-slate-400 uppercase block">QADAM ANIQLIGI</span>
                <span className="text-xl font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  {levelStepsCorrect} / {levelStepsTotal} ({levelStepsTotal > 0 ? Math.round((levelStepsCorrect / levelStepsTotal) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Actions button list */}
            <div className="space-y-3 pt-4 border-t-2 border-dashed border-slate-100">
              
              {levelChainsResults.filter(r => r).length >= 7 && activeLevel < LEVELS.length ? (
                <button
                  id="btn-next-level"
                  onClick={() => startLevel(activeLevel + 1)}
                  className="w-full py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-xl font-black border-4 border-slate-800 neo-btn flex items-center justify-center gap-2 cursor-pointer"
                >
                  KEYINGI DARAJAGA O'TISH <ArrowRight className="w-5 h-5" />
                </button>
              ) : null}

              <button
                id="btn-retry-level"
                onClick={() => startLevel(activeLevel)}
                className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-850 text-lg font-black border-4 border-slate-800 neo-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> DARAJANI QAYTA O'YNASH
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { sounds.playClick(); setScreen('levels'); }}
                  className="py-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-black border-2 border-slate-800 cursor-pointer active:scale-95 transition-transform"
                >
                  Bosqichlar ro'yxati 🗺️
                </button>
                <button
                  onClick={() => { sounds.playClick(); setScreen('home'); }}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black border-2 border-slate-800 cursor-pointer active:scale-95 transition-transform"
                >
                  Bosh sahifa 🏠
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SCREEN: ACHIEVEMENTS (YUTUQLAR)
            ========================================== */}
        {screen === 'achievements' && (
          <div className="w-full space-y-6 animate-pop">
            
            {/* Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  YUTUQLAR VA KUBOKLAR SHELFI
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  Biz qo'lga kiritgan oltin kuboklar va eng yaxshi natijalarimiz ro'yxati!
                </p>
              </div>

              <button
                onClick={() => { sounds.playClick(); setScreen('home'); }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" /> Orqaga
              </button>
            </div>

            {/* Cup Shelves shelf list */}
            <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 sm:p-8 neo-card">
              
              {/* Trophies total display */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-yellow-400 border-2 border-slate-800 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-slate-900 fill-slate-900 animate-float" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Oltin Kuboklar: {Object.keys(bestScores).filter(k => bestScores[Number(k)].percent >= 70).length} ta
                    </h3>
                    <p className="text-xs font-bold text-slate-600">Kamida 70% to'g'ri yechilgan barcha bosqichlar uchun oltin kubok beriladi!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-500 uppercase">JAMI DARAK:</span>
                  <span className="px-3 py-1 bg-white border-2 border-slate-800 rounded-full font-black text-indigo-700">
                    {unlockedLevels.length} / 12 Boschlanishlar
                  </span>
                </div>
              </div>

              {/* Grid of trophy details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {LEVELS.map((level) => {
                  const best = bestScores[level.id];
                  const hasTrophy = best && best.percent >= 70;
                  
                  return (
                    <div 
                      key={level.id}
                      className={`border-2 border-slate-800 rounded-2xl p-4 flex gap-3 items-center ${
                        hasTrophy ? 'bg-amber-50/50' : 'bg-slate-50 opacity-60'
                      }`}
                    >
                      {/* Left: Trophy illustration */}
                      <div className={`w-14 h-14 rounded-xl border-2 border-slate-800 flex items-center justify-center shrink-0 shadow ${
                        hasTrophy ? 'bg-yellow-400' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {hasTrophy ? (
                          <Trophy className="w-6 h-6 text-slate-900 fill-slate-900" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Right: Score details */}
                      <div className="text-left overflow-hidden">
                        <h4 className="font-black text-sm text-slate-800 truncate">{level.id}-Bosqich</h4>
                        <p className="text-[10px] font-bold text-slate-500 truncate">{level.name}</p>
                        
                        {best ? (
                          <div className="mt-1 flex flex-col gap-0.5">
                            <span className="text-xs font-black text-emerald-600">
                              Natija: {best.correctChains}/10 to'g'ri
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              Vaqt: {Math.floor(best.timeInSec / 60)}m {(best.timeInSec % 60)}s
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 block mt-1">
                            Hali o'ynalmagan
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Danger Zone: reset progress */}
            <div className="bg-rose-50 border-4 border-rose-300 p-6 rounded-3xl flex justify-between items-center flex-wrap gap-4">
              <div className="text-left">
                <h4 className="font-black text-rose-800">O'yin progressini tozalash</h4>
                <p className="text-xs font-bold text-rose-600">Diqqat! Barcha kuboklar va ochilgan bosqichlar butunlay o'chirib yuboriladi va o'yin boshidan boshlanadi.</p>
              </div>
              <button
                id="btn-reset-progress"
                onClick={resetProgress}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs cursor-pointer shadow active:scale-95 transition-transform"
              >
                Progressni butunlay o'chirish 🗑️
              </button>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="py-4 text-center text-xs font-bold text-slate-400 border-t border-slate-200 mt-6 z-10 bg-white/70">
        <p>© 2026 AZIMJON QI — Mental Arifmetika O'quv Markazi. Barcha huquqlar himoyalangan.</p>
        <p className="text-[10px] text-slate-400 mt-1">O'zbekiston milliy dasturi asosida o'quvchilar uchun maxsus yaratildi.</p>
      </footer>

    </div>
  );
}
