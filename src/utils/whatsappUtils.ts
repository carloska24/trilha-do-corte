import { Appointment, Service } from '../types';
import { SERVICES as ALL_SERVICES } from '../constants';

interface WhatsAppExportOptions {
  date: Date;
  appointments: Appointment[];
  services: Service[]; // From Context
  barberPhone?: string;
  shopName?: string;
}

export const generateWhatsAppExportUrl = ({
  date,
  appointments,
  services,
  barberPhone,
  shopName = 'Trilha do Corte',
}: WhatsAppExportOptions): string => {
  // Helper to resolve service details
  const getServiceDetails = (id: string | number) => {
    if (!id)
      return { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 };

    const searchId = String(id).trim();
    const s =
      services.find(serv => String(serv.id).trim() === searchId) ||
      ALL_SERVICES.find(serv => String(serv.id).trim() === searchId);

    return (
      s || { name: 'Serviço', category: 'Geral', icon: 'scissors', price: 'R$-', duration: 30 }
    );
  };

  const dailyApps = (appointments || [])
    .filter(a => !!a)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (dailyApps.length === 0) {
    return '';
  }

  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  // Calculate Totals
  let totalRevenue = 0;
  let totalMinutes = 0;

  dailyApps.forEach(app => {
    const service = getServiceDetails(app.serviceId);
    const rawPrice = String(service.price || '0');
    const cleanPrice = rawPrice.replace(/[^\d,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPrice);

    if (!isNaN(priceNum)) totalRevenue += priceNum;
    totalMinutes += Number(service.duration) || 30;
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h${minutes > 0 ? minutes : ''}` : `${minutes} min`;

  // Icons
  const ICON_CALENDAR = '🗓️';
  const ICON_CLOCK = '⏰';
  const ICON_USER = '👤';
  const ICON_DURATION = '⏳';
  const ICON_MONEY = '💸';
  const ICON_CHART = '📈';
  const ICON_SHOP = '💈';
  const SEPARATOR = '──────────────';

  let msg = `${ICON_CALENDAR} *AGENDA — ${dateStr}*\n`;
  msg += `${ICON_SHOP} ${shopName}\n\n`;

  dailyApps.forEach(app => {
    const service = getServiceDetails(app.serviceId);
    let sIcon = '✂️';
    if (service.name.toLowerCase().includes('barba')) sIcon = '💈';
    if (
      service.name.toLowerCase().includes('alisamento') ||
      service.name.toLowerCase().includes('selagem')
    )
      sIcon = '🧴';

    let clientName = (app.clientName || 'Cliente').trim();
    clientName = clientName.replace(/\b\w/g, l => l.toUpperCase());

    msg += `${SEPARATOR}\n`;
    msg += `${ICON_CLOCK} *${app.time}*\n`;
    msg += `${ICON_USER} ${clientName}\n`;
    msg += `${sIcon} ${service.name}\n`;
    msg += `${ICON_DURATION} ${service.duration} min\n`;
    msg += `${ICON_MONEY} ${service.price}\n`;
  });

  msg += `\n${SEPARATOR}\n\n`;
  msg += `${ICON_CHART} *Resumo do dia*\n`;
  msg += `${ICON_DURATION} Tempo total: ${durationStr}\n`;
  msg += `${ICON_MONEY} Faturamento: ${totalRevenue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}\n`;

  // Build URL
  const cleanPhone = barberPhone?.replace(/\D/g, '');
  const baseUrl = `https://api.whatsapp.com/send`;
  const phoneParam = cleanPhone ? `&phone=55${cleanPhone}` : '';
  const textParam = `text=${encodeURIComponent(msg)}`;

  return `${baseUrl}?${textParam}${phoneParam}`;
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const baseUrl = `https://api.whatsapp.com/send`;
  const phoneParam = cleanPhone ? `&phone=55${cleanPhone}` : '';
  const textParam = `text=${encodeURIComponent(message)}`;
  return `${baseUrl}?${textParam}${phoneParam}`;
};
