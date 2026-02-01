import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Calendar, Copy, Music, Volume2, VolumeX, Instagram, Send, Gift, MessageCircle, CheckCircle2, ArrowDown } from 'lucide-react';

/**
 * =====================================================================
 * KONFIGURASI DATA & ASSETS
 * =====================================================================
 */

// 1. KONFIGURASI MUSIK
const MUSIC_URL = "src/assets/song.mp3"; 

// 2. KONFIGURASI FOTO BACKGROUND UTAMA (SLIDESHOW HERO & COVER)
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511285560982-1351c4f809b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
];

// 3. KONFIGURASI FOTO GALERI GRID (KOTAK-KOTAK)
// Diset menjadi 5 Foto sesuai permintaan layout (2 Atas, 1 Tengah Besar, 2 Bawah)
const GRID_IMAGES = [
  "src/assets/foto1.jpg", // Atas Kiri
  "src/assets/foto2.jpg", // Atas Kanan
  "src/assets/foto3.jpg", // TENGAH BESAR
  "src/assets/foto4.jpg", // Bawah Kiri
  "src/assets/foto2.jpg", // Bawah Kanan
];

// 4. KONFIGURASI FOTO GALERI SCROLL SAMPING (AUTO SCROLL)
const SCROLL_IMAGES = [
   "src/assets/foto1.jpg",
   "src/assets/foto2.jpg",
   "src/assets/foto3.jpg",
   "src/assets/foto4.jpg",
];

// 5. KONFIGURASI TANGGAL PERNIKAHAN (Format: YYYY-MM-DDTHH:mm:ss)
const WEDDING_DATE = "2026-11-18T08:00:00"; 

/**
 * =====================================================================
 * HELPER FUNCTIONS & HOOKS
 * =====================================================================
 */

const useOnScreen = (ref, threshold = 0.2) => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold]);
  return isIntersecting;
};

