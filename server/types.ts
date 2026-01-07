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
  textColor?: string;
  iconColor?: string;
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
  priceValue: number;
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
    | 'color';
  featured?: boolean;
  tag?: string;
  category?: string;
  duration?: number;
  discountPercentage?: number;
  promoImage?: string;
  tags?: string[];
  isVip?: boolean;
  badgeConfig?: BadgeConfig;
  badges?: BadgeConfig[];
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

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
  photoUrl?: string;
  notes?: string;
  clientId?: string;
  barberId?: string;
  clientPhone?: string;
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
  email?: string; // Added per context
}

export interface BarberProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string; // Foto do perfil do barbeiro
  phone?: string; // Telefone do barbeiro (Optional)
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
  isGuest?: boolean;
}

export interface ComboItem {
  serviceId: string;
  customLabel?: string;
}

export interface Combo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  priceValue: number;
  items: ComboItem[];
  badge?: string;
  theme: 'gold' | 'silver' | 'neon' | 'tuxedo' | 'classic' | 'standard';
  active: boolean;
  featured?: boolean;
  image?: string;
  duration?: number;
}

export interface ShopSettings {
  startHour: number;
  endHour: number;
  slotInterval: number;
  exceptions?: Record<
    string,
    {
      startHour?: number;
      endHour?: number;
      closed?: boolean;
    }
  >;
}
