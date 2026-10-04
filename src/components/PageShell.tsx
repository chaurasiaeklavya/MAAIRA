'use client';

import { ViewTransition, type ReactNode } from 'react';

/**
 * Wraps each page so route changes animate with the View Transitions API:
 * a directional slide for links tagged `nav-forward` / `nav-back`, and a quiet
 * fade-rise otherwise (including browser back/forward). The header is anchored
 * separately (view-transition-name: site-header) so it never moves.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'nav-forward': 'page-forward', 'nav-back': 'page-back', default: 'page-fade' }}
      exit={{ 'nav-forward': 'page-forward', 'nav-back': 'page-back', default: 'page-fade' }}
      default="none"
    >
      <div className="page">{children}</div>
    </ViewTransition>
  );
}

/** Shared-element wrapper: the same `name` on two routes morphs between them. */
export function SharedFrame({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
