import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

export const getClients = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM clients');
    res.json({ data: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBarbers = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM barbers');
    res.json({ data: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateClientProfile = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, img, preferences } = req.body;

  try {
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
    if (preferences?.notes !== undefined) {
      updates.push(`notes = $${paramIdx++}`);
      params.push(preferences.notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    params.push(id);
    const sql = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
    await db.query(sql, params);

    const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Update Client Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateBarberProfile = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, img, bio, specialty, password } = req.body;

  try {
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
      updates.push(`image = $${paramIdx++}`);
      params.push(img);
    }
    // if (bio !== undefined) {
    //   // Barber specific - Column likely missing in DB, disabling to prevent crash
    //   updates.push(`bio = $${paramIdx++}`);
    //   params.push(bio);
    // }
    if (specialty !== undefined) {
      // Barber specific
      updates.push(`specialty = $${paramIdx++}`);
      params.push(specialty);
    }
    if (password !== undefined && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIdx++}`);
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    params.push(id);
    const sql = `UPDATE barbers SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
    await db.query(sql, params);

    const { rows } = await db.query('SELECT * FROM barbers WHERE id = $1', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Update Barber Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createClientAdmin = async (req, res) => {
  const { name, phone, level, lastVisit, img, status, notes } = req.body;
  const id = uuidv4();
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
};
