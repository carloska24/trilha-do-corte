import db from './db.js';

const today = new Date().toISOString().split('T')[0];

const appointments = [
  {
    id: 'test-1',
    clientName: 'Roberto Silva',
    serviceId: '1', // Corte
    date: today,
    time: '09:00',
    status: 'completed',
    price: 35,
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    notes: 'Cliente fiel.',
  },
  {
    id: 'test-2',
    clientName: 'Carlos Henrique',
    serviceId: '5', // Hidratação / Combo? Let's use 1 (Corte) + 2 (Barba) maybe? Service 5 is Hidratação R$20
    date: today,
    time: '09:40',
    status: 'completed',
    price: 20,
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    notes: '',
  },
  {
    id: 'test-3',
    clientName: 'BRUNO', // User requested example
    serviceId: '1', // Corte
    date: today,
    time: '10:00',
    status: 'in_progress', // To show in "Em Atendimento" potentially, or just queue if pending?
    // Wait, DashboardHome filters `in_progress`.
    // If I want them in QUEUE (next passengers), status must be `pending` or `confirmed`.
    // The user screenshot showed "BRUNO 10:00 AGUARDANDO". So status: confirmed/pending.
    // If Bruno is "Next", he is first in queue.
    price: 35,
    photoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    notes: '',
  },
  {
    id: 'test-4',
    clientName: 'ANDRÉ', // User requested example
    serviceId: '2', // Barba (R$ 25)
    date: today,
    time: '10:35',
    status: 'confirmed',
    price: 25,
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    notes: '',
  },
  {
    id: 'test-5',
    clientName: 'Ricardo Oliveira',
    serviceId: '3', // Sobrancelha (R$ 10) - something different
    date: today,
    time: '11:20',
    status: 'pending',
    price: 10,
    photoUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    notes: '',
  },
];

// Clean table and insert
db.serialize(() => {
  db.run('DELETE FROM appointments', err => {
    if (err) {
      console.error('Error clearing appointments:', err);
      return;
    }
    console.log('Appointments cleared.');

    const stmt = db.prepare(
      'INSERT INTO appointments (id, clientName, serviceId, date, time, status, price, photoUrl, notes) VALUES (?,?,?,?,?,?,?,?,?)'
    );

    appointments.forEach(a => {
      stmt.run(
        a.id,
        a.clientName,
        a.serviceId,
        a.date,
        a.time,
        a.status,
        a.price,
        a.photoUrl,
        a.notes,
        err => {
          if (err) console.error('Error inserting', a.clientName, err);
          else console.log('Inserted:', a.clientName);
        }
      );
    });

    stmt.finalize(() => {
      console.log('Done seeding appointments.');
    });
  });
});
