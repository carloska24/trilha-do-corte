import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

export const getServices = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services');
    const services = rows.map(row => ({
      ...row,
      activePromo: row.activepromo ? JSON.parse(row.activepromo) : null,
      badges: row.badges ? JSON.parse(row.badges) : [],
    }));
    res.json({ data: services });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createService = async (req, res) => {
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
  const id = uuidv4();
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
};

export const updateService = async (req, res) => {
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
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ message: 'deleted', id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
