import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { University, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Mail, Lock, User as UserIcon, BookOpen, Clipboard, 
  School, FileText, Image as ImageIcon, Camera, ArrowRight, ArrowLeft, 
  Check, Sparkles, AlertCircle, Bookmark, CheckCircle, Quote, Star, MapPin
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

const DEPARTMENTS = [
  'Computer Science',
  'Artificial Intelligence',
  'Software Engineering',
  'Cyber Security',
  'Data Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration'
];

const BATCHES = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

const PRESET_UNIVERSITIES_LIST = [
  'FAST NUCES (NUCES-FAST Lahore)',
  'FAST NUCES (NUCES-FAST Islamabad)',
  'FAST NUCES (NUCES-FAST Karachi)',
  'FAST NUCES (NUCES-FAST Peshawar)',
  'FAST NUCES (NUCES-FAST Faisalabad)',
  'NUST (National University of Sciences & Technology, Islamabad)',
  'LUMS (Lahore University of Management Sciences)',
  'UET Lahore (University of Engineering & Technology)',
  'COMSATS University Islamabad',
  'IQRA University Karachi',
  'NED University of Engineering & Technology',
  'GIKI (Ghulam Ishaq Khan Institute, Topi)',
  'QAU (Quaid-i-Azam University, Islamabad)',
  'Punjab University (University of the Punjab, Lahore)',
  'University of Karachi',
  'Bahauddin Zakariya University (BZU, Multan)',
  'ITU (Information Technology University, Lahore)',
  'PIEAS (Pakistan Institute of Engineering and Applied Sciences)',
  'UAF (University of Agriculture, Faisalabad)',
  'Karakoram International University',
  'University of Peshawar',
  'University of Balochistan'
];

const HERO_BACKGROUNDS = [
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80&auto=format&fit=crop',
    title: 'Graduation Cap Toss',
    category: 'Convocation Memories',
    desc: 'The defining flight of achievements & lifelong friendships.'
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80&auto=format&fit=crop',
    title: 'Historic Hallways & Study Walk',
    category: 'Campus Life Showcases',
    desc: 'Wandering through the beautiful campuses, scripting future paths.'
  },
  {
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&q=80&auto=format&fit=crop',
    title: 'Inter-University Athletics Trophy',
    category: 'Sports Week Highlights',
    desc: 'The thrill of competition, sportsmanship, and golden triumphs.'
  },
  {
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&q=80&auto=format&fit=crop',
    title: 'Annual Farewell Gala Dinner',
    category: 'Farewell Moments',
    desc: 'The sunset gala dinner celebrating combined trials and unforgettable milestones.'
  },
  {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1400&q=80&auto=format&fit=crop',
    title: 'Student Society Hackathons',
    category: 'Student Event Highlights',
    desc: 'Vivid events, technology expos, and creative engineering challenges.'
  }
];

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1); // 1, 2, or 3 for Stepper signup
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Rotating backgrounds system
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [degree, setDegree] = useState('Bachelors');
  const [batch, setBatch] = useState('2023');
  const [regNo, setRegNo] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(PRESET_AVATARS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showCustomPhoto, setShowCustomPhoto] = useState(false);

  // Initialize and load academic options
  useEffect(() => {
    const loadUnis = async () => {
      try {
        const list = await api.universities.list();
        const existingNames = new Set(list.map(u => u.name.toLowerCase()));
        const mergedUnis: University[] = [...list];
        
        PRESET_UNIVERSITIES_LIST.forEach((uniName, idx) => {
          if (!existingNames.has(uniName.toLowerCase())) {
            mergedUnis.push({
              id: `preset-${idx}`,
              name: uniName,
              province: 'Punjab',
              logo: '',
              location: 'Pakistan',
              website: '',
              isApproved: true,
              numStudents: 150
            });
          }
        });
        
        setUniversities(mergedUnis);
        if (mergedUnis.length > 0) {
          setSelectedUni(mergedUnis[0].name);
        }
      } catch (err) {
        console.error('Failed to load universities list', err);
        // Clean robust fallback in case of connection failure or empty DB
        const fallbackUnis: University[] = PRESET_UNIVERSITIES_LIST.map((name, idx) => ({
          id: `preset-${idx}`,
          name,
          province: 'Punjab',
          logo: '',
          location: 'Pakistan',
          website: '',
          isApproved: true,
          numStudents: 150
        }));
        setUniversities(fallbackUnis);
        setSelectedUni(fallbackUnis[0].name);
      }
    };
    loadUnis();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step-based validators
  const validateStep1 = () => {
    setError('');
    if (!name.trim()) {
      setError('Please provide your Full Name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid Uni or personal Email Address.');
      return false;
    }
    if (password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setError('');
    if (!selectedUni) {
      setError('Please select your current/past University Affiliation.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setError('');
    if (!regNo.trim()) {
      setError('CMS ID or Roll Number is required for classmate registers.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (registerStep === 1 && validateStep1()) {
      setRegisterStep(2);
    } else if (registerStep === 2 && validateStep2()) {
      setRegisterStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setRegisterStep(prev => Math.max(1, prev - 1));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim() || !password) {
        setError('Please enter both Email and Password.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.auth.login(email.trim(), password);
        onAuthSuccess(res.user);
      } catch (err: any) {
        setError(err?.message || 'Invalid academic email address or password.');
      } finally {
        setLoading(false);
      }
    } else {
      // Direct validation for final step
      if (registerStep !== 3) {
        handleNextStep();
        return;
      }
      if (!validateStep3()) return;

      setLoading(true);
      try {
        const finalPhoto = showCustomPhoto && customPhotoUrl ? customPhotoUrl : photo;
        const res = await api.auth.register({
          name: name.trim(),
          email: email.trim(),
          password,
          university: selectedUni,
          department: selectedDept,
          degreeProgram: degree,
          batch,
          regNo: regNo.trim(),
          profilePhoto: finalPhoto,
          bio: bio.trim() || 'Class Student'
        });
        onAuthSuccess(res.user);
      } catch (err: any) {
        setError(err?.message || 'Registration failed. Try changing the email or roll registration ID.');
      } finally {
        setLoading(false);
      }
    }
  };

  const triggerPresetCredentials = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('ali@nust.edu.pk');
      setPassword('password123');
    } else {
      setEmail('admin@pakyearbook.pk');
      setPassword('password123');
    }
    setIsLogin(true);
  };

  return (
    <div id="yearbook-machine-root" className="min-h-screen bg-[#0A041A] text-white flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* BACKGROUND ROTATOR: Netflix Cinematic Style */}
      <div className="absolute inset-0 w-full h-[110vh] overflow-hidden z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fade-in"
            style={{ backgroundImage: `url(${HERO_BACKGROUNDS[bgIndex].url})` }}
          />
        </AnimatePresence>
        
        {/* Dark radial overlay to maximize readability and dramatic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A041A] via-[#0A041A]/75 to-transparent" />
        <div className="absolute inset-0 bg-[#0A041A]/50 backdrop-blur-[3px]" />
      </div>

      {/* 1. PREMIUM HEADER */}
      <header className="relative z-50 bg-gradient-to-b from-[#0A041A]/90 to-transparent text-white border-b border-purple-950/20 sticky top-0 px-4 md:px-8 py-4 flex justify-between items-center select-none backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-serif italic font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent block">
              Pak-Yearbook
            </span>
            <span className="text-[9px] text-purple-400 font-mono tracking-widest block uppercase">University Chronicles Portal</span>
          </div>
        </div>

        {/* Dynamic Nav Menu */}
        <nav className="hidden lg:flex items-center gap-8 text-slate-300 text-[11px] font-black uppercase tracking-wider">
          <a href="#overview" className="hover:text-purple-400 transition-all cursor-pointer">Overview</a>
          <a href="#designs" className="hover:text-purple-400 transition-all cursor-pointer">Live Chronicles</a>
          <a href="#how-it-works" className="hover:text-purple-400 transition-all cursor-pointer">How It Works</a>
          <span className="h-3.5 w-px bg-purple-900/40" />
          <span className="text-pink-400 text-[11px] font-mono flex items-center gap-2 bg-pink-500/15 border border-pink-500/20 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
            14 Active Campuses
          </span>
        </nav>

        {/* Right CTA Toggle Buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(true);
              setRegisterStep(1);
            }} 
            className={`text-xs px-4.5 py-2 font-bold rounded-xl transition-all cursor-pointer ${
              isLogin 
                ? 'bg-purple-950/60 border border-purple-500/35 text-purple-200 shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsLogin(false);
              setRegisterStep(1);
            }} 
            className={`text-xs px-4.5 py-2 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110 cursor-pointer`}
          >
            Join Registry
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT AREA */}
      <main className="relative z-10 flex-1 text-white flex flex-col items-center justify-center py-8 lg:py-16 overflow-hidden">
        
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT SUBSECTION: Netflix-Style cinematic hook & Active indicators */}
          <div className="lg:col-span-6 space-y-8 text-left" id="overview">
            
            <div className="inline-flex items-center gap-2 bg-purple-950/50 border border-purple-500/30 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-purple-200">
                Rotating Broadcast: {HERO_BACKGROUNDS[bgIndex].category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif italic font-black leading-tight tracking-tight">
              Preserve memories.<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-white bg-clip-text text-transparent not-italic font-black">
                Shared forever online.
              </span>
            </h1>

            <p className="text-sm md:text-base text-purple-200/80 leading-relaxed max-w-xl font-medium">
              We compile digital yearbook chronicles, alumni networking portfolios, live memory feeds, and local campus diaries. Connect with classmates, leave digital yearbook signatures, and trace alumni.
            </p>

            {/* Cinematic Indicators inspired by premium streaming sites */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A78BFA] block">Currently Showcasing</span>
              <div className="grid grid-cols-5 gap-2.5">
                {HERO_BACKGROUNDS.map((bg, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setBgIndex(idx)}
                    className="group relative flex flex-col text-left focus:outline-none cursor-pointer"
                  >
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div 
                        className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${
                          idx === bgIndex ? 'w-full' : 'w-0'
                        }`} 
                      />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block transition-colors truncate ${
                      idx === bgIndex ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {bg.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* FEATURE CARDS (GLASSMORPHISM) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gradient-to-br from-purple-950/40 to-[#0A041A]/50 border border-purple-500/10 backdrop-blur-md p-4 rounded-2xl">
                <span className="font-extrabold text-xs text-purple-200 block">⚡ Instant Reels & Moments</span>
                <span className="text-[10px] text-purple-300/70 mt-1 block leading-normal">
                  Upload daily student memory highlights, campus video stories, and professional photo registers.
                </span>
              </div>
              <div className="bg-gradient-to-br from-purple-950/40 to-[#0A041A]/50 border border-purple-500/10 backdrop-blur-md p-4 rounded-2xl">
                <span className="font-extrabold text-xs text-purple-200 block">✨ Glassmorphism Signatures</span>
                <span className="text-[10px] text-purple-300/70 mt-1 block leading-normal">
                  Sign electronic yearbook files directly with beautiful handwritten styles, images, and graduation wishes.
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT SUBSECTION: Modern Glassmorphic Stepper Form Container */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#11062e]/90 to-[#080217]/95 border border-purple-500/25 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/40 backdrop-blur-xl relative">
              
              {/* Form glowing ambient dot */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              {/* Form header toggles */}
              <div className="bg-gradient-to-r from-purple-950/80 to-[#120926]/90 p-5 md:p-6 text-left border-b border-purple-950/30 flex justify-between items-baseline flex-wrap gap-2 select-none relative z-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif italic font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200">
                    {isLogin ? 'Welcome Back' : 'Join Your Cohort'}
                  </h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-1">
                    {isLogin ? 'Access Academic Yearbooks' : `Establishing Portfolio • Step ${registerStep} of 3`}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setRegisterStep(1);
                    setError('');
                  }}
                  className="text-xs font-black text-pink-400 hover:text-pink-300 underline cursor-pointer"
                >
                  {isLogin ? 'Register Portfolio' : 'Sign in back'}
                </button>
              </div>

              {/* Error Broadcast banner */}
              {error && (
                <div className="m-5 mb-0 p-3.5 bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-2xl text-[11px] font-bold leading-relaxed flex items-start gap-2.5 text-left backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Interactive Form panel */}
              <form onSubmit={handleAuthSubmit} className="p-5 md:p-6 space-y-4 text-left relative z-10">
                
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    
                    /* ==========================================
                                   LOGIN INTERFACE
                       ========================================== */
                    <motion.div
                      key="login-form-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-[#5C6E7E] leading-relaxed font-medium">
                        Enter your credentials below to explore verified classmate grids, write senior updates, upload convocations records, and coordinate chat portfolios.
                      </p>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1.5 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-[#DE7257]" /> Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. m.ahsan@pakyearbook.pk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-sm text-[#1E2E3E] placeholder-[#8E9EAC] rounded-xl px-4 py-3 focus:outline-none focus:border-[#DE7257] focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1.5 flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-[#DE7257]" /> Password Access
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-sm text-[#1E2E3E] placeholder-[#8E9EAC] rounded-xl px-4 py-3 focus:outline-none focus:border-[#DE7257] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                    </motion.div>

                  ) : (
                    
                    /* ==========================================
                                  MULTIPHASE STEPPER SIGNUP
                       ========================================== */
                    <div className="space-y-4">
                      
                      {/* Interactive Visual Progress Stepper Indicators (Yearbook Machine Style) */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 select-none">
                        {[
                          { step: 1, label: 'Account Identity' },
                          { step: 2, label: 'Academic' },
                          { step: 3, label: 'Identity photo' }
                        ].map((s, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex items-center gap-1.5">
                              <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
                                registerStep === s.step
                                  ? 'bg-[#DE7257] text-white border-transparent scale-110 shadow-md shadow-[#DE7257]/20'
                                  : registerStep > s.step
                                    ? 'bg-emerald-500 text-white border-transparent'
                                    : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                              }`}>
                                {registerStep > s.step ? <Check className="h-3 w-3" /> : s.step}
                              </span>
                              <span className={`text-[10px] font-extrabold tracking-tight hidden sm:inline ${
                                registerStep === s.step ? 'text-[#DE7257]' : 'text-[#8E9EAC]'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                            {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${registerStep > idx + 1 ? 'bg-emerald-500' : 'bg-neutral-150'}`} />}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Animated Stepper Panels */}
                      <div className="min-h-[220px]">
                        
                        {/* STEP 1 OF 3: Name, Email, Password */}
                        {registerStep === 1 && (
                          <motion.div
                            key="signUpStep1"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1 flex items-center gap-1.5">
                                <UserIcon className="h-3.5 w-3.5 text-[#DE7257]" /> Full Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Muhmmad Ahsan Qayyum"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#DE7257] focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-[#DE7257]" /> Class Email Address
                              </label>
                              <input
                                type="email"
                                placeholder="e.g. ahsan@uet.edu.pk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#DE7257] focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1 flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 text-[#DE7257]" /> Chosen Secure Password
                              </label>
                              <input
                                type="password"
                                placeholder="Min 4 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#DE7257] focus:bg-white"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 2 OF 3: University, Department, Batch */}
                        {registerStep === 2 && (
                          <motion.div
                            key="signUpStep2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                                <School className="h-3.5 w-3.5 text-pink-500" /> Educational Institute Location
                              </label>
                              
                              <div className="relative">
                                <input
                                  type="text"
                                  list="university-list"
                                  placeholder="Start typing, select or search university..."
                                  value={selectedUni}
                                  onChange={(e) => setSelectedUni(e.target.value)}
                                  className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 font-bold focus:bg-white"
                                />
                                <datalist id="university-list">
                                  {universities.map(uni => (
                                    <option key={uni.id} value={uni.name}>{uni.name}</option>
                                  ))}
                                </datalist>
                              </div>
                              
                              <div className="flex justify-between items-center mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const randUni = PRESET_UNIVERSITIES_LIST[Math.floor(Math.random() * PRESET_UNIVERSITIES_LIST.length)];
                                    setSelectedUni(randUni);
                                  }}
                                  className="text-[10px] text-pink-400 hover:text-pink-300 transition-all flex items-center gap-1 font-extrabold cursor-pointer bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1 rounded-lg border border-pink-500/25 active:scale-95 shadow-sm"
                                >
                                  <span>🎲 Randomly Select University</span>
                                </button>
                                <span className="text-[9px] text-purple-300 italic font-mono uppercase tracking-tight">Type custom name or search list</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5 text-pink-500" /> Department
                                </label>
                                <select
                                  value={selectedDept}
                                  onChange={(e) => setSelectedDept(e.target.value)}
                                  className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-2 py-2.5 focus:outline-none focus:border-pink-500 cursor-pointer font-bold"
                                >
                                  {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300 mb-1">Degree</label>
                                  <select
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-2 py-2.5 focus:outline-none focus:border-pink-500 cursor-pointer font-bold"
                                  >
                                    <option value="Bachelors">BS / BE</option>
                                    <option value="Masters">MS / MBA</option>
                                    <option value="PhD">Doctorate</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300 mb-1">Cohort Batch</label>
                                  <select
                                    value={batch}
                                    onChange={(e) => setBatch(e.target.value)}
                                    className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-2 py-2.5 focus:outline-none focus:border-pink-500 cursor-pointer font-bold"
                                  >
                                    {BATCHES.map(b => (
                                      <option key={b} value={b}>{b}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 3 OF 3: Roll Number, Biography & Photo selections */}
                        {registerStep === 3 && (
                          <motion.div
                            key="signUpStep3"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1 flex items-center gap-1.5">
                                  <Clipboard className="h-3.5 w-3.5 text-[#DE7257]" /> Roll/Enrollment ID
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 2023-F-CS-01"
                                  value={regNo}
                                  onChange={(e) => setRegNo(e.target.value)}
                                  className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#DE7257]"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5C6E7E] mb-1 flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-[#DE7257]" /> Student Bio Label
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Society Lead, Web Slinger"
                                  value={bio}
                                  onChange={(e) => setBio(e.target.value)}
                                  className="w-full bg-[#F3F1ED] border border-[#E8E4E0] text-xs text-[#1E2E3E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#DE7257]"
                                />
                              </div>
                            </div>

                            <div className="bg-[#1C2D3D]/5 border border-dashed border-[#DE7257]/20 p-3 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black tracking-wider text-[#5C6E7E]">Photo Portfolio Selection</span>
                                <button
                                  type="button"
                                  onClick={() => setShowCustomPhoto(!showCustomPhoto)}
                                  className="text-[10px] font-black text-[#DE7257] hover:underline"
                                >
                                  {showCustomPhoto ? 'Presets Selection' : 'Upload File / URL'}
                                </button>
                              </div>

                              {showCustomPhoto ? (
                                <div className="space-y-2 text-left">
                                  <input
                                    type="text"
                                    placeholder="Paste visual image URL directly"
                                    value={customPhotoUrl}
                                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                                    className="w-full bg-white border border-[#E8E4E0] text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-slate-500">OR:</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      className="text-[10px] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[9px] file:font-semibold file:bg-[#DE7257]/10 file:text-[#DE7257]"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2.5 justify-center overflow-x-auto py-1">
                                  {PRESET_AVATARS.map((av) => (
                                    <button
                                      type="button"
                                      key={av}
                                      onClick={() => setPhoto(av)}
                                      className={`relative rounded-lg overflow-hidden h-9 w-9 transition-all shrink-0 cursor-pointer ${
                                        photo === av 
                                          ? 'ring-2 ring-[#DE7257] scale-105 shadow'
                                          : 'opacity-70 hover:opacity-100'
                                      }`}
                                    >
                                      <img src={av} alt="Preset Avatar" className="h-full w-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-2.5 pt-2 border-t border-dashed border-neutral-200">
                                <img
                                  src={showCustomPhoto && customPhotoUrl ? customPhotoUrl : photo}
                                  alt="Preview"
                                  className="w-8 h-8 rounded-full object-cover border border-[#E8E4E0]"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PRESET_AVATARS[0]; }}
                                />
                                <div className="text-left font-sans leading-none">
                                  <span className="text-[9px] font-extrabold text-[#5C6E7E] uppercase block">Selected Frame Preview</span>
                                  <span className="text-[10px] text-neutral-400 mt-0.5 inline-block">Displays under your Class Year registers</span>
                                </div>
                              </div>
                            </div>

                          </motion.div>
                        )}

                      </div>

                    </div>
                  )}
                </AnimatePresence>

                {/* Submit and Navigation triggers */}
                <div className="pt-3 border-t border-neutral-100 flex gap-3">
                  
                  {/* Stepper register BACK command */}
                  {!isLogin && registerStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="border border-[#E8E4E0] hover:bg-neutral-50 text-[#1E2E3E] font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  )}

                  {/* Primary processing command trigger button */}
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      if (!isLogin && registerStep < 3) {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                    className={`flex-1 text-xs font-black uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all text-white cursor-pointer ${
                      !isLogin && registerStep < 3
                        ? 'bg-[#1C2D3D] shadow-slate-900/10'
                        : 'bg-[#DE7257] shadow-[#DE7257]/20 hover:bg-[#C75F46]'
                    }`}
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isLogin ? (
                      <>
                        Sign In <ArrowRight className="h-4 w-4" />
                      </>
                    ) : registerStep < 3 ? (
                      <>
                        Next Step <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Establish Cohort Profile <Check className="h-1.5 w-1.5 font-bold" />
                      </>
                    )}
                  </button>

                </div>

              </form>

              {/* Demo profile login triggers */}
              {isLogin && (
                <div className="bg-[#1C2D3D]/5 border-t border-[#E8E4E0] p-4 text-center space-y-2 select-none">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Or Quick Login with Presets</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => triggerPresetCredentials('student')}
                      className="bg-white hover:bg-neutral-50 border border-neutral-200 font-bold text-[10px] text-[#1C2D3D] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all flex items-center gap-1"
                    >
                      <UserIcon className="h-3 w-3 text-[#DE7257]" /> Student Account (Ali)
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerPresetCredentials('admin')}
                      className="bg-[#1C2D3D] hover:bg-[#2B3E52] font-bold text-[10px] text-white px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 text-yellow-400" /> Executive Admin
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-400 block font-medium">Password: <b>password123</b></span>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* 3. TRUST INTEGRATIONS / INSTITUTES CARDS AREA */}
      <section className="bg-white py-12 px-4 md:px-8 text-center border-t border-[#E8E4E0] select-none text-[#1E2E3E]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] text-[#DE7257] font-black tracking-widest uppercase block">Institutional Network Coverage</span>
            <h2 className="text-xl md:text-2xl font-serif italic text-[#1C2D3D] font-black">Registered Pakistan Campus Registries</h2>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
              We proudly index official student registers, memory archives, and alumni directories from the most reputable academic institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-4 text-left">
            {[
              { code: 'MNS-UET Multan', title: 'Muhammad Nawaz shareef University of engenering and technoology', active: 'New Added' },
              { code: 'NUST Islamabad', title: 'National University of Sciences & Tech (NUST)', active: '1.2k alumni' },
              { code: 'FAST Lahore/Isb', title: 'FAST-NUCES Computer Sciences', active: '1.8k alumni' },
              { code: 'PU Lahore', title: 'Punjab University (University of the Punjab)', active: '2.2k alumni' },
              { code: 'UET Lahore', title: 'University of Engineering and Tech (UET)', active: '800 students' }
            ].map((uni, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${
                uni.active === 'New Added' 
                  ? 'border-[#DE7257]/30 bg-[#DE7257]/5 shadow-sm' 
                  : 'border-[#E8E4E0] bg-[#FDFCF9]'
              }`}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[9px] font-black tracking-wider uppercase ${
                    uni.active === 'New Added' ? 'text-[#DE7257]' : 'text-[#8E9EAC]'
                  }`}>{uni.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    uni.active === 'New Added' ? 'bg-[#DE7257] text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>{uni.active}</span>
                </div>
                <h4 className="text-xs font-serif font-extrabold text-[#1C2D3D] leading-tight line-clamp-2">
                  {uni.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-[#1C2D3D] text-slate-400 py-6 text-center select-none text-[11px] border-t border-slate-800">
        <p>© 2026 Pak-Yearbook. Inspired by professional print editors. Proudly serving Multan, Lahore, Islamabad, and Karachi cohorts.</p>
      </footer>

    </div>
  );
}
