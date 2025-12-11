export const isStoreOpen = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const hour = now.getHours();

  // Fechado aos Domingos (0)
  if (day === 0) return false;

  // Aberto de Segunda (1) a Sábado (6)
  // Das 08:00 às 19:00
  if (hour >= 8 && hour < 19) {
    return true;
  }

  return false;
};

export const getStoreStatusMessage = (): { isOpen: boolean; text: string; color: string } => {
  const open = isStoreOpen();
  if (open) {
    return { isOpen: true, text: 'Aberto Agora', color: 'bg-green-500' };
  } else {
    return { isOpen: false, text: 'Fechado', color: 'bg-red-500' };
  }
};
