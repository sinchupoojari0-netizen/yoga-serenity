import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";

/* ─────────────────────────────────────────
   GLOBAL CSS INJECTION
───────────────────────────────────────── */
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html {
        scroll-behavior: smooth;
        overflow-x: hidden;
        overflow-y: scroll;
        height: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      body {
        font-family: 'Palatino Linotype', Georgia, serif;
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        will-change: scroll-position;
      }
      #root {
        width: 100%;
        min-height: 100%;
        overflow-x: hidden;
      }
      img { max-width: 100%; display: block; }
      .desktop-nav { display: flex; }
      @media (max-width: 900px) { .desktop-nav { display: none !important; } }
      @keyframes float { 0%,100%{transform:translateY(-10px)} 50%{transform:translateY(10px)} }
      @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      @keyframes liveRingRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes liveRadialPulse { 0%,100%{transform:scale(1);opacity:0.45;} 50%{transform:scale(1.22);opacity:0;} }
      @keyframes orbGlowPulse {
        0%,100%{ box-shadow: 0 0 28px rgba(139,92,246,0.55), 0 0 56px rgba(219,39,119,0.22), inset 0 0 18px rgba(255,255,255,0.12); }
        50%{ box-shadow: 0 0 52px rgba(139,92,246,0.85), 0 0 96px rgba(219,39,119,0.45), inset 0 0 28px rgba(255,255,255,0.22); }
      }
      @keyframes orbAuraSpin {
        0%{ transform: rotate(0deg) scale(1); }
        50%{ transform: rotate(180deg) scale(1.06); }
        100%{ transform: rotate(360deg) scale(1); }
      }
      @keyframes neonRingBooking {
        0%,100%{ opacity:0.6; transform:scale(1); }
        50%{ opacity:1; transform:scale(1.04); }
      }
      @keyframes bookingSuccessRipple {
        0%{ transform:scale(0.6); opacity:0.8; }
        100%{ transform:scale(2.2); opacity:0; }
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #3A7D7C; border-radius: 3px; }
      * { -webkit-tap-highlight-color: transparent; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ─────────────────────────────────────────
   THEME
───────────────────────────────────────── */
const LIGHT = {
  bg: "#F5F5F0", primary: "#7A9E7E", secondary: "#A3C4BC", accent: "#CDB4DB",
  text: "#2C2C2C", textMuted: "#6B6B6B", card: "#FFFFFF", border: "#E8E8E0",
  glass: "rgba(245,245,240,0.85)",
};
const DARK = {
  bg: "#0A1628", primary: "#3A7D7C", secondary: "#84A59D", accent: "#B8C0FF",
  text: "#EDF2F4", textMuted: "#9EADA8", card: "#0F1E30", border: "#1E3A4A",
  glass: "rgba(10,22,40,0.92)",
};

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const HERO_IMAGES = [
  { url: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1600&q=80", tagline: "Begin Your Journey Within", sub: "Discover the transformative power of authentic yoga practice" },
  { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80", tagline: "Breathe. Move. Heal.", sub: "Ancient wisdom meeting modern wellness science" },
  { url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1600&q=80", tagline: "Find Your Stillness", sub: "A sanctuary for mind, body and soul" },
  { url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&q=80", tagline: "Strength Through Practice", sub: "Build resilience from the inside out" },
];

const CLASSES = [
  { id: 1, name: "Hatha Yoga", type: "Hatha", description: "A classical approach focusing on physical postures and breathing techniques. Perfect for building a strong foundation and developing body awareness through mindful, deliberate movement.", benefits: ["Improved flexibility", "Better posture", "Stress relief", "Muscle toning"], difficulty: "Beginner", duration: "60 mins", instructor: "Anjali Sharma", image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80", color: "#7A9E7E" },
  { id: 2, name: "Vinyasa Flow", type: "Vinyasa", description: "A dynamic, flowing practice that links breath to movement. Each class is uniquely sequenced, building heat and strength while improving cardiovascular endurance.", benefits: ["Increased stamina", "Muscle strength", "Cardiovascular health", "Mental clarity"], difficulty: "Intermediate", duration: "75 mins", instructor: "Rahul Verma", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", color: "#A3C4BC" },
  { id: 3, name: "Yin Yoga", type: "Yin", description: "A slow-paced style targeting the connective tissues — fascia, ligaments, and joints. Long-held poses promote deep relaxation and flexibility at the cellular level.", benefits: ["Deep flexibility", "Joint health", "Deep relaxation", "Emotional release"], difficulty: "Beginner", duration: "75 mins", instructor: "Meera Iyer", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80", color: "#CDB4DB" },
  { id: 4, name: "Meditation", type: "Meditation", description: "Guided mindfulness sessions that train focused attention and open awareness. Techniques include breath observation, body scanning, loving-kindness, and visualization.", benefits: ["Reduced anxiety", "Better focus", "Emotional balance", "Improved sleep"], difficulty: "All Levels", duration: "45 mins", instructor: "Anjali Sharma", image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&q=80", color: "#B8C0FF" },
  { id: 5, name: "Power Yoga", type: "Vinyasa", description: "An intense, fitness-based approach to yoga. This vigorous class builds strength, flexibility, and mental focus while burning calories and developing lean muscle.", benefits: ["Fat burning", "Core strength", "Endurance", "Mental toughness"], difficulty: "Advanced", duration: "60 mins", instructor: "Rahul Verma", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80", color: "#3A7D7C" },
  { id: 6, name: "Restorative Yoga", type: "Yin", description: "A gentle, therapeutic practice using props to support the body in passive poses for extended periods. Perfect for recovery, injury rehabilitation, and stress management.", benefits: ["Deep rest", "Nervous system reset", "Injury recovery", "Chronic pain relief"], difficulty: "Beginner", duration: "90 mins", instructor: "Meera Iyer", image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80", color: "#84A59D" },
  { id: 7, name: "Pranayama", type: "Breathwork", description: "The ancient science of breath control. These sessions explore various breathing techniques to energize, calm, and balance the nervous system, unlocking the body's vital life force.", benefits: ["Lung capacity", "Nervous balance", "Energy boost", "Mental clarity"], difficulty: "All Levels", duration: "50 mins", instructor: "Anjali Sharma", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80", color: "#F4A261" },
  { id: 8, name: "Advanced Yoga", type: "Hatha", description: "For experienced practitioners ready to explore arm balances, inversions, and advanced backbends. A technically demanding class that refines existing skills and unlocks new possibilities.", benefits: ["Advanced postures", "Inversions", "Core mastery", "Body awareness"], difficulty: "Advanced", duration: "90 mins", instructor: "Rahul Verma", image: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=600&q=80", color: "#E76F51" },
];

const SCHEDULE = [
  { day: "Monday", time: "6:00 AM", class: "Hatha Yoga", instructor: "Anjali Sharma", duration: "60 min", spots: 8 },
  { day: "Monday", time: "9:00 AM", class: "Restorative Yoga", instructor: "Meera Iyer", duration: "90 min", spots: 12 },
  { day: "Monday", time: "7:00 PM", class: "Meditation", instructor: "Anjali Sharma", duration: "45 min", spots: 15 },
  { day: "Tuesday", time: "6:00 AM", class: "Vinyasa Flow", instructor: "Rahul Verma", duration: "75 min", spots: 6 },
  { day: "Tuesday", time: "10:00 AM", class: "Hatha Yoga", instructor: "Anjali Sharma", duration: "60 min", spots: 10 },
  { day: "Tuesday", time: "6:30 PM", class: "Power Yoga", instructor: "Rahul Verma", duration: "60 min", spots: 3 },
  { day: "Wednesday", time: "7:00 AM", class: "Yin Yoga", instructor: "Meera Iyer", duration: "75 min", spots: 9 },
  { day: "Wednesday", time: "12:00 PM", class: "Pranayama", instructor: "Anjali Sharma", duration: "50 min", spots: 14 },
  { day: "Wednesday", time: "6:00 PM", class: "Vinyasa Flow", instructor: "Rahul Verma", duration: "75 min", spots: 7 },
  { day: "Thursday", time: "6:00 AM", class: "Hatha Yoga", instructor: "Anjali Sharma", duration: "60 min", spots: 11 },
  { day: "Thursday", time: "8:00 AM", class: "Advanced Yoga", instructor: "Rahul Verma", duration: "90 min", spots: 5 },
  { day: "Thursday", time: "8:00 PM", class: "Meditation", instructor: "Anjali Sharma", duration: "45 min", spots: 14 },
  { day: "Friday", time: "6:00 AM", class: "Power Yoga", instructor: "Rahul Verma", duration: "60 min", spots: 5 },
  { day: "Friday", time: "10:00 AM", class: "Yin Yoga", instructor: "Meera Iyer", duration: "75 min", spots: 8 },
  { day: "Friday", time: "7:00 PM", class: "Restorative Yoga", instructor: "Meera Iyer", duration: "90 min", spots: 12 },
  { day: "Saturday", time: "8:00 AM", class: "Vinyasa Flow", instructor: "Rahul Verma", duration: "75 min", spots: 4 },
  { day: "Saturday", time: "10:00 AM", class: "Hatha Yoga", instructor: "Anjali Sharma", duration: "60 min", spots: 9 },
  { day: "Saturday", time: "4:00 PM", class: "Pranayama", instructor: "Anjali Sharma", duration: "50 min", spots: 11 },
  { day: "Sunday", time: "9:00 AM", class: "Yin Yoga", instructor: "Meera Iyer", duration: "75 min", spots: 10 },
  { day: "Sunday", time: "11:00 AM", class: "Meditation", instructor: "Anjali Sharma", duration: "45 min", spots: 16 },
  { day: "Sunday", time: "5:00 PM", class: "Advanced Yoga", instructor: "Rahul Verma", duration: "90 min", spots: 6 },
];

const INSTRUCTORS = [
  { id: 1, name: "Anjali Sharma", title: "Senior Yoga Instructor & Meditation Guide", experience: "12 years", specialties: ["Hatha Yoga", "Meditation", "Pranayama", "Yoga Nidra"], image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80", bio: "Anjali began her yoga journey in Rishikesh at 18, studying under revered masters at the Parmarth Niketan Ashram. After earning her 500-hour RYT certification, she spent three years teaching across Southeast Asia. Her classes blend ancient Vedic wisdom with modern anatomical understanding.", certifications: ["500-Hour RYT (Yoga Alliance)", "Yin Yoga Teacher Training", "MBSR Certified"], classes: ["Hatha Yoga", "Meditation", "Restorative Yoga"], quote: "Yoga is not about touching your toes. It's about what you learn on the way down.", instagram: "@anjali_asana" },
  { id: 2, name: "Rahul Verma", title: "Vinyasa & Power Yoga Expert", experience: "9 years", specialties: ["Vinyasa Flow", "Power Yoga", "Ashtanga", "Athletic Performance"], image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", bio: "A former national-level swimmer who discovered yoga as a recovery tool and never looked back. Trained in Mysore, mastering the Ashtanga system before developing his signature high-energy Vinyasa style. Led workshops in Dubai, Singapore, and London.", certifications: ["200-Hour RYT (Yoga Alliance)", "Ashtanga Primary Series", "Sports Yoga Specialist"], classes: ["Vinyasa Flow", "Power Yoga", "Advanced Yoga"], quote: "Your breath is your anchor. Let it guide every movement.", instagram: "@rahul_flow" },
  { id: 3, name: "Meera Iyer", title: "Yin Yoga & Restorative Specialist", experience: "8 years", specialties: ["Yin Yoga", "Restorative Yoga", "Thai Yoga Massage", "Yoga Therapy"], image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80", bio: "Rooted in the therapeutic tradition, Meera has a background in physiotherapy and specializes in healing-oriented practices. Trained in Yin Yoga under Paul Grilley and Bernie Clark, her classes are deeply informed by TCM meridian theory.", certifications: ["500-Hour RYT (Yoga Alliance)", "Yin Yoga (Paul Grilley)", "C-IAYT Certified"], classes: ["Yin Yoga", "Restorative Yoga"], quote: "In stillness, we find what movement can never reach.", instagram: "@meera_yin" },
  { id: 4, name: "Priya Menon", title: "Ashtanga & Breathwork Specialist", experience: "7 years", specialties: ["Ashtanga", "Pranayama", "Breathwork", "Pre-natal Yoga"], image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", bio: "Priya trained at the KPJ Ashtanga Yoga Institute in Mysore and later studied pranayama under traditional Vedic teachers in Pune. She is passionate about breath as medicine and brings a deeply compassionate, grounded energy to every class.", certifications: ["300-Hour Ashtanga Certification", "Prenatal Yoga RYT", "Pranayama Advanced"], classes: ["Pranayama", "Ashtanga"], quote: "The breath is a bridge between the conscious and unconscious mind.", instagram: "@priya_prana" },
  { id: 5, name: "Aryan Kapoor", title: "Advanced Yoga & Alignment Expert", experience: "10 years", specialties: ["Iyengar Method", "Advanced Poses", "Anatomy", "Therapeutic Yoga"], image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80", bio: "Trained in the precision-focused Iyengar tradition, Aryan brings exceptional anatomical knowledge to each class. He has worked with professional athletes and rehabilitation centers, helping practitioners safely explore advanced postures.", certifications: ["Iyengar Yoga Certification (Level 2)", "500-Hour RYT", "Yoga Anatomy Specialist"], classes: ["Advanced Yoga", "Hatha Yoga"], quote: "Precision in practice creates freedom in life.", instagram: "@aryan_align" },
  { id: 6, name: "Lakshmi Nair", title: "Kundalini & Spiritual Yoga Teacher", experience: "15 years", specialties: ["Kundalini Yoga", "Mantra Chanting", "Sound Healing", "Chakra Balancing"], image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", bio: "Lakshmi spent 5 years studying Kundalini Yoga with Yogi Bhajan's lineage in Amritsar. She combines ancient Tantric knowledge with accessible modern teaching, creating transformational experiences through mantra, movement, and meditation.", certifications: ["Kundalini Yoga Level 2", "Sound Healing Practitioner", "Reiki Master Level 3"], classes: ["Meditation", "Kundalini"], quote: "When you tune into your inner light, every shadow dissolves.", instagram: "@lakshmi_kundalini" },
  { id: 7, name: "Vikram Das", title: "Power Yoga & Functional Fitness Coach", experience: "6 years", specialties: ["Power Yoga", "Core Training", "HIIT Yoga", "Sports Recovery"], image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", bio: "A certified fitness coach turned yoga teacher, Vikram blends functional movement science with yoga philosophy. His Power Yoga classes are legendary for their intensity and the results students achieve in remarkably short time.", certifications: ["200-Hour RYT", "NASM Certified Trainer", "FRC Mobility Specialist"], classes: ["Power Yoga", "Vinyasa Flow"], quote: "Your body is capable of more than your mind believes.", instagram: "@vikram_power" },
  { id: 8, name: "Sunita Rao", title: "Gentle Yoga & Senior Wellness Specialist", experience: "11 years", specialties: ["Chair Yoga", "Senior Yoga", "Gentle Hatha", "Yoga for Arthritis"], image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", bio: "Sunita has dedicated her practice to making yoga accessible to everyone, regardless of age or physical limitation. Her gentle, compassionate approach has helped hundreds of seniors and people with chronic conditions transform their quality of life.", certifications: ["500-Hour RYT", "Senior Yoga Specialist", "Yoga for Arthritis Certified"], classes: ["Restorative Yoga", "Hatha Yoga"], quote: "It is never too late to unfold.", instagram: "@sunita_gentle" },
];

const RETREATS = [
  { id: 1, name: "Rishikesh Sacred Journey", location: "Rishikesh, Uttarakhand", duration: "7 Days / 6 Nights", date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), price: "₹45,000", capacity: 12, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", description: "Immerse yourself in the birthplace of yoga. This transformative 7-day retreat combines daily asana practice, pranayama, meditation, Ganga Aarti ceremonies, and guided nature walks in the foothills of the Himalayas.", includes: ["Daily morning yoga (2 hrs)", "Evening meditation", "Nature walks & river rafting", "Sattvic meals included", "Ashram accommodation", "Yoga philosophy lectures"], instructor: "Anjali Sharma", highlights: ["Sunrise yoga by the Ganges", "Kirtan evenings", "Ayurvedic consultation"] },
  { id: 2, name: "Goa Beachside Detox", location: "Arambol, Goa", duration: "5 Days / 4 Nights", date: new Date(Date.now() + 78 * 24 * 60 * 60 * 1000), price: "₹32,000", capacity: 16, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", description: "Find your flow by the sea. This beachside retreat combines sunrise yoga on the sand, detox nutrition, sunset meditation, and therapeutic Yin sessions to reset your body and mind.", includes: ["Sunrise beach yoga", "Sunset Yin sessions", "Detox meal plan", "Beach villa accommodation", "Sound healing session", "Free time for exploration"], instructor: "Meera Iyer", highlights: ["Yoga on the beach", "Detox smoothie bar", "Bioluminescent kayaking"] },
  { id: 3, name: "Kerala Ayurveda & Yoga", location: "Varkala, Kerala", duration: "10 Days / 9 Nights", date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), price: "₹68,000", capacity: 8, image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80", description: "The ultimate mind-body reset. This premium 10-day program integrates yoga, Ayurvedic treatments, nutritional counselling, and coastal meditation for a profoundly healing experience.", includes: ["Daily yoga & pranayama", "Panchakarma treatments", "Ayurvedic doctor consultation", "Cliff-top yoga sessions", "All Sattvic meals", "Personalized wellness plan"], instructor: "Anjali Sharma & Meera Iyer", highlights: ["Panchakarma detox", "Cliff yoga over the Arabian Sea", "Personal wellness plan"] },
];

const PRICING = [
  { name: "Basic", price: "₹999", period: "/month", features: ["3 classes per week", "Access to Hatha & Yin", "Online resources library", "Community forum access", "Monthly newsletter"], highlighted: false, cta: "Get Started" },
  { name: "Standard", price: "₹1,999", period: "/month", features: ["Unlimited classes", "All class types", "Priority booking", "1 monthly workshop", "Nutrition guide", "Progress tracking", "Community events"], highlighted: true, cta: "Most Popular" },
  { name: "Premium", price: "₹3,499", period: "/month", features: ["Everything in Standard", "1-on-1 personal trainer", "Custom diet plan", "Ayurvedic consultation", "Retreat discounts (20%)", "Dedicated instructor", "Home practice plan"], highlighted: false, cta: "Go Premium" },
];

const TESTIMONIALS = [
  { name: "Priya Nair", rating: 5, role: "Marketing Professional", text: "Joining this studio was the single best decision I've made for my health. After 3 months with Anjali, my chronic back pain is gone. The environment is serene, the instructors are exceptional, and I've found a community I never knew I needed.", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&q=80" },
  { name: "Arjun Mehta", rating: 5, role: "Software Engineer", text: "I was skeptical about yoga at first. Rahul's Power Yoga class changed everything. Six months in, I'm stronger than I've ever been and my productivity at work has skyrocketed. Truly life-changing.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Kavitha Reddy", rating: 5, role: "School Teacher", text: "Meera's Yin Yoga classes are pure magic. I've struggled with anxiety for years, and nothing has helped as much as this practice. The studio has become my sanctuary — a place where I can completely let go and just breathe.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
  { name: "Siddharth Rao", rating: 5, role: "Entrepreneur", text: "The Rishikesh retreat was a transformational experience I'll carry for the rest of my life. Waking up for sunrise yoga by the Ganges, the Ganga Aarti, the philosophy discussions — it reset something deep inside me.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  { name: "Divya Krishnan", rating: 5, role: "Doctor", text: "As a physician, I can say with full confidence that this studio's approach to yoga is genuinely therapeutic. The instructors have real anatomical knowledge and create a safe, supportive space.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" },
  { name: "Rajan Pillai", rating: 5, role: "Retired Officer", text: "I started at 58, thinking yoga was not for me. Three years later, I'm doing headstands and my doctor says my bone density has improved significantly. It's never too late to begin this practice.", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&q=80" },
];

const QUOTES = [
  { text: "Yoga is the journey of the self, through the self, to the self.", author: "The Bhagavad Gita" },
  { text: "The nature of yoga is to shine the light of awareness into the darkest corners of the body.", author: "Jason Crandell" },
  { text: "Yoga is not about touching your toes. It is what you learn on the way down.", author: "Jigar Gor" },
  { text: "The goal of yoga is to still the mind, not to silence the world.", author: "T. Krishnamacharya" },
  { text: "You cannot do yoga. Yoga is your natural state.", author: "Sharon Gannon" },
  { text: "Inhale the future, exhale the past.", author: "Unknown" },
  { text: "Your body exists in the past and your mind exists in the future. In yoga, they come together in the present.", author: "B.K.S. Iyengar" },
];

const FAQ = [
  { q: "Is yoga suitable for complete beginners?", a: "Absolutely! Our Hatha and Restorative classes are specifically designed for beginners. Our instructors will guide you through each pose with modifications to suit your flexibility and strength level. There is no prior experience needed — just come with an open mind and comfortable clothing." },
  { q: "What should I bring to class?", a: "Wear comfortable, stretchy clothing that allows free movement. Bring your own yoga mat if you have one — we also provide clean studio mats. A small towel and water bottle are recommended. Leave your shoes at the entrance." },
  { q: "How early should I arrive for my first class?", a: "We recommend arriving 10–15 minutes early for your first class. This gives you time to complete a short intake form, meet your instructor, and settle in before the class begins." },
  { q: "Can I attend classes during pregnancy?", a: "Yes, with your doctor's clearance. Please inform your instructor before class so they can offer appropriate modifications. We also recommend our Restorative Yoga class, which is gentle and particularly beneficial during pregnancy." },
  { q: "How do I cancel or reschedule a booking?", a: "Bookings can be cancelled or rescheduled up to 4 hours before the class via our booking system. Late cancellations count against your session allowance. Please reach out if you have an emergency — we're always happy to help." },
];

/* ─────────────────────────────────────────
   UTILITY HOOKS & COMPONENTS
───────────────────────────────────────── */
function useTheme() {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark((d) => !d);
  return { dark, toggle, colors: dark ? DARK : LIGHT };
}

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
}

function StarRating({ rating, c }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? "#F4A261" : c.border, fontSize: 16 }}>★</span>
      ))}
    </div>
  );
}

function CountdownTimer({ targetDate, c }) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = targetDate - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Object.entries(timeLeft).map(([key, val]) => (
        <div key={key} style={{ textAlign: "center" }}>
          <div style={{ background: c.primary, color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 22, fontWeight: 700, minWidth: 52 }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{{ d: "Days", h: "Hrs", m: "Min", s: "Sec" }[key]}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   WAVE DIVIDER
───────────────────────────────────────── */
function WaveDivider({ fill, inverted = false }) {
  return (
    <div style={{ width: "100%", overflow: "hidden", lineHeight: 0, transform: inverted ? "rotate(180deg)" : "none" }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
function Loader({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.7, ease: "easeInOut" }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(135deg, #050E1A 0%, #0A1628 50%, #0F1E30 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: [0.4, 1.1, 1], opacity: 1 }} transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }} style={{ textAlign: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ fontSize: 80, lineHeight: 1, marginBottom: 20 }}>☸️</motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
          style={{ fontFamily: "'Georgia', serif", fontSize: 44, color: "#84A59D", letterSpacing: 8, fontStyle: "italic" }}>Praṇa</motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ color: "#3A7D7C", fontSize: 12, letterSpacing: 8, textTransform: "uppercase", marginTop: 8 }}>Yoga & Wellness Studio</motion.div>
      </motion.div>
      <motion.div initial={{ width: 0 }} animate={{ width: 240 }} transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
        style={{ height: 2, background: "linear-gradient(90deg, transparent, #3A7D7C, #84A59D, transparent)", marginTop: 48, borderRadius: 2 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 1.6, duration: 0.8, repeat: 1 }}
        style={{ color: "#3A7D7C", fontSize: 11, letterSpacing: 4, marginTop: 20, textTransform: "uppercase" }}>Breathe. Move. Heal.</motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────── */
function ScrollProgress({ c }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9998, background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`, scaleX, transformOrigin: "left" }} />
  );
}

/* ─────────────────────────────────────────
   BOOKING MODAL
───────────────────────────────────────── */
function BookingModal({ item, type, onClose, c }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [booked, setBooked] = useState(false);
  const [errors, setErrors] = useState({});
  const [ripples, setRipples] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required";
    return e;
  };

  const handleBook = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setBooked(true);
    setRipples(true);
    // Fire booking notification
    const className = item.name || item.class || "Yoga Session";
    const instructorPart = item.instructor ? ` with ${item.instructor}` : "";
    const timePart = type === "schedule" && item.time ? ` — ${item.day} at ${item.time}` : "";
    emitBookingNotification({
      id: Date.now(),
      icon: "✅",
      msg: `Booking confirmed: ${className}${instructorPart}`,
      sub: `${timePart || "Your spot is reserved"} · Confirmation sent to ${email}`,
      isBooking: true,
    });
    // Also fire a follow-up reminder notification after 3s
    setTimeout(() => {
      emitBookingNotification({
        id: Date.now() + 1,
        icon: "⏰",
        msg: `Reminder: ${className} starts soon`,
        sub: "We look forward to seeing you on the mat 🙏",
        isBooking: true,
      });
    }, 3200);
  };

  const inp = { background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 16px", color: c.text, width: "100%", outline: "none", fontSize: 14, fontFamily: "inherit" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 40 }} transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: c.card, borderRadius: 24, padding: 40, maxWidth: 460, width: "100%", border: `1px solid ${c.border}`, boxShadow: `0 40px 80px rgba(0,0,0,0.5)` }}>
        {!booked ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧘</div>
            <h3 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 26, marginBottom: 6 }}>Reserve Your Spot</h3>
            <p style={{ color: c.textMuted, fontSize: 14, marginBottom: 28 }}>{item.name || item.class}{type === "schedule" ? ` — ${item.day} at ${item.time}` : ""}</p>
            <div style={{ marginBottom: 16 }}>
              <input style={{ ...inp, borderColor: errors.name ? "#ff6b6b" : c.border }} placeholder="Your Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
            </div>
            <div style={{ marginBottom: 28 }}>
              <input style={{ ...inp, borderColor: errors.email ? "#ff6b6b" : c.border }} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <motion.button whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${c.primary}60` }} whileTap={{ scale: 0.97 }} onClick={handleBook}
                style={{ flex: 1, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Confirm Booking
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                style={{ flex: 1, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, borderRadius: 12, padding: "13px 0", fontFamily: "inherit", fontSize: 15, cursor: "pointer" }}>
                Cancel
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "24px 0", position: "relative" }}>
            {/* Success ripple bursts */}
            {ripples && [0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ scale: 0.6, opacity: 0.7 }} animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 1.4, delay: i * 0.28, ease: "easeOut" }}
                style={{ position: "absolute", top: "50%", left: "50%", width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: "50%", border: `2px solid ${c.primary}`, pointerEvents: "none", zIndex: 0 }} />
            ))}
            <motion.div animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }} transition={{ duration: 0.8 }} style={{ fontSize: 64, marginBottom: 16, position: "relative", zIndex: 1 }}>🌿</motion.div>
            <h3 style={{ color: c.primary, fontFamily: "'Georgia', serif", fontSize: 26, marginBottom: 8, position: "relative", zIndex: 1 }}>Booking Confirmed!</h3>
            <p style={{ color: c.textMuted, fontSize: 14, marginBottom: 6, position: "relative", zIndex: 1 }}>A confirmation has been sent to {email}</p>
            <p style={{ color: c.textMuted, fontSize: 12, marginBottom: 28, position: "relative", zIndex: 1, opacity: 0.7 }}>Check your notifications for class reminders 🔔</p>
            <motion.button whileHover={{ scale: 1.03 }} onClick={onClose}
              style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 40px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", position: "relative", zIndex: 1 }}>
              Wonderful! ✨
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar({ c, dark, toggleDark, setBookingModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const logoVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.94 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { rotate: [0, -10, 10, 0], scale: 1.05, transition: { duration: 0.55, ease: "easeInOut" } },
  };

  const navItemVariants = {
    hidden: (index) => ({ opacity: 0, y: -12, transition: { delay: index * 0.05, duration: 0.28, ease: "easeOut" } }),
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  };

  useEffect(() => { setMenuOpen(false); setMegaMenu(null); }, [location]);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/classes", label: "Classes", mega: "classes" },
    { to: "/schedule", label: "Schedule" },
    { to: "/instructors", label: "Instructors" },
    { to: "/retreats", label: "Retreats", mega: "retreats" },
    { to: "/pricing", label: "Pricing" },
    { to: "/testimonials", label: "Reviews" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? c.glass : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${c.border}` : "none",
        padding: "0 clamp(20px, 5vw, 60px)",
        transition: "all 0.3s ease",
      }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 72 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <motion.span variants={logoVariants} initial="hidden" animate="visible" whileHover="hover"
            style={{ fontSize: 30, display: "inline-block" }}>☸️</motion.span>
          <motion.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
            style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: c.primary, fontStyle: "italic", letterSpacing: 1 }}>
            Praṇa
          </motion.span>
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 2, alignItems: "center" }} className="desktop-nav">
          {navLinks.map((link, index) => (
            <motion.div key={link.to} custom={index} variants={navItemVariants} initial="hidden" animate="visible" whileHover={{ y: -2, scale: 1.02 }}
              style={{ position: "relative", display: "inline-block" }} onMouseEnter={() => link.mega && setMegaMenu(link.mega)} onMouseLeave={() => setMegaMenu(null)}>
              <NavLink to={link.to} style={({ isActive }) => ({
                textDecoration: "none", padding: "7px 14px", borderRadius: 8, fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? c.primary : c.textMuted,
                background: isActive ? `${c.primary}18` : "transparent",
                transition: "all 0.2s", display: "block",
              })}>
                {link.label}
              </NavLink>
              <AnimatePresence>
                {megaMenu === link.mega && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.18 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, minWidth: 280, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                    {link.mega === "classes" ? CLASSES.slice(0, 4).map((cls) => (
                      <Link key={cls.id} to="/classes" style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 8px", borderRadius: 10, alignItems: "center" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${c.primary}12`}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: 20 }}>🧘</span>
                        <div><div style={{ color: c.text, fontWeight: 600, fontSize: 13 }}>{cls.name}</div><div style={{ color: c.textMuted, fontSize: 11 }}>{cls.difficulty} · {cls.duration}</div></div>
                      </Link>
                    )) : RETREATS.slice(0, 2).map((r) => (
                      <Link key={r.id} to="/retreats" style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 8px", borderRadius: 10, alignItems: "center" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${c.primary}12`}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: 20 }}>🌄</span>
                        <div><div style={{ color: c.text, fontWeight: 600, fontSize: 13 }}>{r.name}</div><div style={{ color: c.textMuted, fontSize: 11 }}>{r.duration} · {r.price}</div></div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleDark}
          style={{ marginLeft: 14, background: `${c.primary}22`, border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer", fontSize: 17 }} aria-label="Toggle dark mode">
          {dark ? "☀️" : "🌙"}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05, boxShadow: `0 0 24px ${c.primary}60` }} whileTap={{ scale: 0.97 }}
          onClick={() => setBookingModal({ item: { name: "Free Trial Session" }, type: "class" })}
          style={{ marginLeft: 12, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Book Free Class
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMenuOpen((v) => !v)}
          style={{ marginLeft: 12, background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 6 }} aria-label="Menu">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} animate={menuOpen ? { rotate: i === 1 ? 0 : i === 0 ? 45 : -45, y: i === 1 ? 0 : i === 0 ? 9 : -9, opacity: i === 1 ? 0 : 1 } : { rotate: 0, y: 0, opacity: 1 }}
              style={{ display: "block", width: 22, height: 2, background: c.text, borderRadius: 2 }} />
          ))}
        </motion.button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: `1px solid ${c.border}`, background: c.glass, backdropFilter: "blur(24px)" }}>
            <div style={{ padding: "16px 0" }}>
              {navLinks.map((link, index) => (
                <motion.div key={link.to} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 + index * 0.04, duration: 0.3, ease: "easeOut" }} whileHover={{ x: 0, scale: 1.01 }}
                  style={{ overflow: "hidden" }}>
                  <NavLink to={link.to} style={({ isActive }) => ({ display: "block", textDecoration: "none", padding: "12px clamp(20px, 5vw, 60px)", color: isActive ? c.primary : c.text, fontWeight: isActive ? 600 : 400, fontSize: 16, borderBottom: `1px solid ${c.border}` })}>
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─────────────────────────────────────────
   PAGE WRAPPER & SECTION TITLE
───────────────────────────────────────── */
function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, c, center = true }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
      style={{ textAlign: center ? "center" : "left", marginBottom: 52 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: center ? "center" : "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, transparent, ${c.primary})` }} />
        <span style={{ color: c.primary, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Praṇa Studio</span>
        <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${c.primary}, transparent)` }} />
      </div>
      <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 5vw, 48px)", color: c.text, marginBottom: 14, lineHeight: 1.2, fontStyle: "italic" }}>{title}</h2>
      {subtitle && <p style={{ color: c.textMuted, fontSize: 17, maxWidth: 560, margin: center ? "0 auto" : "0", lineHeight: 1.8 }}>{subtitle}</p>}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   LIVE HERO BUTTON
───────────────────────────────────────── */
function LiveHeroButton({ onClick }) {
  const particles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Ambient particles */}
      {particles.map((i) => (
        <motion.div key={i}
          animate={{ x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i * 4), 0], y: [0, -(10 + i * 5), 0], opacity: [0, 0.8, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.28, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${10 + (i * 11) % 80}%`, top: "50%", width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: "50%", background: ["#f0abfc","#fb7185","#fbbf24","#a78bfa","#34d399","#60a5fa","#f472b6","#818cf8"][i], pointerEvents: "none", zIndex: 1 }} />
      ))}
      <motion.button
        onClick={onClick}
        animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(236,72,153,0.2)", "0 0 35px rgba(168,85,247,0.7), 0 0 60px rgba(236,72,153,0.4)", "0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(236,72,153,0.2)"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.06, boxShadow: "0 0 60px rgba(168,85,247,0.8), 0 0 100px rgba(236,72,153,0.5)" }}
        whileTap={{ scale: 0.96 }}
        style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, rgba(88,28,135,0.85) 0%, rgba(157,23,77,0.85) 50%, rgba(194,65,12,0.75) 100%)", backdropFilter: "blur(16px)", border: "1px solid rgba(216,180,254,0.35)", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Palatino Linotype', Georgia, serif", color: "#fff", cursor: "pointer", letterSpacing: 0.5, zIndex: 2, overflow: "hidden" }}>
        {/* Shimmer sweep */}
        <motion.div animate={{ x: ["-120%", "220%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)", pointerEvents: "none" }} />
        {/* Live dot */}
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <motion.span animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "rgba(239,68,68,0.4)" }} />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "block", position: "relative", boxShadow: "0 0 8px #ef4444" }} />
        </span>
        {/* Broadcast icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12a19.79 19.79 0 0 1-3-8.6A2 2 0 0 1 3.56 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Join Live Classes
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────
   SVG REACTION ICONS
───────────────────────────────────────── */
const SVG_REACTIONS = [
  { id: "heart", label: "Love", el: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )},
  { id: "lotus", label: "Peace", el: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="currentColor">
      <ellipse cx="24" cy="32" rx="10" ry="14" opacity="0.25"/>
      <path d="M24 12 C18 12, 10 18, 10 28 C14 24, 19 22, 24 22 C29 22, 34 24, 38 28 C38 18, 30 12, 24 12Z"/>
      <path d="M24 22 C20 16, 12 16, 10 24 C14 22, 19 23, 24 22Z"/>
      <path d="M24 22 C28 16, 36 16, 38 24 C34 22, 29 23, 24 22Z"/>
      <ellipse cx="24" cy="30" rx="4" ry="6"/>
    </svg>
  )},
  { id: "om", label: "Namaste", el: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="currentColor">
      <text x="8" y="36" fontSize="30" fontFamily="serif">🕉</text>
    </svg>
  )},
  { id: "fire", label: "Energy", el: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-3-2-5-2-5s-1 2-2 2c0 0 1-3-1-6z"/>
      <path d="M12 12c0 0-2 1.5-2 3a2 2 0 0 0 4 0c0-1.5-2-3-2-3z" opacity="0.6"/>
    </svg>
  )},
  { id: "wave", label: "Flow", el: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M2 12 C4 8, 8 8, 10 12 C12 16, 16 16, 18 12 C20 8, 22 8, 22 12"/>
    </svg>
  )},
];

