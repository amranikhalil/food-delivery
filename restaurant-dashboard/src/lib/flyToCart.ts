export const CART_BUMP_EVENT = "cart:bump";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Throws a copy of the dish photo into the cart button along an arc,
 * then makes the button bounce. Purely decorative.
 */
export function flyToCart(source: HTMLElement | null) {
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
    (el) => el.getClientRects().length > 0
  );
  const bump = () => target?.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));

  if (!source || !target || prefersReducedMotion() || !source.animate) return bump();

  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (!s.width || !s.height) return bump();

  const clone = source.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    margin: "0",
    zIndex: "100",
    pointerEvents: "none",
    objectFit: "contain",
    mixBlendMode: "normal",
    transform: "none",
  });
  clone.removeAttribute("id");
  clone.setAttribute("aria-hidden", "true");
  document.body.appendChild(clone);

  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);
  const end = Math.max(0.08, 40 / s.width);

  const anim = clone.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 140}px) scale(0.7) rotate(-14deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(-32deg)`, opacity: 0.6 },
    ],
    { duration: 850, easing: "cubic-bezier(.55,.05,.4,1)" }
  );
  const done = () => {
    clone.remove();
    bump();
  };
  anim.onfinish = done;
  anim.oncancel = done;
}
