import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Debug Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url} | Origin: ${req.headers.origin || 'Unknown'}`);
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper Wrapper for db.query to avoid repetitive try/catch if desired,
// but using explicit try/catch in handlers is clearer for migration.

// Auth Endpoints
app.post('/api/login/client', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  console.log('📝 [Login Attempt] Client:', emailOrPhone);

  try {
    const { rows } = await db.query('SELECT * FROM clients WHERE email = $1 OR phone = $2', [
      emailOrPhone,
      emailOrPhone,
    ]);
    const row = rows[0];

    if (row) {
      console.log('✅ User found:', row.name);
      const match = await bcrypt.compare(password, row.password);
      console.log('🔐 Match:', match);

      if (match) {
        // Strip password
        const { password, ...userWithoutPass } = row;
        res.json({ success: true, data: userWithoutPass });
      } else {
        res.status(401).json({ error: 'Senha incorreta.' });
      }
    } else {
      console.log('⚠️ User NOT found:', emailOrPhone);
      res.status(401).json({ error: 'Usuário não encontrado.' });
    }
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login/barber', async (req, res) => {
  const { email, password } = req.body;
  console.log('💈 [Login Attempt] Barber:', email);

  try {
    const { rows } = await db.query('SELECT * FROM barbers WHERE email = $1', [email]);
    const row = rows[0];

    if (row) {
      console.log('✅ Barber found:', row.name);
      const match = await bcrypt.compare(password, row.password);
      if (match) {
        const { password, ...userWithoutPass } = row;
        res.json({ success: true, data: userWithoutPass });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (err) {
    console.error('❌ Database Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register/barber', async (req, res) => {
  const { name, phone, email, password, photoUrl } = req.body;
  const id = Date.now().toString();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Note: 'specialty' is optional or can be set to default
    const sql =
      'INSERT INTO barbers (id, name, specialty, image, email, password, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const params = [id, name, 'Barbeiro', photoUrl, email, hashedPassword, phone];

    await db.query(sql, params);
    res.json({
      success: true,
      data: { id, name, specialty: 'Barbeiro', image: photoUrl, email, phone },
    });
  } catch (err) {
    console.error('❌ Register Barber Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register/client', async (req, res) => {
  const { name, phone, email, password, photoUrl } = req.body;

  // Sequential ID Logic: Find max ID < 1,000,000 (to exclude timestamps)
  let id = '0';
  try {
    const { rows } = await db.query('SELECT id FROM clients');
    const existingIds = rows.map(r => parseInt(r.id, 10)).filter(n => !isNaN(n) && n < 1000000); // Filter out timestamp IDs

    if (existingIds.length > 0) {
      const maxId = Math.max(...existingIds);
      id = (maxId + 1).toString();
    }
  } catch (e) {
    console.error('Error generating ID, using timestamp fallback:', e);
    id = Date.now().toString();
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO clients (id, name, phone, email, password, img, level, status, notes) VALUES ($1, $2, $3, $4, $5, $6, 1, 'new', '')";
    const params = [id, name, phone, email, hashedPassword, photoUrl];

    await db.query(sql, params);
    res.json({
      success: true,
      data: { id, name, phone, email, img: photoUrl, level: 1, status: 'new' },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Erro ao criar conta: ' + error.message });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services');
    const services = rows.map(row => ({
      ...row,
      activePromo: row.activepromo ? JSON.parse(row.activepromo) : null, // Postgres lowercases column names
      badges: row.badges ? JSON.parse(row.badges) : [],
    }));
    res.json({ data: services });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  const {
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo,
    category,
    duration,
    badges,
  } = req.body;
  const id = Date.now().toString();
  const sql =
    'INSERT INTO services (id, name, price, priceValue, description, icon, image, activePromo, category, duration, badges) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
  const params = [
    id,
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo ? JSON.stringify(activePromo) : null,
    category || 'Outros',
    duration || 30,
    badges ? JSON.stringify(badges) : null,
  ];

  try {
    await db.query(sql, params);
    res.json({
      message: 'success',
      data: { id, name, price, priceValue, description, icon, image, activePromo, badges },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo,
    category,
    duration,
    badges,
  } = req.body;

  const sql =
    'UPDATE services SET name = $1, price = $2, priceValue = $3, description = $4, icon = $5, image = $6, activePromo = $7, category = $8, duration = $9, badges = $10 WHERE id = $11';
  const params = [
    name,
    price,
    priceValue,
    description,
    icon,
    image,
    activePromo ? JSON.stringify(activePromo) : null,
    category || 'Outros',
    duration || 30,
    badges ? JSON.stringify(badges) : null,
    id,
  ];

  try {
    await db.query(sql, params);
    res.json({
      message: 'updated',
      data: {
        id,
        name,
        price,
        priceValue,
        description,
        icon,
        image,
        activePromo,
        category,
        duration,
        badges,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ message: 'deleted', id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Barbers
app.get('/api/barbers', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM barbers');
    res.json({ data: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clients
app.get('/api/clients', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM clients');
    res.json({ data: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE CLIENT PROFILE
app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, img, preferences } = req.body;
  console.log(`[PUT /api/clients/${id}]`, req.body);

  try {
    // Only update fields that are provided
    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIdx++}`);
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIdx++}`);
      params.push(phone);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIdx++}`);
      params.push(email);
    }
    if (img !== undefined) {
      updates.push(`img = $${paramIdx++}`);
      params.push(img);
    }
    // 'preferences' is not a direct column but we could store it as JSON or notes
    // For now, we can ignore or store preferences.notes in 'notes'
    if (preferences?.notes !== undefined) {
      updates.push(`notes = $${paramIdx++}`);
      params.push(preferences.notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    params.push(id); // Last param is the ID for WHERE clause
    const sql = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
    await db.query(sql, params);

    // Return updated row
    const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Update Client Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, phone, level, lastVisit, img, status, notes } = req.body;
  const id = Date.now().toString();
  const sql =
    'INSERT INTO clients (id, name, phone, level, lastVisit, img, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  const params = [id, name, phone, level, lastVisit, img, status, notes];

  try {
    await db.query(sql, params);
    res.json({
      message: 'success',
      data: { id, name, phone, level, lastVisit, img, status, notes },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM appointments');
    res.json({ data: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { clientName, serviceId, date, time, status, price, photoUrl, notes } = req.body;

  try {
    // 1. Check for Double Booking
    const { rows: existingRows } = await db.query(
      "SELECT * FROM appointments WHERE date = $1 AND time = $2 AND status != 'cancelled'",
      [date, time]
    );

    console.log(`[DEBUG] Booking Check: Date=${date}, Time=${time}, Found=${existingRows.length}`);
    console.log('[DEBUG] Incoming Appointment Payload:', {
      clientName,
      serviceId,
      clientId: req.body.clientId,
    });

    if (existingRows.length > 0) {
      console.log('[DEBUG] Conflict found!');
      return res.status(409).json({ error: 'Horário já reservado por outro cliente.' });
    }

    // 2. Check Business Rules
    const dateObj = new Date(`${date}T${time}`);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Data ou hora inválida.' });
    }

    const day = dateObj.getDay(); // 0 = Sunday
    const hour = parseInt(time.split(':')[0], 10);

    // Rule: Closed on Sundays
    if (day === 0) {
      return res.status(400).json({ error: 'A barbearia não abre aos domingos!' });
    }

    // Rule: Hours 08:00 - 19:00
    if (hour < 8 || hour >= 19) {
      return res.status(400).json({ error: 'Estamos fechados. Horário: 08h às 19h.' });
    }

    // Insert
    const id = Date.now().toString(); // clientId is passed in body
    const sql =
      'INSERT INTO appointments (id, clientName, serviceId, date, time, status, price, photoUrl, notes, clientId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    const params = [
      id,
      clientName,
      serviceId,
      date,
      time,
      status,
      price,
      photoUrl,
      notes,
      req.body.clientId,
    ];

    await db.query(sql, params);
    res.json({
      message: 'success',
      data: { id, clientName, serviceId, date, time, status, price, photoUrl, notes },
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Erro ao validar/salvar agendamento: ' + e.message });
  }
});

// Clear All Appointments (Reset)
app.delete('/api/appointments', async (req, res) => {
  try {
    await db.query('DELETE FROM appointments');
    console.log('🗑️ [API] All appointments deleted by request.');
    res.json({ message: 'Agenda limpa com sucesso.' });
  } catch (err) {
    console.error('❌ Error clearing appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
