import { NextResponse } from 'next/server';
import { authConfigured, getAuth } from '@/server/auth';

export const runtime = 'nodejs';

const unavailable = () =>
  NextResponse.json({ code: 'not_configured', message: 'Accounts are not available yet.' }, { status: 503 });

export async function GET(request: Request) {
  return authConfigured() ? getAuth().handler(request) : unavailable();
}

export async function POST(request: Request) {
  return authConfigured() ? getAuth().handler(request) : unavailable();
}
