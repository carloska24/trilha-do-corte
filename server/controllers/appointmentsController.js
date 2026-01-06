import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import { appointmentSchema } from '../validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_123';

export const getAppointments = async (req, res) => {
  try {
    // 1. Auth Check & Role Decoupling
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user = null;
    let isBarber = false;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
        isBarber = user.type === 'barber';
      } catch (err) {
        // Token invalid/expired - Treat as Guest
      }
    }

    // 2. Query Optimization (Tunnel Vision)
    let queryText = 'SELECT * FROM appointments';
    let params = [];

    // DEFAULT (GUEST): Only fetch future + recent busy slots to keep payload small
    // Optimization: Guests only need to know what is taken to avoid double booking.
    if (!user) {
      // Fetch only future appointments (and maybe today's)
      queryText += ' WHERE date >= CURRENT_DATE::text';
      // Note: 'date' column is text in this schema, so we cast or use string comparison if stored as ISO YYYY-MM-DD
    }
    // CLIENT: Fetch ONLY their history + future
    else if (!isBarber) {
      queryText += ' WHERE clientid = $1';
      params.push(user.id);
    }
    // BARBER: Fetch Everything (Maybe limit history to last 6 months for speed?)
    else if (isBarber) {
      // For now, load all for barber to ensure full dashboard visibility,
      // but ideally should be paginated or limited by date range in future.
      // queryText += " WHERE date >= ..."
    }

    console.log(
      `🔍 [API] GetApps - Strategy: ${
        !user ? 'GUEST (Filtered)' : isBarber ? 'BARBER (Full)' : 'CLIENT (Personal)'
      }`
    );

    const { rows } = await db.query(queryText, params);

    // 3. Privacy Filter (The "View" Layer) remains as secondary safety net
    const data = rows.map(row => {
      // Fix: Handle PG casing (clientId vs clientid)
      const dbClientId = row.clientId !== undefined ? row.clientId : row.clientid;

      // Strict check that handles 0 and string/number mismatch
      const isOwner =
        user &&
        dbClientId !== null &&
        dbClientId !== undefined &&
        String(dbClientId) === String(user.id);

      if (isBarber || isOwner) {
        return row; // Full Data
      }

      return {
        // Sanitized for Guests
        date: row.date,
        time: row.time,
        serviceId: row.serviceId || row.serviceid,
        status: row.status,
      };
    });

    res.json({ data });
  } catch (err) {
    console.error('GetAppointments Error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    const { clientName, serviceId, date, time, status, price, photoUrl, notes, clientId } =
      validatedData;

    // Legacy mapping or use validatedData directly. The schema ensures types.
    // Note: Schema validation already checks valid date/time format, so we can simplify checks below or keep them as double-safety.
    // 1. Check for Double Booking
    const { rows: existingRows } = await db.query(
      "SELECT * FROM appointments WHERE date = $1 AND time = $2 AND status != 'cancelled'",
      [date, time]
    );

    if (existingRows.length > 0) {
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
    const id = uuidv4();
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
      clientId !== undefined && clientId !== null ? clientId : null, // Fix: Allow 0 as ID
    ];

    await db.query(sql, params);

    // RETURN FULL OBJECT (Critical for UI consistency)
    res.json({
      message: 'success',
      data: { id, clientName, serviceId, date, time, status, price, photoUrl, notes, clientId },
    });
  } catch (e) {
    if (e.code === '23505') {
      console.warn('⚠️ Double booking attempt prevented by DB constraint.');
      return res
        .status(409)
        .json({ error: 'Ops! Este horário acabou de ser reservado por outro cliente.' });
    }

    console.error('❌ [POST] Error Creating Appointment:', e);
    return res.status(400).json({ error: 'Erro ao validar/salvar agendamento: ' + e.message });
  }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { status, date, time, notes, price, serviceId } = req.body;

  try {
    const fields = [];
    const params = [];
    let idx = 1;

    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      params.push(status);
    }
    if (date !== undefined) {
      fields.push(`date = $${idx++}`);
      params.push(date);
    }
    if (time !== undefined) {
      fields.push(`time = $${idx++}`);
      params.push(time);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      params.push(notes);
    }
    if (price !== undefined) {
      fields.push(`price = $${idx++}`);
      params.push(price);
    }
    if (serviceId !== undefined) {
      fields.push(`serviceId = $${idx++}`);
      params.push(serviceId);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    params.push(id);
    const sql = `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx}`;
    const result = await db.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const { rows: updatedRows } = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
    res.json({
      success: true,
      message: 'Agendamento atualizado com sucesso.',
      data: updatedRows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearAppointments = async (req, res) => {
  try {
    await db.query('DELETE FROM appointments');
    res.json({ message: 'Agenda limpa com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
