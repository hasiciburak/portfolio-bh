"use client";

type Listener = (message: string) => void;

const listeners = new Set<Listener>();

/**
 * Hands a ready-written opening line to the contact form.
 *
 * The services deck and the form sit in different branches of the tree with the
 * whole page between them, so lifting this into shared React state would mean
 * re-rendering every section in between to move one string. A subscription costs
 * one `useEffect` in the only component that cares, and keeps the deck free of
 * any knowledge of how the form stores its fields.
 *
 * Both sides are client components on the same page, so a listener is always
 * registered by the time a card can be clicked — there is deliberately no replay
 * of the last message for a late subscriber.
 */
export const requestContactPrefill = (message: string): void => {
  listeners.forEach((listener) => listener(message));
};

export const onContactPrefill = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