/* ─────────────────────────────────────────
   FLOATING REACTION PARTICLE
───────────────────────────────────────── */
function FloatingReaction({ reaction, id, onDone }) {
  const x = (Math.random() - 0.5) * 120;
  const size = 18 + Math.random() * 22;
  const COLORS = { heart: "#f43f5e", lotus: "#a78bfa", om: "#fbbf24", fire: "#f97316", wave: "#38bdf8" };
  const color = COLORS[reaction.id] || "#fff";
  return (
    <motion.div key={id}
      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -160, x, scale: 1.2 }}
      transition={{ duration: 2.2, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{ position: "absolute", bottom: 60, left: "50%", pointerEvents: "none", color, width: size, height: size, filter: `drop-shadow(0 0 6px ${color})` }}>
      {reaction.el}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   ORB VIDEO — robust autoplay component
───────────────────────────────────────── */
const ORB_VIDEO_SOURCES = [
  "https://assets.mixkit.co/videos/preview/mixkit-woman-meditating-in-a-room-with-candles-43640-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-yoga-woman-doing-exercises-1487-large.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-orbs-of-light-394-large.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

/* Animated canvas fallback — cinematic chakra/meditation orb shown when video fails */
function OrbCanvasFallback() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let raf;
    const W = canvas.width = canvas.offsetWidth || 200;
    const H = canvas.height = canvas.offsetHeight || 200;
    const cx = W / 2, cy = H / 2;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Deep cosmic background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
      bg.addColorStop(0, "rgba(88,28,135,0.95)");
      bg.addColorStop(0.5, "rgba(30,10,60,0.98)");
      bg.addColorStop(1, "rgba(2,8,17,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Rotating nebula rings
      for (let r = 0; r < 3; r++) {
        const rot = frame * 0.008 * (r % 2 === 0 ? 1 : -1) + r * Math.PI * 0.6;
        const ringR = 55 + r * 22;
        const grad = ctx.createConicalGradient ? null : null;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${270 + r * 30 + frame * 0.3}, 80%, 70%, ${0.12 + r * 0.04})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Floating energy particles
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + frame * 0.012;
        const radius = 40 + Math.sin(frame * 0.05 + i * 0.7) * 22;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        const alpha = 0.4 + 0.5 * Math.sin(frame * 0.08 + i * 0.9);
        const hue = 270 + i * 15 + frame * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 75%, ${alpha})`;
        ctx.fill();
      }

      // Inner glow core
      const coreGrad = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 38);
      coreGrad.addColorStop(0, `hsla(${280 + Math.sin(frame * 0.04) * 20}, 90%, 90%, 0.95)`);
      coreGrad.addColorStop(0.4, `hsla(${260 + Math.cos(frame * 0.03) * 15}, 85%, 65%, 0.75)`);
      coreGrad.addColorStop(1, "rgba(139,92,246,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Pulsing mandala petals
      const petals = 8;
      const pulse = 0.85 + 0.15 * Math.sin(frame * 0.045);
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * Math.PI * 2 + frame * 0.01;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -24 * pulse, 5, 14 * pulse, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${290 + p * 8}, 80%, 72%, 0.22)`;
        ctx.fill();
        ctx.restore();
      }

      // Om symbol shine
      ctx.save();
      ctx.translate(cx, cy);
      ctx.font = `bold ${22 + Math.sin(frame * 0.04) * 2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const shimmer = `rgba(255,220,255,${0.7 + 0.3 * Math.sin(frame * 0.06)})`;
      ctx.shadowColor = "rgba(216,180,254,0.9)";
      ctx.shadowBlur = 12 + Math.sin(frame * 0.05) * 5;
      ctx.fillStyle = shimmer;
      ctx.fillText("🕉", 0, 1);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%", zIndex: 0 }} />
  );
}

function OrbVideo() {
  const vidRef = useRef(null);
  const [srcIdx, setSrcIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.playsInline = true;
    setVideoLoaded(false);
    const p = vid.play();
    if (p && p.catch) {
      p.catch(() => {
        const retry = () => { vid.play().catch(() => {}); document.removeEventListener("click", retry); };
        document.addEventListener("click", retry, { once: true });
      });
    }
  }, [srcIdx]);

  return (
    <>
      {/* Always show canvas fallback underneath */}
      <OrbCanvasFallback />
      {/* Video on top when available */}
      {!failed && (
        <video
          ref={vidRef}
          key={srcIdx}
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => {
            if (srcIdx < ORB_VIDEO_SOURCES.length - 1) setSrcIdx((i) => i + 1);
            else setFailed(true);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: videoLoaded ? 0.88 : 0,
            transition: "opacity 0.8s ease",
            display: "block",
            willChange: "transform",
            zIndex: 1,
          }}
        >
          <source src={ORB_VIDEO_SOURCES[srcIdx]} type="video/mp4" />
        </video>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   BREATHING ORB
───────────────────────────────────────── */
function BreathingOrb() {
  const phases = ["Inhale", "Hold", "Exhale", "Hold"];
  const durations = [4, 2, 6, 2];
  const [phase, setPhase] = useState(0);
  const totalCycle = durations.reduce((a, b) => a + b, 0);

  useEffect(() => {
    let elapsed = 0;
    const timers = phases.map((_, i) => {
      const t = setTimeout(() => setPhase(i), elapsed * 1000);
      elapsed += durations[i];
      return t;
    });
    const loop = setInterval(() => {
      elapsed = 0;
      phases.forEach((_, i) => {
        setTimeout(() => setPhase(i), elapsed * 1000);
        elapsed += durations[i];
      });
    }, totalCycle * 1000);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  const isExpand = phase === 0;
  const isHold = phase === 1 || phase === 3;
  const scaleVal = isExpand ? 1 : isHold ? (phase === 1 ? 1 : 0.7) : 0.7;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Outer glow rings */}
        {[1.6, 1.3, 1].map((scale, i) => (
          <motion.div key={i} animate={{ scale: isExpand ? scale : scale * 0.65, opacity: isExpand ? 0.15 - i * 0.04 : 0.05 }} transition={{ duration: durations[phase], ease: "easeInOut" }}
            style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: `1px solid rgba(168,85,247,${0.4 - i * 0.1})`, background: "transparent" }} />
        ))}

        {/* Soft neon aura spinning ring */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", width: 98, height: 98, borderRadius: "50%", background: "conic-gradient(from 0deg, transparent 60%, rgba(168,85,247,0.5) 75%, rgba(219,39,119,0.4) 88%, transparent 100%)", pointerEvents: "none" }} />

        {/* Main orb with cinematic video inside */}
        <motion.div animate={{ scale: isExpand ? 1 : 0.7 }} transition={{ duration: durations[phase], ease: "easeInOut" }}
          style={{ width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(216,180,254,0.9) 0%, rgba(139,92,246,0.7) 40%, rgba(88,28,135,0.9) 100%)", animation: "orbGlowPulse 4s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>

          {/* Cinematic meditation video */}
          <OrbVideo />

          {/* Vignette overlay to blend video into orb */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(88,28,135,0.18) 0%, rgba(88,28,135,0.62) 75%, rgba(88,28,135,0.92) 100%)", pointerEvents: "none", zIndex: 10 }} />
          {/* Om symbol on top */}
          <span style={{ position: "relative", fontSize: 22, zIndex: 11, filter: "drop-shadow(0 0 6px rgba(216,180,254,0.9))" }}>🕉️</span>
        </motion.div>

        {/* Breathing pulse wave overlay */}
        <motion.div animate={{ scale: isExpand ? 1.18 : 0.85, opacity: isExpand ? 0.22 : 0.04 }} transition={{ duration: durations[phase], ease: "easeInOut" }}
          style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)", pointerEvents: "none" }} />
      </div>
      <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: ["rgba(167,139,250,1)", "rgba(251,191,36,1)", "rgba(52,211,153,1)", "rgba(251,191,36,1)"][phase] }}>
        {phases[phase]}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SESSION PROGRESS RING
───────────────────────────────────────── */
function SessionProgressRing({ progress }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const segments = [
    { label: "Warmup", color: "#f472b6", pct: 0.15 },
    { label: "Flow", color: "#a78bfa", pct: 0.45 },
    { label: "Meditation", color: "#34d399", pct: 0.25 },
    { label: "Cooldown", color: "#60a5fa", pct: 0.15 },
  ];
  const currentSeg = (() => {
    let acc = 0;
    for (const s of segments) { acc += s.pct; if (progress <= acc) return s; }
    return segments[segments.length - 1];
  })();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <motion.circle cx="45" cy="45" r={r} fill="none" stroke={currentSeg.color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} animate={{ strokeDashoffset: circ * (1 - progress) }} transition={{ duration: 1.2, ease: "easeInOut" }}
            transform="rotate(-90 45 45)" style={{ filter: `drop-shadow(0 0 6px ${currentSeg.color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: currentSeg.color }}>{Math.round(progress * 100)}%</div>
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: currentSeg.color }}>{currentSeg.label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CHAKRA PANEL
───────────────────────────────────────── */
function ChakraPanel() {
  const chakras = [
    { name: "Sahasrara", color: "#c084fc", symbol: "◉" },
    { name: "Ajna", color: "#818cf8", symbol: "◈" },
    { name: "Vishuddha", color: "#67e8f9", symbol: "◇" },
    { name: "Anahata", color: "#4ade80", symbol: "◆" },
    { name: "Manipura", color: "#fde047", symbol: "▲" },
    { name: "Svadhisthana", color: "#fb923c", symbol: "◑" },
    { name: "Muladhara", color: "#f87171", symbol: "■" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {chakras.map((ch, i) => (
        <motion.div key={ch.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 18, height: 18, borderRadius: "50%", background: ch.color, boxShadow: `0 0 8px ${ch.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#000", flexShrink: 0 }}>
            {ch.symbol}
          </motion.div>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <motion.div animate={{ width: [`${40 + i * 8}%`, `${60 + i * 5}%`, `${40 + i * 8}%`] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ height: "100%", background: ch.color, borderRadius: 2, boxShadow: `0 0 4px ${ch.color}` }} />
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", minWidth: 56, textAlign: "right", letterSpacing: 0.5 }}>{ch.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   LIVE CLASS MODAL — FULLSCREEN IMMERSIVE
───────────────────────────────────────── */
const LIVE_QUOTES = [
  "Your breath is your power.",
  "Stillness creates clarity.",
  "Be present in this moment.",
  "Let go of what no longer serves you.",
  "You are stronger than you know.",
  "Every breath is a new beginning.",
];

const LIVE_CHAT_MSGS = [
  { user: "Priya N.", msg: "This is so calming 🙏", t: 0 },
  { user: "Arjun M.", msg: "Feeling the energy!", t: 3 },
  { user: "Kavitha R.", msg: "Namaste everyone 🌿", t: 7 },
  { user: "Rajan P.", msg: "Incredible session today", t: 12 },
  { user: "Divya K.", msg: "My chakras are aligning ✨", t: 18 },
  { user: "Siddharth R.", msg: "This breathing phase 🔥", t: 24 },
  { user: "Meena T.", msg: "Been doing this for 30 days straight!", t: 30 },
  { user: "Vikram S.", msg: "That lotus pose 😍", t: 36 },
];

function LiveClassModal({ onClose }) {
  const [reactions, setReactions] = useState([]);
  const [reactionId, setReactionId] = useState(0);
  const [energy, setEnergy] = useState(67);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [ambient, setAmbient] = useState("rain");
  const [ambientVol, setAmbientVol] = useState(60);
  const [chatMsgs, setChatMsgs] = useState(LIVE_CHAT_MSGS.slice(0, 2).map((m) => ({ ...m, uid: Math.random(), ts: new Date() })));
  const [chatInput, setChatInput] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [viewers, setViewers] = useState(1247);
  const [progress, setProgress] = useState(0.28);
  const [streak] = useState(7);
  const [showAchievement, setShowAchievement] = useState(true);
  const [livePlaying, setLivePlaying] = useState(true);
  const [liveTime, setLiveTime] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);
  const liveVideoRef = useRef(null);
  const chatRef = useRef(null);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => {
      setSessionSecs((s) => s + 1);
      setProgress((p) => Math.min(p + 0.0003, 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Viewer fluctuation
  useEffect(() => {
    const t = setInterval(() => setViewers((v) => v + Math.floor((Math.random() - 0.3) * 5)), 4000);
    return () => clearInterval(t);
  }, []);

  // Quote rotation
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % LIVE_QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Chat drip — periodic bot messages
  useEffect(() => {
    const t = setInterval(() => {
      const BOT_MSGS = [
        "My breathing feels lighter ✨",
        "This meditation is calming 🌌",
        "My chakras feel aligned",
        "Energy feels amazing today 🔥",
        "Namaste everyone 🙏",
        "So peaceful here 🌿",
        "Incredible session!",
        "That lotus flow was beautiful 😍",
      ];
      const BOT_USERS = ["Priya N.", "Arjun M.", "Kavitha R.", "Rajan P.", "Meena T.", "Vikram S.", "Divya K."];
      const user = BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)];
      const msg = BOT_MSGS[Math.floor(Math.random() * BOT_MSGS.length)];
      setChatMsgs((prev) => {
        const updated = [...prev, { user, msg, uid: Date.now() + Math.random(), ts: new Date(), isBot: true }];
        return updated.slice(-20);
      });
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 60);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Send user chat message
  const sendChatMsg = () => {
    const text = chatInput.trim();
    if (!text) return;
    const newMsg = { user: "You", msg: text, uid: Date.now() + Math.random(), ts: new Date(), isOwn: true };
    setChatMsgs((prev) => [...prev, newMsg].slice(-20));
    setChatInput("");
    setEnergy((e) => Math.min(e + 1, 100));
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 60);
  };

  const handleChatKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMsg(); }
  };

  // Auto-dismiss achievement
  useEffect(() => {
    const t = setTimeout(() => setShowAchievement(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const addReaction = (r) => {
    const id = reactionId + 1;
    setReactionId(id);
    setReactions((prev) => [...prev, { ...r, uid: id }]);
    setEnergy((e) => Math.min(e + 3, 100));
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const ambients = [
    { id: "rain", label: "Rain", icon: "🌧" },
    { id: "ocean", label: "Ocean", icon: "🌊" },
    { id: "bowls", label: "Tibetan Bowls", icon: "🔔" },
    { id: "forest", label: "Forest", icon: "🌲" },
    { id: "freq", label: "432Hz", icon: "🎵" },
  ];

  const achievements = [
    { icon: "⭐", title: "First Live Session", desc: "Welcome to the community!" },
    { icon: "🔥", title: "7 Day Streak", desc: `${streak} days of mindfulness` },
    { icon: "🧘", title: "Meditation Master", desc: "30+ sessions completed" },
    { icon: "⏱", title: "30 Min Completed", desc: "Deep practice unlocked" },
  ];

  useEffect(() => {
    const video = liveVideoRef.current;
    if (!video) return;

    const handleLoaded = () => setLiveDuration(video.duration || 0);
    const handleTimeUpdate = () => setLiveTime(video.currentTime || 0);

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const video = liveVideoRef.current;
    if (!video) return;
    if (livePlaying) {
      const playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    } else {
      video.pause();
    }
  }, [livePlaying]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, "0");
    const seconds = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#020811", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "rgba(2,8,17,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
          <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>LIVE</span>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Morning Flow & Breathwork with Anjali Sharma</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style={{ color: "#fff", fontWeight: 700 }}>{viewers.toLocaleString()}</span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>⏱ {fmtTime(sessionSecs)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
          <span>Video {formatTime(liveTime)} / {formatTime(liveDuration || 0)}</span>
          <motion.button onClick={() => setLivePlaying(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
            Play
          </motion.button>
          <motion.button onClick={() => setLivePlaying(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
            Stop
          </motion.button>
        </div>
        <motion.button onClick={onClose} whileHover={{ scale: 1.1, background: "rgba(239,68,68,0.2)" }} whileTap={{ scale: 0.95 }}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>✕</span> Leave
        </motion.button>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL (hidden in focus mode) ── */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ width: 280, background: "rgba(5,10,24,0.95)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

              {/* Instructor card */}
              <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=100&q=80" alt="Anjali" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(139,92,246,0.6)" }} />
                    <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: "#22c55e", border: "2px solid #020811" }} />
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Anjali Sharma</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Senior Instructor</div>
                    <div style={{ display: "inline-block", background: "rgba(239,68,68,0.2)", color: "#fca5a5", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginTop: 3 }}>LIVE</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Hatha", "Breathwork", "Meditation"].map((tag) => (
                    <span key={tag} style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Breathing orb */}
              <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Breathing Guide</div>
                <BreathingOrb />
              </div>

              {/* Session ring + chakras */}
              <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Session</div>
                  <SessionProgressRing progress={progress} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Chakras</div>
                  <ChakraPanel />
                </div>
              </div>

              {/* Streak & scores */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[{ label: "Streak", val: `${streak}d`, icon: "🔥" }, { label: "Mindfulness", val: "92", icon: "🧠" }, { label: "Consistency", val: "85%", icon: "📊" }].map((s) => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 6px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 18 }}>{s.icon}</div>
                      <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 2 }}>{s.val}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 0.5 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ambient sounds */}
              <div style={{ padding: "14px 16px", flex: 1 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Ambient Sound</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {ambients.map((a) => (
                    <motion.button key={a.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setAmbient(a.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: ambient === a.id ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${ambient === a.id ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.06)"}`, borderRadius: 20, padding: "5px 11px", fontSize: 11, color: ambient === a.id ? "#c4b5fd" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                      <span>{a.icon}</span>{a.label}
                    </motion.button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Vol</span>
                  <div style={{ flex: 1, position: "relative", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, cursor: "pointer" }}
                    onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAmbientVol(Math.round(((e.clientX - r.left) / r.width) * 100)); }}>
                    <motion.div style={{ width: `${ambientVol}%`, height: "100%", background: "linear-gradient(90deg, #7c3aed, #db2777)", borderRadius: 2, boxShadow: "0 0 6px rgba(139,92,246,0.6)" }} />
                    <motion.div style={{ position: "absolute", top: "50%", left: `${ambientVol}%`, width: 12, height: 12, borderRadius: "50%", background: "#c4b5fd", transform: "translate(-50%, -50%)", boxShadow: "0 0 8px rgba(196,181,253,0.8)" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, minWidth: 24 }}>{ambientVol}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CENTER: VIDEO + CONTROLS ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Cinematic video area */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {/* ── FULL PANEL BACKGROUND VIDEO ── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
              {/* The actual yoga/meditation background video */}
              <video
                ref={liveVideoRef}
                autoPlay muted loop playsInline preload="auto"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  opacity: 0.45,
                  filter: "brightness(0.7) saturate(1.2)",
                  transform: "scale(1.05)",
                  transition: "opacity 1.5s ease",
                }}
              >
                <source src="/videos/yoga-bg.mp4" type="video/mp4" />
              </video>
              {/* Dark cinematic overlay */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
              {/* Purple spiritual radial glow */}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(139,92,246,0.22), transparent 70%)" }} />
              {/* Top vignette */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, rgba(2,8,17,0.85), transparent)" }} />
              {/* Bottom vignette */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to top, rgba(2,8,17,0.9), transparent)" }} />
              {/* Side vigettes for depth */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 80, background: "linear-gradient(to right, rgba(2,8,17,0.6), transparent)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 80, background: "linear-gradient(to left, rgba(2,8,17,0.6), transparent)" }} />
            </div>

            {/* Ambient gradient bg — sits above video for color mood */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(135deg, rgba(5,14,26,0.5) 0%, rgba(13,27,42,0.4) 40%, rgba(26,5,51,0.45) 100%)", pointerEvents: "none" }} />
            {/* Moving ambient lights */}
            {[
              { x: "15%", y: "20%", c1: "#7c3aed", c2: "transparent", s: 500 },
              { x: "75%", y: "60%", c1: "#db2777", c2: "transparent", s: 400 },
              { x: "45%", y: "85%", c1: "#0e7490", c2: "transparent", s: 350 },
            ].map((orb, i) => (
              <motion.div key={i} animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
                style={{ position: "absolute", zIndex: 1, left: orb.x, top: orb.y, width: orb.s, height: orb.s, borderRadius: "50%", background: `radial-gradient(circle, ${orb.c1}40, ${orb.c2})`, pointerEvents: "none" }} />
            ))}
            {/* Fog layer */}
            <motion.div animate={{ opacity: [0.12, 0.22, 0.12], x: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(139,92,246,0.15), transparent)", pointerEvents: "none" }} />

            {/* ── CINEMATIC LIVE ORB ── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

                {/* Radial pulse waves */}
                {[1, 1.4, 1.8].map((scale, i) => (
                  <div key={i} style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(139,92,246,0.3)", animation: `liveRadialPulse ${3 + i * 0.7}s ease-out ${i * 0.9}s infinite`, pointerEvents: "none" }} />
                ))}

                {/* Outer rotating neon ring */}
                <div style={{ position: "absolute", width: 216, height: 216, borderRadius: "50%", animation: "liveRingRotate 8s linear infinite", background: "conic-gradient(from 0deg, #7c3aed, #ec4899, #f97316, #7c3aed)", padding: 2, boxSizing: "border-box", flexShrink: 0 }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#020811" }} />
                </div>

                {/* Soft aura glow */}
                <motion.div animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(219,39,119,0.18) 50%, transparent 75%)", pointerEvents: "none" }} />

                {/* Video circle */}
                <div style={{ position: "relative", width: 200, height: 200, borderRadius: "50%", overflow: "hidden", flexShrink: 0, zIndex: 2, boxShadow: "0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(219,39,119,0.2)" }}>
                  <OrbVideo />
                  {/* Soft vignette/blur edge overlay */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, transparent 55%, rgba(2,8,17,0.85) 100%)", pointerEvents: "none", zIndex: 10 }} />
                  {/* Subtle color tint overlay */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(88,28,135,0.12)", pointerEvents: "none", mixBlendMode: "overlay", zIndex: 11 }} />
                </div>

                {/* LIVE STREAM ACTIVE label */}
                <motion.div animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{ position: "absolute", bottom: -36, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  LIVE STREAM ACTIVE
                </motion.div>
              </div>
            </div>

            {/* Floating quote */}
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "80%", textAlign: "center", pointerEvents: "none", zIndex: 2 }}>
              <AnimatePresence mode="wait">
                <motion.div key={quoteIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6 }}
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "10px 24px", border: "1px solid rgba(255,255,255,0.08)", display: "inline-block" }}>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>"{LIVE_QUOTES[quoteIdx]}"</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating reactions container */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 2 }}>
              <AnimatePresence>
                {reactions.map((r) => (
                  <FloatingReaction key={r.uid} reaction={r} id={r.uid} onDone={() => setReactions((prev) => prev.filter((x) => x.uid !== r.uid))} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── CONTROLS BAR ── */}
          <div style={{ background: "rgba(2,8,17,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Community energy */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 1 }}>COMMUNITY ENERGY</span>
                <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700 }}>{energy}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div animate={{ width: `${energy}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)", borderRadius: 2, boxShadow: "0 0 8px rgba(139,92,246,0.5)" }} />
              </div>
            </div>

            {/* Reactions */}
            <div style={{ display: "flex", gap: 6 }}>
              {SVG_REACTIONS.map((r) => (
                <motion.button key={r.id} whileHover={{ scale: 1.25, y: -4 }} whileTap={{ scale: 0.9 }} onClick={() => addReaction(r)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 9px", cursor: "pointer", color: { heart: "#f43f5e", lotus: "#a78bfa", om: "#fbbf24", fire: "#f97316", wave: "#38bdf8" }[r.id], display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {r.el}
                </motion.button>
              ))}
            </div>

            {/* Control buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: muted ? "🔇" : "🎙️", label: muted ? "Unmute" : "Mute", action: () => setMuted(!muted), active: muted },
                { icon: camOff ? "📵" : "📷", label: camOff ? "Cam On" : "Cam Off", action: () => setCamOff(!camOff), active: camOff },
                { icon: focusMode ? "⊠" : "⊞", label: focusMode ? "Exit Focus" : "Focus Mode", action: () => setFocusMode(!focusMode), active: focusMode },
              ].map((btn) => (
                <motion.button key={btn.label} whileHover={{ scale: 1.08, background: "rgba(139,92,246,0.2)" }} whileTap={{ scale: 0.93 }} onClick={btn.action}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: btn.active ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${btn.active ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "7px 12px", cursor: "pointer", color: btn.active ? "#c4b5fd" : "rgba(255,255,255,0.5)", fontSize: 18, minWidth: 52 }}>
                  {btn.icon}
                  <span style={{ fontSize: 8, letterSpacing: 0.5 }}>{btn.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: CHAT (hidden in focus mode) ── */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ width: 280, background: "rgba(5,10,24,0.95)", backdropFilter: "blur(24px)", borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

              {/* Chat header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Live Chat</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ color: "#22c55e", fontSize: 10 }}>{viewers.toLocaleString()} watching</span>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <AnimatePresence initial={false}>
                  {chatMsgs.map((msg) => (
                    <motion.div key={msg.uid} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.isOwn ? "row-reverse" : "row" }}>
                      {!msg.isOwn && (
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: `hsl(${(msg.user.charCodeAt(0) * 37) % 360}, 50%, 38%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                          {msg.user[0]}
                        </div>
                      )}
                      <div style={{ maxWidth: "78%", textAlign: msg.isOwn ? "right" : "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: msg.isOwn ? "flex-end" : "flex-start" }}>
                          <span style={{ color: msg.isOwn ? "#34d399" : "rgba(139,92,246,0.9)", fontSize: 10, fontWeight: 700 }}>{msg.user}</span>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>
                            {msg.ts ? `${msg.ts.getHours().toString().padStart(2,"0")}:${msg.ts.getMinutes().toString().padStart(2,"0")}` : ""}
                          </span>
                        </div>
                        <div style={{ background: msg.isOwn ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${msg.isOwn ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: msg.isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "6px 10px", marginTop: 2 }}>
                          <div style={{ color: msg.isOwn ? "rgba(167,243,208,0.95)" : "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 1.5 }}>{msg.msg}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Chat input */}
              <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "8px 8px 8px 14px", border: "1px solid rgba(255,255,255,0.1)", transition: "border-color 0.2s" }}
                  onFocus={() => {}} onBlur={() => {}}>
                  <input
                    placeholder="Send a message…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12, fontFamily: "'Palatino Linotype', Georgia, serif" }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.15, background: "rgba(139,92,246,0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={sendChatMsg}
                    style={{ background: chatInput.trim() ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${chatInput.trim() ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: chatInput.trim() ? "#c4b5fd" : "rgba(255,255,255,0.25)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    ↑
                  </motion.button>
                </div>
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 5, paddingLeft: 4 }}>Press Enter to send</div>
              </div>

              {/* Achievements panel */}
              <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Achievements</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {achievements.map((ach, i) => (
                    <motion.div key={ach.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.04, borderColor: "rgba(139,92,246,0.5)" }}
                      style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                      <div style={{ fontSize: 20 }}>{ach.icon}</div>
                      <div style={{ color: "#fff", fontSize: 9, fontWeight: 700, marginTop: 3, lineHeight: 1.3 }}>{ach.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, marginTop: 2 }}>{ach.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── ACHIEVEMENT TOAST ── */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div initial={{ opacity: 0, y: 80, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 80, scale: 0.8 }} transition={{ type: "spring", damping: 18, stiffness: 280 }}
            style={{ position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(219,39,119,0.9))", backdropFilter: "blur(20px)", borderRadius: 16, padding: "14px 24px", border: "1px solid rgba(216,180,254,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 12, zIndex: 20, whiteSpace: "nowrap" }}>
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, delay: 0.3 }} style={{ fontSize: 28 }}>⭐</motion.span>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Achievement Unlocked!</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>First Live Session — Welcome to the community!</div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowAchievement(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", padding: "2px 8px", fontSize: 12 }}>✕</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   NOTIFICATION SYSTEM
───────────────────────────────────────── */
const NOTIF_DATA = [
  { id: 1, icon: "🧘", msg: "Ananya Sharma started a live class", sub: "Morning Flow • 847 watching", delay: 3000 },
  { id: 2, icon: "👥", msg: "120 users joined meditation session", sub: "Energy is high right now", delay: 12000 },
  { id: 3, icon: "⏰", msg: "New live yoga session starts in 10 min", sub: "Vinyasa Flow with Rahul Verma", delay: 22000 },
  { id: 4, icon: "🔥", msg: "Your meditation streak reached 7 days", sub: "You're on fire! Keep going", delay: 35000 },
  { id: 5, icon: "🌊", msg: "Breathing session is now live", sub: "Join 312 people breathing together", delay: 48000 },
];

// Global booking notification emitter
const bookingNotifListeners = new Set();
function emitBookingNotification(notif) {
  bookingNotifListeners.forEach((fn) => fn(notif));
}

function NotificationSystem() {
  const [notifs, setNotifs] = useState([]);
  const [bellPulse, setBellPulse] = useState(false);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [allHistory, setAllHistory] = useState([...NOTIF_DATA]);

  const pushNotif = useCallback((n) => {
    const uid = Date.now() + Math.random();
    setNotifs((prev) => [...prev, { ...n, uid }]);
    setUnread((u) => u + 1);
    setBellPulse(true);
    setTimeout(() => setBellPulse(false), 1200);
    setTimeout(() => setNotifs((prev) => prev.filter((x) => x.uid !== uid)), 7000);
  }, []);

  // Ambient auto-notifications
  useEffect(() => {
    const timers = NOTIF_DATA.map((n) =>
      setTimeout(() => {
        pushNotif(n);
        setAllHistory((prev) => [{ ...n, uid: Date.now() }, ...prev.filter((x) => x.id !== n.id)]);
      }, n.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [pushNotif]);

  // Booking notification listener
  useEffect(() => {
    const handler = (notif) => {
      pushNotif(notif);
      setAllHistory((prev) => [{ ...notif, uid: Date.now() }, ...prev]);
    };
    bookingNotifListeners.add(handler);
    return () => bookingNotifListeners.delete(handler);
  }, [pushNotif]);

  const dismiss = (uid) => setNotifs((prev) => prev.filter((x) => x.uid !== uid));

  return (
    <>
      {/* Bell button */}
      <motion.button
        onClick={() => { setPanelOpen((v) => !v); setUnread(0); }}
        animate={bellPulse ? { rotate: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
        style={{ position: "fixed", top: 82, right: 20, zIndex: 1500, width: 44, height: 44, borderRadius: "50%", background: "rgba(10,22,40,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 19, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
        🔔
        {unread > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", top: -3, right: -3, width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "2px solid #0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800 }}>
            {unread > 9 ? "9+" : unread}
          </motion.div>
        )}
      </motion.button>

      {/* Notification panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} transition={{ duration: 0.2 }}
            style={{ position: "fixed", top: 132, right: 20, zIndex: 1499, width: 320, background: "rgba(10,22,40,0.96)", backdropFilter: "blur(24px)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 18, padding: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700 }}>Notifications</span>
              <button onClick={() => setNotifs([])} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>Clear all</button>
            </div>
            {allHistory.slice(0, 8).map((n, idx) => (
              <div key={n.uid || n.id || idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{n.msg}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{n.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast stack */}
      <div style={{ position: "fixed", bottom: 100, right: 20, zIndex: 1498, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        <AnimatePresence>
          {notifs.slice(-3).map((n) => (
            <motion.div key={n.uid}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              whileHover={{ scale: 1.03, boxShadow: n.isBooking ? "0 12px 40px rgba(52,211,153,0.45)" : n.isContact ? "0 12px 40px rgba(56,189,248,0.4)" : "0 12px 40px rgba(139,92,246,0.4)" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              style={{ background: n.isBooking ? "rgba(5,24,18,0.97)" : n.isContact ? "rgba(5,18,28,0.97)" : "rgba(10,22,40,0.96)", backdropFilter: "blur(20px)", border: `1px solid ${n.isBooking ? "rgba(52,211,153,0.4)" : n.isContact ? "rgba(56,189,248,0.35)" : "rgba(139,92,246,0.25)"}`, borderRadius: 14, padding: "12px 14px", width: 300, display: "flex", gap: 10, alignItems: "flex-start", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", cursor: "pointer", position: "relative", overflow: "hidden" }}>
              {/* Glow border accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "14px 14px 0 0", background: n.isBooking ? "linear-gradient(90deg, #34d399, #059669)" : n.isContact ? "linear-gradient(90deg, #38bdf8, #0ea5e9)" : "linear-gradient(90deg, #7c3aed, #ec4899)", opacity: 0.85 }} />
              <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{n.msg}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>{n.sub}</div>
              </div>
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => dismiss(n.uid)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14, flexShrink: 0, padding: 0, lineHeight: 1 }}>✕</motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   HOME PAGE — UPGRADED HERO WITH AUTO SLIDER
───────────────────────────────────────── */
function HeroSlider({ c, setBookingModal, setLiveModal }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current);
      setCurrent((i) => (i + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(id);
  }, [current]);

  const goTo = (idx) => { setPrev(current); setCurrent(idx); };

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, -140]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Slides */}
      {HERO_IMAGES.map((slide, i) => (
        <motion.div key={i} initial={false}
          animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.06 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}>
          <motion.img src={slide.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", y: heroY }} />
        </motion.div>
      ))}
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(5,14,26,0.85) 0%, rgba(5,14,26,0.5) 60%, rgba(5,14,26,0.3) 100%)" }} />
      {/* Decorative orbs */}
      {[{ x: "10%", y: "15%", s: 300, d: 0 }, { x: "75%", y: "20%", s: 200, d: 2 }, { x: "60%", y: "70%", s: 400, d: 1 }].map((orb, i) => (
        <motion.div key={i} animate={{ y: [-15, 15, -15], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.d }}
          style={{ position: "absolute", left: orb.x, top: orb.y, width: orb.s, height: orb.s, borderRadius: "50%", background: `radial-gradient(circle, ${c.primary}25, transparent 70%)`, pointerEvents: "none" }} />
      ))}
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", padding: "0 clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 820 }}>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ background: "rgba(58,125,124,0.25)", backdropFilter: "blur(10px)", display: "inline-block", borderRadius: 30, padding: "6px 22px", marginBottom: 22, border: "1px solid rgba(58,125,124,0.4)" }}>
                <span style={{ color: "#84A59D", fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}>Welcome to Praṇa Studio</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(40px, 7.5vw, 88px)", color: "#fff", lineHeight: 1.08, marginBottom: 22, fontStyle: "italic" }}>
                {HERO_IMAGES[current].tagline.split(" ").map((word, wi) => (
                  <motion.span key={wi} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + wi * 0.07 }} style={{ display: "inline-block", marginRight: "0.3em" }}>
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ color: "rgba(255,255,255,0.78)", fontSize: "clamp(15px, 2vw, 20px)", lineHeight: 1.7, maxWidth: 520, marginBottom: 44 }}>
                {HERO_IMAGES[current].sub}
              </motion.p>
            </motion.div>
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(58,125,124,0.7)" }} whileTap={{ scale: 0.97 }}
              onClick={() => setBookingModal({ item: { name: "Free Trial Session" }, type: "class" })}
              style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", letterSpacing: 0.5 }}>
              Book Free Session →
            </motion.button>
            <motion.a whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.18)" }} href="/classes"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", transition: "background 0.2s" }}>
              Explore Classes
            </motion.a>
            {/* ── LIVE CLASSES CTA ── */}
            <LiveHeroButton onClick={() => setLiveModal(true)} />
          </motion.div>
        </div>
      </div>
      {/* Slide indicators */}
      <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, zIndex: 3 }}>
        {HERO_IMAGES.map((_, i) => (
          <motion.button key={i} onClick={() => goTo(i)} whileHover={{ scale: 1.3 }}
            style={{ width: i === current ? 32 : 8, height: 8, borderRadius: 4, background: i === current ? c.primary : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.4s ease", padding: 0 }} />
        ))}
      </div>
      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
        style={{ position: "absolute", bottom: 36, right: 48, color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", writingMode: "vertical-rl", display: "flex", alignItems: "center", gap: 8 }}>
        <span>Scroll</span>
        <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.3)" }} />
      </motion.div>
    </div>
  );
}

function HomePage({ c, setBookingModal, setLiveModal }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteKey, setQuoteKey] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [liveCurrentTime, setLiveCurrentTime] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);
  const [liveIsPlaying, setLiveIsPlaying] = useState(true);
  const liveVideoRef = useRef(null);

  const exp = useCountUp(10, 1800, statsVisible);
  const students = useCountUp(5000, 2200, statsVisible);
  const programs = useCountUp(50, 1600, statsVisible);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const nextQuote = () => { setQuoteIdx((i) => (i + 1) % QUOTES.length); setQuoteKey((k) => k + 1); };

  const formatTime = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;

  return (
    <PageWrapper>
      {/* HERO SLIDER */}
      <HeroSlider c={c} setBookingModal={setBookingModal} setLiveModal={setLiveModal} />

      {/* WHY PRANA - features strip */}
      <div style={{ background: c.card, padding: "0 clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", borderTop: `1px solid ${c.border}` }}>
          {[
            { icon: "🏅", title: "Certified Experts", desc: "8+ years avg experience" },
            { icon: "📅", title: "30+ Classes/Week", desc: "7 days, all levels" },
            { icon: "🌿", title: "Serene Space", desc: "Purpose-built sanctuary" },
            { icon: "🎯", title: "Personal Plans", desc: "Tailored to your goals" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: "32px 24px", borderRight: i < 3 ? `1px solid ${c.border}` : "none", display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <div>
                <div style={{ color: c.text, fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                <div style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CLASSES PREVIEW */}
      <div style={{ background: c.bg, padding: "90px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionTitle title="Our Signature Classes" subtitle="Each class is thoughtfully designed to guide you deeper into your practice, whatever your level." c={c} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}>
            {CLASSES.slice(0, 4).map((cls, i) => (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, boxShadow: `0 24px 60px ${cls.color}35` }}
                style={{ background: c.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${c.border}`, cursor: "pointer" }}>
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                  <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} src={cls.image} alt={cls.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: cls.color, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{cls.difficulty}</div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 20, marginBottom: 6 }}>{cls.name}</h3>
                  <p style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{cls.description.slice(0, 100)}…</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: c.textMuted }}>
                    <span>⏱ {cls.duration}</span><span>👤 {cls.instructor}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <motion.a href="/classes" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-block", background: "transparent", color: c.primary, border: `2px solid ${c.primary}`, borderRadius: 12, padding: "13px 40px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", textDecoration: "none", letterSpacing: 0.5 }}>
              View All Classes →
            </motion.a>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: c.card }}>
        <WaveDivider fill={c.card} inverted />
        <div ref={statsRef} style={{ padding: "0 clamp(24px, 8vw, 80px) 80px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ background: `linear-gradient(135deg, ${c.primary}20, ${c.accent}12)`, borderRadius: 28, padding: "64px 40px", border: `1px solid ${c.primary}25`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center" }}>
              {[{ val: exp, suffix: "+", label: "Years of Experience", icon: "📿" }, { val: students.toLocaleString(), suffix: "+", label: "Students Transformed", icon: "🧘" }, { val: programs, suffix: "+", label: "Certified Programs", icon: "🏆" }].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{stat.icon}</div>
                  <div style={{ fontFamily: "'Georgia', serif", fontSize: 58, fontWeight: 700, color: c.primary, lineHeight: 1 }}>{stat.val}{stat.suffix}</div>
                  <div style={{ color: c.textMuted, fontSize: 14, marginTop: 8, letterSpacing: 1 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS PREVIEW */}
      <div style={{ background: c.bg, padding: "90px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionTitle title="What Our Students Say" c={c} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                style={{ background: c.card, borderRadius: 20, padding: 30, border: `1px solid ${c.border}` }}>
                <StarRating rating={t.rating} c={c} />
                <p style={{ color: c.text, fontSize: 14, lineHeight: 1.85, margin: "16px 0 20px", fontStyle: "italic" }}>"{t.text.slice(0, 140)}…"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${c.primary}40` }} />
                  <div><div style={{ color: c.text, fontWeight: 700, fontSize: 14 }}>{t.name}</div><div style={{ color: c.textMuted, fontSize: 12 }}>{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* QUOTE */}
      <div style={{ background: c.card, padding: "80px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: `linear-gradient(135deg, ${c.secondary}20, ${c.accent}12)`, borderRadius: 28, padding: "64px 48px", textAlign: "center", border: `1px solid ${c.secondary}25` }}>
          <div style={{ fontSize: 36, marginBottom: 24 }}>🕉️</div>
          <AnimatePresence mode="wait">
            <motion.div key={quoteKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <p style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(18px, 3vw, 28px)", color: c.text, fontStyle: "italic", maxWidth: 640, margin: "0 auto 16px", lineHeight: 1.6 }}>"{QUOTES[quoteIdx].text}"</p>
              <p style={{ color: c.textMuted, fontSize: 14 }}>— {QUOTES[quoteIdx].author}</p>
            </motion.div>
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={nextQuote}
            style={{ marginTop: 32, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            ✨ Next Inspiration
          </motion.button>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   CLASSES PAGE
───────────────────────────────────────── */
function ClassesPage({ c, setBookingModal }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [type, setType] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];
  const types = ["All", "Hatha", "Vinyasa", "Yin", "Meditation", "Breathwork"];

  const filtered = CLASSES.filter((cls) => {
    const q = search.toLowerCase();
    const matchSearch = !q || cls.name.toLowerCase().includes(q) || cls.description.toLowerCase().includes(q) || cls.instructor.toLowerCase().includes(q);
    const matchDiff = difficulty === "All" || cls.difficulty === difficulty;
    const matchType = type === "All" || cls.type === type;
    return matchSearch && matchDiff && matchType;
  });

  return (
    <PageWrapper>
      {/* Hero banner */}
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1600&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,14,26,0.85) 0%, rgba(5,14,26,0.5) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 6vw, 60px)", color: "#fff", fontStyle: "italic", textAlign: "center" }}>Our Classes</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, textAlign: "center" }}>From gentle Yin to dynamic Power Yoga — find your perfect practice</p>
        </div>
      </div>

      <div style={{ background: c.bg, padding: "60px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Filters */}
          <div style={{ background: c.card, borderRadius: 20, padding: 28, marginBottom: 44, border: `1px solid ${c.border}`, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 260px" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.textMuted }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, instructor…"
                style={{ width: "100%", paddingLeft: 44, paddingRight: 14, padding: "11px 14px 11px 44px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {difficulties.map((d) => (
                <motion.button key={d} whileTap={{ scale: 0.95 }} onClick={() => setDifficulty(d)}
                  style={{ background: difficulty === d ? c.primary : "transparent", color: difficulty === d ? "#fff" : c.textMuted, border: `1px solid ${difficulty === d ? c.primary : c.border}`, borderRadius: 20, padding: "6px 16px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                  {d}
                </motion.button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {types.map((t) => (
                <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setType(t)}
                  style={{ background: type === t ? c.accent : "transparent", color: type === t ? "#fff" : c.textMuted, border: `1px solid ${type === t ? c.accent : c.border}`, borderRadius: 20, padding: "6px 16px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🌿</div>
                <h3 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 22 }}>No classes found</h3>
                <button onClick={() => { setSearch(""); setDifficulty("All"); setType("All"); }}
                  style={{ marginTop: 20, background: c.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: "inherit", cursor: "pointer" }}>
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 28 }}>
                {filtered.map((cls, i) => (
                  <motion.div key={cls.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.06 }} layout
                    whileHover={{ y: -8, boxShadow: `0 20px 60px ${cls.color}30` }}
                    style={{ background: c.card, borderRadius: 24, overflow: "hidden", border: `1px solid ${c.border}` }}>
                    <div style={{ position: "relative", height: 230, overflow: "hidden" }}>
                      <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} src={cls.image} alt={cls.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                      <div style={{ position: "absolute", top: 14, left: 14, background: cls.color, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>{cls.difficulty}</div>
                      <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12 }}>⏱ {cls.duration}</div>
                    </div>
                    <div style={{ padding: 28 }}>
                      <h3 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 22, marginBottom: 6 }}>{cls.name}</h3>
                      <p style={{ color: c.secondary, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>with {cls.instructor}</p>
                      <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>{expanded === cls.id ? cls.description : cls.description.slice(0, 100) + "…"}</p>
                      <AnimatePresence>
                        {expanded === cls.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 18, overflow: "hidden" }}>
                            <h4 style={{ color: c.text, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Benefits</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {cls.benefits.map((b) => (
                                <span key={b} style={{ background: `${cls.color}22`, color: cls.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{b}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div style={{ display: "flex", gap: 12 }}>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setExpanded(expanded === cls.id ? null : cls.id)}
                          style={{ flex: 1, background: "transparent", color: c.primary, border: `1px solid ${c.primary}`, borderRadius: 10, padding: "10px 0", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                          {expanded === cls.id ? "Show Less" : "Learn More"}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${c.primary}50` }} whileTap={{ scale: 0.97 }} onClick={() => setBookingModal({ item: cls, type: "class" })}
                          style={{ flex: 1, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                          Book Class
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   SCHEDULE PAGE
───────────────────────────────────────── */
function SchedulePage({ c, setBookingModal }) {
  const [dayFilter, setDayFilter] = useState("All");
  const [instrFilter, setInstrFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const instructors = ["All", ...new Set(SCHEDULE.map((s) => s.instructor))];
  const classTypes = ["All", ...new Set(SCHEDULE.map((s) => s.class))];

  const getTimeSlot = (time) => {
    const hour = parseInt(time.split(":")[0]);
    const isPM = time.includes("PM");
    const h = isPM && hour !== 12 ? hour + 12 : hour;
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    return "Evening";
  };

  const filtered = SCHEDULE.filter((s) =>
    (dayFilter === "All" || s.day === dayFilter) &&
    (instrFilter === "All" || s.instructor === instrFilter) &&
    (classFilter === "All" || s.class === classFilter) &&
    (timeFilter === "All" || getTimeSlot(s.time) === timeFilter)
  );

  const grouped = days.slice(1).reduce((acc, day) => {
    const items = filtered.filter((s) => s.day === day);
    if (items.length) acc[day] = items;
    return acc;
  }, {});

  const spotColor = (spots) => spots <= 3 ? "#e74c3c" : spots <= 6 ? "#f39c12" : c.primary;

  return (
    <PageWrapper>
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,14,26,0.85) 0%, rgba(5,14,26,0.5) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 5vw, 56px)", color: "#fff", fontStyle: "italic" }}>Weekly Schedule</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>Plan your week — 20+ sessions to choose from</p>
        </div>
      </div>

      <div style={{ background: c.bg, padding: "60px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Filters */}
          <div style={{ background: c.card, borderRadius: 20, padding: "22px 28px", marginBottom: 40, border: `1px solid ${c.border}`, display: "flex", flexWrap: "wrap", gap: 20 }}>
            {[
              { label: "Day", options: days, val: dayFilter, set: setDayFilter },
              { label: "Time Slot", options: ["All", "Morning", "Afternoon", "Evening"], val: timeFilter, set: setTimeFilter },
              { label: "Instructor", options: instructors, val: instrFilter, set: setInstrFilter },
              { label: "Class", options: classTypes, val: classFilter, set: setClassFilter },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ color: c.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{f.label}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.options.map((opt) => (
                    <button key={opt} onClick={() => f.set(opt)}
                      style={{ background: f.val === opt ? c.primary : "transparent", color: f.val === opt ? "#fff" : c.textMuted, border: `1px solid ${f.val === opt ? c.primary : c.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 28 }}>
            {Object.entries(grouped).map(([day, sessions], di) => (
              <motion.div key={day} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: di * 0.07 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <h3 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 22 }}>{day}</h3>
                  <div style={{ flex: 1, height: 1, background: c.border }} />
                  <span style={{ color: c.textMuted, fontSize: 12 }}>{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {sessions.map((s, i) => (
                    <motion.div key={i} whileHover={{ y: -4, boxShadow: `0 12px 40px ${c.primary}20` }}
                      style={{ background: c.card, borderRadius: 16, padding: 22, border: `1px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ color: c.text, fontWeight: 700, fontSize: 15 }}>{s.class}</div>
                          <div style={{ color: c.textMuted, fontSize: 12, marginTop: 3 }}>with {s.instructor}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: c.primary, fontWeight: 700, fontSize: 16 }}>{s.time}</div>
                          <div style={{ color: c.textMuted, fontSize: 12 }}>{s.duration}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                        <span style={{ color: spotColor(s.spots), fontSize: 12, fontWeight: 700 }}>
                          {s.spots <= 3 ? "⚠️ " : "✅ "}{s.spots} spots left
                        </span>
                        <motion.button whileHover={{ scale: 1.07, boxShadow: `0 0 16px ${c.primary}50` }} whileTap={{ scale: 0.95 }}
                          onClick={() => setBookingModal({ item: s, type: "schedule" })}
                          style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 8, padding: "7px 20px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                          Reserve
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <div style={{ textAlign: "center", padding: "70px 0", color: c.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <p>No classes match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   INSTRUCTORS PAGE — UPGRADED (8 INSTRUCTORS)
───────────────────────────────────────── */
function InstructorsPage({ c }) {
  const [modal, setModal] = useState(null);

  return (
    <PageWrapper>
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,14,26,0.85) 0%, rgba(5,14,26,0.5) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 6vw, 60px)", color: "#fff", fontStyle: "italic" }}>Meet Your Guides</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>World-class instructors dedicated to your transformation</p>
        </div>
      </div>

      <div style={{ background: c.bg, padding: "70px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionTitle title="Our Teaching Team" subtitle="Our instructors are not just teachers — they are guides, healers, and lifelong students of the practice." c={c} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 28 }}>
            {INSTRUCTORS.map((inst, i) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, boxShadow: `0 24px 60px ${c.primary}25` }}
                onClick={() => setModal(inst)}
                style={{ background: c.card, borderRadius: 24, overflow: "hidden", border: `1px solid ${c.border}`, cursor: "pointer" }}>
                <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
                  <motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.5 }} src={inst.image} alt={inst.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 16, right: 16, background: `${c.primary}cc`, backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                    {inst.experience} exp.
                  </div>
                  <div style={{ position: "absolute", bottom: 18, left: 18 }}>
                    <h3 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: 22, marginBottom: 2 }}>{inst.name}</h3>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{inst.title}</p>
                  </div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {inst.specialties.slice(0, 3).map((s) => (
                      <span key={s} style={{ background: `${c.primary}18`, color: c.primary, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <p style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 }}>"{inst.quote}"</p>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", background: "transparent", color: c.primary, border: `1px solid ${c.primary}`, borderRadius: 10, padding: "10px 0", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                    View Full Profile →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}
            style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 40 }} onClick={(e) => e.stopPropagation()}
              style={{ background: c.card, borderRadius: 24, maxWidth: 640, width: "100%", overflow: "hidden", border: `1px solid ${c.border}`, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                <img src={modal.image} alt={modal.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                  <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: 28, marginBottom: 4 }}>{modal.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{modal.title}</p>
                </div>
                <button onClick={() => setModal(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              <div style={{ padding: 32 }}>
                <p style={{ color: c.text, fontSize: 14, lineHeight: 1.85, marginBottom: 24 }}>{modal.bio}</p>
                <h4 style={{ color: c.text, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Certifications</h4>
                {modal.certifications.map((cert) => (
                  <div key={cert} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: c.primary, marginTop: 1 }}>✓</span>
                    <span style={{ color: c.textMuted, fontSize: 13 }}>{cert}</span>
                  </div>
                ))}
                <h4 style={{ color: c.text, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, margin: "22px 0 12px" }}>Classes Taught</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {modal.classes.map((cls) => (
                    <span key={cls} style={{ background: `${c.primary}20`, color: c.primary, borderRadius: 20, padding: "5px 16px", fontSize: 13, fontWeight: 600 }}>{cls}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   RETREATS PAGE
───────────────────────────────────────── */
function RetreatsPage({ c, setBookingModal }) {
  return (
    <PageWrapper>
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,14,26,0.85) 0%, rgba(5,14,26,0.5) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 6vw, 60px)", color: "#fff", fontStyle: "italic" }}>Yoga Retreats</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>Immersive journeys into practice, community, and nature</p>
        </div>
      </div>

      <div style={{ background: c.bg, padding: "70px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gap: 44 }}>
            {RETREATS.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: c.card, borderRadius: 28, overflow: "hidden", border: `1px solid ${c.border}`, display: "grid", gridTemplateColumns: "minmax(300px, 45%) 1fr" }}>
                <div style={{ position: "relative", minHeight: 360, overflow: "hidden" }}>
                  <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.2), transparent)" }} />
                  <div style={{ position: "absolute", top: 18, left: 18, background: c.primary, color: "#fff", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700 }}>{r.duration}</div>
                  <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                    <div style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 16px" }}>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 4 }}>👤 Led by</div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.instructor}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "36px 36px 36px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ color: c.textMuted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>📍 {r.location}</div>
                    <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: c.text, lineHeight: 1.2 }}>{r.name}</h3>
                  </div>
                  <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.8, flex: 1 }}>{r.description}</p>
                  <div>
                    <h4 style={{ color: c.text, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>What's Included</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {r.includes.slice(0, 4).map((item) => (
                        <div key={item} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ color: c.primary, fontSize: 13 }}>🌿</span>
                          <span style={{ color: c.textMuted, fontSize: 12 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: `${c.primary}12`, borderRadius: 14, border: `1px solid ${c.primary}20` }}>
                    <div style={{ color: c.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Starts In</div>
                    <CountdownTimer targetDate={r.date} c={c} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: c.primary, fontFamily: "'Georgia', serif", fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{r.price}</div>
                      <div style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>per person · {r.capacity} spots only</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05, boxShadow: `0 0 28px ${c.primary}60` }} whileTap={{ scale: 0.97 }} onClick={() => setBookingModal({ item: r, type: "retreat" })}
                      style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                      Book Retreat
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   PRICING PAGE
───────────────────────────────────────── */
function PricingPage({ c, setBookingModal }) {
  return (
    <PageWrapper>
      <div style={{ background: c.bg, padding: "80px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionTitle title="Simple, Honest Pricing" subtitle="Choose the plan that fits your practice. No hidden fees, no long-term lock-ins." c={c} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                style={{ background: plan.highlighted ? `linear-gradient(145deg, ${c.primary}, ${c.secondary})` : c.card, borderRadius: 28, padding: 40, border: plan.highlighted ? "none" : `1px solid ${c.border}`, position: "relative", overflow: "hidden", boxShadow: plan.highlighted ? `0 24px 70px ${c.primary}45` : "none" }}>
                {plan.highlighted && (
                  <>
                    <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 700, letterSpacing: 1 }}>✨ MOST POPULAR</div>
                  </>
                )}
                <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: plan.highlighted ? "#fff" : c.text, marginBottom: 10, fontStyle: "italic" }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 28 }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: 52, fontWeight: 700, color: plan.highlighted ? "#fff" : c.primary, lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.65)" : c.textMuted, marginBottom: 8, fontSize: 14 }}>{plan.period}</span>
                </div>
                <div style={{ marginBottom: 32 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.9)" : c.primary, fontSize: 15, flexShrink: 0 }}>✓</span>
                      <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.85)" : c.textMuted, fontSize: 14 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setBookingModal({ item: { name: plan.name + " Membership" }, type: "class" })}
                  style={{ width: "100%", background: plan.highlighted ? "rgba(255,255,255,0.22)" : `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: plan.highlighted ? "1px solid rgba(255,255,255,0.4)" : "none", borderRadius: 14, padding: "15px 0", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ marginTop: 48, textAlign: "center", background: c.card, borderRadius: 20, padding: 36, border: `1px solid ${c.border}` }}>
            <p style={{ color: c.text, fontSize: 18, marginBottom: 8, fontFamily: "'Georgia', serif" }}>🎁 First class is always <em>free</em></p>
            <p style={{ color: c.textMuted, fontSize: 14 }}>Try any class before you commit. No credit card required for your first session.</p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS PAGE
───────────────────────────────────────── */
function TestimonialsPage({ c }) {
  const [carouselIdx, setCarouselIdx] = useState(0);

  return (
    <PageWrapper>
      <div style={{ background: c.bg, padding: "80px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* About */}
          <div style={{ background: c.card, borderRadius: 28, padding: "44px 40px", marginBottom: 60, border: `1px solid ${c.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
            <div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 34, color: c.text, marginBottom: 18, fontStyle: "italic" }}>About Praṇa Studio</h2>
              <p style={{ color: c.textMuted, fontSize: 15, lineHeight: 1.85, marginBottom: 16 }}>Founded in 2015, Praṇa Studio was born from a simple but powerful belief: that everyone deserves a space to breathe, heal, and grow.</p>
              <p style={{ color: c.primary, fontSize: 15, lineHeight: 1.85, fontStyle: "italic", marginBottom: 24 }}>"Our mission is to create a peaceful space for holistic wellness — where ancient wisdom meets modern living."</p>
              <div style={{ display: "flex", gap: 32 }}>
                {[["2015", "Founded"], ["3", "Studios"], ["5,000+", "Students"]].map(([val, label]) => (
                  <div key={label}><div style={{ fontFamily: "'Georgia', serif", fontSize: 30, color: c.primary, fontWeight: 700 }}>{val}</div><div style={{ color: c.textMuted, fontSize: 12 }}>{label}</div></div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80" alt="Studio" style={{ width: "100%", height: 260, objectFit: "cover" }} />
            </div>
          </div>

          {/* Carousel */}
          <SectionTitle title="Student Stories" subtitle="Real experiences from real people whose lives have been transformed." c={c} />
          <div style={{ position: "relative", marginBottom: 60 }}>
            <AnimatePresence mode="wait">
              <motion.div key={carouselIdx} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                style={{ background: c.card, borderRadius: 24, padding: 44, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 48, color: c.primary, fontFamily: "'Georgia', serif", lineHeight: 1, marginBottom: 20, opacity: 0.4 }}>"</div>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <img src={TESTIMONIALS[carouselIdx].avatar} alt={TESTIMONIALS[carouselIdx].name} style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: `3px solid ${c.primary}50`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <StarRating rating={TESTIMONIALS[carouselIdx].rating} c={c} />
                    <p style={{ color: c.text, fontSize: 17, lineHeight: 1.85, margin: "16px 0", fontStyle: "italic" }}>"{TESTIMONIALS[carouselIdx].text}"</p>
                    <div><div style={{ color: c.text, fontWeight: 700, fontSize: 15 }}>{TESTIMONIALS[carouselIdx].name}</div><div style={{ color: c.textMuted, fontSize: 13 }}>{TESTIMONIALS[carouselIdx].role}</div></div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28 }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCarouselIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "50%", width: 46, height: 46, cursor: "pointer", color: c.text, fontSize: 18 }}>←</motion.button>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {TESTIMONIALS.map((_, i) => (
                  <div key={i} onClick={() => setCarouselIdx(i)} style={{ width: i === carouselIdx ? 28 : 8, height: 8, borderRadius: 4, background: i === carouselIdx ? c.primary : c.border, cursor: "pointer", transition: "all 0.3s" }} />
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCarouselIdx((i) => (i + 1) % TESTIMONIALS.length)}
                style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "50%", width: 46, height: 46, cursor: "pointer", color: c.text, fontSize: 18 }}>→</motion.button>
            </div>
          </div>

          {/* All testimonials grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: c.card, borderRadius: 20, padding: 28, border: `1px solid ${c.border}` }}>
                <StarRating rating={t.rating} c={c} />
                <p style={{ color: c.text, fontSize: 14, lineHeight: 1.8, margin: "14px 0 18px", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                  <div><div style={{ color: c.text, fontWeight: 700, fontSize: 14 }}>{t.name}</div><div style={{ color: c.textMuted, fontSize: 12 }}>{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   CONTACT PAGE
───────────────────────────────────────── */
function ContactPage({ c }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [newsletter, setNewsletter] = useState("");
  const [nlSub, setNlSub] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.message.trim() || form.message.length < 10) e.message = "Please write at least 10 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSubmitted(true);
    // Fire contact notification
    emitBookingNotification({
      id: Date.now(),
      icon: "🕊️",
      msg: `Message sent! Thank you, ${form.name.split(" ")[0]}`,
      sub: "We'll get back to you within 24 hours · Praṇa Studio",
      isContact: true,
    });
    setTimeout(() => {
      emitBookingNotification({
        id: Date.now() + 1,
        icon: "📬",
        msg: "We received your wellness inquiry",
        sub: "Our team will contact you shortly 🌿",
        isContact: true,
      });
    }, 2800);
  };
  const inp = { background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 16px", color: c.text, width: "100%", outline: "none", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <PageWrapper>
      <div style={{ background: c.bg, padding: "80px clamp(24px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionTitle title="Get In Touch" subtitle="Whether you're a beginner or a seasoned practitioner, we're here to help you find your path." c={c} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, marginBottom: 70 }}>
            <div style={{ background: c.card, borderRadius: 24, padding: 40, border: `1px solid ${c.border}` }}>
              <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: c.text, marginBottom: 28, fontStyle: "italic" }}>Send Us a Message</h3>
              {!submitted ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <input style={{ ...inp, borderColor: errors.name ? "#e74c3c" : c.border }} placeholder="Your Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <input style={{ ...inp, borderColor: errors.email ? "#e74c3c" : c.border }} placeholder="Email Address *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    {errors.email && <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
                  </div>
                  <input style={inp} placeholder="Phone Number (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <div>
                    <textarea style={{ ...inp, height: 140, resize: "vertical", borderColor: errors.message ? "#e74c3c" : c.border }} placeholder="Your Message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    {errors.message && <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{errors.message}</p>}
                  </div>
                  <motion.button whileHover={{ scale: 1.02, boxShadow: `0 10px 32px ${c.primary}50` }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                    style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 12, padding: "15px 0", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                    Send Message 🕊️
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "48px 0" }}>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: 64, marginBottom: 16 }}>🌸</motion.div>
                  <h3 style={{ color: c.primary, fontFamily: "'Georgia', serif", fontSize: 26, marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: c.textMuted }}>We'll get back to you within 24 hours.</p>
                </motion.div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: c.card, borderRadius: 20, padding: 30, border: `1px solid ${c.border}` }}>
                <h4 style={{ color: c.text, fontFamily: "'Georgia', serif", fontSize: 20, marginBottom: 20, fontStyle: "italic" }}>Visit Us</h4>
                {[["📍", "42 Lotus Lane, Jayanagar, Bengaluru — 560011"], ["📞", "+91 80 4567 8900"], ["✉️", "hello@pranastudio.in"], ["🕐", "Mon–Fri: 5:30 AM – 9:00 PM | Weekends: 7:00 AM – 6:00 PM"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <span style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: c.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${c.border}`, flex: 1, minHeight: 200 }}>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5949!2d77.5832!3d12.9259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae158a4a4bd3c3%3A0xf44bcfdba2c9!2sJayanagar%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%" height="220" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Prana Studio Map" />
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 70 }}>
            <SectionTitle title="Frequently Asked Questions" c={c} />
            {FAQ.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: c.card, borderRadius: 16, marginBottom: 12, border: `1px solid ${c.border}`, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", background: "transparent", border: "none", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ color: c.text, fontSize: 15, fontWeight: 600, textAlign: "left" }}>{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} style={{ color: c.primary, fontSize: 20, flexShrink: 0 }}>⌄</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                      <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.85, padding: "0 28px 22px" }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ background: `linear-gradient(135deg, ${c.primary}22, ${c.accent}14)`, borderRadius: 28, padding: "56px 44px", textAlign: "center", border: `1px solid ${c.primary}28` }}>
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: c.text, marginBottom: 12, fontStyle: "italic" }}>🌸 Join Our Wellness Newsletter</h3>
            <p style={{ color: c.textMuted, fontSize: 15, marginBottom: 28 }}>Weekly yoga tips, retreat updates, and exclusive offers — straight to your inbox.</p>
            {!nlSub ? (
              <div style={{ display: "flex", gap: 12, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
                <input value={newsletter} onChange={(e) => setNewsletter(e.target.value)} placeholder="your@email.com"
                  style={{ flex: "1 1 240px", padding: "13px 18px", borderRadius: 10, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => newsletter && setNlSub(true)}
                  style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Subscribe
                </motion.button>
              </div>
            ) : (
              <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: c.primary, fontSize: 18, fontWeight: 600 }}>🎉 Welcome to the Praṇa community!</motion.p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer({ c }) {
  return (
    <footer style={{ background: c.card, borderTop: `1px solid ${c.border}`, padding: "60px clamp(24px, 8vw, 80px) 36px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 36, marginBottom: 44 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>☸️</span>
              <span style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: c.primary, fontStyle: "italic" }}>Praṇa</span>
            </div>
            <p style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.85 }}>A space for holistic wellness, ancient wisdom, and modern healing. Founded 2015, Bengaluru.</p>
          </div>
          {[
            { title: "Practice", links: ["Hatha Yoga", "Vinyasa Flow", "Yin Yoga", "Meditation", "Pranayama"] },
            { title: "Studio", links: ["About Us", "Instructors", "Retreats", "Pricing", "Testimonials"] },
            { title: "Connect", links: ["Instagram", "YouTube", "Spotify Playlist", "Newsletter", "WhatsApp"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 style={{ color: c.text, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 18 }}>{section.title}</h4>
              {section.links.map((link) => (
                <div key={link} style={{ color: c.textMuted, fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = c.primary}
                  onMouseLeave={(e) => e.target.style.color = c.textMuted}>
                  {link}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ color: c.textMuted, fontSize: 12 }}>© 2025 Praṇa Yoga & Wellness Studio · Bengaluru, India · All rights reserved</p>
          <p style={{ color: c.textMuted, fontSize: 12 }}>Made with 🌿 & ☮️ in India</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   FLOATING ACTION BUTTONS (WhatsApp, Back-to-Top, Book Now)
───────────────────────────────────────── */
function FloatingButtons({ c, setBookingModal }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 500, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          {/* WhatsApp */}
          <motion.a initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ delay: 0.1 }}
            href="https://wa.me/918045678900" target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.15, boxShadow: "0 0 30px rgba(37,211,102,0.7)" }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: "#25D366", textDecoration: "none", boxShadow: "0 4px 20px rgba(37,211,102,0.5)", fontSize: 24 }}
            aria-label="WhatsApp">
            💬
          </motion.a>

          {/* Book Now */}
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ delay: 0.05 }}
            onClick={() => setBookingModal({ item: { name: "Free Trial Session" }, type: "class" })}
            whileHover={{ scale: 1.08, boxShadow: `0 0 36px ${c.primary}80` }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, border: "none", cursor: "pointer", boxShadow: `0 6px 24px ${c.primary}55`, fontSize: 26 }}
            aria-label="Book a session">
            🧘
          </motion.button>

          {/* Back to top */}
          <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            whileHover={{ scale: 1.12, boxShadow: `0 0 24px ${c.primary}60` }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: "50%", background: c.card, border: `1px solid ${c.border}`, cursor: "pointer", color: c.primary, fontSize: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
            aria-label="Back to top">
            ↑
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   APP ROOT
───────────────────────────────────────── */
function AppInner() {
  const { dark, toggle, colors: c } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const [liveModal, setLiveModal] = useState(false);
  const location = useLocation();

  return (
    <div style={{ background: c.bg, minHeight: "100vh", width: "100%", transition: "background 0.4s, color 0.4s", fontFamily: "'Palatino Linotype', Georgia, serif", overflowX: "hidden" }}>
      <GlobalStyles />
      <AnimatePresence>{!loaded && <Loader onDone={() => setLoaded(true)} />}</AnimatePresence>
      {loaded && (
        <>
          <ScrollProgress c={c} />
          <Navbar c={c} dark={dark} toggleDark={toggle} setBookingModal={setBookingModal} />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage c={c} setBookingModal={setBookingModal} setLiveModal={setLiveModal} />} />
              <Route path="/classes" element={<ClassesPage c={c} setBookingModal={setBookingModal} />} />
              <Route path="/schedule" element={<SchedulePage c={c} setBookingModal={setBookingModal} />} />
              <Route path="/instructors" element={<InstructorsPage c={c} />} />
              <Route path="/retreats" element={<RetreatsPage c={c} setBookingModal={setBookingModal} />} />
              <Route path="/pricing" element={<PricingPage c={c} setBookingModal={setBookingModal} />} />
              <Route path="/testimonials" element={<TestimonialsPage c={c} />} />
              <Route path="/contact" element={<ContactPage c={c} />} />
            </Routes>
          </AnimatePresence>
          <Footer c={c} />
          <FloatingButtons c={c} setBookingModal={setBookingModal} />
          <NotificationSystem />
          <AnimatePresence>
            {bookingModal && <BookingModal item={bookingModal.item} type={bookingModal.type} onClose={() => setBookingModal(null)} c={c} />}
          </AnimatePresence>
          <AnimatePresence>
            {liveModal && <LiveClassModal onClose={() => setLiveModal(false)} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}