import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useMotionValueEvent, useScroll } from "framer-motion";
import Logo from "./Logo";
import Checker from "./Checker";
import { BagIcon, CloseIcon } from "./icons";
import { CART_BUMP_EVENT } from "@/lib/flyToCart";
import { BRAND } from "@/data/brand";
import { formatDA } from "@/lib/format";

export interface NavItem {
  id: string;
  label: string;
}

/** Id of the section currently in the middle of the screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

function OrderButton({
  count,
  total,
  onClick,
  className = "",
}: {
  count: number;
  total?: number;
  onClick: () => void;
  className?: string;
}) {
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  // Bounce when a dish lands in the cart (see lib/flyToCart)
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const bump = () =>
      animate(el, { scale: [1, 1.18, 0.94, 1.04, 1], rotate: [0, -6, 4, 0] }, { duration: 0.55 });
    el.addEventListener(CART_BUMP_EVENT, bump);
    return () => el.removeEventListener(CART_BUMP_EVENT, bump);
  }, [animate, scope]);

  return (
    <motion.button
      ref={scope}
      type="button"
      data-cart-target
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`btn btn-red btn-shine px-6 py-3.5 ${className}`}
      aria-label={count ? `Commander, ${count} article${count > 1 ? "s" : ""} dans le panier` : "Commander"}
    >
      <BagIcon className={count ? "block" : "hidden sm:block"} width={18} height={18} />
      Commander
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="count"
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: "auto" }}
            exit={{ scale: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={`-mr-2 flex h-7 min-w-[28px] items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-white px-2 text-[13px] font-black text-red tabular-nums ${
              total !== undefined ? "ml-auto px-3" : ""
            }`}
          >
            {total !== undefined ? `${count} · ${formatDA(total)}` : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function Header({
  nav,
  cartCount,
  cartTotal,
  onOrder,
}: {
  nav: NavItem[];
  cartCount: number;
  cartTotal: number;
  onOrder: () => void;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(nav.map((n) => n.id));
  const menuButton = useRef<HTMLButtonElement>(null);

  // Two thresholds (hysteresis): the header changes height when it switches,
  // which moves scrollY. With a single threshold that jump re-crosses it and
  // the header flickers between big and small near the top of the page.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled((was) => (was ? y > 30 : y > 100)));

  useEffect(() => {
    if (!menuOpen) return;
    const opener = menuButton.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled ? "bg-cream/90 shadow-[0_2px_0_#141414] backdrop-blur-md" : "bg-cream"
        }`}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={`mx-auto flex max-w-container items-center justify-between gap-5 px-6 transition-[padding] duration-300 ${
            scrolled ? "py-2.5" : "py-5"
          }`}
        >
          <Logo compact={scrolled} />

          <nav aria-label="Navigation principale" className="flex items-center gap-7">
            <ul className="hidden items-center gap-7 md:flex">
              {nav.map((item) => (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.id}`}
                    className={`font-ui text-[15px] font-extrabold uppercase tracking-button no-underline transition-colors hover:text-red-dark ${
                      active === item.id ? "text-red-dark" : "text-ink"
                    }`}
                    aria-current={active === item.id ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 right-0 h-[3px] -rotate-2 rounded-full bg-red"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              ))}
            </ul>
            <OrderButton count={cartCount} onClick={onOrder} className="hidden sm:inline-flex" />
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border-2 border-ink md:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <span className="h-[2.5px] w-5 rounded bg-ink" />
              <span className="h-[2.5px] w-5 rounded bg-ink" />
              <span className="h-[2.5px] w-3.5 self-center rounded bg-ink" />
            </button>
          </nav>
        </div>

        {/* Phones: category pills, always visible under the header */}
        <ul className="flex gap-2 overflow-x-auto bg-ink px-6 py-2.5 md:hidden" aria-label="Catégories">
          {nav.map((item) => (
            <li key={item.id} className="flex-none">
              <a
                href={`#${item.id}`}
                className={`block rounded-full border-2 px-4 py-1.5 font-ui text-xs font-extrabold uppercase tracking-button no-underline transition-colors ${
                  active === item.id ? "border-red bg-red text-white" : "border-white text-white"
                }`}
                aria-current={active === item.id ? "true" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.header>

      {/* Phones: full-width order bar at the bottom of the screen */}
      <div className="fixed inset-x-3 bottom-3 z-30 sm:hidden">
        <OrderButton count={cartCount} total={cartTotal} onClick={onOrder} className="w-full shadow-photo" />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            nav={nav}
            onClose={() => setMenuOpen(false)}
            onOrder={() => {
              setMenuOpen(false);
              onOrder();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({ nav, onClose, onOrder }: { nav: NavItem[]; onClose: () => void; onOrder: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 flex flex-col bg-red text-white"
      initial={{ clipPath: "circle(0% at calc(100% - 46px) 46px)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 46px) 46px)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 46px) 46px)" }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
    >
      <Checker roll="left" />
      <div className="flex items-center justify-between px-6 py-5">
        <span className="font-script text-[40px] leading-none">{BRAND.name}</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white"
          aria-label="Fermer le menu"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="flex flex-1 flex-col justify-center gap-2 px-6" aria-label="Menu mobile">
        {nav.map((item, i) => (
          <motion.a
            key={item.id}
            href={`#${item.id}`}
            onClick={onClose}
            className="display block break-words text-[clamp(36px,11vw,56px)] leading-[1.05] text-white no-underline first-letter:uppercase hover:text-ink"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.25 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.label}
          </motion.a>
        ))}
        <motion.button
          type="button"
          onClick={onOrder}
          className="btn mt-8 self-start bg-white px-8 py-4 text-red hover:bg-ink hover:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + nav.length * 0.07 }}
        >
          Commander
        </motion.button>
      </nav>
      <p className="px-6 pb-6 font-ui text-xs font-extrabold uppercase tracking-tagline text-white/80">
        {BRAND.tagline} · Since {BRAND.since}
      </p>
      <Checker roll="right" />
    </motion.div>
  );
}
