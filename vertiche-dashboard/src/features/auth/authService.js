import { supabase } from './supabase';

function sessionFromUser(user) {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id:        user.id,
    email:     user.email,
    nombre:    meta.nombre    ?? user.email,
    cargo:     meta.cargo     ?? '',
    role:      meta.role      ?? 'operador',
    panels:    meta.panels    ?? ['rfid'],
    roleLabel: meta.roleLabel ?? meta.role ?? 'Operador',
  };
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { session: sessionFromUser(data.user) };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return sessionFromUser(data.session?.user ?? null);
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(sessionFromUser(session?.user ?? null));
  });
  return () => subscription.unsubscribe();
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return error ? { error: error.message } : { ok: true };
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { error: error.message } : { ok: true };
}