const ScrollReveal = ({ children, animation = "fade-up", delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up': return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20';
      case 'fade-in': return isVisible ? 'opacity-100' : 'opacity-0';
      case 'slide-left': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20';
      case 'slide-right': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20';
      case 'zoom-in': return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75';
      case 'flip': return isVisible ? 'opacity-100 rotate-x-0' : 'opacity-0 rotate-x-90';
      default: return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${getAnimationClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- KOMPONEN ANIMASI DAUN JATUH (DIPERBARUI) ---
const FloatingPetals = () => {
  const leaves = Array.from({ length: 15 }); // Jumlah daun
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {leaves.map((_, i) => (
        <img
          key={i}
          src="src/assets/daun2.png" // Menggunakan gambar daun Anda
          alt="falling leaf"
          className="petal absolute opacity-60 object-contain"
          style={{
            top: '-10vh',
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
            // Ukuran random agar variatif (antara 20px - 45px)
            width: `${20 + Math.random() * 25}px`, 
            height: 'auto', 
          }}
        />
      ))}
    </div>
  );
};

const CornerOrnament = ({ className }) => (
  <svg className={`absolute w-16 h-16 md:w-24 md:h-24 text-sky-300 opacity-80 ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5V35C5 51.5685 18.4315 65 35 65H65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 5V25C15 36.0457 23.9543 45 35 45H55" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="5" cy="5" r="3" fill="currentColor"/>
    <circle cx="35" cy="65" r="2" fill="currentColor"/>
    <path d="M5 5L25 25" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
  </svg>
);

/**
 * =====================================================================
 * KOMPONEN UTAMA
 * =====================================================================
 */
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [activeSlide, setActiveSlide] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const [showGift, setShowGift] = useState(false);
  const [isRsvpSubmitted, setIsRsvpSubmitted] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1 Orang', status: 'Hadir', message: '' });
  
  // Data komentar dimulai kosong
  const [comments, setComments] = useState([]); 

  // --- STATE & LOGIC UNTUK AUTO SCROLL ---
  const [isAutoScroll, setIsAutoScroll] = useState(false);

  useEffect(() => {
    let scrollInterval;
    // Jalankan interval jika fitur aktif dan halaman sudah terbuka
    if (isAutoScroll && isOpen) {
      scrollInterval = setInterval(() => {
        // Cek jika sudah mentok bawah
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          setIsAutoScroll(false);
        } else {
          window.scrollBy(0, 1); // Scroll 1px setiap interval
        }
      }, 40); // Kecepatan scroll (semakin besar angka ms, semakin pelan)
    }
    return () => clearInterval(scrollInterval);
  }, [isAutoScroll, isOpen]);

  // Fitur tambahan: Stop auto scroll jika user melakukan interaksi manual (scroll/touch)
  useEffect(() => {
    const stopScroll = () => {
      if (isAutoScroll) setIsAutoScroll(false);
    };

    window.addEventListener("wheel", stopScroll);
    window.addEventListener("touchmove", stopScroll);
    window.addEventListener("keydown", stopScroll);

    return () => {
      window.removeEventListener("wheel", stopScroll);
      window.removeEventListener("touchmove", stopScroll);
      window.removeEventListener("keydown", stopScroll);
    };
  }, [isAutoScroll]);

  // Logic Audio
  useEffect(() => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.play().catch(error => console.log("Audio play failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicPlaying]);

  // Logic Auto Scroll Gallery
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    const scroll = () => {
      if (!isPaused) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  // Countdown Logic
  const calculateTimeLeft = () => {
    const difference = +new Date(WEDDING_DATE) - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) setGuestName(to);

    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(timer);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setMusicPlaying(true);
    // Mulai auto scroll setelah jeda 1 detik agar transisi buka selesai dulu
    setTimeout(() => {
        setIsAutoScroll(true);
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Nomor rekening ${text} berhasil disalin!`);
  };

  const handleRsvpChange = (e) => {
    setRsvpForm({ ...rsvpForm, [e.target.name]: e.target.value });
  };

  const submitRsvp = (e) => {
    e.preventDefault();
    if (!rsvpForm.name || !rsvpForm.message) {
      alert("Mohon lengkapi nama dan ucapan Anda.");
      return;
    }
    const newComment = {
      name: rsvpForm.name,
      message: rsvpForm.message,
      time: "Baru saja",
      color: "bg-sky-500"
    };
    setComments([newComment, ...comments]);
    setIsRsvpSubmitted(true);
  };

  // --- STYLE BLOCK ---
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    
    .font-cursive { font-family: 'Great Vibes', cursive; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-montserrat { font-family: 'Montserrat', sans-serif; }
    
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    @keyframes fall {
      0% { transform: translateY(0vh) translateX(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(110vh) translateX(20px) rotate(360deg); opacity: 0; }
    }
    
    .petal { 
      animation-name: fall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    
    @keyframes zoomInOut {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .animate-ken-burns {
      animation: zoomInOut 20s infinite ease-in-out;
    }
  `;

  // --- HALAMAN COVER / DEPAN ---
  if (!isOpen) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center font-sans text-slate-800">
        <style>{globalStyles}</style>

        {/* MENGGUNAKAN HERO_IMAGES UNTUK BACKGROUND */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center animate-ken-burns"
            style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-white/10 to-slate-900/60 backdrop-blur-[2px]"></div>
          
          {/* ANIMASI DAUN DI COVER */}
          <FloatingPetals />
        </div>

        <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up flex flex-col items-center">
          <div className="text-center mb-8 drop-shadow-md">
            <p className="text-white/90 text-sm md:text-base tracking-[0.4em] uppercase font-montserrat mb-2">The Wedding Of</p>
            <div className="h-0.5 w-12 bg-sky-200 mx-auto opacity-70"></div>
          </div>

          <div className="relative w-full bg-white/70 backdrop-blur-md rounded-[40px] shadow-2xl overflow-hidden border border-white/60 p-2 md:p-3">
            <CornerOrnament className="top-4 left-4" />
            <CornerOrnament className="bottom-4 right-4 rotate-180" />

            <div className="border border-sky-600/20 rounded-[32px] p-8 md:p-12 text-center h-full flex flex-col justify-center items-center relative z-10">
              <div className="mb-8">
                <h1 className="font-serif text-5xl md:text-6xl text-slate-800 leading-tight">Dicky</h1>
                <span className="font-cursive text-sky-500 text-5xl md:text-6xl my-1 block">&</span>
                <h1 className="font-serif text-5xl md:text-6xl text-slate-800 leading-tight">Delly</h1>
              </div>

              <div className="w-full">
                <div className="border-t border-slate-300/50 w-full mb-4"></div>
                <p className="text-xs text-slate-500 font-montserrat uppercase tracking-widest mb-3">Undangan Spesial Untuk:</p>
                <div className="bg-sky-50/50 rounded-xl py-3 px-4 mb-8 border border-sky-100">
                  <h3 className="font-serif text-2xl font-bold text-slate-800 truncate px-2">{guestName}</h3>
                </div>

                <button 
                  onClick={handleOpen}
                  className="group relative w-full py-4 bg-slate-800 hover:bg-sky-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-300/50 flex items-center justify-center gap-2 overflow-hidden font-montserrat font-medium text-sm tracking-wide"
                >
                  <span className="relative z-10">BUKA UNDANGAN</span>
                  <Heart className="w-4 h-4 fill-current relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-white/80 font-serif italic text-sm drop-shadow-md">01 November 2026</p>
        </div>
      </div>
    );
  }

  // --- HALAMAN ISI UNDANGAN ---
  return (
    <div className="relative min-h-screen bg-[#F0F8FF] text-slate-700 font-sans overflow-x-hidden">
      <style>{globalStyles}</style>

      {/* AUDIO ELEMENT HIDDEN */}
      <audio ref={audioRef} src={MUSIC_URL} loop />

      {/* ANIMASI DAUN DI ISI UNDANGAN */}
      <FloatingPetals />

      {/* TOMBOL AUTO SCROLL */}
      <button 
        onClick={() => setIsAutoScroll(!isAutoScroll)}
        className="fixed bottom-20 right-6 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg border border-sky-100 text-sky-600 hover:bg-sky-50 transition-colors"
        title="Auto Scroll"
      >
        <ArrowDown className={`w-5 h-5 ${isAutoScroll ? 'animate-bounce text-sky-500' : 'text-slate-400'}`} />
      </button>

      {/* TOMBOL MUSIK */}
      <button 
        onClick={() => setMusicPlaying(!musicPlaying)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg border border-sky-100 text-sky-600 hover:bg-sky-50 transition-colors animate-pulse-slow"
      >
        {musicPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* ================================================================= */}
      {/* SECTION 1: HERO / PEMBUKA */}
      {/* ================================================================= */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 pt-20 bg-[url('src/assets/love.png'),url('src/assets/happy.jpg')] bg-cover bg-center bg-white/40 bg-blend-lighten">
         <ScrollReveal animation="fade-up">
            <p className="text-sky-600 tracking-[0.3em] uppercase text-xs font-semibold mb-6">The Wedding Of</p>
            <div className="relative inline-block">
               <h1 className="font-serif text-5xl md:text-8xl text-slate-800 mb-2 relative z-10">
                 Dicky <span className="font-cursive text-sky-500 text-6xl md:text-9xl mx-2">&</span> Delly
               </h1>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-sky-200 rounded-full opacity-50"></div>
            </div>
            <p className="font-montserrat font-light text-slate-900 mt-8 text-lg tracking-wide">Minggu, 18 November 2026</p>
         </ScrollReveal>
         
         <div className="absolute bottom-10 -translate-x-1/2 animate-bounce text-sky-400 flex flex-col items-center gap-2">
           <span className="text-[15px] tracking-widest touppercase">Scroll Down</span>
           <div className="w-0.5 h-8 bg-gradient-to-b from-sky-400 to-transparent"></div>
         </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 2: GALERI FOTO */}
      {/* ================================================================= */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Layer 0: Background Slideshow (Menggunakan HERO_IMAGES agar senada dengan cover) */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${
                idx === activeSlide ? 'opacity-30 blur-sm' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="absolute inset-0 bg-white/80"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
           {/* JUDUL GALERI */}
           <ScrollReveal animation="fade-up">
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl text-slate-800 mb-3">Momen Bahagia</h2>
                <p className="font-cursive text-2xl text-sky-500">Galeri Prewedding</p>
              </div>
           </ScrollReveal>

           {/* --- SUB-SECTION 2.1: GALERI GRID (5 FOTO: 2 Atas, 1 Tengah Besar, 2 Bawah) --- */}
           <div className="grid grid-cols-2 gap-4 md:gap-6 mb-16">
             {GRID_IMAGES.map((img, idx) => {
               const isLarge = idx === 2; // Index ke-2 (foto ke-3) jadi besar di tengah
               
               return (
                 <ScrollReveal 
                    key={idx} 
                    delay={idx * 150} 
                    animation="fade-up"
                    className={isLarge ? "col-span-2" : "col-span-1"}
                 >
                   <div className={`relative overflow-hidden rounded-xl shadow-lg border-[6px] border-white group cursor-pointer ${
                     isLarge ? 'aspect-video md:aspect-[2/1]' : 'aspect-[3/4]'
                   }`}>
                     <img 
                        src={img} 
                        alt="Prewedding" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                   </div>
                 </ScrollReveal>
               );
             })}
           </div>
           
           {/* --- SUB-SECTION 2.2: GALERI SCROLL HORIZONTAL (GESER SAMPING) --- */}
           {/* Edit foto di variabel SCROLL_IMAGES di atas */}
           <ScrollReveal animation="fade-up" delay={200}>
              <div className="relative">
                <h3 className="text-center font-montserrat text-sm tracking-widest uppercase text-slate-500 mb-6">Our Journey</h3>
                
                <div 
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-2 select-none"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  {/* Duplikasi array untuk efek looping */}
                  {[...SCROLL_IMAGES, ...SCROLL_IMAGES, ...SCROLL_IMAGES].map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 relative w-64 md:w-80 aspect-[4/3] rounded-lg overflow-hidden shadow-md group">
                      <img 
                        src={img} 
                        alt={`Moment ${idx}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable="false" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                         <p className="text-white text-xs font-montserrat">Sweet Moment</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-4 text-xs text-sky-400 italic flex items-center justify-center gap-1 opacity-70">
                   <span>&larr;</span> Geser untuk melihat lebih banyak <span>&rarr;</span>
                </div>
              </div>
           </ScrollReveal>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 3: SALAM & QUOTES */}
      {/* ================================================================= */}
      <section className="py-24 px-6 max-w-3xl mx-auto text-center relative">
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-sky-200 opacity-50 rounded-tl-3xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-sky-200 opacity-50 rounded-br-3xl"></div>

        <ScrollReveal animation="zoom-in">
          <img src="src/assets/bismillah.png" alt="Bismillah" className="mx-auto mb-8 w-24 opacity-80" />
          <p className="font-serif italic text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
          </p>
          <div className="inline-block px-6 py-2 border border-sky-200 rounded-full">
             <p className="font-montserrat font-semibold text-sky-600 text-xs tracking-widest uppercase">(QS. Ar-Rum: 21)</p>
          </div>
        </ScrollReveal>
      </section>

      {/* ================================================================= */}
      {/* SECTION 4: PROFIL MEMPELAI */}
      {/* ================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#F0F8FF] to-white relative overflow-hidden">
        <div className="absolute -left-20 top-20 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -right-20 bottom-20 w-72 h-72 bg-pink-50 rounded-full blur-3xl opacity-40"></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
            
            <ScrollReveal animation="slide-left" className="w-full md:w-5/12 text-center md:text-right group">
              <div className="flex flex-col items-center md:items-end">
                <div className="w-56 h-56 rounded-full border-2 border-dashed border-sky-300 p-2 mb-6 relative">
                   <div className="absolute inset-0 rounded-full animate-spin-slow opacity-20 border-t-2 border-sky-500"></div>
                   <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Groom" className="w-full h-full object-cover rounded-full shadow-xl" />
                </div>
                <h3 className="font-serif text-4xl font-bold text-slate-800 mb-2">Dicky</h3>
                <p className="text-sky-600 font-medium font-montserrat tracking-wide text-sm mb-4 uppercase">Putra Kedua</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-4"></div>
                <p className="text-slate-500 text-sm mb-1">Putra dari Pasangan</p>
                <p className="text-slate-700 font-semibold mb-4">Bpk. Hendra & Ibu Susi</p>
                <a href="#" className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-500 transition-colors text-sm border border-slate-200 px-4 py-2 rounded-full hover:border-sky-300 hover:bg-sky-50">
                  <Instagram size={16} /> @rizky_pratama
                </a>
              </div>
            </ScrollReveal>

            <div className="hidden md:flex flex-col items-center justify-center h-64 gap-2 opacity-30">
               <div className="w-px h-full bg-slate-400"></div>
               <Heart size={20} className="text-slate-400" />
               <div className="w-px h-full bg-slate-400"></div>
            </div>

            <ScrollReveal animation="slide-right" className="w-full md:w-5/12 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-56 h-56 rounded-full border-2 border-dashed border-pink-300 p-2 mb-6 relative">
                   <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Bride" className="w-full h-full object-cover rounded-full shadow-xl" />
                </div>
                <h3 className="font-serif text-4xl font-bold text-slate-800 mb-2">Delly</h3>
                <p className="text-sky-600 font-medium font-montserrat tracking-wide text-sm mb-4 uppercase">Putri Pertama</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-4"></div>
                <p className="text-slate-500 text-sm mb-1">Putri dari Pasangan</p>
                <p className="text-slate-700 font-semibold mb-4">Bpk. Budi & Ibu Rina</p>
                <a href="#" className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-500 transition-colors text-sm border border-slate-200 px-4 py-2 rounded-full hover:border-sky-300 hover:bg-sky-50">
                  <Instagram size={16} /> @aulia_zahra
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 5: INFO ACARA & LOKASI */}
      {/* ================================================================= */}
      <section className="py-24 px-4 bg-sky-50/50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-center font-serif text-4xl mb-16 text-slate-800">Rangkaian Acara</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mb-20 relative">
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full z-20 border-4 text-center border-sky-100 flex items-center justify-center text-sky-300 text-xl font-bold">&</div>

            <ScrollReveal animation="slide-left" delay={100}>
              <div className="bg-white p-10 rounded-[30px] shadow-sm border border-sky-100 h-full text-center hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-300 to-sky-500"></div>
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600 rotate-45 group-hover:rotate-0 transition-transform duration-500">
                  <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">
                     <Heart className="w-8 h-8 fill-current" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">Akad Nikah</h3>
                <p className="text-sky-500 font-medium mb-6 uppercase tracking-widest text-xs">Minggu, 20 Oktober 2024</p>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={18} className="text-sky-400" />
                    <p>08:00 WIB - Selesai</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin size={18} className="text-sky-400" />
                    <div>
                        <p className="font-bold text-slate-800">Masjid Agung Al-Azhar</p>
                        <p className="text-sm">Jl. Sisingamangaraja, Jakarta Selatan</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-right" delay={300}>
              <div className="bg-white p-10 rounded-[30px] shadow-sm border border-sky-100 h-full text-center hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-400 to-slate-600"></div>
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600 rotate-45 group-hover:rotate-0 transition-transform duration-500">
                  <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500">
                    <Music className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">Resepsi</h3>
                <p className="text-slate-500 font-medium mb-6 uppercase tracking-widest text-xs">Minggu, 20 Oktober 2024</p>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <p>11:00 WIB - 14:00 WIB</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin size={18} className="text-slate-400" />
                    <div>
                        <p className="font-bold text-slate-800">Ballroom Hotel Mulia</p>
                        <p className="text-sm">Jl. Asia Afrika, Senayan, Jakarta</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="zoom-in">
            <div className="bg-slate-800 rounded-[40px] p-8 md:p-12 text-white text-center shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               
               {/* Content Container */}
               <div className="relative z-10">
                 <h4 className="font-serif text-2xl mb-8">Menuju Hari Bahagia</h4>
                 <div className="flex justify-center gap-4 md:gap-8 mb-10">
                   {Object.entries(timeLeft).map(([unit, value]) => (
                     <div key={unit} className="flex flex-col items-center">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg mb-2">
                         {value}
                       </div>
                       <span className="text-xs uppercase tracking-widest text-sky-200">{unit}</span>
                     </div>
                   ))}
                 </div>

                 {/* --- GOOGLE MAPS EMBED --- */}
                 <div className="w-full max-w-2xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-lg border-4 border-white/20 bg-slate-700">
                    {/* Menggunakan aspect-video agar responsif (16:9) */}
                    <div className="relative aspect-video w-full">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d494.1104952859346!2d111.4589309422842!3d-7.802107776748101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7999d12c016b45%3A0x8c396fb868608bd2!2sUD.%20Alfina!5e0!3m2!1sid!2skr!4v1769920194354!5m2!1sid!2skr" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                        title="Lokasi Pernikahan"
                      ></iframe>
                    </div>
                 </div>

                 {/* --- TOMBOL BUKA MAPS (LINK) --- */}
                 {/* Saya ubah jadi <a> tag agar bisa diklik untuk navigasi */}
                 <a 
                   href="https://goo.gl/maps/kjsdhfksjdf" // Ganti dengan Link Google Maps Lokasi Anda yang asli
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-sky-400/50 transition-all items-center justify-center gap-2 mx-auto font-montserrat font-semibold tracking-wide cursor-pointer"
                 >
                   <MapPin size={18} />
                   BUKA GOOGLE MAPS APP
                 </a>
               </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 6: GIFT & AMPLOP DIGITAL */}
      {/* ================================================================= */}
      <section className="py-24 px-4 bg-white transition-all duration-500">
        <div className="max-w-xl mx-auto text-center">
          <ScrollReveal animation="fade-up">
            <h2 className="font-serif text-4xl mb-4 text-slate-800">Tanda Kasih</h2>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-sm mx-auto">
              Tanpa mengurangi rasa hormat, bagi Anda yang ingin memberikan tanda kasih, kami menyediakan fitur amplop digital.
            </p>
          </ScrollReveal>
          
          {!showGift ? (
            <ScrollReveal animation="zoom-in" delay={100}>
              <button 
                onClick={() => setShowGift(true)}
                className="group bg-sky-500 hover:bg-sky-600 text-white px-10 py-4 rounded-full shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all flex items-center justify-center gap-3 mx-auto font-montserrat font-semibold tracking-wide"
              >
                <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Kirim Hadiah</span>
              </button>
            </ScrollReveal>
          ) : (
            <div className="animate-fade-in-up">
              <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 md:p-10 text-white shadow-2xl overflow-hidden mx-auto transition-transform hover:scale-[1.02] duration-300 group bg-slate-900 mb-8 cursor-pointer border border-sky-400/20">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-sky-700 to-slate-800 opacity-90"></div>
                <div className="absolute -right-20 -top-20 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10 flex flex-col justify-between h-full text-left">
                  <div className="flex justify-between items-start">
                     <div className="font-serif italic text-2xl">Bank BCA</div>
                     <div className="w-14 h-9 bg-yellow-400/80 rounded flex items-center justify-center relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                        <div className="w-8 h-5 border border-black/20 rounded-sm"></div>
                     </div>
                  </div>

                  <div className="my-auto pt-4">
                     <p className="font-mono text-2xl md:text-4xl tracking-widest drop-shadow-lg mb-2">
                       1234 5678 9000
                     </p>
                     <p className="text-xs uppercase tracking-[0.2em] opacity-70">Rizky Pratama</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 items-center animate-fade-in">
                <button 
                  onClick={() => copyToClipboard("123456789000")}
                  className="flex items-center gap-2 text-slate-700 hover:text-sky-600 font-medium transition-colors border-b border-slate-300 hover:border-sky-300 pb-1"
                >
                  <Copy size={16} /> Salin Nomor Rekening
                </button>
                <button 
                  onClick={() => setShowGift(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Tutup Tanda Kasih
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 7: RSVP & LIVE CHAT (WISHBOARD) */}
      {/* ================================================================= */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
         <div className="max-w-3xl mx-auto">
            <ScrollReveal animation="fade-up">
              
              {!isRsvpSubmitted ? (
                <div className="bg-white p-8 md:p-10 rounded-[30px] shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50"></div>
                  
                  <h2 className="text-center font-serif text-3xl mb-2 text-slate-800 relative z-10">Konfirmasi Kehadiran</h2>
                  <p className="text-center text-slate-500 text-sm mb-10 relative z-10">Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan acara.</p>

                  <form className="space-y-6 relative z-10" onSubmit={submitRsvp}>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                       <input 
                          type="text" 
                          name="name"
                          value={rsvpForm.name}
                          onChange={handleRsvpChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-slate-50 transition-all" 
                          placeholder="Masukkan nama Anda" 
                          required
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Jumlah Tamu</label>
                          <select 
                            name="guests"
                            value={rsvpForm.guests}
                            onChange={handleRsvpChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-slate-50 transition-all"
                          >
                            <option>1 Orang</option>
                            <option>2 Orang</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kehadiran</label>
                          <select 
                            name="status"
                            value={rsvpForm.status}
                            onChange={handleRsvpChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-slate-50 transition-all"
                          >
                            <option>Hadir</option>
                            <option>Tidak Bisa</option>
                          </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ucapan & Doa</label>
                        <textarea 
                          name="message"
                          value={rsvpForm.message}
                          onChange={handleRsvpChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-slate-50 h-32 transition-all resize-none" 
                          placeholder="Tuliskan doa terbaik untuk kami..."
                          required
                        ></textarea>
                     </div>
                     <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-sky-300/50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
                       <Send size={18} /> Kirim Konfirmasi
                     </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-8 md:p-10 rounded-[30px] shadow-xl border border-slate-100 animate-zoom-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-green-500 w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl text-slate-800">Terima Kasih!</h3>
                    <p className="text-slate-500 text-sm">Konfirmasi dan ucapan Anda telah kami terima.</p>
                  </div>

                  <div className="border-t border-slate-100 pt-8">
                     <div className="flex items-center gap-3 mb-6">
                       <MessageCircle className="text-sky-500 w-6 h-6" />
                       <h3 className="font-serif text-xl text-slate-800">Live Wishes</h3>
                       <span className="bg-sky-100 text-sky-600 text-[10px] font-bold px-2 py-1 rounded-full">{comments.length} Ucapan</span>
                     </div>

                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.map((comment, idx) => (
                           <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in-up">
                              <div className={`w-10 h-10 ${comment.color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                                {comment.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                 <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{comment.name}</h4>
                                    <span className="text-[10px] text-slate-400">{comment.time}</span>
                                 </div>
                                 <p className="text-slate-600 text-sm leading-relaxed">"{comment.message}"</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

            </ScrollReveal>
         </div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER */}
      {/* ================================================================= */}
      <footer className="py-16 bg-slate-900 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
         <ScrollReveal animation="fade-in">
           <h2 className="font-cursive text-5xl text-sky-400 mb-8 relative z-10">Dicky & Delly</h2>
           <p className="text-slate-500 text-xs tracking-[0.2em] uppercase relative z-10">Terima Kasih Atas Doa & Restu Anda</p>
           
           <div className="mt-12 opacity-50 text-[10px] tracking-widest">
             <p>DESIGNED BY MAZ_R</p>
           </div>
         </ScrollReveal>
      </footer>
    </div>
  );
}