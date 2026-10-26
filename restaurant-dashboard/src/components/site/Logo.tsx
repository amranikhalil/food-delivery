import { motion } from "framer-motion";
import { BRAND } from "@/data/brand";

/**
 * Round logo + "Benny's" script wordmark + tagline. Links to the top of the page.
 * The round mark stands in for the real logo: swap it for an <Image> when you have the file.
 */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-3.5 text-ink no-underline" aria-label={`${BRAND.name}, retour en haut`}>
      <motion.span
        className="flex flex-none items-center justify-center rounded-full border-2 border-ink bg-white"
        animate={{ width: compact ? 48 : 64, height: compact ? 48 : 64 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotate: -12, scale: 1.06 }}
      >
        <span
          className="font-script leading-none text-red transition-transform duration-500 group-hover:rotate-[360deg]"
          style={{ fontSize: compact ? 24 : 32 }}
        >
          B
        </span>
      </motion.span>
      <span className="flex flex-col gap-0.5">
        <motion.span
          className="font-script leading-none text-red"
          animate={{ fontSize: compact ? "32px" : "40px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {BRAND.name}
        </motion.span>
        <motion.span
          className="overflow-hidden whitespace-nowrap font-ui text-xs font-extrabold uppercase tracking-tagline text-ink"
          animate={{ height: compact ? 0 : "auto", opacity: compact ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {BRAND.tagline} · Since {BRAND.since}
        </motion.span>
      </span>
    </a>
  );
}
