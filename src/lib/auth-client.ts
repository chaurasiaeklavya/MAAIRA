'use client';

import { createAuthClient } from 'better-auth/react';

/** Browser client for /api/auth (same origin; cookies are httpOnly). */
export const authClient = createAuthClient();
