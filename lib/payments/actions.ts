'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';


export const customerPortalAction = async (formData: FormData) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      redirect('/login');
    }

    const team = await getTeamByUserId(session.user.id);
    
    // ถ้าไม่มี team ให้ redirect ไปสร้าง team ก่อน
    if (!team) {
      redirect('/onboarding/team?redirect=billing');
    }

    // ถ้าไม่มี subscription ให้ redirect ไปหน้า pricing
    if (!team.stripeCustomerId || !team.subscriptionStatus) {
      redirect('/pricing');
    }

    const portalSession = await createCustomerPortalSession(team);
    redirect(portalSession.url);
    
  } catch (error) {
    console.error('Customer portal error:', error);
    redirect('/billing?error=portal_failed');
  }
};