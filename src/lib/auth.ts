import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'vitalsync_super_secret_key_12345';
const SESSION_COOKIE = 'vitalsync_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'CARE_TEAM' | 'ADMIN';
  patientId?: string;
  providerId?: string;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      patientProfile: true,
      providerProfile: true,
    },
  });
}
