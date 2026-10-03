/**
 * Tiny external store for the desktop cursor label, so hover states on cards
 * and carousels don't re-render the React tree.
 */
type Listener = () => void;

let label: string | null = null;
const listeners = new Set<Listener>();

export const cursorStore = {
  get: () => label,
  set(next: string | null) {
    if (next === label) return;
    label = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** Spread onto any element: `<div {...cursorLabel('View')}>` */
export function cursorLabel(text: string) {
  return {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') cursorStore.set(text);
    },
    onPointerLeave: () => cursorStore.set(null),
  };
}
