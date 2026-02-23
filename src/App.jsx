import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  House, User, Scan, ShareNetwork, Heart, Gear, SquaresFour, 
  CaretLeft, PencilSimple, Plus, Lightning, 
  Moon, X, Sparkle, PawPrint, Fire, MagnifyingGlassPlus, MagnifyingGlassMinus, Check, FloppyDisk, Info, UsersThree, CalendarBlank, List,
  WifiHigh, BatteryFull, CellSignalFull, Ghost,
  Path, Star, Heartbeat, Syringe, SmileyWink, Trophy, Camera, TextT, DotsThree, Trash
} from '@phosphor-icons/react';

// --- GLOBAL STYLES ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
  
  * { font-family: 'Nunito', sans-serif; }
  .font-display { font-family: 'Fraunces', Georgia, serif; }

  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pawprint { 0% { opacity: 0; transform: scale(0.5) rotate(-10deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: scale(1.2) rotate(5deg); } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-shimmer { background: linear-gradient(90deg, #f0ebe3 25%, #faf6f0 50%, #f0ebe3 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
  .animate-spin-slow { animation: spin-slow 3s linear infinite; }
  
  .pet-card-shadow { box-shadow: 0 8px 32px -8px rgba(180,120,80,0.18), 0 2px 8px -2px rgba(180,120,80,0.10); }
  .warm-glow { box-shadow: 0 0 40px -10px rgba(255,180,80,0.25); }
  
  input:focus, select:focus { outline: 2px solid #E8A87C; outline-offset: 2px; }
  
  .grain-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
  }
`;

// --- MOTION CONFIG ---
const smoothSpring = { type: "spring", stiffness: 110, damping: 18, mass: 1.0 };
const tapAnimation = { scale: 0.92 };
const containerVariants = { 
  hidden: { opacity: 0 }, 
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } 
};
const itemVariants = { 
  hidden: { opacity: 0, y: 16, scale: 0.97 }, 
  show: { opacity: 1, y: 0, scale: 1, transition: smoothSpring } 
};

// --- COLOR PALETTE ---
const COLORS = {
  cream: '#FDF6EC',
  warmBg: '#F5EDE0',
  terracotta: '#C4714A',
  peach: '#E8A87C',
  sage: '#7BAE8A',
  blush: '#E8A0A0',
  slate: '#3D3530',
  muted: '#9B8E85',
  cardBg: '#FFFAF4',
};

// --- HELPER FUNCTIONS ---
const getCroppedImg = async (imageSrc, zoom, offset) => {
  const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 600;
  canvas.width = size; canvas.height = size;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, size, size);
  ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI); ctx.closePath(); ctx.clip();
  const scale = Math.max(size / image.width, size / image.height) * zoom;
  const w = image.width * scale; const h = image.height * scale;
  const uiSize = 250; const ratio = size / uiSize;
  const x = (size - w) / 2 + (offset.x * ratio);
  const y = (size - h) / 2 + (offset.y * ratio);
  ctx.drawImage(image, x, y, w, h);
  return canvas.toDataURL('image/jpeg', 0.9);
};

const drawRoundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x + r, y + h);
  ctx.closePath();
};

const generateShareCard = async (pet, petImage) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const W = 900, H = 1200;
    canvas.width = W; canvas.height = H;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FDF6EC');
    bgGrad.addColorStop(0.5, '#F5EDE0');
    bgGrad.addColorStop(1, '#EDD9C0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.fillStyle = 'rgba(232, 168, 124, 0.12)';
    ctx.beginPath(); ctx.arc(W - 80, 80, 160, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(123, 174, 138, 0.10)';
    ctx.beginPath(); ctx.arc(60, H - 100, 200, 0, Math.PI * 2); ctx.fill();

    // Card border/shadow effect
    ctx.shadowColor = 'rgba(180, 120, 80, 0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    drawRoundedRect(ctx, 40, 40, W - 80, H - 80, 48);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Card border
    ctx.strokeStyle = 'rgba(237, 227, 216, 0.9)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 40, 40, W - 80, H - 80, 48);
    ctx.stroke();

    // Header bar
    const headerGrad = ctx.createLinearGradient(40, 40, W - 40, 40);
    headerGrad.addColorStop(0, '#C4714A');
    headerGrad.addColorStop(1, '#E8A87C');
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    ctx.moveTo(88, 40); ctx.lineTo(W - 88, 40);
    ctx.quadraticCurveTo(W - 40, 40, W - 40, 88);
    ctx.lineTo(W - 40, 175);
    ctx.lineTo(40, 175);
    ctx.lineTo(40, 88);
    ctx.quadraticCurveTo(40, 40, 88, 40);
    ctx.closePath();
    ctx.fill();

    // PAWERFUL logo text
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('🐾 PAWERFUL', 78, 95);
    ctx.font = '16px Helvetica, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('PET IDENTITY CARD', 78, 125);

    // ID badge on right
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    drawRoundedRect(ctx, W - 190, 65, 135, 85, 16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PET ID', W - 122, 96);
    ctx.font = 'bold 28px Courier New, monospace';
    ctx.fillText(`#${pet.stableId || '----'}`, W - 122, 130);

    // Pet photo - circular
    const photoSize = 220;
    const photoX = 78, photoY = 200;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = petImage;
    await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 3000); });

    // Photo shadow
    ctx.shadowColor = 'rgba(180, 120, 80, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Clip and draw photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
    ctx.restore();

    // Vibe badge on photo
    const vibeColors = { zoom: '#E05A5A', chill: '#5B8DB8', sleep: '#5B8DB8', love: '#D47A8A', happy: '#D47A8A', sass: '#C4914A', judge: '#C4914A' };
    let vibeColor = '#6A9E7A';
    const modeL = (pet.mode || '').toLowerCase();
    Object.keys(vibeColors).forEach(k => { if (modeL.includes(k)) vibeColor = vibeColors[k]; });

    ctx.fillStyle = vibeColor;
    drawRoundedRect(ctx, photoX, photoY + photoSize - 48, photoSize, 48, 24);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((pet.mode || 'Unknown Vibe').toUpperCase().slice(0, 22), photoX + photoSize / 2, photoY + photoSize - 20);

    // Pet info section - right of photo
    const infoX = 330, infoY = 215;
    ctx.textAlign = 'left';

    ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#9B8E85';
    ctx.fillText('NAME', infoX, infoY);
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillStyle = '#3D3530';
    ctx.fillText(pet.name || 'Unknown', infoX, infoY + 38);

    ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#9B8E85';
    ctx.fillText('BREED', infoX, infoY + 70);
    ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#5A4A40';
    ctx.fillText(pet.breed || 'Unknown', infoX, infoY + 95);

    // Details grid
    const details = [
      { label: 'AGE', value: (pet.details?.age || '?') + ' yrs' },
      { label: 'GENDER', value: pet.details?.gender || 'Pet' },
      { label: 'HUMANS', value: pet.humanSafe === 'green' ? 'Friendly ✓' : 'Cautious' },
      { label: 'DOGS', value: pet.dogSafe === 'green' ? 'Chill ✓' : 'Reactive' },
    ];
    details.forEach((d, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const dx = infoX + col * 220, dy = infoY + 120 + row * 65;
      ctx.font = 'bold 10px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#9B8E85';
      ctx.fillText(d.label, dx, dy);
      ctx.font = 'bold 17px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#3D3530';
      ctx.fillText(d.value, dx, dy + 22);
    });

    // Stats section
    const statsY = 460;
    ctx.fillStyle = '#F5EDE0';
    drawRoundedRect(ctx, 78, statsY, W - 156, 140, 24);
    ctx.fill();
    ctx.strokeStyle = '#EDE3D8';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 78, statsY, W - 156, 140, 24);
    ctx.stroke();

    ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#9B8E85';
    ctx.textAlign = 'center';
    ctx.fillText('PET STATS', W / 2, statsY + 28);

    const stats = pet.stats && pet.stats.length > 0 ? pet.stats : [
      { label: 'Vibe', value: 85 }, { label: 'Sass', value: 70 }, { label: 'Energy', value: 60 }
    ];
    const statSpacing = (W - 156) / stats.length;
    stats.forEach((stat, i) => {
      const sx = 78 + statSpacing * i + statSpacing / 2;
      // Bar
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      drawRoundedRect(ctx, sx - 30, statsY + 50, 60, 14, 7);
      ctx.fill();
      ctx.fillStyle = vibeColor;
      const barW = Math.max(8, (stat.value / 100) * 60);
      drawRoundedRect(ctx, sx - 30, statsY + 50, barW, 14, 7);
      ctx.fill();
      ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#3D3530';
      ctx.fillText(stat.value, sx, statsY + 105);
      ctx.font = 'bold 10px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#9B8E85';
      ctx.fillText(stat.label.toUpperCase(), sx, statsY + 122);
    });

    // Diary section
    if (pet.diary) {
      const diaryY = statsY + 160;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      drawRoundedRect(ctx, 78, diaryY, W - 156, 120, 20);
      ctx.fill();
      ctx.font = 'italic bold 15px Georgia, serif';
      ctx.fillStyle = '#5A4A40';
      ctx.textAlign = 'left';
      const diaryText = `"${pet.diary}"`;
      // Word wrap
      const maxW = W - 200;
      const words = diaryText.split(' ');
      let line = '', lineY = diaryY + 30;
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && line) {
          ctx.fillText(line, 98, lineY);
          line = word + ' ';
          lineY += 26;
        } else {
          line = testLine;
        }
      });
      if (lineY < diaryY + 110) ctx.fillText(line, 98, lineY);
    }

    // Footer CTA
    const footerY = H - 175;
    const ctaGrad = ctx.createLinearGradient(78, footerY, W - 78, footerY);
    ctaGrad.addColorStop(0, '#C4714A');
    ctaGrad.addColorStop(1, '#E8A87C');
    ctx.fillStyle = ctaGrad;
    drawRoundedRect(ctx, 78, footerY, W - 156, 80, 40);
    ctx.fill();
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 Try Pawerful — Scan Your Pet\'s Vibe', W / 2, footerY + 34);
    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('pawerful.app', W / 2, footerY + 58);

    // Date watermark
    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#C4B8B0';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, W / 2, H - 60);

    const link = document.createElement('a');
    link.download = `pawerful-id-${pet.name || 'pet'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error("Share failed", e);
    alert("Could not generate card. Please try again.");
  }
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

// --- DATA ---
const MOCK_FEED_POSTS = [
  { id: 1, title: "Sunday Park Vibes", user: "Tia & Pika", likes: "1.2k", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tia" },
  { id: 2, title: "Does this bandana make me look tough?", user: "Max_The_Bulldog", likes: "856", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max" },
  { id: 3, title: "Nap time is sacred time.", user: "Luna_Cat", likes: "2.1k", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna" },
  { id: 4, title: "Zoomies caught on camera!", user: "Cooper_Goldie", likes: "3.4k", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper" },
  { id: 5, title: "Judging you silently.", user: "Sassy_Siamese", likes: "900", image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&q=80", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sassy" }
];

const TRENDS_DATA = [
  { id: 'goldens', type: 'dog', title: "Golden Retrievers", members: "12.5k", color: "bg-amber-400", image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&q=80" },
  { id: 'shiba', type: 'dog', title: "Shiba Squad", members: "42k", color: "bg-orange-400", image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80" },
  { id: 'zoomies', type: 'dog', title: "Zoomie Zone", members: "8k", color: "bg-red-400", image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&q=80" },
  { id: 'orange', type: 'cat', title: "Orange Cat Energy", members: "8.2k", color: "bg-amber-400", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80" },
  { id: 'voids', type: 'cat', title: "The Voids", members: "15k", color: "bg-slate-700", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80" },
  { id: 'british', type: 'cat', title: "British Shorthair", members: "20k", color: "bg-stone-400", image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80" },
  { id: 'nappers', type: 'cat', title: "Professional Nappers", members: "22k", color: "bg-sky-400", image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&q=80" },
];

const getVibeTheme = (modeString = "") => {
  const mode = modeString.toLowerCase();
  if (mode.includes("zoom")) return { bg: "bg-gradient-to-br from-[#E05A5A] to-[#B33A3A]", accent: "#E05A5A", line: "bg-red-200", text: "text-white", desc: "Pure kinetic energy.", fact: "FRAP: Frenetic Random Activity Periods.", Icon: Lightning };
  if (mode.includes("chill") || mode.includes("sleep") || mode.includes("calm") || mode.includes("nap")) return { bg: "bg-gradient-to-br from-[#5B8DB8] to-[#2E5F8A]", accent: "#5B8DB8", line: "bg-blue-200", text: "text-white", desc: "Recharging batteries.", fact: "Cats sleep 12-16 hours a day on average.", Icon: Moon };
  if (mode.includes("love") || mode.includes("happy") || mode.includes("cuddle")) return { bg: "bg-gradient-to-br from-[#D47A8A] to-[#A8546A]", accent: "#D47A8A", line: "bg-pink-200", text: "text-white", desc: "Maximum serotonin.", fact: "Slow blinking is a cat's way of saying 'I trust you'.", Icon: Heart };
  if (mode.includes("side-eye") || mode.includes("sass") || mode.includes("judge")) return { bg: "bg-gradient-to-br from-[#C4914A] to-[#9A6830]", accent: "#C4914A", line: "bg-amber-200", text: "text-white", desc: "100% pure judgment.", fact: "Side-eye is actually a sign of high emotional intelligence.", Icon: Sparkle };
  return { bg: "bg-gradient-to-br from-[#6A9E7A] to-[#4A7A5A]", accent: "#6A9E7A", line: "bg-green-200", text: "text-white", desc: `A distinct ${modeString} energy.`, fact: "Pets communicate almost entirely through body language.", Icon: PawPrint };
};

// --- JOURNEY FEATURE ---
const EVENT_TYPES = [
  { id: 'milestone', label: 'Milestone', Icon: Trophy, color: '#C4914A', bg: '#FEF3E2', border: '#FDDFA0' },
  { id: 'funny', label: 'Funny Moment', Icon: SmileyWink, color: '#D47A8A', bg: '#FEF0F3', border: '#F9C8D2' },
  { id: 'health', label: 'Health', Icon: Syringe, color: '#5B8DB8', bg: '#EEF4FB', border: '#BDD4ED' },
  { id: 'mood', label: 'Mood', Icon: Heartbeat, color: '#7BAE8A', bg: '#EEF7F1', border: '#B8DEC3' },
];

const getEventType = (id) => EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[0];

// Add Journey entry form modal
const AddJourneyModal = ({ savedPets, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPet, setSelectedPet] = useState(savedPets[0]?.name || '');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [isBig, setIsBig] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const uniquePetNames = [...new Set(savedPets.map(p => p.name).filter(Boolean))];

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now(),
      type: selectedType?.id || 'milestone',
      petName: selectedPet,
      title: title.trim(),
      story: story.trim(),
      isBig,
      date,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(30,15,5,0.55)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={smoothSpring}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-[36px] overflow-hidden"
        style={{ background: COLORS.cream, maxHeight: '88%' }}>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full opacity-25" style={{ background: COLORS.slate }}></div>
        </div>

        <div className="px-6 pb-10 overflow-y-auto scrollbar-hide" style={{ maxHeight: '80vh' }}>
          <div className="flex justify-between items-center mb-6 pt-2">
            <h2 className="font-display text-2xl font-black" style={{ color: COLORS.slate }}>
              {step === 1 ? 'What happened?' : 'Tell the story'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ background: '#EDE3D8' }}>
              <X weight="bold" className="w-4 h-4" style={{ color: COLORS.slate }} />
            </button>
          </div>

          {step === 1 && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.muted }}>Type of Moment</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {EVENT_TYPES.map(type => (
                  <motion.button key={type.id} variants={itemVariants} whileTap={tapAnimation}
                    onClick={() => setSelectedType(type)}
                    className="p-4 rounded-[20px] flex flex-col items-start gap-2 transition-all"
                    style={{
                      background: selectedType?.id === type.id ? type.bg : COLORS.cardBg,
                      border: `2px solid ${selectedType?.id === type.id ? type.border : '#EDE3D8'}`,
                      boxShadow: selectedType?.id === type.id ? `0 4px 16px -4px ${type.color}40` : 'none'
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: type.bg, border: `1.5px solid ${type.border}` }}>
                      <type.Icon weight="fill" className="w-5 h-5" style={{ color: type.color }} />
                    </div>
                    <span className="font-black text-sm" style={{ color: COLORS.slate }}>{type.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="p-4 rounded-[20px] flex items-center justify-between"
                style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
                <div>
                  <p className="font-black text-sm" style={{ color: COLORS.slate }}>Big Milestone?</p>
                  <p className="text-[10px] font-semibold" style={{ color: COLORS.muted }}>Shows as a large feature card</p>
                </div>
                <button onClick={() => setIsBig(!isBig)}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: isBig ? COLORS.terracotta : '#EDE3D8' }}>
                  <motion.div animate={{ x: isBig ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    style={{ left: 0 }} transition={smoothSpring} />
                </button>
              </div>

              <motion.button whileTap={tapAnimation} onClick={() => selectedType && setStep(2)}
                className="w-full font-bold py-4 rounded-full text-white mt-2"
                style={{
                  background: selectedType ? COLORS.terracotta : '#C4B8B0',
                  boxShadow: selectedType ? '0 4px 20px -6px rgba(196,113,74,0.5)' : 'none',
                  transition: 'all 0.3s'
                }}>
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {uniquePetNames.length > 1 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>For which pet?</p>
                  <div className="flex gap-2 flex-wrap">
                    {uniquePetNames.map(name => (
                      <button key={name} onClick={() => setSelectedPet(name)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={{
                          background: selectedPet === name ? COLORS.terracotta : COLORS.cardBg,
                          color: selectedPet === name ? 'white' : COLORS.muted,
                          border: `1.5px solid ${selectedPet === name ? COLORS.terracotta : '#EDE3D8'}`
                        }}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>Date</p>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full p-3.5 rounded-2xl font-bold text-sm"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: COLORS.slate }} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>Title</p>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder={selectedType?.id === 'milestone' ? 'e.g. First time at the beach!' :
                               selectedType?.id === 'funny' ? 'e.g. Stole my sandwich again' :
                               selectedType?.id === 'health' ? 'e.g. Annual vet checkup' : 'e.g. Super cuddly today'}
                  className="w-full p-3.5 rounded-2xl font-bold text-sm"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: COLORS.slate }}
                  autoFocus />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.muted }}>Story (optional)</p>
                <textarea value={story} onChange={e => setStory(e.target.value)}
                  placeholder="What exactly happened? The more detail, the better the memory..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl font-semibold text-sm resize-none"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: COLORS.slate }} />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)}
                  className="px-5 py-4 rounded-full font-bold text-sm"
                  style={{ background: '#EDE3D8', color: COLORS.muted }}>
                  Back
                </button>
                <motion.button whileTap={tapAnimation} onClick={handleSave}
                  disabled={!title.trim()}
                  className="flex-1 font-bold py-4 rounded-full text-white"
                  style={{
                    background: title.trim() ? COLORS.terracotta : '#C4B8B0',
                    boxShadow: title.trim() ? '0 4px 20px -6px rgba(196,113,74,0.5)' : 'none'
                  }}>
                  Save Memory
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Big milestone card
const MilestoneCard = ({ entry, onDelete }) => {
  const eventType = getEventType(entry.type);
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div variants={itemVariants} className="relative mb-5 rounded-[28px] overflow-hidden pet-card-shadow"
      style={{ background: eventType.bg, border: `2px solid ${eventType.border}` }}>
      <div className="h-1.5 w-full" style={{ background: eventType.color, opacity: 0.7 }}></div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${eventType.border}` }}>
              <eventType.Icon weight="fill" className="w-5 h-5" style={{ color: eventType.color }} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: eventType.color }}>
                {eventType.label}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: COLORS.muted }}>{entry.petName}</span>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.6)' }}>
              <DotsThree weight="bold" className="w-4 h-4" style={{ color: COLORS.muted }} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 rounded-2xl overflow-hidden z-10 pet-card-shadow"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', minWidth: 120 }}>
                  <button onClick={() => { onDelete(entry.id); setShowMenu(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-2"
                    style={{ color: '#C4514A' }}>
                    <Trash weight="bold" className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <h3 className="font-display text-2xl font-black mb-2 leading-tight" style={{ color: COLORS.slate }}>
          {entry.title}
        </h3>
        {entry.story && (
          <p className="text-sm font-semibold leading-relaxed mb-3" style={{ color: '#6A5A50' }}>
            {entry.story}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-3">
          <CalendarBlank weight="fill" className="w-3 h-3" style={{ color: eventType.color }} />
          <span className="text-[10px] font-bold" style={{ color: COLORS.muted }}>{formattedDate}</span>
          <div className="ml-auto px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${eventType.border}` }}>
            <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: eventType.color }}>Big Moment</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Regular timeline entry
const TimelineEntry = ({ entry, isLast, onDelete }) => {
  const eventType = getEventType(entry.type);
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div variants={itemVariants} className="flex gap-4 relative">
      <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{ background: eventType.bg, border: `2px solid ${eventType.border}` }}>
          <eventType.Icon weight="fill" className="w-4 h-4" style={{ color: eventType.color }} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1" style={{ background: '#EDE3D8', minHeight: 32 }}></div>
        )}
      </div>

      <div className="flex-1 pb-6">
        <div className="p-4 rounded-[20px] relative"
          style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: eventType.color }}>
                  {eventType.label}
                </span>
                {entry.petName && (
                  <span className="text-[9px] font-semibold" style={{ color: COLORS.muted }}>· {entry.petName}</span>
                )}
              </div>
              <p className="font-black text-sm leading-snug" style={{ color: COLORS.slate }}>{entry.title}</p>
              {entry.story && (
                <p className="text-xs font-semibold mt-1.5 leading-relaxed" style={{ color: COLORS.muted }}>{entry.story}</p>
              )}
            </div>
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full"
                style={{ background: '#F5EDE0' }}>
                <DotsThree weight="bold" className="w-3.5 h-3.5" style={{ color: COLORS.muted }} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-8 rounded-2xl overflow-hidden z-10 pet-card-shadow"
                    style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', minWidth: 110 }}>
                    <button onClick={() => { onDelete(entry.id); setShowMenu(false); }}
                      className="w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-2"
                      style={{ color: '#C4514A' }}>
                      <Trash weight="bold" className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <CalendarBlank weight="fill" className="w-3 h-3" style={{ color: '#C4B8B0' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#C4B8B0' }}>{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Duolingo-style Daily Check-in Modal
const CheckInModal = ({ onClose, streak, onComplete, todaysPet }) => {
  const [phase, setPhase] = useState('question'); // question | success
  const [selectedMood, setSelectedMood] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const moods = [
    { id: 'zoomies', emoji: '⚡', label: 'ZOOMIES', color: '#E05A5A', bg: '#FEE2E2' },
    { id: 'chill', emoji: '😴', label: 'CHILL', color: '#5B8DB8', bg: '#EEF4FB' },
    { id: 'hungry', emoji: '🍗', label: 'HUNGRY', color: '#C4914A', bg: '#FEF3E2' },
    { id: 'cuddly', emoji: '🥰', label: 'CUDDLY', color: '#D47A8A', bg: '#FEF0F3' },
    { id: 'sass', emoji: '😒', label: 'SIDE-EYE', color: '#7BAE8A', bg: '#EEF7F1' },
    { id: 'playful', emoji: '🎾', label: 'PLAYFUL', color: '#E8A87C', bg: '#FEF6EE' },
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setTimeout(() => {
      setPhase('success');
      setShowConfetti(true);
    }, 400);
  };

  const xpAmount = streak > 0 ? Math.min(10 + streak * 2, 50) : 10;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[80] flex items-end justify-center"
      style={{ background: 'rgba(30,15,5,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={phase === 'success' ? onClose : undefined}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={smoothSpring}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-[36px] overflow-hidden"
        style={{ background: COLORS.cream, maxHeight: '85%' }}>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full opacity-25" style={{ background: COLORS.slate }}></div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'question' && (
            <motion.div key="question" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-10 pt-2">
              {/* Streak display */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-black" style={{ color: COLORS.slate }}>Daily Check-in</h2>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: COLORS.muted }}>
                    {todaysPet ? `How's ${todaysPet} doing today?` : "How's your pet feeling?"}
                  </p>
                </div>
                <div className="flex flex-col items-center px-4 py-2 rounded-2xl"
                  style={{ background: streak > 0 ? '#FEF3E2' : '#F5EDE0', border: `2px solid ${streak > 0 ? '#FDDFA0' : '#EDE3D8'}` }}>
                  <Fire weight="fill" className="w-5 h-5 mb-0.5" style={{ color: streak > 0 ? '#E8703A' : '#C4B8B0' }} />
                  <span className="font-black text-xl leading-none" style={{ color: streak > 0 ? '#C4714A' : COLORS.muted }}>{streak}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>streak</span>
                </div>
              </div>

              {/* XP reward preview */}
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #FEF3E2, #FDF6EC)', border: '1.5px solid #FDDFA0' }}>
                <Star weight="fill" className="w-4 h-4" style={{ color: '#C4914A' }} />
                <span className="font-black text-sm" style={{ color: '#C4914A' }}>+{xpAmount} XP for checking in today!</span>
                <Lightning weight="fill" className="w-3.5 h-3.5 ml-auto" style={{ color: '#E8A87C' }} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: COLORS.muted }}>Pick today's vibe</p>

              <div className="grid grid-cols-3 gap-3">
                {moods.map((mood) => (
                  <motion.button key={mood.id}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleMoodSelect(mood)}
                    className="flex flex-col items-center gap-2 p-4 rounded-[20px] transition-all"
                    style={{
                      background: selectedMood?.id === mood.id ? mood.bg : COLORS.cardBg,
                      border: `2px solid ${selectedMood?.id === mood.id ? mood.color : '#EDE3D8'}`,
                      boxShadow: selectedMood?.id === mood.id ? `0 4px 16px -4px ${mood.color}50` : 'none'
                    }}>
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="font-black text-[10px] uppercase tracking-wider" style={{ color: mood.color }}>{mood.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="px-6 pb-10 pt-4 flex flex-col items-center text-center">
              {/* Big celebration */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-28 h-28 rounded-full flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${selectedMood?.bg || '#FEF3E2'}, ${COLORS.cardBg})`, border: `3px solid ${selectedMood?.color || COLORS.terracotta}` }}>
                <span className="text-5xl">{selectedMood?.emoji || '🐾'}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="font-display text-3xl font-black mb-1" style={{ color: COLORS.slate }}>
                  {streak >= 7 ? 'ON FIRE! 🔥' : streak >= 3 ? 'Keep it up!' : 'Great job!'}
                </h2>
                <p className="text-base font-semibold mb-5" style={{ color: COLORS.muted }}>
                  {selectedMood?.label} vibes logged for today
                </p>
              </motion.div>

              {/* XP pill */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full mb-5"
                style={{ background: 'linear-gradient(135deg, #C4714A, #E8A87C)', boxShadow: '0 6px 24px -6px rgba(196,113,74,0.5)' }}>
                <Lightning weight="fill" className="w-5 h-5 text-white" />
                <span className="font-black text-lg text-white">+{xpAmount} XP earned!</span>
              </motion.div>

              {/* Streak card */}
              <div className="w-full p-4 rounded-[24px] mb-6 flex items-center gap-4"
                style={{ background: '#FEF3E2', border: '2px solid #FDDFA0' }}>
                <div className="flex flex-col items-center">
                  <Fire weight="fill" className="w-8 h-8" style={{ color: '#E8703A' }} />
                  <span className="font-black text-2xl leading-none mt-1" style={{ color: '#C4714A' }}>{streak}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>day streak</span>
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm mb-1" style={{ color: COLORS.slate }}>
                    {streak === 1 ? 'First day! 🎉' : streak >= 7 ? `${streak} days — you're a legend!` : `${streak} days in a row!`}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: COLORS.muted }}>
                    {streak >= 7 ? 'Keep this streak alive!' : `${7 - streak} more days for a weekly badge`}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: '#FDDFA0' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="h-full rounded-full" style={{ background: '#E8703A' }} />
                  </div>
                </div>
              </div>

              <motion.button whileTap={tapAnimation} onClick={onComplete}
                className="w-full py-4 rounded-full font-black text-white text-base"
                style={{ background: 'linear-gradient(135deg, #C4714A, #E8A87C)', boxShadow: '0 4px 20px -6px rgba(196,113,74,0.5)' }}>
                Continue 🐾
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
      style={{ background: 'linear-gradient(135deg, #FEF3E2, #FDDFA0)' }}>
      <Path weight="fill" className="w-10 h-10" style={{ color: '#C4914A' }} />
    </motion.div>
    <h3 className="font-display text-2xl font-black mb-2 text-center" style={{ color: COLORS.slate }}>
      Start the Journey
    </h3>
    <p className="text-sm font-semibold text-center mb-8 max-w-[240px] leading-relaxed" style={{ color: COLORS.muted }}>
      Every milestone, funny moment, and health visit deserves to be remembered.
    </p>
    <motion.button whileTap={tapAnimation} onClick={onAdd}
      className="px-7 py-4 rounded-full font-bold text-white flex items-center gap-2"
      style={{ background: COLORS.terracotta, boxShadow: '0 4px 20px -6px rgba(196,113,74,0.5)' }}>
      <Plus weight="bold" className="w-4 h-4" /> Add First Memory
    </motion.button>
  </div>
);

// Full Journey page
const JourneyPage = ({ journeyEntries, savedPets, onAddEntry, onDeleteEntry }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPet, setFilterPet] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const uniquePetNames = [...new Set(savedPets.map(p => p.name).filter(Boolean))];

  const filtered = journeyEntries
    .filter(e => filterPet === 'all' || e.petName === filterPet)
    .filter(e => filterType === 'all' || e.type === filterType)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grouped = filtered.reduce((acc, entry) => {
    const d = new Date(entry.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <>
      <div className="pb-28">
        <div className="pt-16 px-6 mb-5">
          <div className="flex justify-between items-center mb-1">
            <h1 className="font-display text-3xl font-black" style={{ color: COLORS.slate }}>Journey</h1>
            <motion.button whileTap={tapAnimation} onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: COLORS.terracotta, boxShadow: '0 4px 16px -4px rgba(196,113,74,0.5)' }}>
              <Plus weight="bold" className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-sm font-semibold" style={{ color: COLORS.muted }}>
            {journeyEntries.length} {journeyEntries.length === 1 ? 'memory' : 'memories'} collected
          </p>
        </div>

        {journeyEntries.length > 0 && (
          <div className="mx-6 mb-5 p-4 rounded-[24px] flex justify-between"
            style={{ background: 'linear-gradient(135deg, #FEF3E2, #FDF6EC)', border: '1.5px solid #FDDFA0' }}>
            {EVENT_TYPES.map(type => {
              const count = journeyEntries.filter(e => e.type === type.id).length;
              return (
                <div key={type.id} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: type.bg, border: `1.5px solid ${type.border}` }}>
                    <type.Icon weight="fill" className="w-4 h-4" style={{ color: type.color }} />
                  </div>
                  <span className="font-black text-sm" style={{ color: COLORS.slate }}>{count}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>
                    {type.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {journeyEntries.length > 0 && (
          <div className="px-6 mb-5 space-y-2">
            {uniquePetNames.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button onClick={() => setFilterPet('all')}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all"
                  style={{
                    background: filterPet === 'all' ? COLORS.slate : COLORS.cardBg,
                    color: filterPet === 'all' ? 'white' : COLORS.muted,
                    border: '1.5px solid #EDE3D8'
                  }}>All pets</button>
                {uniquePetNames.map(name => (
                  <button key={name} onClick={() => setFilterPet(name)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all"
                    style={{
                      background: filterPet === name ? COLORS.slate : COLORS.cardBg,
                      color: filterPet === name ? 'white' : COLORS.muted,
                      border: '1.5px solid #EDE3D8'
                    }}>{name}</button>
                ))}
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setFilterType('all')}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all"
                style={{
                  background: filterType === 'all' ? COLORS.terracotta : COLORS.cardBg,
                  color: filterType === 'all' ? 'white' : COLORS.muted,
                  border: '1.5px solid #EDE3D8'
                }}>All types</button>
              {EVENT_TYPES.map(type => (
                <button key={type.id} onClick={() => setFilterType(type.id)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all flex items-center gap-1"
                  style={{
                    background: filterType === type.id ? type.color : COLORS.cardBg,
                    color: filterType === type.id ? 'white' : COLORS.muted,
                    border: `1.5px solid ${filterType === type.id ? type.color : '#EDE3D8'}`
                  }}>
                  <type.Icon weight="fill" className="w-3 h-3" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {journeyEntries.length === 0 ? (
          <JourneyEmptyState onAdd={() => setShowAddModal(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 opacity-60">
            <p className="text-sm font-bold" style={{ color: COLORS.muted }}>No entries match this filter.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="px-6">
            {Object.entries(grouped).map(([monthYear, entries]) => (
              <div key={monthYear} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: '#EDE3D8' }}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: '#EDE3D8', color: COLORS.muted }}>
                    {monthYear}
                  </span>
                  <div className="h-px flex-1" style={{ background: '#EDE3D8' }}></div>
                </div>

                {entries.map((entry, i) =>
                  entry.isBig
                    ? <MilestoneCard key={entry.id} entry={entry} onDelete={onDeleteEntry} />
                    : <TimelineEntry key={entry.id} entry={entry} isLast={i === entries.length - 1} onDelete={onDeleteEntry} />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddJourneyModal
            savedPets={savedPets}
            onClose={() => setShowAddModal(false)}
            onSave={onAddEntry}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- COMPONENTS ---

const StatusBar = () => (
  <div className="absolute top-0 left-0 right-0 h-14 z-[100] flex justify-between items-start px-7 pt-4 pointer-events-none" style={{ color: '#3D3530' }}>
    <div className="font-bold text-[15px] tracking-tight w-12 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>9:41</div>
    <div className="bg-slate-900 w-[120px] h-[34px] rounded-[20px] absolute left-1/2 -translate-x-1/2 top-3"></div>
    <div className="flex items-center gap-1.5">
      <CellSignalFull weight="fill" className="w-4 h-4" />
      <WifiHigh weight="bold" className="w-4 h-4" />
      <BatteryFull weight="fill" className="w-6 h-6" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 opacity-60">
    <motion.div 
      animate={{ y: [0, -8, 0] }} 
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
      style={{ background: 'linear-gradient(135deg, #F5EDE0, #E8D5C0)' }}
    >
      <Ghost weight="fill" className="w-8 h-8" style={{ color: '#C4A882' }} />
    </motion.div>
    <p className="text-sm font-bold mb-1" style={{ color: '#9B8E85' }}>No vibes collected yet.</p>
    <p className="text-[10px] font-semibold" style={{ color: '#C4B8B0' }}>Scan your first pet to start!</p>
  </div>
);

const CircularStat = ({ label, value, color }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r={radius} stroke="#EDE3D8" strokeWidth="4" fill="transparent" />
          <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className={`transition-all duration-1000 ease-out ${color}`} />
        </svg>
        <span className="absolute text-[10px] font-black" style={{ color: '#5A4A40' }}>{value}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#9B8E85' }}>{label}</span>
    </div>
  );
};

const JournalCard = ({ pet }) => {
  const date = new Date(pet.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const theme = getVibeTheme(pet.mode);
  return (
    <motion.div
      layoutId={`journal-${pet.id}`}
      className="break-inside-avoid rounded-[20px] overflow-hidden mb-3 group cursor-pointer pet-card-shadow"
      style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <img src={pet.image} className="w-full h-auto object-cover" loading="lazy" />
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full flex items-center gap-1"
          style={{ background: 'rgba(30,20,15,0.45)', backdropFilter: 'blur(8px)' }}>
          <CalendarBlank weight="fill" className="w-3 h-3 text-white" />
          <span className="text-[9px] font-bold text-white tracking-wide">{date}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-2 h-2 rounded-full ${theme.bg}`} style={{ minWidth: 8 }}></div>
          <span className="text-[9px] font-black uppercase tracking-wider truncate max-w-[120px]" style={{ color: '#9B8E85' }}>{pet.mode}</span>
        </div>
        <p className="text-xs font-semibold leading-snug text-left line-clamp-4" style={{ color: '#5A4A40' }}>
          {pet.diary || "No vibes recorded."}
        </p>
      </div>
    </motion.div>
  );
};

const PetNameCard = ({ image, petData, details, onSave, readonly = false, initialState = 'none' }) => {
  const [activeState, setActiveState] = useState(initialState);
  const [showToast, setShowToast] = useState(false);
  const vibeTheme = getVibeTheme(petData.mode);

  const handleShareClick = async (e) => { e.stopPropagation(); await generateShareCard(petData, image); };
  const handleSave = (e) => {
    e.stopPropagation();
    onSave(petData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };
  const toggle = (target) => {
    setActiveState(prev => prev === target ? 'none' : target);
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className={`relative w-full transition-all duration-500 ${readonly ? 'h-[600px]' : 'min-h-[680px] h-auto'} mb-6`}>
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
              style={{ background: '#3D3530' }}>
              <Check weight="bold" className="w-3 h-3" style={{ color: '#7BAE8A' }} /> Saved to Memory
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout transition={smoothSpring}
        onClick={() => toggle('vibe')}
        className={`absolute top-0 inset-x-0 rounded-[36px] z-0 shadow-lg cursor-pointer overflow-hidden origin-top ${vibeTheme.bg}`}
        animate={{ height: activeState === 'vibe' ? 520 : 155, paddingTop: 22 }}
      >
        <div className="flex justify-between items-start px-6 relative z-10">
          <div className="flex flex-col max-w-[80%]">
            <span className="font-bold text-[10px] text-white/70 uppercase tracking-widest mb-0.5">Current Vibe</span>
            <motion.span layout className="font-black text-2xl text-white uppercase leading-none tracking-wide drop-shadow-sm flex items-center gap-2">
              {petData.mode}
              <vibeTheme.Icon weight="fill" className="w-5 h-5 opacity-90" />
            </motion.span>
            <motion.div animate={{ scaleX: activeState === 'vibe' ? 0 : 1 }}
              className={`h-[3px] w-full ${vibeTheme.line} rounded-full mt-3 origin-left opacity-60`} />
          </div>
          <div className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
            <Info weight="bold" className="text-white w-5 h-5" />
          </div>
        </div>
        <AnimatePresence>
          {activeState === 'vibe' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.08 }} className="px-6 pt-7 text-white">
              <p className="font-display font-bold text-3xl mb-5 leading-tight opacity-90">"{vibeTheme.desc}"</p>
              <div className="rounded-2xl p-5 border" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' }}>
                <p className="text-[10px] font-bold uppercase mb-2 opacity-70 tracking-widest">Did you know?</p>
                <p className="text-sm font-semibold leading-relaxed">{vibeTheme.fact}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        layout transition={smoothSpring}
        onClick={() => toggle('details')}
        className="absolute inset-x-0 top-24 bottom-0 rounded-[40px] overflow-hidden cursor-pointer z-10"
        style={{ background: COLORS.cardBg, boxShadow: '0 -10px 40px -15px rgba(150,100,60,0.12)' }}
        animate={{ y: activeState === 'vibe' ? 460 : 0 }}
      >
        <motion.div className="absolute inset-x-0 top-0 z-0"
          animate={{ height: activeState === 'details' ? '42%' : '62%' }}
          transition={smoothSpring}
          style={{ height: '62%' }}
        >
          <img src={image} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(253,246,236,0.97) 100%)' }}></div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-end z-10 pointer-events-none">
          <div className="px-7 pb-7 pt-12 pointer-events-auto"
            style={{ background: 'linear-gradient(to top, rgba(253,246,236,1) 80%, transparent 100%)' }}>
            <div className="flex justify-between items-end mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest"
                    style={{ background: '#EDE3D8', color: '#9B8E85' }}>
                    ID: {petData.stableId || '—'}
                  </span>
                  {petData.humanSafe === 'green' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ background: '#D4EAD8', color: '#4A7A5A' }}>Safe</span>
                  )}
                </div>
                <h2 className="font-display text-5xl font-black leading-none mb-2 tracking-tight" style={{ color: '#3D3530' }}>
                  {petData.name}
                </h2>
                <p className="text-sm font-semibold" style={{ color: '#9B8E85' }}>
                  {details?.age || "3"} yrs · {details?.gender || "Pet"} · {petData.breed || "Unknown"}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleShareClick}
                  className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform pet-card-shadow"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
                  <ShareNetwork weight="bold" className="w-5 h-5" style={{ color: COLORS.slate }} />
                </button>
                {!readonly && (
                  <button onClick={handleSave}
                    className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: COLORS.terracotta, boxShadow: '0 4px 18px -4px rgba(196,113,74,0.45)' }}>
                    <FloppyDisk weight="bold" className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{ height: activeState === 'details' ? 'auto' : 0, opacity: activeState === 'details' ? 1 : 0, marginTop: activeState === 'details' ? 20 : 0 }}
              transition={smoothSpring}
              className="overflow-hidden"
            >
              <div className="rounded-[24px] p-5" style={{ background: '#F5EDE0', border: '1.5px solid #EDE3D8' }}>
                <div className="flex justify-between items-center mb-5 px-2">
                  {petData.stats && petData.stats.length > 0 ? (
                    petData.stats.map((stat, i) => (
                      <CircularStat key={i} label={stat.label} value={stat.value} color="text-amber-500" />
                    ))
                  ) : (
                    <div className="w-full text-center text-[10px] py-2" style={{ color: '#C4B8B0' }}>Stats initializing...</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <div className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 ${petData.humanSafe === 'green' ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#9B8E85' }}>Humans</span>
                    <span className="text-sm font-black" style={{ color: petData.humanSafe === 'green' ? '#4A7A5A' : '#9A6830' }}>
                      {petData.humanSafe === 'green' ? 'Friendly' : 'Cautious'}
                    </span>
                  </div>
                  <div className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 ${petData.dogSafe === 'green' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#9B8E85' }}>Dogs</span>
                    <span className="text-sm font-black" style={{ color: petData.dogSafe === 'green' ? '#4A7A5A' : '#9A3A3A' }}>
                      {petData.dogSafe === 'green' ? 'Chill' : 'Reactive'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="flex justify-center mt-4 opacity-20">
              <div className="w-12 h-1 rounded-full" style={{ background: COLORS.slate }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ScanningScreen = ({ image, mode }) => {
  const [loadingText, setLoadingText] = useState("Initializing sensors...");
  useEffect(() => {
    let index = 0;
    const steps = ["Calibrating sensors...", "Analyzing fuzziness...", "Detecting good vibes...", "Reading pet's mind...", "Writing diary entry..."];
    const interval = setInterval(() => {
      setLoadingText(steps[index]);
      index = (index + 1) % steps.length;
    }, 800);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pb-20 text-center">
      <div className="absolute inset-0 backdrop-blur-[3px] -z-10" style={{ background: 'rgba(253,246,236,0.7)' }}></div>
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-64 h-64 rounded-full overflow-hidden mb-10 relative"
        style={{ border: '6px solid white', boxShadow: '0 12px 48px -12px rgba(196,113,74,0.3)' }}
      >
        <img src={image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(30,20,15,0.15)' }}>
          <Scan className="w-24 h-24 text-white/90 animate-spin-slow drop-shadow-lg" />
        </div>
      </motion.div>
      <h3 className="font-display text-3xl font-black mb-3 tracking-tight" style={{ color: '#3D3530' }}>Reading Vibe...</h3>
      <div className="h-8 flex items-center justify-center">
        <motion.p
          key={loadingText}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-base" style={{ color: '#9B8E85' }}
        >
          {loadingText}
        </motion.p>
      </div>
    </div>
  );
};

const AvatarEditorModal = ({ image, onClose, onSave }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => { e.preventDefault(); setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handlePointerMove = (e) => { if (isDragging) { e.preventDefault(); setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); } };
  const handlePointerUp = () => setIsDragging(false);
  const handleSaveClick = async () => { const croppedImage = await getCroppedImg(image, zoom, offset); onSave(croppedImage); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex items-center justify-center p-6"
      style={{ background: 'rgba(30,20,15,0.55)', backdropFilter: 'blur(10px)' }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-[32px] p-6 shadow-2xl flex flex-col items-center gap-6"
        style={{ background: COLORS.cardBg }}>
        <div className="flex justify-between items-center w-full">
          <h3 className="font-black text-xl" style={{ color: '#3D3530' }}>Adjust Photo</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ background: '#EDE3D8' }}>
            <X weight="bold" style={{ color: '#5A4A40' }} />
          </button>
        </div>
        <div className="relative w-[250px] h-[250px] rounded-full overflow-hidden cursor-move touch-none"
          style={{ border: '4px solid #EDE3D8' }}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <img src={image} className="w-full h-full object-cover pointer-events-none select-none"
            style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`, transformOrigin: 'center', transition: isDragging ? 'none' : 'transform 0.1s' }} />
        </div>
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3">
            <MagnifyingGlassMinus className="w-5 h-5" style={{ color: '#9B8E85' }} />
            <input type="range" min="1" max="3" step="0.1" value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: '#EDE3D8', accentColor: COLORS.terracotta }} />
            <MagnifyingGlassPlus className="w-5 h-5" style={{ color: '#9B8E85' }} />
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-wide" style={{ color: '#C4B8B0' }}>Drag to Reposition</p>
        </div>
        <motion.button whileTap={tapAnimation} onClick={handleSaveClick}
          className="w-full text-white font-bold py-4 rounded-full shadow-lg flex items-center justify-center gap-2"
          style={{ background: COLORS.terracotta }}>
          <Check weight="bold" className="w-5 h-5" /> Save Avatar
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const Header = ({ mode, onModeSwitch, streak, checkedInToday, onStreakClick }) => (
  <div className="flex justify-between items-center w-full">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-md transition-colors duration-500"
        style={{ background: mode === 'dog' ? '#E8A0A0' : '#7BAE8A', color: '#FDF6EC' }}>
        P
      </div>
      <span className="font-black text-lg tracking-tight" style={{ color: '#3D3530', fontFamily: 'Fraunces, serif' }}>Pawerful</span>
    </div>
    <div className="flex items-center gap-2">
      <motion.button whileTap={tapAnimation} onClick={onStreakClick}
        className="px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform"
        style={{ background: checkedInToday ? '#FEF3E2' : 'rgba(255,255,255,0.8)', border: `1px solid ${checkedInToday ? '#FDDFA0' : '#EDE3D8'}` }}>
        <Fire weight="fill" className="w-3.5 h-3.5" style={{ color: streak > 0 ? '#E8703A' : '#C4B8B0' }} />
        <span className="text-[10px] font-black" style={{ color: '#5A4A40' }}>
          {streak} {checkedInToday ? '✓' : 'Check in'}
        </span>
      </motion.button>
      <div className="p-0.5 rounded-full flex" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #EDE3D8' }}>
        <button onClick={() => onModeSwitch('cat')}
          className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
          style={{ background: mode === 'cat' ? '#7BAE8A' : 'transparent', color: mode === 'cat' ? 'white' : '#9B8E85' }}>
          Cat
        </button>
        <button onClick={() => onModeSwitch('dog')}
          className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
          style={{ background: mode === 'dog' ? '#E8A0A0' : 'transparent', color: mode === 'dog' ? 'white' : '#9B8E85' }}>
          Dog
        </button>
      </div>
    </div>
  </div>
);

const ShowroomHero = ({ onUpload, backgroundImage, onUpdateBackground, mode }) => {
  const scanInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const handleUpload = async (e) => {
    if (e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      onUpload(e.target.files[0], base64);
      e.target.value = '';
    }
  };
  const handleBgChange = (e) => { if (e.target.files[0]) onUpdateBackground(URL.createObjectURL(e.target.files[0])); };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[420px] rounded-[36px] overflow-hidden mb-7 shadow-xl group grain-overlay"
      style={{ border: `3.5px solid ${mode === 'dog' ? '#E8A0A0' : 'rgba(255,255,255,0.8)'}` }}>
      <img src={backgroundImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,15,5,0.82) 0%, rgba(30,15,5,0.1) 50%, transparent 100%)' }}></div>
      
      <div className="absolute top-8 right-20 opacity-10">
        <PawPrint weight="fill" className="w-8 h-8 text-white" />
      </div>
      <div className="absolute top-16 right-12 opacity-8">
        <PawPrint weight="fill" className="w-5 h-5 text-white" />
      </div>

      <motion.button whileTap={tapAnimation} onClick={() => bgInputRef.current.click()}
        className="absolute top-5 right-5 text-white p-2.5 rounded-full transition-colors"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
        <PencilSimple weight="bold" className="w-4 h-4" />
      </motion.button>

      <div className="absolute bottom-0 left-0 right-0 p-7 pb-8 z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Daily Check</p>
        <h1 className="font-display text-5xl font-black leading-[0.92] mb-6 text-white tracking-tight drop-shadow-sm">
          How's your<br/>pet feeling?
        </h1>
        <motion.button whileTap={tapAnimation} onClick={() => scanInputRef.current.click()}
          className="w-full font-bold py-4 rounded-full flex items-center justify-center gap-3 transition-all"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', color: 'white' }}>
          <Scan weight="bold" className="w-5 h-5" />
          <span className="text-base tracking-wide">Scan New Photo</span>
        </motion.button>
      </div>
      <input type="file" ref={scanInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
      <input type="file" ref={bgInputRef} onChange={handleBgChange} className="hidden" accept="image/*" />
    </motion.div>
  );
};

const PetDetailsForm = ({ image, onSubmit, mode, savedPets }) => {
  const [activeView, setActiveView] = useState(savedPets && savedPets.length > 0 ? 'select' : 'new');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Boy');

  const uniquePets = useMemo(() => {
    const map = new Map();
    if (savedPets) savedPets.forEach(p => { if (!map.has(p.name)) map.set(p.name, p); });
    return Array.from(map.values());
  }, [savedPets]);

  const handleQuickSelect = (pet) => {
    const details = pet.details || { name: pet.name, age: "3", gender: "Pet" };
    onSubmit(details);
  };

  return (
    <div className="animate-in fade-in h-full flex flex-col relative z-20">
      <h2 className="font-display text-3xl font-black mb-5 pt-2" style={{ color: '#3D3530' }}>
        Who is this {mode}?
      </h2>
      <div className="w-full h-52 rounded-[28px] overflow-hidden mb-7 pet-card-shadow" style={{ border: '3px solid white' }}>
        <img src={image} className="w-full h-full object-cover" />
      </div>

      {activeView === 'select' && uniquePets.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 ml-1 tracking-widest">Quick Select</p>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
            <button onClick={() => setActiveView('new')} className="flex flex-col items-center gap-2.5 min-w-[76px]">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed flex items-center justify-center active:scale-95 transition-transform"
                style={{ borderColor: '#C4B8B0', background: 'rgba(255,255,255,0.5)' }}>
                <Plus weight="bold" className="w-7 h-7" style={{ color: '#9B8E85' }} />
              </div>
              <span className="font-bold text-sm" style={{ color: '#9B8E85' }}>New Pet</span>
            </button>
            {uniquePets.map((pet, i) => (
              <button key={i} onClick={() => handleQuickSelect(pet)} className="flex flex-col items-center gap-2.5 min-w-[76px]">
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden pet-card-shadow" style={{ border: '3px solid white' }}>
                  <img src={pet.image} className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm truncate max-w-[72px]" style={{ color: '#3D3530' }}>{pet.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pet's name"
            className="w-full p-4 rounded-2xl text-lg font-bold"
            style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: '#3D3530' }}
            autoFocus />
          <div className="flex gap-3">
            <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age"
              className="w-full p-4 rounded-2xl font-bold"
              style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: '#3D3530' }} />
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full p-4 rounded-2xl font-bold"
              style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: '#3D3530' }}>
              <option>Boy</option>
              <option>Girl</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <motion.button whileTap={tapAnimation}
              onClick={() => onSubmit({ name, age, gender })} disabled={!name}
              className="w-full text-white text-base font-bold py-4 rounded-full shadow-md disabled:opacity-40"
              style={{ background: COLORS.terracotta, boxShadow: '0 4px 20px -6px rgba(196,113,74,0.5)' }}>
              Analyze Vibe
            </motion.button>
            {uniquePets.length > 0 && (
              <button onClick={() => setActiveView('select')} className="text-[10px] font-bold py-2 uppercase tracking-widest"
                style={{ color: '#9B8E85' }}>
                Back to my pets
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TrendingCommunities = ({ onTrendClick, mode }) => {
  const filteredTrends = TRENDS_DATA.filter(t => t.type === mode);
  return (
    <div className="mb-6 relative z-10">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-black text-lg" style={{ color: '#3D3530' }}>
          Trending {mode === 'dog' ? 'Packs' : 'Squads'}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C4B8B0' }}>See all</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
        {filteredTrends.map((trend) => (
          <motion.button whileTap={tapAnimation} key={trend.id} onClick={() => onTrendClick(trend)}
            className="min-w-[136px] h-40 rounded-[24px] relative overflow-hidden flex flex-col justify-between p-1 group cursor-pointer pet-card-shadow"
            style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
            <div className="h-24 w-full rounded-[18px] overflow-hidden relative">
              <img src={trend.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,15,5,0.3), transparent)' }}></div>
            </div>
            <div className="px-2 pb-2 text-left">
              <span className="font-bold text-sm leading-tight block mb-1 truncate" style={{ color: '#3D3530' }}>{trend.title}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${trend.color}`}></div>
                <span className="text-[10px] font-semibold" style={{ color: '#9B8E85' }}>{trend.members}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const TrendFeed = ({ trend, onBack }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
    className="w-full min-h-full relative z-20" style={{ background: COLORS.cream }}>
    <div className="flex items-center gap-4 mb-4 px-4 sticky top-0 z-30 pt-14 pb-3"
      style={{ background: 'rgba(253,246,236,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(237,227,216,0.8)' }}>
      <motion.button whileTap={tapAnimation} onClick={onBack}
        className="p-2 rounded-full pet-card-shadow active:scale-90 transition-transform"
        style={{ background: COLORS.cardBg, border: '1px solid #EDE3D8' }}>
        <CaretLeft weight="bold" className="w-5 h-5" style={{ color: '#3D3530' }} />
      </motion.button>
      <div>
        <h1 className="font-display font-black text-xl leading-none" style={{ color: '#3D3530' }}>{trend.title}</h1>
        <p className="text-[10px] font-bold" style={{ color: '#9B8E85' }}>{trend.members} Members</p>
      </div>
    </div>
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="columns-2 gap-3 space-y-3 px-3 pb-32">
      {MOCK_FEED_POSTS.map((post, index) => (
        <motion.div key={post.id} variants={itemVariants} whileTap={tapAnimation}
          className="break-inside-avoid rounded-[16px] overflow-hidden cursor-pointer pet-card-shadow"
          style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
          <div className={`w-full overflow-hidden relative ${index % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
            <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          </div>
          <div className="p-3">
            <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2" style={{ color: '#3D3530' }}>{post.title}</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <img src={post.avatar} className="w-5 h-5 rounded-full" style={{ border: '1px solid #EDE3D8' }} />
                <span className="text-[10px] font-bold truncate max-w-[60px]" style={{ color: '#9B8E85' }}>{post.user}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart weight={index % 3 === 0 ? "fill" : "regular"} className="w-3.5 h-3.5" style={{ color: index % 3 === 0 ? '#D47A8A' : '#C4B8B0' }} />
                <span className="text-[10px] font-bold" style={{ color: '#9B8E85' }}>{post.likes}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

const MyPage = ({ savedPets, userProfile, setUserProfile }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempBio, setTempBio] = useState(userProfile.bio);
  const [viewingPet, setViewingPet] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatarImage, setTempAvatarImage] = useState(null);
  const avatarInputRef = useRef(null);

  const collections = savedPets.reduce((acc, pet) => {
    const name = pet.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(pet);
    return acc;
  }, {});
  const filteredPets = activeTab === 'all' ? savedPets : collections[activeTab] || [];
  const petNames = Object.keys(collections);

  const totalLikes = savedPets.length * 47;
  const formattedLikes = totalLikes > 999 ? (totalLikes / 1000).toFixed(1) + 'k' : totalLikes;

  const handleSaveProfile = () => { setUserProfile({ ...userProfile, name: tempName, bio: tempBio }); setIsEditing(false); };
  const handleFileSelect = async (e) => {
    if (e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setTempAvatarImage(base64); setShowAvatarModal(true); e.target.value = null;
    }
  };
  const handleAvatarSave = (croppedImage) => { setUserProfile({ ...userProfile, avatar: croppedImage }); setShowAvatarModal(false); setTempAvatarImage(null); };

  return (
    <>
      <div className="pb-24">
        <div className="pt-24 px-6 mb-7">
          <div className="flex justify-between items-start mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: '4px solid white', boxShadow: '0 4px 20px -6px rgba(150,100,60,0.25)' }}>
                <img src={userProfile.avatar} className="w-full h-full object-cover" />
              </div>
              <button onClick={() => avatarInputRef.current.click()}
                className="absolute -bottom-1 -right-1 text-white p-1.5 rounded-full z-10 active:scale-90 transition-transform"
                style={{ background: COLORS.terracotta, border: '2px solid white' }}>
                <Plus weight="bold" className="w-3.5 h-3.5" />
              </button>
              <input type="file" ref={avatarInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            </div>
            <div className="flex gap-2 pt-2">
              {!isEditing && (
                <button onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
                  style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: '#5A4A40' }}>
                  Edit Profile
                </button>
              )}
              <button className="p-2 rounded-full active:scale-95 transition-transform"
                style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8', color: '#5A4A40' }}>
                <Gear weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 mb-4">
              <input value={tempName} onChange={(e) => setTempName(e.target.value)}
                className="w-full font-black text-2xl bg-transparent"
                style={{ borderBottom: '2px solid #EDE3D8', color: '#3D3530' }} />
              <input value={tempBio} onChange={(e) => setTempBio(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent"
                style={{ borderBottom: '2px solid #EDE3D8', color: '#9B8E85' }} />
              <button onClick={handleSaveProfile}
                className="text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2"
                style={{ background: COLORS.terracotta }}>
                <FloppyDisk weight="bold" className="w-3 h-3" /> Save
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-black" style={{ color: '#3D3530' }}>{userProfile.name}</h1>
              <p className="text-xs font-semibold leading-relaxed max-w-[90%]" style={{ color: '#9B8E85' }}>{userProfile.bio}</p>
            </div>
          )}

          <div className="flex gap-7 mt-5">
            <div className="flex flex-col">
              <span className="font-black text-lg" style={{ color: '#3D3530' }}>{savedPets.length}</span>
              <span className="text-[10px] font-bold" style={{ color: '#9B8E85' }}>Vibes</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg" style={{ color: '#3D3530' }}>{savedPets.length > 0 ? savedPets.length * 3 : 0}</span>
              <span className="text-[10px] font-bold" style={{ color: '#9B8E85' }}>Days</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg" style={{ color: '#3D3530' }}>{savedPets.length > 0 ? formattedLikes : '—'}</span>
              <span className="text-[10px] font-bold" style={{ color: '#9B8E85' }}>Likes</span>
            </div>
          </div>
        </div>

        {savedPets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-3 px-6">
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                <button onClick={() => setActiveTab('all')}
                  className={`flex flex-col items-center gap-2 min-w-[56px] transition-opacity ${activeTab === 'all' ? 'opacity-100' : 'opacity-45'}`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: activeTab === 'all' ? COLORS.slate : '#F0E8DE', border: `2px solid ${activeTab === 'all' ? COLORS.slate : '#EDE3D8'}` }}>
                    <SquaresFour weight="bold" className="w-6 h-6" style={{ color: activeTab === 'all' ? 'white' : '#9B8E85' }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: '#3D3530' }}>All</span>
                </button>
                {petNames.map((name, i) => (
                  <button key={i} onClick={() => setActiveTab(name)}
                    className={`flex flex-col items-center gap-2 min-w-[56px] transition-opacity ${activeTab === name ? 'opacity-100' : 'opacity-45'}`}>
                    <div className="w-14 h-14 rounded-full p-0.5" style={{ border: `2px solid ${activeTab === name ? COLORS.terracotta : 'transparent'}` }}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                        <img src={collections[name][0]?.image} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold truncate max-w-[56px]" style={{ color: '#3D3530' }}>{name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="columns-2 gap-3 space-y-3 px-6 pb-24">
              {filteredPets.map((pet, i) => (
                <div key={i} onClick={() => setViewingPet(pet)}>
                  <JournalCard pet={pet} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showAvatarModal && (
          <AvatarEditorModal image={tempAvatarImage} onClose={() => setShowAvatarModal(false)} onSave={handleAvatarSave} />
        )}
        {viewingPet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex justify-center items-end"
            style={{ background: 'rgba(30,15,5,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setViewingPet(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={smoothSpring}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-[92%] rounded-t-[32px] overflow-hidden flex flex-col relative shadow-2xl"
              style={{ background: COLORS.cream }}>
              <div className="absolute top-0 left-0 right-0 z-50 pt-5 pb-4 px-6 flex items-center justify-between"
                style={{ background: 'rgba(253,246,236,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE3D8' }}>
                <button onClick={() => setViewingPet(null)}
                  className="p-2.5 rounded-full pet-card-shadow active:scale-90 transition-transform"
                  style={{ background: COLORS.cardBg, border: '1px solid #EDE3D8' }}>
                  <X weight="bold" className="w-4 h-4" style={{ color: '#3D3530' }} />
                </button>
                <h2 className="font-display text-lg font-black" style={{ color: '#3D3530' }}>Pawerful Memory</h2>
                <div className="w-10"></div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 px-6 pb-10">
                <PetNameCard image={viewingPet.image} petData={viewingPet} details={viewingPet.details}
                  onSave={() => {}} readonly={true} initialState="details" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('home');
  const [mode, setMode] = useState('cat');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [savedPets, setSavedPets] = useState(() => JSON.parse(localStorage.getItem('pawerful_pets') || "[]"));
  const [userProfile, setUserProfile] = useState(() => JSON.parse(localStorage.getItem('pawerful_profile') || '{"name": "Tia & Pika", "bio": "Living the chaotic pet life.", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Tia"}'));
  const [journeyEntries, setJourneyEntries] = useState(() => JSON.parse(localStorage.getItem('pawerful_journey') || "[]"));
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'pawerful-global-styles';
    if (!document.getElementById('pawerful-global-styles')) {
      style.innerHTML = globalStyles;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById('pawerful-global-styles');
      if (el) document.head.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const lastVisit = localStorage.getItem('last_visit_date');
    const today = new Date().toDateString();
    let currentStreak = parseInt(localStorage.getItem('vibe_streak') || "0");

    if (lastVisit === today) {
      setCheckedInToday(true);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastVisit === yesterday.toDateString()) {
        currentStreak += 1;
      } else if (!lastVisit) {
        currentStreak = 1;
      } else {
        currentStreak = 1;
      }
      localStorage.setItem('vibe_streak', currentStreak);
      localStorage.setItem('last_visit_date', today);
      setCheckedInToday(true);
    }
    setStreak(currentStreak);
  }, []);

  const [homeBg, setHomeBg] = useState("https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&q=80");
  const [dogBg, setDogBg] = useState("https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&q=80");
  const currentBg = mode === 'dog' ? dogBg : homeBg;
  const setBg = mode === 'dog' ? setDogBg : setHomeBg;

  useEffect(() => { localStorage.setItem('pawerful_pets', JSON.stringify(savedPets)); }, [savedPets]);
  useEffect(() => { localStorage.setItem('pawerful_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('pawerful_journey', JSON.stringify(journeyEntries)); }, [journeyEntries]);

  const handleAddJourneyEntry = (entry) => {
    setJourneyEntries(prev => [entry, ...prev]);
  };

  const handleDeleteJourneyEntry = (id) => {
    setJourneyEntries(prev => prev.filter(e => e.id !== id));
  };

  const [petImage, setPetImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [petDetails, setPetDetails] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [scanError, setScanError] = useState(false);
  const scanTimeoutRef = useRef(null);

  const handleUpload = async (file, base64) => {
    setRawFile(file);
    setPetImage(base64 || URL.createObjectURL(file));
    setView('form');
  };

  const handleTrendClick = (trend) => { setSelectedTrend(trend); setView('trend-feed'); };

  const handleFormSubmit = async (details) => {
    setPetDetails(details);
    setScanError(false);
    setView('scanning');

    scanTimeoutRef.current = setTimeout(() => {
      // 超时后回到表单页面，让用户重试
      setView('form');
    }, 20000);

    const catFallback = {
      breed: "British Longhair",
      mode: "Nesting Mode",
      humanSafe: "green",
      dogSafe: "yellow",
      stats: [
        { label: "Zen", value: 95 },
        { label: "Sass", value: 80 },
        { label: "Energy", value: 20 }
      ],
      diary: "The humans are loud, but my fur is majestic today.",
      squads: TRENDS_DATA.filter(t => t.type === 'cat').slice(0, 3)
    };

    const dogFallback = {
      breed: "Shiba Inu",
      mode: "Side-Eye Mode",
      humanSafe: "green",
      dogSafe: "red",
      stats: [
        { label: "Sass", value: 100 },
        { label: "Play", value: 40 },
        { label: "Loyalty", value: 85 }
      ],
      diary: "I destroyed the monkey. It deserved it.",
      squads: TRENDS_DATA.filter(t => t.type === 'dog').slice(0, 3)
    };

    const selectedFallback = mode === 'dog' ? dogFallback : catFallback;

    try {
      let data;
      if (rawFile) {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
          console.log('[Frontend] Local dev mode - using fallback');
          await new Promise(res => setTimeout(res, 2000));
          data = selectedFallback;
        } else {
          const imageBase64 = await fileToBase64(rawFile);
          
          console.log(`[Frontend] Calling API for ${mode} analysis...`);
          
          const response = await fetch('/api/analyze-pet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64,
              petType: mode
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
          }

          const result = await response.json();
          console.log(`[Frontend] Got response:`, result.requestId, result.data.breed);
          
          if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
          }

          data = result.data;
        }
      } else {
        await new Promise(res => setTimeout(res, 1500));
        data = selectedFallback;
      }

      data.squads = [
        { id: 'dynamic-' + Date.now(), title: `${data.breed || 'Pet'} Club`, members: "New", color: "bg-amber-400", image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80" },
        ...TRENDS_DATA.filter(t => t.type === mode).slice(0, 2)
      ];

      clearTimeout(scanTimeoutRef.current);
      setAiResult(data);
      setView('result');
    } catch (error) {
      console.error('[Frontend] Analysis error:', error);
      clearTimeout(scanTimeoutRef.current);
      // 发生错误时使用fallback数据，不显示错误提示
      setAiResult(selectedFallback);
      setView('result');
    }
  };

  const handleSavePet = (petData) => {
    const stableId = petData.stableId || (Math.floor(Math.random() * 9000) + 1000);
    setSavedPets([{
      id: Date.now(),
      stableId,
      image: petImage,
      name: petDetails.name || petData.name,
      breed: petData.breed || "Unknown",
      mode: petData.mode,
      details: petDetails,
      stats: petData.stats,
      humanSafe: petData.humanSafe,
      dogSafe: petData.dogSafe,
      diary: petData.diary,
      timestamp: new Date().toISOString()
    }, ...savedPets]);
    setView('profile');
  };

  const [resultStableId] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const defaultData = { name: petDetails.name || "Unknown", breed: "Unknown", mode: "Scanning...", humanSafe: 'green', dogSafe: 'yellow', stats: [], squads: [], stableId: resultStableId };
  const finalPetData = aiResult ? { ...defaultData, ...aiResult, stableId: resultStableId } : defaultData;

  const handleCheckInComplete = () => {
    setCheckedInToday(true);
    setShowCheckIn(false);
  };

  const handleMainScroll = (e) => { setIsScrolled(e.currentTarget.scrollTop > 50); };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(135deg, #D4C5B5 0%, #E8D8C8 50%, #D0C0A8 100%)', fontFamily: 'Nunito, sans-serif' }}>
      
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: '#E8C4A0' }}></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: '#C4D8E0' }}></div>

      <div className="w-full max-w-[390px] h-[844px] rounded-[52px] shadow-2xl relative overflow-hidden flex flex-col"
        style={{ background: COLORS.cream, border: '10px solid #2A2018' }}>
        
        <StatusBar />

        <div className="absolute top-[-40px] left-[-40px] w-36 h-36 rounded-full blur-3xl opacity-35 pointer-events-none transition-colors duration-700"
          style={{ background: mode === 'dog' ? '#E8C0C0' : '#C0D8B8' }}></div>
        <div className="absolute bottom-[80px] right-[-20px] w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: mode === 'dog' ? '#C0D4E8' : '#E8D0C0' }}></div>

        {view === 'home' && (
          <div className="absolute top-0 left-0 right-0 z-40 pt-14 pb-3 px-6"
            style={{ background: 'rgba(253,246,236,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(237,227,216,0.6)' }}>
            <Header mode={mode} onModeSwitch={(m) => { setMode(m); setView('home'); }} streak={streak} checkedInToday={checkedInToday} onStreakClick={() => !checkedInToday && setShowCheckIn(true)} />
          </div>
        )}

        {view === 'result' && (
          <div className="absolute top-0 left-0 right-0 z-40 pt-14 pb-4 px-6 flex items-center justify-between"
            style={{ background: 'rgba(253,246,236,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #EDE3D8' }}>
            <button onClick={() => setView('home')}
              className="p-2.5 rounded-full pet-card-shadow active:scale-90 transition-transform"
              style={{ background: COLORS.cardBg, border: '1px solid #EDE3D8' }}>
              <CaretLeft weight="bold" className="w-5 h-5" style={{ color: '#3D3530' }} />
            </button>
            <h2 className="font-display text-xl font-black" style={{ color: '#3D3530' }}>Pawerful ID</h2>
            <div className="w-10"></div>
          </div>
        )}

        {view === 'profile' && (
          <div className={`absolute top-0 left-0 right-0 z-40 pt-16 pb-3 px-6 flex items-center justify-between transition-opacity duration-300 ${isScrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'rgba(253,246,236,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE3D8' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: '1px solid #EDE3D8' }}>
                <img src={userProfile.avatar} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-sm" style={{ color: '#3D3530' }}>{userProfile.name}</span>
            </div>
            <div className="flex gap-3">
              <button className="p-2 rounded-full" style={{ background: COLORS.cardBg, border: '1px solid #EDE3D8' }}>
                <ShareNetwork weight="bold" className="w-4 h-4" style={{ color: '#3D3530' }} />
              </button>
              <button className="p-2 rounded-full" style={{ background: COLORS.cardBg, border: '1px solid #EDE3D8' }}>
                <List weight="bold" className="w-4 h-4" style={{ color: '#3D3530' }} />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {scanError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-20 left-4 right-4 z-50 text-white text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ background: '#C4714A' }}>
              <X weight="bold" className="w-4 h-4" />
              Couldn't read those vibes — please try again.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 h-full" onScroll={handleMainScroll}>
          <div className={`${(view === 'home' || view === 'result') ? 'pt-[88px]' : view === 'journey' ? 'pt-4' : ''} px-6 h-full`}>

            {view === 'home' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                <motion.div variants={itemVariants}>
                  <ShowroomHero onUpload={handleUpload} backgroundImage={currentBg} onUpdateBackground={setBg} mode={mode} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="pb-28">
                    <TrendingCommunities onTrendClick={handleTrendClick} mode={mode} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {view === 'form' && (
              <div className="pt-20">
                <PetDetailsForm image={petImage} onSubmit={handleFormSubmit} mode={mode} savedPets={savedPets} />
              </div>
            )}

            {view === 'scanning' && <ScanningScreen image={petImage} mode={mode} />}

            {view === 'result' && (
              <div className="flex flex-col h-full pt-4">
                <div className="pb-32">
                  <PetNameCard
                    image={petImage}
                    petData={{ ...finalPetData, name: petDetails.name || finalPetData.name }}
                    details={petDetails}
                    onSave={handleSavePet}
                    initialState="none"
                  />
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <UsersThree weight="fill" className="w-5 h-5" style={{ color: '#3D3530' }} />
                      <h3 className="font-black text-base" style={{ color: '#3D3530' }}>Your Vibe Squads</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                      {finalPetData.squads && finalPetData.squads.map((trend) => (
                        <motion.button whileTap={tapAnimation} key={trend.id}
                          onClick={() => handleTrendClick(trend)}
                          className="min-w-[136px] h-44 rounded-[24px] relative overflow-hidden flex flex-col justify-between p-1 group cursor-pointer pet-card-shadow"
                          style={{ background: COLORS.cardBg, border: '1.5px solid #EDE3D8' }}>
                          <div className="h-28 w-full rounded-[18px] overflow-hidden relative">
                            <img src={trend.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute bottom-2 left-2 backdrop-blur-sm px-2 py-1 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.88)' }}>
                              <span className="text-[10px] font-bold" style={{ color: '#3D3530' }}>Match 98%</span>
                            </div>
                          </div>
                          <div className="px-2 pb-3 text-left">
                            <span className="font-bold text-sm leading-tight block mb-1 truncate" style={{ color: '#3D3530' }}>{trend.title}</span>
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${trend.color}`}></div>
                              <span className="text-[10px] font-semibold" style={{ color: '#9B8E85' }}>{trend.members}</span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'trend-feed' && <TrendFeed trend={selectedTrend} onBack={() => setView('home')} />}
            {view === 'profile' && <MyPage savedPets={savedPets} userProfile={userProfile} setUserProfile={setUserProfile} />}
            {view === 'journey' && (
              <JourneyPage
                journeyEntries={journeyEntries}
                savedPets={savedPets}
                onAddEntry={handleAddJourneyEntry}
                onDeleteEntry={handleDeleteJourneyEntry}
              />
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-50">
          <div className="w-full rounded-full px-7 py-2 h-16 flex justify-between items-center relative"
            style={{ background: COLORS.cardBg, boxShadow: '0 8px 32px -8px rgba(100,60,20,0.22)', border: '1.5px solid #EDE3D8' }}>
            <motion.button whileTap={tapAnimation} onClick={() => setView('home')} className="flex flex-col items-center gap-0.5">
              <House weight={view === 'home' ? "fill" : "regular"} className="w-6 h-6 transition-colors"
                style={{ color: view === 'home' ? COLORS.terracotta : '#C4B8B0' }} />
              <span className="text-[8px] font-bold transition-colors"
                style={{ color: view === 'home' ? COLORS.terracotta : '#C4B8B0' }}>Home</span>
            </motion.button>

            <motion.button whileTap={tapAnimation} onClick={() => setView('journey')} className="flex flex-col items-center gap-0.5">
              <Path weight={view === 'journey' ? "fill" : "regular"} className="w-6 h-6 transition-colors"
                style={{ color: view === 'journey' ? COLORS.terracotta : '#C4B8B0' }} />
              <span className="text-[8px] font-bold transition-colors"
                style={{ color: view === 'journey' ? COLORS.terracotta : '#C4B8B0' }}>Journey</span>
            </motion.button>

            <label className="relative -top-6 cursor-pointer flex flex-col items-center gap-0.5">
              <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files[0]) { handleUpload(e.target.files[0]); e.target.value = ''; }
              }} className="hidden" />
              <motion.div whileTap={tapAnimation}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: COLORS.terracotta, border: '3px solid #FDF6EC', boxShadow: '0 4px 20px -4px rgba(196,113,74,0.55)' }}>
                <Scan weight="bold" className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-[8px] font-bold" style={{ color: COLORS.terracotta }}>Scan</span>
            </label>

            <motion.button whileTap={tapAnimation} onClick={() => setView('profile')} className="flex flex-col items-center gap-0.5">
              <User weight={view === 'profile' ? "fill" : "regular"} className="w-6 h-6 transition-colors"
                style={{ color: view === 'profile' ? COLORS.terracotta : '#C4B8B0' }} />
              <span className="text-[8px] font-bold transition-colors"
                style={{ color: view === 'profile' ? COLORS.terracotta : '#C4B8B0' }}>Profile</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showCheckIn && (
            <CheckInModal
              streak={streak}
              onClose={() => setShowCheckIn(false)}
              onComplete={handleCheckInComplete}
              todaysPet={savedPets[0]?.name || null}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}