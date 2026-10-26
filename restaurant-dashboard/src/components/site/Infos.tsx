import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND } from "@/data/brand";
import { telHref } from "@/lib/menu";
import type { Restaurant } from "@/types/menu";
import { EASE_OUT, WordsReveal } from "../motion";
import Checker from "./Checker";
import { PhoneIcon } from "./icons";

function InfoBlock({ label, children, index }: { label: string; children: ReactNode; index: number }) {
  return (
    <motion.div
      className="relative flex flex-col gap-2.5 pt-5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ hidden: {}, show: { transition: { delayChildren: index * 0.12 } } }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-0.5 origin-left bg-red"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE_OUT } } }}
      />
      <motion.p
        className="m-0 font-ui text-[13px] font-extrabold uppercase tracking-label text-on-dark-muted"
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 0.15 } } }}
      >
        {label}
      </motion.p>
      <motion.div
        className="m-0 font-ui text-xl leading-[1.45]"
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 0.25 } } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const link = "text-white underline decoration-red decoration-2 underline-offset-4 transition-colors hover:text-red";

export default function Infos({ restaurant }: { restaurant: Restaurant }) {
  const blocks: { label: string; value: ReactNode }[] = [
    { label: "Adresse", value: restaurant.address },
    { label: "Horaires", value: restaurant.hours },
    {
      label: "Téléphone",
      value: restaurant.phone && (
        <a href={telHref(restaurant.phone)} className={link}>
          {restaurant.phone}
        </a>
      ),
    },
    {
      label: "Instagram",
      value: restaurant.instagram && (
        <a href={`https://www.instagram.com/${restaurant.instagram}/`} target="_blank" rel="noreferrer" className={link}>
          @{restaurant.instagram}
        </a>
      ),
    },
  ].filter((b) => b.value);

  return (
    <>
      <section id="infos" aria-labelledby="infos-title" className="scroll-mt-20 bg-ink py-22 text-white">
        <div className="mx-auto flex max-w-container flex-col gap-12 px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div id="infos-title">
              <WordsReveal className="display m-0 text-display-m" parts={[{ text: BRAND.infosTitle }]} />
            </div>
            {restaurant.phone && (
              <motion.a
                href={telHref(restaurant.phone)}
                className="btn btn-red btn-shine group px-[30px] py-[18px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.3 }}
              >
                <PhoneIcon width={18} height={18} className="group-hover:animate-[wiggle_0.5s_ease-in-out]" />
                Commander par téléphone
              </motion.a>
            )}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
            {blocks.map((b, i) => (
              <InfoBlock key={b.label} label={b.label} index={i}>
                {b.value}
              </InfoBlock>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-ink text-on-dark-muted">
        <div className="mx-auto flex max-w-container flex-wrap items-baseline justify-between gap-3 border-t border-text-secondary px-6 py-7 font-ui text-sm">
          <span>
            <span className="mr-2 font-script text-[22px] text-white">{BRAND.name}</span>
            {BRAND.tagline} · Since {BRAND.since}
          </span>
          <span>
            © {new Date().getFullYear()} {BRAND.name}
          </span>
        </div>
        <Checker roll="right" />
      </footer>
    </>
  );
}
