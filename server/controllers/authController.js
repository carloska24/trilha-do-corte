import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_123';

const generateToken = user => {
  return jwt.sign(
    { id: user.id, email: user.email, type: user.specialty ? 'barber' : 'client' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const loginClient = async (req, res) => {
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

      if (match) {
        const { password, ...userWithoutPass } = row;
        const token = generateToken(userWithoutPass);
        res.json({ success: true, token, data: userWithoutPass });
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
};

export const loginBarber = async (req, res) => {
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
        const token = generateToken(userWithoutPass);
        res.json({ success: true, token, data: userWithoutPass });
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
};

export const registerClient = async (req, res) => {
  const { name, phone, email, password, photoUrl } = req.body;
  const id = uuidv4();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO clients (id, name, phone, email, password, img, level, status, notes) VALUES ($1, $2, $3, $4, $5, $6, 1, 'new', '')";
    const params = [id, name, phone, email, hashedPassword, photoUrl];

    await db.query(sql, params);

    // Return token directly after register for auto-login
    const newUser = { id, name, phone, email, img: photoUrl, level: 1, status: 'new' };
    const token = generateToken(newUser);

    res.json({
      success: true,
      token,
      data: newUser,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Erro ao criar conta: ' + error.message });
  }
};

export const registerBarber = async (req, res) => {
  const { name, phone, email, password, photoUrl } = req.body;
  const id = uuidv4();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      'INSERT INTO barbers (id, name, specialty, image, email, password, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const params = [id, name, 'Barbeiro', photoUrl, email, hashedPassword, phone];

    await db.query(sql, params);

    const newBarber = { id, name, specialty: 'Barbeiro', image: photoUrl, email, phone };
    const token = generateToken(newBarber);

    res.json({
      success: true,
      token,
      data: newBarber,
    });
  } catch (err) {
    console.error('❌ Register Barber Error:', err);
    res.status(500).json({ error: err.message });
  }
};
