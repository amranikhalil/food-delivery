import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { BRAND, HERO_STATS } from "@/data/brand";
import { formatDA } from "@/lib/format";
import { telHref } from "@/lib/menu";
import type { Dish } from "@/types/menu";
import { CountUp, EASE_OUT, WordsReveal } from "../motion";
import { PhoneIcon } from "./icons";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE_OUT },
});

/** Moves a layer with the pointer; `depth` sets how far (px at the edge of the box). */
function useParallax(x: MotionValue<number>, y: MotionValue<number>, depth: number) {
  return {
    x: useTransform(x, (v) => v * depth),
    y: useTransform(y, (v) => v * depth),
  };
}

export default function Hero({ dishes, phone, menuHref }: { dishes: Dish[]; phone: string; menuHref: string }) {
  const stats = HERO_STATS.map((s) => {
    const prices = dishes.filter(s.match).map((d) => d.price);
    return { label: s.label, price: prices.length ? Math.min(...prices) : null };
  }).filter((s): s is { label: string; price: number } => s.price !== null);

  // Pointer position over the visual, from -1 to 1, smoothed with a spring
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 18 });
  const sy = useSpring(py, { stiffness: 120, damping: 18 });
  const circle = useParallax(sx, sy, -14);
  const photo = useParallax(sx, sy, 18);
  const badge = useParallax(sx, sy, 32);
  const tiltX = useTransform(sy, (v) => v * -5);
  const tiltY = useTransform(sx, (v) => v * 6);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section id="top" className="mx-auto flex max-w-container scroll-mt-28 flex-wrap items-center gap-12 px-6 pb-22 pt-10">
      {/* Text column */}
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
        <motion.p
          className="font-ui text-sm font-extrabold uppercase text-red-dark"
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.24em" }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        >
          {BRAND.tagline} — Since {BRAND.since}
        </motion.p>

        <WordsReveal
          as="h1"
          onMount
          delay={0.15}
          className="display m-0 text-display-l"
          parts={[{ text: BRAND.headline.start }, { text: BRAND.headline.accent, className: "text-red" }]}
        />

        <motion.p {...rise(0.55)} className="m-0 max-w-[34rem] font-ui text-[19px] leading-[1.55] text-text-secondary">
          {BRAND.lead}
        </motion.p>

        <motion.div {...rise(0.7)} className="flex flex-wrap gap-3.5">
          <motion.a whileTap={{ scale: 0.95 }} href={menuHref} className="btn btn-ink btn-shine px-[30px] py-[18px]">
            Voir le menu
          </motion.a>
          {phone && (
            <motion.a whileTap={{ scale: 0.95 }} href={telHref(phone)} className="btn btn-outline group px-7 py-4">
              <PhoneIcon width={18} height={18} className="transition-transform duration-300 group-hover:-rotate-12" />
              Appeler
            </motion.a>
          )}
        </motion.div>

        {stats.length > 0 && (
          <motion.div {...rise(0.85)} className="relative flex flex-wrap gap-8 pt-3">
            {/* The 2px ink line draws itself from left to right */}
            <motion.span
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-0.5 origin-left bg-ink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE_OUT }}
            />
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-ui text-xs font-extrabold uppercase tracking-micro text-text-label">{s.label}</span>
                <span className="font-ui text-[26px] font-black [font-stretch:115%]">
                  <CountUp value={s.price} format={formatDA} delay={1 + i * 0.12} />
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Visual column: red circle, tilted photo, "Since 1970" seal */}
      <div
        className="relative flex min-h-[460px] min-w-0 flex-[1_1_420px] items-center justify-center [perspective:1200px]"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <motion.div
          aria-hidden="true"
          className="absolute aspect-square w-[min(460px,92%)] rounded-full bg-red"
          style={circle}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
        />
        {/* Slow spinning dashed ring around the circle */}
        <motion.div
          aria-hidden="true"
          className="absolute aspect-square w-[min(520px,104%)] rounded-full border-2 border-dashed border-ink/25"
          style={circle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            opacity: { delay: 0.8, duration: 0.6 },
            scale: { delay: 0.8, duration: 0.8, ease: EASE_OUT },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
        />

        <motion.div className="relative w-[min(520px,100%)]" style={{ ...photo, rotateX: tiltX, rotateY: tiltY }}>
          <motion.div
            initial={{ opacity: 0, y: 80, rotate: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, rotate: -3, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.45 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            >
              <Image
                src={BRAND.hero.image}
                alt={BRAND.hero.alt}
                width={BRAND.hero.width}
                height={BRAND.hero.height}
                priority
                sizes="(max-width: 600px) 92vw, 520px"
                className="block h-auto w-full rounded-photo border-[6px] border-white bg-cream-warm shadow-photo"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute right-[4%] top-2"
          style={badge}
          initial={{ scale: 0, rotate: -200 }}
          animate={{ scale: 1, rotate: 10 }}
          transition={{ type: "spring", stiffness: 140, damping: 12, delay: 1.05 }}
        >
          <motion.div
            className="flex h-[120px] w-[120px] cursor-default flex-col items-center justify-center rounded-full bg-ink text-center text-white"
            whileHover={{ rotate: 360, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <span className="font-ui text-[11px] font-extrabold tracking-micro">SINCE</span>
            <span className="display text-[36px] leading-none">{BRAND.since}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
