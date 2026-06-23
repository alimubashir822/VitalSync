import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Redirect based on role
  if (session.role === 'PATIENT') {
    redirect('/patient/dashboard');
  } else if (session.role === 'DOCTOR') {
    redirect('/doctor/dashboard');
  } else if (session.role === 'CARE_TEAM') {
    redirect('/care-team/dashboard');
  } else if (session.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  redirect('/login');
}
