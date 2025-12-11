import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth Endpoints
app.post('/api/login/client', (req, res) => {
  const { emailOrPhone, password } = req.body;

  console.log('📝 [Login Attempt] Client:', emailOrPhone);

  // Try to clean phone input just in case (remove spaces, parens, dashes)
  // But for now, let's just log what we have.

  db.get(
    'SELECT * FROM clients WHERE email = ? OR phone = ?',
    [emailOrPhone, emailOrPhone],
    async (err, row) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        console.log(
          '✅ User found:',
          row.name,
          '| Stored Hash:',
          row.password.substring(0, 15) + '...'
        );
        const match = await bcrypt.compare(password, row.password);
        console.log('🔐 Password Match Result:', match);

        if (match) {
          console.log('🚀 Login Successful!');
          const { password, ...userWithoutPass } = row;
          res.json({ success: true, data: userWithoutPass });
        } else {
          console.log('⛔ Password Rejected.');
          res.status(401).json({ error: 'Senha incorreta.' });
        }
      } else {
        console.log('⚠️ User NOT found for:', emailOrPhone);
        res.status(401).json({ error: 'Usuário não encontrado.' });
      }
    }
  );
});

app.post('/api/login/barber', (req, res) => {
  const { email, password } = req.body;
  console.log('💈 [Login Attempt] Barber:', email);

  db.get('SELECT * FROM barbers WHERE email = ?', [email], async (err, row) => {
    if (err) {
      console.error('❌ Database Error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      console.log('✅ Barber found:', row.name);
      const match = await bcrypt.compare(password, row.password);
      console.log('🔐 Password Match:', match);

      if (match) {
        const { password, ...userWithoutPass } = row;
        res.json({ success: true, data: userWithoutPass });
      } else {
        console.log('⛔ Password Rejected.');
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      console.log('⚠️ Barber NOT found:', email);
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});

app.post('/api/register/client', async (req, res) => {
  const { name, phone, email, password, photoUrl } = req.body;
  const id = Date.now().toString();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      'INSERT INTO clients (id, name, phone, email, password, img, level, status, notes) VALUES (?,?,?,?,?,?, 1, "new", "")';
    const params = [id, name, phone, email, hashedPassword, photoUrl];

    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        success: true,
        data: { id, name, phone, email, img: photoUrl, level: 1, status: 'new' },
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Services
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Parse JSON string back to object
    const services = rows.map(row => ({
      ...row,
      activePromo: row.activePromo ? JSON.parse(row.activePromo) : null,
    }));
    res.json({ data: services });
  });
});

app.post('/api/services', (req, res) => {
  const { name, price, priceValue, description, icon, image, activePromo } = req.body;
  const id = Date.now().toString(); // Simple ID generation
  const sql =
    'INSERT INTO services (id, name, price, priceValue, description, icon, image, activePromo) VALUES (?,?,?,?,?,?,?,?)';
  const params = [
    id,
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo ? JSON.stringify(activePromo) : null,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id, name, price, priceValue, description, icon, image, activePromo },
    });
  });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, priceValue, description, icon, image, activePromo } = req.body;
  const sql =
    'UPDATE services SET name = ?, price = ?, priceValue = ?, description = ?, icon = ?, image = ?, activePromo = ? WHERE id = ?';
  const params = [
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo ? JSON.stringify(activePromo) : null,
    id,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'updated',
      data: { id, name, price, priceValue, description, icon, image, activePromo },
    });
  });
});

// Barbers
app.get('/api/barbers', (req, res) => {
  db.all('SELECT * FROM barbers', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/clients', (req, res) => {
  const { name, phone, level, lastVisit, img, status, notes } = req.body;
  const id = Date.now().toString();
  const sql =
    'INSERT INTO clients (id, name, phone, level, lastVisit, img, status, notes) VALUES (?,?,?,?,?,?,?,?)';
  const params = [id, name, phone, level, lastVisit, img, status, notes];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: { id, name, phone, level, lastVisit, img, status, notes },
    });
  });
});

// Appointments
app.get('/api/appointments', (req, res) => {
  db.all('SELECT * FROM appointments', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/appointments', (req, res) => {
  const { clientName, serviceId, date, time, status, price, photoUrl, notes } = req.body;

  // 1. Check for Double Booking
  db.get(
    'SELECT * FROM appointments WHERE date = ? AND time = ? AND status != "cancelled"',
    [date, time],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existing) {
        return res.status(409).json({ error: 'Horário já reservado por outro cliente.' });
      }

      // 2. Check Business Rules (Hours & Days)
      try {
        // Construct date object safely (handling potential format issues)
        const dateObj = new Date(`${date}T${time}`);

        // If date is invalid
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({ error: 'Data ou hora inválida.' });
        }

        const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday...
        const hour = parseInt(time.split(':')[0], 10);

        // Rule: Closed on Sundays
        if (day === 0) {
          return res.status(400).json({ error: 'A barbearia não abre aos domingos!' });
        }

        // Rule: Hours 09:00 - 19:00
        // Allows start times from 09:00 up to 18:00 (closing at 19:00)?
        // Let's assume last slot is 18:XX so they finish by 19:00, or strict 19:00 limit.
        // User rule: "08h-19h" (Memory says 08h-19h. Audit said 09h? Memory says "Seg-Sáb, 08h-19h")
        // I will use 08h to 19h based on Memory.
        if (hour < 8 || hour >= 19) {
          return res.status(400).json({ error: 'Estamos fechados. Horário: 08h às 19h.' });
        }

        // Proceed to Insert
        const id = Date.now().toString();
        const sql =
          'INSERT INTO appointments (id, clientName, serviceId, date, time, status, price, photoUrl, notes) VALUES (?,?,?,?,?,?,?,?,?)';
        const params = [id, clientName, serviceId, date, time, status, price, photoUrl, notes];

        db.run(sql, params, function (err2) {
          if (err2) {
            res.status(400).json({ error: err2.message });
            return;
          }
          res.json({
            message: 'success',
            data: { id, clientName, serviceId, date, time, status, price, photoUrl, notes },
          });
        });
      } catch (e) {
        console.error(e);
        return res.status(400).json({ error: 'Erro ao validar horário.' });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
