export interface BadgeConfig {
  variant: 'pill' | 'ribbon' | 'seal';
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
    | 'mid-left'
    | 'mid-right'
    | 'mid-center';
  icon?:
    | 'crown'
    | 'rocket'
    | 'fire'
    | 'star'
    | 'tag'
    | 'zap'
    | 'percent'
    | 'megaphone'
    | 'trophy'
    | 'gift'
    | 'heart'
    | 'scissors'
    | 'user'
    | 'map-pin'
    | 'calendar'
    | 'clock'
    | 'seal'
    | 'seal-check'
    | 'seal-percent'
    | 'seal-warning'
    | 'sticker'
    | 'ticket'
    | 'medal';
  text: string;
  subText?: string;
  color:
    | 'red'
    | 'green'
    | 'gold'
    | 'purple'
    | 'neon'
    | 'black'
    | 'yellow'
    | 'pink'
    | 'teal'
    | 'orange'
    | 'lime'
    | 'magenta'
    | 'blue'
    | 'transparent';
  textColor?: string; // Hex or tailwind class override
  iconColor?: string; // NEW: Specific icon color override
  fontFamily?:
    | 'sans'
    | 'serif'
    | 'mono'
    | 'graffiti'
    | 'handwritten'
    | 'display'
    | 'script'
    | 'slab'
    | 'gothic'
    | 'modern'
    | 'classic'
    | 'pixel';
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  priceValue: number; // Numeric value for calculations
  description: string;
  image?: string;
  icon?:
    | 'scissors'
    | 'razor'
    | 'combo'
    | 'kids'
    | 'clipper'
    | 'star'
    | 'wind'
    | 'sparkles'
    | 'color'; // Expanded icon set
  featured?: boolean;
  tag?: string;
  category?: string; // 'Combo', 'Cabelo', 'Barba', etc
  duration?: number; // Optional now
  discountPercentage?: number;
  promoImage?: string; // Specific image for the showcase
  tags?: string[];
  isVip?: boolean;
  badgeConfig?: BadgeConfig; // Legacy single badge
  badges?: BadgeConfig[]; // New: Multiple badges support
  activePromo?: {
    text: string;
    theme: 'standard' | 'christmas' | 'premium';
    discountValue?: number;
  };
}

export type Service = ServiceItem;

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export interface BookingData {
  name: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
}

export interface AiConsultationResponse {
  suggestion: string;
  styleName: string;
  maintenanceLevel: string;
}

// Novos tipos para o sistema completo
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  price: number;
  photoUrl?: string; // URL da foto do corte finalizado
  notes?: string; // Notas técnicas do barbeiro
  clientId?: string; // Link to ClientProfile
  barberId?: string; // Link to BarberProfile
}

export interface SavedStyle extends AiConsultationResponse {
  id: string;
  dateSaved: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string; // Foto do perfil do cliente
  loyaltyPoints: number; // 0 a 10
  history: Appointment[];
  savedStyles: SavedStyle[];
  preferences?: {
    cutFrequency: 'weekly' | 'biweekly' | 'monthly';
    favoriteStyle: string; // e.g., "Fade", "Mullet"
    beardPreference: 'clean' | 'stubble' | 'full';
    notes?: string;
  };
}

export interface BarberProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string; // Foto do perfil do barbeiro
}

export type DashboardView =
  | 'home'
  | 'clients'
  | 'calendar'
  | 'financial'
  | 'services'
  | 'marketing'
  | 'settings';

export type ClientStatus = 'active' | 'new' | 'vip' | 'inactive';

export interface Client {
  id: string;
  name: string;
  phone: string;
  level: number; // 1-10
  lastVisit: string;
  img: string | null;
  status: ClientStatus;
  notes: string;
}

// COMBO / HIGHLIGHTS SYSTEM
export interface ComboItem {
  serviceId: string;
  customLabel?: string; // Optional custom name for the service in this combo
}

export interface Combo {
  id: string;
  title: string; // e.g., "Dia do Noivo"
  subtitle?: string; // e.g., "Experiência completa"
  description?: string;

  priceValue: number; // Total price of the combo

  items: ComboItem[]; // List of services included

  // Visual
  badge?: string; // e.g., "VIP"
  theme: 'gold' | 'silver' | 'neon' | 'tuxedo' | 'classic' | 'standard';

  active: boolean;
  featured?: boolean; // Should it appear in "Destaques"?
  image?: string;
  duration?: number; // Total duration in minutes
}

export interface ShopSettings {
  startHour: number;
  endHour: number;
  slotInterval: number; // in minutes (e.g., 30, 60)
  exceptions?: Record<
    string,
    {
      // Key: 'YYYY-MM-DD'
      startHour?: number;
      endHour?: number;
      closed?: boolean;
    }
  >;
}
