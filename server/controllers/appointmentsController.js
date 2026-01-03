import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import jwt from 'jsonwebtoken';

export const getAppointments = async (req, res) => {
  try {
    // 1. Check Authority (Soft Auth)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isBarber = false;

    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        isBarber = true;
      } catch (err) {
        // Token invalid - Default to public view
      }
    }

    // 2. Optimized Query
    // Public: Only fetch recent/future appointments (Privacy + Perf)
    // Barber: Fetch All (for now)
    let queryText = 'SELECT * FROM appointments';

    if (!isBarber) {
      // Postgres-specific: Cast to date if string, or compare if date.
      // Assuming standard ISO string 'YYYY-MM-DD' which is lexicographically comparable.
      // Adding a safety margin for timezones
      queryText += " WHERE date >= TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD')";
    }

    const { rows } = await db.query(queryText);

    // 3. Data Sanitization (Privacy Shield)
    const data = rows.map(row => {
      if (isBarber) return row;

      return {
        // PUBLIC FIELDS ONLY
        date: row.date,
        time: row.time,
        // Handle PG potential casing issues (serviceId vs serviceid)
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
  const { clientName, serviceId, date, time, status, price, photoUrl, notes } = req.body;

  try {
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
      req.body.clientId || null,
    ];

    const result = await db.query(sql, params);
    res.json({
      message: 'success',
      data: { id, clientName, serviceId, date, time, status, price, photoUrl, notes },
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
