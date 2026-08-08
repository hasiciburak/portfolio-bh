/**
 * Entrance intro (#HSC curtain) — shared config between the pre-paint boot script
 * and the React overlay.
 *
 * The boot script stamps `data-intro` on <html> *before the body paints* so the
 * overlay never flashes on visits that should skip it. Everything downstream —
 * the overlay's own visibility, the hero's hidden start states — keys off that
 * attribute, which is why it has to be resolved synchronously rather than in an
 * effect.
 *
 *   play    → run the full sequence
 *   reduced → prefers-reduced-motion: cross-fade the panel out, no movement
 *   skip    → never show the panel (repeat visit, non-home route, or no JS)
 *   done    → set by the overlay once it finishes; releases every hidden state
 */
export type IntroMode = "play" | "reduced" | "skip" | "done";

export const INTRO_SESSION_KEY = "bh-intro-seen";

/**
 * `true`  → plays once per tab session (first arrival only).
 * `false` → plays on every load and refresh.
 *
 * Single switch on purpose: this is the one knob worth changing without touching
 * the timeline.
 */
export const INTRO_ONCE_PER_SESSION = true;

/**
 * >1 speeds the whole timeline up, <1 slows it down. Tune here, not in the tween —
 * the beat-to-beat relationships are what make the sequence read, and editing
 * individual durations pulls them apart.
 *
 * At 0.85 the raw ~1.95s timeline plays in ~2.3s: the panel clears around 1.15s
 * and the hero settles by ~2.3s.
 */
export const INTRO_SPEED = 0.85;

/** Hard ceiling before the overlay force-releases, in case a tween never completes. */
export const INTRO_FAILSAFE_MS = 5000;

/**
 * `/en` is redirected to `/` by proxy.ts, so the prefix-less path is the English
 * home and `/tr` is the Turkish one.
 */
const INTRO_HOME_PATHS = ["/", "/tr", "/tr/"];

export const INTRO_BOOT_SCRIPT = `(function(){var r=document.documentElement;try{
if(${JSON.stringify(INTRO_HOME_PATHS)}.indexOf(location.pathname)===-1){r.dataset.intro="skip";return}
if(${INTRO_ONCE_PER_SESSION}&&sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1"){r.dataset.intro="skip";return}
r.dataset.intro=matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"play"
}catch(e){r.dataset.intro="skip"}})()`;
