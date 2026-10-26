import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

/** Fades and rises into view once, when scrolled to. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

const wordsParent: Variants = {
  hidden: {},
  show: ({ stagger, delay }: { stagger: number; delay: number }) => ({
    transition: { staggerChildren: stagger, delayChildren: delay },
  }),
};
const word: Variants = {
  hidden: { y: "110%", rotate: 4 },
  show: { y: "0%", rotate: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/**
 * Headline whose words slide up from behind a mask, one after the other.
 * `parts` lets a phrase be colored (e.g. the red "façon Benny's.").
 */
export function WordsReveal({
  parts,
  className,
  as = "h2",
  stagger = 0.07,
  delay = 0,
  onMount = false,
}: {
  parts: { text: string; className?: string }[];
  className?: string;
  as?: "h1" | "h2";
  stagger?: number;
  delay?: number;
  /** true: play on page load (hero); false: play when scrolled into view */
  onMount?: boolean;
}) {
  const Tag = as === "h1" ? motion.h1 : motion.h2;
  const trigger = onMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, amount: 0.6 } };
  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={wordsParent}
      custom={{ stagger, delay }}
      aria-label={parts.map((p) => p.text).join(" ")}
    >
      {parts.map((part, pi) =>
        part.text.split(" ").map((w, wi) => (
          <Fragment key={`${pi}-${wi}`}>
            <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
              <motion.span variants={word} className={`inline-block will-change-transform ${part.className || ""}`}>
                {w}
              </motion.span>
            </span>{" "}
          </Fragment>
        ))
      )}
    </Tag>
  );
}

/** Number that counts up from 0 the first time it is visible. */
export function CountUp({ value, format, delay = 0 }: { value: number; format: (n: number) => string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return setShown(value);
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: EASE_OUT,
      onUpdate: (v) => setShown(Math.round(v / 10) * 10),
    });
    return () => controls.stop();
  }, [inView, value, delay, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(shown)}
    </span>
  );
}
