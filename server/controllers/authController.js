import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import {
  loginSchema,
  loginBarberSchema,
  registerClientSchema,
  registerBarberSchema,
} from '../validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_123';

const generateToken = user => {
  return jwt.sign(
    { id: user.id, email: user.email, type: user.specialty ? 'barber' : 'client' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const loginClient = async (req, res) => {
  try {
    const { emailOrPhone, password } = loginSchema.parse(req.body);
    console.log('📝 [Login Attempt] Client:', emailOrPhone);

    const { rows } = await db.query('SELECT * FROM clients WHERE email = $1 OR phone = $2', [
      emailOrPhone,
      emailOrPhone,
    ]);
    const row = rows[0];

    if (row) {
      console.log('✅ User found:', row.name);

      // 🛡️ Segurança: Verificar integridade da senha (hash)
      if (!row.password) {
        console.error(`❌ [Auth Error] Senha ausente no DB para usuário: ${emailOrPhone}`);
        return res.status(401).json({ error: 'Erro de cadastro. Contate o suporte.' });
      }

      let match = false;
      try {
        match = await bcrypt.compare(password, row.password);
      } catch (bcryptErr) {
        console.error('❌ [Bcrypt Error] Falha na verificação de senha:', bcryptErr);
        // Não retornar 500 aqui para não assustar o cliente, apenas negar acesso
        return res.status(401).json({ error: 'Erro de verificação de credenciais.' });
      }

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
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    console.error('❌ Database error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const loginBarber = async (req, res) => {
  try {
    const { email, password } = loginBarberSchema.parse(req.body);
    console.log('💈 [Login Attempt] Barber:', email);

    const { rows } = await db.query('SELECT * FROM barbers WHERE email = $1', [email]);
    const row = rows[0];

    if (row) {
      console.log('✅ Barber found:', row.name);

      if (!row.password) {
        console.error(`❌ [Auth Error] Senha ausente no DB para barbeiro: ${email}`);
        return res.status(401).json({ error: 'Erro de cadastro. Contate o admin.' });
      }

      let match = false;
      try {
        match = await bcrypt.compare(password, row.password);
      } catch (err) {
        console.error('❌ [Bcrypt Error] Falha na verificação:', err);
        return res.status(401).json({ error: 'Erro de verificação.' });
      }

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
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    console.error('❌ Database Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const registerClient = async (req, res) => {
  try {
    const { name, phone, email, password, photoUrl } = registerClientSchema.parse(req.body);
    const id = uuidv4();

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
  try {
    const { name, phone, email, password, photoUrl } = registerBarberSchema.parse(req.body);
    const id = uuidv4();

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
