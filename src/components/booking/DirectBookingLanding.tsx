import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Users,
  Check,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Wifi,
  Key,
  Palette,
  Building,
  X,
  Coffee,
  Sun,
  Home,
  Star,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  CheckCircle2,
  Crown,
  Flame,
  Waves,
  ShieldCheck,
  Compass,
  Smartphone,
  Eye,
  MessageCircle,
  Wine,
  Mountain,
  Layers,
} from 'lucide-react';
import { WelcomeGuideData, Property } from '../../types';
import { DateRangeCalendarPicker } from './DateRangeCalendarPicker';

interface DirectBookingLandingProps {
  guideData: WelcomeGuideData;
  properties: Property[];
  activeTemplate?: LandingTemplate;
  onSelectTemplate?: (template: LandingTemplate) => void;
}

export type LandingTemplate =
  | 'saisei'
  | 'zen-and-bed'
  | 'salt'
  | 'dos-aguas'
  | 'corte-vette'
  | 'medano-blanco'
  | 'bay'
  | 'retrato'
  | 'urbano';

export const DirectBookingLanding: React.FC<DirectBookingLandingProps> = ({
  guideData,
  properties,
  activeTemplate,
  onSelectTemplate,
}) => {
  // Visual template state (3 Modelos Base Oficiales de Loomi Suite: SAISEI, ZEN & BED, SALT)
  const [internalTemplate, setInternalTemplate] = useState<LandingTemplate>('saisei');
  const selectedTemplate = activeTemplate || internalTemplate;
  const setSelectedTemplate = (t: LandingTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(t);
    } else {
      setInternalTemplate(t);
    }
  };

  // Dates state
  const [checkInDate, setCheckInDate] = useState<string>('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-10-18');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Selected apartment and guest counts
  const [selectedCabinId, setSelectedCabinId] = useState<string>(properties[0]?.id || 'cat-a');
  const [nights, setNights] = useState<number>(3);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [showSelfOnboardExplain, setShowSelfOnboardExplain] = useState<boolean>(false);
  const [activeFloatingDetail, setActiveFloatingDetail] = useState<'sommelier' | 'wellness' | 'terroir' | 'direct_perks' | null>(null);

  // Early Check-in & Late Check-out options
  const [earlyCheckIn, setEarlyCheckIn] = useState<boolean>(false);
  const [lateCheckOut, setLateCheckOut] = useState<boolean>(false);
  // Promo code
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<number>(0);

  // Urbano Buenos Aires custom hero image state
  const [urbanoHeroImage, setUrbanoHeroImage] = useState<string>('/catalinas/edificio.jpg');
  const [showUrbanoImageModal, setShowUrbanoImageModal] = useState<boolean>(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string; tag: string } | null>(null);

  // Custom photos for SAISEI architectural gallery
  const [cortePhotos, setCortePhotos] = useState<{
    suite1: string;
    bathroom: string;
    suite2: string;
    terrace: string;
    pool: string;
    cellar: string;
    sunset: string;
    facade: string;
  }>({
    suite1: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop',
    bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop',
    suite2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop',
    terrace: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
    pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    cellar: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1600&auto=format&fit=crop',
    sunset: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1600&auto=format&fit=crop',
    facade: '/entrada.jpeg',
  });
  const [editingPhotoKey, setEditingPhotoKey] = useState<string | null>(null);
  const [photoEditInput, setPhotoEditInput] = useState<string>('');

  const selectedCabin = properties.find((p) => p.id === selectedCabinId) || properties[0];

  // State to toggle/collapse simulator toolbar for 100% clean live website view (default false for pure website look)
  const [showSimulatorBar, setShowSimulatorBar] = useState<boolean>(false);

  // Helper to calculate nights between 2 dates
  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 3;
    const d1 = new Date(inDate + 'T00:00:00');
    const d2 = new Date(outDate + 'T00:00:00');
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const handleDatesSelect = (newIn: string, newOut: string) => {
    setCheckInDate(newIn);
    setCheckOutDate(newOut);
    const n = calculateNights(newIn, newOut);
    setNights(n);
    setIsCalendarOpen(false);
  };

  const handleCheckInChange = (newIn: string) => {
    setCheckInDate(newIn);
    if (newIn >= checkOutDate) {
      const d = new Date(newIn + 'T00:00:00');
      d.setDate(d.getDate() + 3);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const outStr = `${d.getFullYear()}-${m}-${day}`;
      setCheckOutDate(outStr);
      setNights(3);
    } else {
      setNights(calculateNights(newIn, checkOutDate));
    }
  };

  const handleCheckOutChange = (newOut: string) => {
    if (newOut > checkInDate) {
      setCheckOutDate(newOut);
      setNights(calculateNights(checkInDate, newOut));
    }
  };

  // Pricing math
  const pricePerNight = selectedCabin?.basePrice || 140;
  const rawTotal = pricePerNight * nights;

  // Early / Late fee
  const earlyFee = earlyCheckIn ? 25 : 0;
  const lateFee = lateCheckOut ? 25 : 0;
  const earlyLateTotal = earlyFee + lateFee;

  // Direct booking discount (default 15% off OTA price)
  const baseDiscountPercent = guideData.directBookingSettings?.directDiscountPercent || 15;
  const totalDiscountPercent = baseDiscountPercent + appliedPromo;
  const discountAmount = Math.round((rawTotal * totalDiscountPercent) / 100);

  const finalTotal = rawTotal + earlyLateTotal - discountAmount;
  const depositPercent = guideData.directBookingSettings?.depositPercentage || 50;
  const depositAmount = Math.round((finalTotal * depositPercent) / 100);
  const balanceOnArrival = finalTotal - depositAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'DIRECTO' || code === 'AMIGO' || code === 'AURA') {
      setAppliedPromo(10);
    } else if (code === 'ESPECIAL20') {
      setAppliedPromo(5);
    } else {
      setAppliedPromo(0);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking-engine-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUrbanoHeroImage(event.target.result as string);
          setShowUrbanoImageModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero confirmar mi reserva directa en AURA (Valle de Uco, Mendoza):\n` +
    `• Unidad: ${selectedCabin?.name || 'Suite de Viña'}\n` +
    `• Estadía: ${checkInDate} al ${checkOutDate} (${nights} noches, ${guestsCount} personas)\n` +
    `${earlyCheckIn ? '• Incluye Ingreso Temprano & Copa de Bienvenida\n' : ''}` +
    `${lateCheckOut ? '• Incluye Salida Extendida (Sunset Tasting)\n' : ''}` +
    `• Total con ${totalDiscountPercent}% descuento directo: $${finalTotal} USD\n` +
    `• Seña 50% ($${depositAmount} USD) a transferir a ${guideData.directBookingSettings?.bankAlias || 'AURA.MENDOZA'}\n` +
    `• Mi nombre: ${guestName || 'Huésped'} - Tel: ${guestPhone}`
  );

  // Template flags: 3 Modelos Base Oficiales de Loomi Suite
  const isSaisei = selectedTemplate === 'saisei' || selectedTemplate === 'corte-vette' || (selectedTemplate as string) === 'triptych';
  const isZenAndBed = selectedTemplate === 'zen-and-bed' || selectedTemplate === 'dos-aguas' || selectedTemplate === 'retrato';
  const isSalt = selectedTemplate === 'salt' || selectedTemplate === 'medano-blanco' || selectedTemplate === 'bay' || selectedTemplate === 'urbano';

  return (
    <div className={`w-full transition-all duration-300 relative ${
      isSaisei
        ? 'bg-[#EDE6DC] text-[#1D1A16]'
        : isZenAndBed
        ? 'bg-[#F8F6F1] text-[#242320]'
        : 'bg-[#F4EFEA] text-[#1D1814]'
    }`}>
      {/* ========================================================================= */}
      {/* SELECTOR FLOTANTE ELEGANTE DE MODELOS (DOCK FLOTANTE CON ACCESO DIRECTO)   */}
      {/* ========================================================================= */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-6 z-50 font-sans pointer-events-auto">
        {showSimulatorBar ? (
          <div className="bg-[#181614]/95 backdrop-blur-xl border border-stone-700/60 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-2 text-xs text-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-mono text-stone-400 uppercase px-1 hidden sm:inline">Modelos Oficiales:</span>
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedTemplate('saisei')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSaisei ? 'bg-[#8C6D46] text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="SAISEI • Glamping & Arquitectura Contemporánea: Minimalismo sofisticado, serif monumental y grillas limpias"
              >
                <span>🏛️ SAISEI</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Glamping & Arq.)</span>
              </button>
              <button
                onClick={() => setSelectedTemplate('zen-and-bed')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isZenAndBed ? 'bg-[#5E6D59] text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="ZEN & BED • Retiro Holístico & Bosque: Silencioso, orgánico, wabi-sabi y blancos rotos"
              >
                <span>🌿 ZEN & BED</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Retiro & Bosque)</span>
              </button>
              <button
                onClick={() => setSelectedTemplate('salt')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSalt ? 'bg-[#2A211A] text-[#EDE0D0] border border-[#8C6D46]/40 font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="SALT • Eco-Lodge & Naturaleza Inmersiva: Estilo editorial de viajes, marcos de madera oscura y columnas periodísticas"
              >
                <span>📖 SALT</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Eco-Lodge Editorial)</span>
              </button>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setShowSimulatorBar(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Minimizar selector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Compact Floating Badge to Switch Designs */
          <button
            onClick={() => setShowSimulatorBar(true)}
            className="px-3.5 py-2 rounded-full bg-black/85 hover:bg-black text-[#E67E22] border border-[#E67E22]/40 text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            title="Cambiar modelo web oficial"
          >
            <Palette className="w-3.5 h-3.5 text-[#E67E22]" />
            <span className="font-sans font-medium text-[11px] text-white">
              {isSaisei ? '🏛️ SAISEI' : isZenAndBed ? '🌿 ZEN & BED' : '📖 SALT'}
            </span>
            <span className="text-[10px] text-stone-400 ml-0.5">▼</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL GLOBAL: SELECTOR DE CALENDARIO VISUAL DE FECHAS (REACT PORTAL) */}
      {/* ========================================================================= */}
      {isCalendarOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="relative w-full max-w-md shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DateRangeCalendarPicker
              checkIn={checkInDate}
              checkOut={checkOutDate}
              onChange={handleDatesSelect}
              onClose={() => setIsCalendarOpen(false)}
              accentColor={isSaisei ? 'amber' : isZenAndBed ? 'emerald' : 'amber'}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL GLOBAL: LIGHTBOX EXPANDIDO DE FOTOS DE ALTA RESOLUCIÓN              */}
      {/* ========================================================================= */}
      {lightboxImage && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-20 w-11 h-11 rounded-full bg-black/80 text-white hover:bg-stone-800 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-h-[75vh] rounded-2xl overflow-hidden border border-[#c5a880]/40 shadow-2xl bg-black">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full max-h-[75vh] object-contain mx-auto"
              />
            </div>

            <div className="w-full bg-[#14110d]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#c5a880]/30 flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880] font-bold block">
                  {lightboxImage.tag}
                </span>
                <h3 className="text-lg sm:text-xl font-serif text-white">{lightboxImage.title}</h3>
                <p className="text-xs text-stone-300 font-light mt-0.5">{lightboxImage.subtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setLightboxImage(null);
                    scrollToBooking();
                  }}
                  className="min-h-[40px] px-6 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Consultar Disponibilidad
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERSONALIZAR / CAMBIAR FOTO DE CORTE DELLE VETTE                   */}
      {/* ========================================================================= */}
      {editingPhotoKey && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setEditingPhotoKey(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#14110d] text-white border border-[#c5a880]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingPhotoKey(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#c5a880]">
                GALERÍA CORTE DELLE VETTE
              </span>
              <h3 className="text-xl font-serif mt-1">Reemplazar Fotografía del Espacio</h3>
              <p className="text-xs text-stone-300 mt-1">
                Ingresá la URL de tu imagen o cargá un archivo desde tu dispositivo para actualizar este cuadro.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1.5">Pegar URL de Imagen:</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoEditInput}
                  onChange={(e) => setPhotoEditInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="text-center text-xs text-stone-500 font-mono">— O bien —</div>

              <div>
                <label className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-stone-700 hover:border-[#c5a880] bg-stone-950/60 cursor-pointer transition-colors text-xs text-stone-300">
                  <Upload className="w-5 h-5 text-[#c5a880] mb-1" />
                  <span>Subir imagen desde tu computadora / celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result && editingPhotoKey) {
                            setCortePhotos((prev) => ({
                              ...prev,
                              [editingPhotoKey]: event.target?.result as string,
                            }));
                            setEditingPhotoKey(null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end gap-3">
              <button
                onClick={() => setEditingPhotoKey(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (photoEditInput.trim() && editingPhotoKey) {
                    setCortePhotos((prev) => ({
                      ...prev,
                      [editingPhotoKey]: photoEditInput.trim(),
                    }));
                    setEditingPhotoKey(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs"
              >
                Guardar Foto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODELO 1: SAISEI — GLAMPING & ARQUITECTURA CONTEMPORÁNEA                  */}
      {/* ========================================================================= */}
      {isSaisei && (
        <div className="relative min-h-screen bg-[#EDE6DC] text-[#1D1A16] font-sans antialiased overflow-x-hidden selection:bg-[#c5a880] selection:text-white">
          
          {/* ===================================================================== */}
          {/* 1. FIXED BACKGROUND: WARM MINERAL TONE + ARCHITECTURAL GRID + SERIF   */}
          {/* ===================================================================== */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#EDE6DC]">
            
            {/* Subtle Winery/Texture Wall Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-multiply transition-opacity duration-700"
              style={{
                backgroundImage: `url(${cortePhotos.facade || '/entrada.jpeg'})`,
              }}
            />

            {/* Subtle Fine Grain / Architectural Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#8C6D46_1px,transparent_1px)] [background-size:36px_36px] opacity-20" />

            {/* Fixed Editorial Header Meta */}
            <div className="absolute top-14 sm:top-16 left-6 right-6 sm:left-12 sm:right-12 flex items-center justify-between text-[11px] sm:text-xs font-serif tracking-[0.25em] text-[#2C2720] uppercase border-b border-[#2C2720]/15 pb-3">
              <span className="font-bold tracking-[0.3em]">SAISEI</span>
              <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#735D43]">GLAMPING &amp; ARQUITECTURA CONTEMPORÁNEA</span>
              <span className="font-mono text-[10px] tracking-widest">MINIMALISMO SOFISTICADO</span>
            </div>

            {/* Central Giant Typographic Composition */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 z-10 w-full max-w-5xl mx-auto pointer-events-none">
              {/* Architectural Geometric Icon */}
              <div className="w-16 h-10 text-[#8C6D46] opacity-80 mb-2 flex items-center justify-center">
                <svg viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                  <polygon points="50,5 90,35 10,35" strokeLinejoin="round" />
                  <line x1="50" y1="5" x2="50" y2="35" strokeDasharray="2 2" />
                  <circle cx="50" cy="20" r="4" fill="currentColor" opacity="0.4" />
                </svg>
              </div>

              {/* Huge Editorial Serif Title */}
              <h1 className="text-[clamp(2.6rem,7vw,6.5rem)] font-serif tracking-[0.06em] uppercase text-[#191612] leading-[0.92] font-normal select-none text-center max-w-full overflow-visible break-normal px-2">
                <span className="block tracking-[0.08em] whitespace-nowrap">SAISEI</span>
              </h1>

              {/* Subtitle Line */}
              <p className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base font-serif italic text-[#6B573F] tracking-widest max-w-xl px-4 uppercase">
                Glamping &amp; Arquitectura Contemporánea
              </p>
              <p className="mt-1 text-[11px] sm:text-xs font-sans text-[#7A6750] tracking-wide max-w-md px-4 font-light">
                Minimalismo sofisticado, bloques arena y marfil cálido, y grillas de arquitectura limpias integradas al paisaje.
              </p>
            </div>

            {/* Fixed Bottom Left Label */}
            <div className="absolute bottom-6 left-6 sm:left-12 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#5C4D3C] uppercase">
              DOMOS DE AUTOR • ARQUITECTURA LIMPIA
            </div>

            {/* Fixed Bottom Right Scroll Cue */}
            <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#735D43] uppercase">
              <span>Desplazar para explorar</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>

          {/* Top Control Bar (Customize background or photos) */}
          <div className="relative z-20 max-w-6xl mx-auto pt-4 px-6 flex justify-end">
            <button
              onClick={() => {
                setEditingPhotoKey('facade');
                setPhotoEditInput(cortePhotos.facade);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#2C2720] border border-[#2C2720]/20 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md transition-all shadow-sm cursor-pointer"
              title="Cambiar foto de fondo o pared de la bodega"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>Cambiar Foto de Fondo / Bodega</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* 2. FOREGROUND SCROLLABLE FLOW OF FLOATING PHOTO CUTOUTS (REFERENCE)   */}
          {/* ===================================================================== */}
          <div className="relative z-10 pt-[25vh] pb-44 px-4 sm:px-12 max-w-6xl mx-auto min-h-[220vh] pointer-events-none">
            
            {/* ORGANIC ASYMMETRIC FLOATING CUTOUTS OVER & AROUND THE GIANT TYPOGRAPHY */}
            {[
              {
                id: 'suite1',
                key: 'suite1',
                tag: '01 / MASTER DOME',
                title: 'Master Dome Panorámico',
                subtitle: 'Hormigón arena, lino y geometría pura',
                img: cortePhotos.suite1,
                // Positioned top-right, floating
                layoutStyle: 'ml-auto mr-2 sm:mr-8 md:mr-16 mt-0 w-[200px] sm:w-[260px] md:w-[290px]',
                aspectRatio: 'aspect-[4/3]',
              },
              {
                id: 'bathroom',
                key: 'bathroom',
                tag: '02 / BAÑO MINERAL',
                title: 'Tina de Piedra Natural',
                subtitle: 'Ventanal zen y luz cenital',
                img: cortePhotos.bathroom,
                // Positioned top-left, floating
                layoutStyle: 'mr-auto ml-2 sm:ml-6 md:ml-12 mt-12 sm:mt-16 w-[180px] sm:w-[230px] md:w-[260px]',
                aspectRatio: 'aspect-[3/4]',
              },
              {
                id: 'suite2',
                key: 'suite2',
                tag: '03 / PABELLÓN CRISTAL',
                title: 'Módulo de Madera & Cristal',
                subtitle: 'Líneas limpias y vistas abiertas',
                img: cortePhotos.suite2,
                // Overlapping center-left
                layoutStyle: 'mr-auto ml-4 sm:ml-20 md:ml-28 mt-20 sm:mt-28 w-[210px] sm:w-[270px] md:w-[310px]',
                aspectRatio: 'aspect-[16/10]',
              },
              {
                id: 'terrace',
                key: 'terrace',
                tag: '04 / TERRAZA & FUEGO',
                title: 'Terraza Geométrica & Deck',
                subtitle: 'Piscina de inmersión exterior',
                img: cortePhotos.terrace,
                // Floating center-right
                layoutStyle: 'ml-auto mr-4 sm:mr-16 md:mr-24 mt-16 sm:mt-24 w-[190px] sm:w-[250px] md:w-[280px]',
                aspectRatio: 'aspect-[4/3]',
              },
              {
                id: 'pool',
                key: 'pool',
                tag: '05 / AGUA & REFLEJO',
                title: 'Piscina Mineral Infinita',
                subtitle: 'Reflejo del paisaje y sol cenital',
                img: cortePhotos.pool,
                // Bottom center-left
                layoutStyle: 'mr-auto ml-6 sm:ml-14 md:ml-20 mt-20 sm:mt-32 w-[220px] sm:w-[280px] md:w-[320px]',
                aspectRatio: 'aspect-[16/10]',
              },
              {
                id: 'cellar',
                key: 'cellar',
                tag: '06 / SALÓN DE TÉ & CAVA',
                title: 'Espacio de Contemplación',
                subtitle: 'Piedra natural y degustación privada',
                img: cortePhotos.cellar,
                // Bottom center-right
                layoutStyle: 'ml-auto mr-2 sm:mr-10 md:mr-18 mt-16 sm:mt-24 w-[190px] sm:w-[240px] md:w-[270px]',
                aspectRatio: 'aspect-[3/4]',
              },
              {
                id: 'sunset',
                key: 'sunset',
                tag: '07 / ATARDECER',
                title: 'Silueta Arquitectónica',
                subtitle: 'Fuego exterior y calma absoluta',
                img: cortePhotos.sunset,
                // Bottom right
                layoutStyle: 'ml-auto mr-8 sm:mr-24 md:mr-36 mt-20 sm:mt-32 w-[210px] sm:w-[270px] md:w-[300px]',
                aspectRatio: 'aspect-[4/3]',
              },
            ].map((frame, idx) => (
              <div
                key={frame.id}
                className={`pointer-events-auto transition-all duration-500 hover:scale-105 hover:z-40 ${frame.layoutStyle}`}
              >
                {/* Pure Floating Photographic Cutout (Inspired by Leon Dupuis Reference) */}
                <div
                  onClick={() => setLightboxImage({ src: frame.img, title: frame.title, subtitle: frame.subtitle, tag: frame.tag })}
                  className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] border border-[#2C2720]/10 group cursor-pointer transition-all duration-500 bg-stone-200"
                >
                  <div className={`relative w-full ${frame.aspectRatio} overflow-hidden`}>
                    <img
                      src={frame.img}
                      alt={frame.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                    />

                    {/* Subtle Edit Photo trigger on hover for owner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhotoKey(frame.key);
                        setPhotoEditInput(frame.img);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                      title="Cambiar foto de este espacio"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Closing Manifesto Box */}
            <div className="pointer-events-auto pt-28 pb-12 max-w-xl mx-auto text-center space-y-4">
              <div className="p-8 rounded-2xl bg-white/85 backdrop-blur-md border border-[#2C2720]/20 shadow-xl space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8C6D46] font-bold block">
                  CORTE DELLE VETTE • MENDOZA
                </span>
                <h3 className="text-2xl font-serif text-[#191612]">
                  Experiencia Enológica en la Cordillera
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  15 suites esculpidas en hormigón, piedra y madera noble sobre el propio viñedo. Reservá de forma directa con 0% de comisión y atención personalizada.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={scrollToBooking}
                    className="min-h-[44px] px-8 py-3 rounded-xl bg-[#2C2720] hover:bg-black text-[#EDE6DC] font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Ver Fechas & Reservar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Floating Reservation Capsule */}
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto pointer-events-auto font-sans">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#191612]/95 backdrop-blur-xl border border-[#8C6D46]/40 shadow-2xl flex items-center justify-between gap-3 text-white">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 cursor-pointer truncate"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#c5a880] block font-bold truncate">
                  SAISEI • Reserva Directa Oficial
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  {checkInDate} al {checkOutDate} ({nights} nts)
                </span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[38px] px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Reservar
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO 2: ZEN & BED — RETIRO HOLÍSTICO & BOSQUE                           */}
      {/* ========================================================================= */}
      {isZenAndBed && (
        <div className="space-y-0 font-sans animate-in fade-in duration-300 bg-[#F8F6F1] text-[#282622]">
          <section className="relative min-h-[660px] lg:min-h-[760px] flex flex-col justify-between overflow-hidden bg-[#1B1D19] text-[#EDE8DF]">
            <div className="absolute inset-0 z-0">
              <img
                src={selectedCabin?.imageUrl || '/cabanas/sendero-noche.jpg'}
                alt={guideData.propertyName}
                className="w-full h-full object-cover opacity-35 scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151713] via-[#151713]/60 to-transparent" />
            </div>

            {/* Subtle Minimal Header Bar */}
            <div className="relative z-10 max-w-5xl mx-auto w-full pt-8 px-6 sm:px-12">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between text-[11px] font-mono tracking-widest text-[#BACDB0] uppercase">
                <span>ZEN &amp; BED</span>
                <span className="hidden sm:inline">RETIRO HOLÍSTICO &amp; BOSQUE</span>
                <span>WABI-SABI • SERENIDAD</span>
              </div>
            </div>

            <div className="relative z-10 p-6 sm:p-14 max-w-5xl mx-auto w-full my-auto space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8E9F80] animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-[#BACDB0] uppercase">
                  RETIRO HOLÍSTICO &amp; BOSQUE • SILENCIO WABI-SABI
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-wide text-white leading-tight">
                  ZEN &amp; BED
                </h1>
                <p className="text-xs sm:text-sm font-mono tracking-widest text-[#BACDB0] uppercase">
                  {guideData.propertyName || 'Retiro del Bosque'} — Serenidad &amp; Arquitectura Orgánica
                </p>
              </div>

              <p className="text-stone-300 max-w-xl text-sm sm:text-base font-light leading-relaxed">
                Silencioso, orgánico, wabi-sabi, madera clara, blancos rotos y máxima serenidad visual. Un espacio donde el tiempo se dilata entre los árboles y la respiración profunda.
              </p>

              {/* Serenity Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left max-w-3xl">
                <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#BACDB0] block uppercase">01 / Atmósfera</span>
                  <strong className="text-xs text-white font-medium block">Silencio Total</strong>
                  <p className="text-[11px] text-stone-300 font-light leading-snug">Sin ruidos urbanos, sólo el viento y el bosque.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#BACDB0] block uppercase">02 / Materialidad</span>
                  <strong className="text-xs text-white font-medium block">Madera Clara</strong>
                  <p className="text-[11px] text-stone-300 font-light leading-snug">Blancos rotos, lino puro y texturas táctiles.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#BACDB0] block uppercase">03 / Bienestar</span>
                  <strong className="text-xs text-white font-medium block">Tinajas de Inmersión</strong>
                  <p className="text-[11px] text-stone-300 font-light leading-snug">Baños calientes de bosque y aromas a cedro.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#BACDB0] block uppercase">04 / Calma</span>
                  <strong className="text-xs text-white font-medium block">Paz Visual</strong>
                  <p className="text-[11px] text-stone-300 font-light leading-snug">Espacios despojados y equilibrio wabi-sabi.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToBooking}
                  className="min-h-[44px] px-8 py-3.5 rounded-full bg-[#5E6D59] hover:bg-[#4E5B4A] text-white font-medium text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#5E6D59]/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Reservar Estadía Silenciosa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="min-h-[44px] px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs border border-white/15 cursor-pointer flex items-center gap-2"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#BACDB0]" />
                  <span>{checkInDate} → {checkOutDate}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Sticky Floating Reservation Capsule for ZEN & BED */}
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto pointer-events-auto font-sans">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#1A1C18]/95 backdrop-blur-xl border border-[#5E6D59]/40 shadow-2xl flex items-center justify-between gap-3 text-white">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 cursor-pointer truncate"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#BACDB0] block font-bold truncate">
                  ZEN &amp; BED • Retiro Holístico &amp; Bosque
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#BACDB0] shrink-0" />
                  {checkInDate} al {checkOutDate} ({nights} nts)
                </span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[38px] px-5 py-2 rounded-xl bg-[#5E6D59] hover:bg-[#4E5B4A] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO 3: SALT — ECO-LODGE & NATURALEZA INMERSIVA                         */}
      {/* ========================================================================= */}
      {isSalt && (
        <div className="space-y-0 animate-in fade-in duration-300 font-serif bg-[#F4EFEA] text-[#1D1814]">
          <section className="relative min-h-[660px] lg:min-h-[760px] flex flex-col justify-between overflow-hidden bg-[#18130E] text-white">
            <div className="absolute inset-0 z-0">
              <img
                src={selectedCabin?.imageUrl || '/cabanas/deck-hamaca.jpg'}
                alt={guideData.propertyName}
                className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140F0B] via-[#140F0B]/60 to-black/40" />
            </div>

            {/* Editorial Top Border Line with Dark Wood Framing */}
            <div className="relative z-10 max-w-6xl mx-auto w-full pt-8 px-6 sm:px-12">
              <div className="border-t-2 border-b border-[#C2A27A]/30 py-2.5 flex items-center justify-between text-[11px] font-serif tracking-[0.2em] uppercase text-[#D8C4AC]">
                <span>VOL. VIII — TRAVEL DISPATCH</span>
                <span className="hidden sm:inline font-mono text-[10px]">SALT ECO-LODGE • NATURALEZA INMERSIVA</span>
                <span>EDICIÓN DE AUTOR</span>
              </div>
            </div>

            <div className="relative z-10 p-6 sm:p-12 max-w-6xl mx-auto w-full my-auto space-y-6">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#2A2017] border border-[#5A4533] text-[10px] tracking-[0.25em] uppercase font-mono text-[#E4D1BC]">
                  <span>CRÓNICA DE VIAJE • ECO-LODGE OFICIAL</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif uppercase tracking-tight font-normal text-white leading-[0.95]">
                  SALT
                </h1>
                <p className="text-sm sm:text-base font-serif italic text-[#D8C4AC] tracking-wider">
                  {guideData.propertyName || 'Eco-Lodge & Naturaleza Inmersiva'}
                </p>

                <p className="text-stone-300 font-sans font-light text-xs sm:text-sm leading-relaxed max-w-2xl pt-1">
                  Estilo editorial de viajes, marcos de madera oscura, columnas periodísticas y conexión profunda con el entorno salvaje.
                </p>
              </div>

              {/* 3 Journalistic Columns in Dark Wood Frames */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-[#1C1611]/90 backdrop-blur-md border-2 border-[#3D2E22] space-y-2 shadow-xl">
                  <div className="text-[10px] font-mono text-[#C2A27A] tracking-widest uppercase border-b border-[#3D2E22] pb-1.5 flex justify-between">
                    <span>COLUMNA 01</span>
                    <span>EL ENTORNO</span>
                  </div>
                  <h3 className="font-serif text-sm font-normal text-white uppercase tracking-wider">
                    El Salar &amp; las Mareas
                  </h3>
                  <p className="text-[11px] font-sans text-stone-300 font-light leading-relaxed">
                    Pabellones suspendidos en madera oscura de nogal que respetan el viento y el suelo costero sin impacto invasivo.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1611]/90 backdrop-blur-md border-2 border-[#3D2E22] space-y-2 shadow-xl">
                  <div className="text-[10px] font-mono text-[#C2A27A] tracking-widest uppercase border-b border-[#3D2E22] pb-1.5 flex justify-between">
                    <span>COLUMNA 02</span>
                    <span>ARQUITECTURA</span>
                  </div>
                  <h3 className="font-serif text-sm font-normal text-white uppercase tracking-wider">
                    Madera Oscura &amp; Quietud
                  </h3>
                  <p className="text-[11px] font-sans text-stone-300 font-light leading-relaxed">
                    Marcos tostados, aislamiento térmico natural, ventanales continuos y biblioteca de viaje para lectura lenta.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#1C1611]/90 backdrop-blur-md border-2 border-[#3D2E22] space-y-2 shadow-xl">
                  <div className="text-[10px] font-mono text-[#C2A27A] tracking-widest uppercase border-b border-[#3D2E22] pb-1.5 flex justify-between">
                    <span>COLUMNA 03</span>
                    <span>HOSPITALIDAD</span>
                  </div>
                  <h3 className="font-serif text-sm font-normal text-white uppercase tracking-wider">
                    Inmersión Silvestre
                  </h3>
                  <p className="text-[11px] font-sans text-stone-300 font-light leading-relaxed">
                    Gastronomía botánica de recolección, fogoneros bajo las estrellas y expediciones al ritmo de la naturaleza.
                  </p>
                </div>
              </div>

              {/* Editorial Quick Reserve Capsule */}
              <div className="pt-2 max-w-2xl font-sans">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#140F0B]/95 backdrop-blur-xl border border-[#C2A27A]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div
                    onClick={() => setIsCalendarOpen(true)}
                    className="flex items-center gap-3 cursor-pointer text-left w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#2A2017] border border-[#5A4533] flex items-center justify-center text-[#C2A27A] shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#C2A27A] block font-bold">
                        SALT • RESERVAS DIRECTAS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {checkInDate} al {checkOutDate} ({nights} noches)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={scrollToBooking}
                    className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 rounded-xl bg-[#C2A27A] hover:bg-[#B19069] text-[#140F0B] font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer shrink-0"
                  >
                    Ver Suites &amp; Reservar
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sticky Floating Reservation Capsule for SALT */}
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto pointer-events-auto font-sans">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#140F0B]/95 backdrop-blur-xl border border-[#C2A27A]/40 shadow-2xl flex items-center justify-between gap-3 text-white">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 cursor-pointer truncate"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#C2A27A] block font-bold truncate">
                  SALT • Eco-Lodge &amp; Naturaleza Inmersiva
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#C2A27A] shrink-0" />
                  {checkInDate} al {checkOutDate} ({nights} nts)
                </span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[38px] px-5 py-2 rounded-xl bg-[#C2A27A] hover:bg-[#B19069] text-[#140F0B] font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATÁLOGO DE UNIDADES & MOTOR DE RESERVAS                                  */}
      {/* ========================================================================= */}
      <section id="booking-engine-section" className="py-16 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isSaisei ? 'text-[#8C6D46]' : isZenAndBed ? 'text-[#5E6D59]' : 'text-[#C2A27A]'}`}>
              RESERVA DIRECTA OFICIAL
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              {isSaisei ? 'Pabellones & Domos de Diseño Disponibles' : isZenAndBed ? 'Suites de Madera Clara & Refugios de Bosque' : 'Suites Eco-Lodge & Habitaciones Disponibles'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const isSelected = selectedCabinId === property.id;
              const discountedPrice = Math.round(property.basePrice * (1 - totalDiscountPercent / 100));

              return (
                <div
                  key={property.id}
                  onClick={() => setSelectedCabinId(property.id)}
                  className={`rounded-3xl overflow-hidden border p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? (isSaisei
                          ? 'bg-[#18140f] text-white border-[#8C6D46] shadow-2xl ring-2 ring-[#8C6D46]/30'
                          : isZenAndBed
                          ? 'bg-[#191C18] text-white border-[#5E6D59] shadow-2xl ring-2 ring-[#5E6D59]/30'
                          : 'bg-[#18130E] text-white border-[#C2A27A] shadow-2xl ring-2 ring-[#C2A27A]/30')
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="h-48 rounded-2xl overflow-hidden relative">
                      <img
                        src={property.imageUrl || '/catalinas/1dormA.jpg'}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white font-bold">
                        {property.maxGuests} Huéspedes
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">{property.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {property.bedrooms || 1} Dormitorio(s) • Climatización • Vista Panorámica
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 line-through">${property.basePrice}</span>
                      <div className={`text-xl font-black ${isSaisei ? 'text-[#C5A880]' : isZenAndBed ? 'text-[#BACDB0]' : 'text-[#C2A27A]'}`}>
                        ${discountedPrice} <span className="text-xs font-normal text-stone-400">USD/noche</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                      isSelected
                        ? (isSaisei ? 'bg-[#8C6D46] text-white font-bold' : isZenAndBed ? 'bg-[#5E6D59] text-white' : 'bg-[#C2A27A] text-[#140F0B] font-bold')
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {isSelected ? 'Seleccionada' : 'Elegir'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de Reserva Directa */}
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className={`text-xs font-mono uppercase font-bold ${isSaisei ? 'text-[#C5A880]' : isZenAndBed ? 'text-[#BACDB0]' : 'text-[#C2A27A]'}`}>
                  Resumen de Estadía
                </span>
                <h4 className="text-lg font-bold">{selectedCabin?.name}</h4>
              </div>
              <span className="text-xs font-mono text-stone-400">
                {nights} noches • {guestsCount} huéspedes
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>{nights} noches x ${pricePerNight} USD</span>
                <span>${rawTotal} USD</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Descuento Reserva Directa ({totalDiscountPercent}%)</span>
                <span>-${discountAmount} USD</span>
              </div>
              <div className="flex justify-between text-stone-300 pt-2 border-t border-stone-800 text-base font-bold text-white">
                <span>Total Final</span>
                <span className={isSaisei ? 'text-[#C5A880]' : isZenAndBed ? 'text-[#BACDB0]' : 'text-[#C2A27A]'}>${finalTotal} USD</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-800/80 text-stone-300 text-[11px] flex justify-between">
                <span>Seña 50% para confirmar:</span>
                <span className="font-bold text-white">${depositAmount} USD</span>
              </div>
            </div>

            {!bookingConfirmed ? (
              <form onSubmit={handleBook} className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-xl border border-stone-700 bg-stone-800 text-white placeholder-stone-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Teléfono Móvil"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-xl border border-stone-700 bg-stone-800 text-white placeholder-stone-500"
                />
                <button
                  type="submit"
                  className={`w-full min-h-[44px] py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSaisei
                      ? 'bg-[#8C6D46] hover:bg-[#785C39] text-white shadow-[#8C6D46]/30'
                      : isZenAndBed
                      ? 'bg-[#5E6D59] hover:bg-[#4E5B4A] text-white shadow-[#5E6D59]/30'
                      : 'bg-[#C2A27A] hover:bg-[#B19069] text-[#140F0B] shadow-[#C2A27A]/30'
                  }`}
                >
                  <span>Solicitar Reserva Directa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">¡Solicitud Lista para Enviar!</h4>
                <p className="text-xs text-stone-300">
                  Tocá el botón abajo para abrir WhatsApp con todos los datos y recibir el alias bancario:
                </p>
                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  📲 Enviar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="py-12 px-6 sm:px-12 text-center text-xs border-t bg-stone-950 border-stone-800 text-stone-400">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="font-bold text-sm text-white tracking-widest uppercase">
            {isSaisei ? 'SAISEI — Glamping & Arquitectura Contemporánea' : isZenAndBed ? 'ZEN & BED — Retiro Holístico & Bosque' : 'SALT — Eco-Lodge & Naturaleza Inmersiva'}
          </span>
          <p className="text-stone-400 text-xs">
            Reservas directas sin comisiones • {isSaisei ? 'Glamping & Arquitectura Contemporánea' : isZenAndBed ? 'Retiro Holístico & Bosque' : 'Eco-Lodge & Naturaleza Inmersiva'} • {guideData.locationAddress || 'Alojamiento Oficial'}
          </p>
          <div className="text-[11px] text-stone-500">
            Desarrollado con Loomi Suite PMS & Motor de Reservas Directas
          </div>
        </div>
      </footer>
    </div>
  );
};
