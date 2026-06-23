'use server';

import { prisma } from '@/lib/db';
import { hashPassword, setSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        providerProfile: true,
      },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return { error: 'Invalid email or password.' };
    }

    // Set Session
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      patientId: user.patientProfile?.id,
      providerId: user.providerProfile?.id,
    });

    // Determine redirection
    let redirectPath = '/login';
    if (user.role === 'PATIENT') {
      redirectPath = '/patient/dashboard';
    } else if (user.role === 'DOCTOR') {
      redirectPath = '/doctor/dashboard';
    } else if (user.role === 'CARE_TEAM') {
      redirectPath = '/care-team/dashboard';
    } else if (user.role === 'ADMIN') {
      redirectPath = '/admin/dashboard';
    }

    // Server actions redirect
    redirect(redirectPath);
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Standard Next.js redirect behavior
    }
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
