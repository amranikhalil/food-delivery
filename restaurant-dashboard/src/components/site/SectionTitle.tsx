import { motion } from "framer-motion";
import Checker from "./Checker";
import { EASE_OUT } from "../motion";

const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.6 } } as const;

/** Fraunces title between two checker strips that grow out from it (from the printed Burgers menu). */
export function CheckerTitle({ children, id }: { children: string; id?: string }) {
  return (
    <motion.div className="flex items-center gap-4 sm:gap-6" {...inView}>
      <motion.div
        className="min-w-0 flex-1 origin-right"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } } }}
      >
        <Checker roll="right" />
      </motion.div>
      <motion.h2
        id={id}
        className="display m-0 text-center text-display-xl"
        variants={{
          hidden: { opacity: 0, y: 30, scale: 0.92 },
          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 16, delay: 0.1 } },
        }}
      >
        {children}
      </motion.h2>
      <motion.div
        className="min-w-0 flex-1 origin-left"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } } }}
      >
        <Checker roll="left" />
      </motion.div>
    </motion.div>
  );
}

/** Red italic Archivo title with a tilted underline swash that draws in (from the printed Tenders menu). */
export function SwashTitle({ children, id }: { children: string; id?: string }) {
  return (
    <motion.div className="flex flex-col items-center gap-1.5" {...inView}>
      <h2 id={id} className="m-0 flex overflow-hidden font-ui text-display-xl font-black uppercase italic tracking-[0.02em] text-red [font-stretch:100%]">
        {/* Letters bounce up one after the other */}
        {Array.from(children).map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="inline-block whitespace-pre pr-[0.02em]"
            variants={{
              hidden: { y: "105%" },
              show: { y: "0%", transition: { type: "spring", stiffness: 260, damping: 18, delay: i * 0.045 } },
            }}
          >
            {ch}
          </motion.span>
        ))}
        <span className="sr-only">{children}</span>
      </h2>
      <motion.div
        aria-hidden="true"
        className="h-2 w-[min(280px,70vw)] origin-left rounded-tag bg-red"
        style={{ rotate: -2 }}
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 0.7, delay: 0.35, ease: EASE_OUT } },
        }}
      />
    </motion.div>
  );
}
