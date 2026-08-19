/**
 * Tiny shared flag: is an opaque video layer currently covering the page?
 *
 * The WebGL node network sits underneath the video backdrop. While a clip is
 * fully faded in, every node and link it draws is invisible, so the render loop
 * is pure waste — and it competes with video decoding for the same frame
 * budget, which shows up as dropped frames. VideoBackdrop publishes here and
 * Scene idles itself in response.
 */
let covered = false;
const listeners = new Set<(value: boolean) => void>();

export function setVideoCovering(value: boolean) {
  if (value === covered) return;
  covered = value;
  for (const listener of listeners) listener(value);
}

export function subscribeVideoCovering(listener: (value: boolean) => void) {
  listeners.add(listener);
  listener(covered);
  return () => {
    listeners.delete(listener);
  };
}
