import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/email.js';

const router = Router();

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ROLES = {
  superadmin: { panels: ['monitoreo', 'rfid', 'ventas'] },
  supervisor:  { panels: ['monitoreo', 'ventas'] },
  operador:    { panels: ['rfid'] },
  analista:    { panels: ['ventas'] },
};

// GET /users — listar todos los usuarios
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    if (error) throw error;
    res.json(data.users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users — crear usuario
router.post('/', requireAdmin, async (req, res) => {
  const { email, password, nombre, cargo, role } = req.body;
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'email, password y nombre son requeridos' });
  }
  const panels = ROLES[role]?.panels ?? ['rfid'];
  try {
    const { data: usersData } = await adminSupabase.auth.admin.listUsers();
    const existingNums = (usersData?.users ?? [])
      .map(u => parseInt(u.user_metadata?.empleadoId?.replace('VRT-', '') ?? ''))
      .filter(n => !isNaN(n) && n > 0);
    const nextNum = (Math.max(0, ...existingNums) + 1).toString().padStart(4, '0');
    const empleadoId = `VRT-${nextNum}`;

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        cargo: cargo ?? '',
        role: role ?? 'operador',
        panels,
        empleadoId,
        mustChangePassword: true,
      },
    });
    if (error) throw error;

    // Send welcome email with temporary credentials (non-blocking)
    sendWelcomeEmail({ email, nombre, empleadoId, password }).catch(err => {
      console.error('[email] Error enviando correo de bienvenida:', err.message);
    });

    res.status(201).json(data.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id — eliminar usuario
router.delete('/:id', requireAdmin, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }
  try {
    const { error } = await adminSupabase.auth.admin.deleteUser(req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
