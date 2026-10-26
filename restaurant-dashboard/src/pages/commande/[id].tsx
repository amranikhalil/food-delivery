import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "@/firebase/firebase";
import { BRAND } from "@/data/brand";
import { formatDA, STATUS, type OrderStatus } from "@/lib/format";
import Checker from "@/components/site/Checker";
import { CheckIcon } from "@/components/site/icons";
import { EASE_OUT } from "@/components/motion";

const STEPS: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "PICKEDUP", "COMPLETE"];

const HEADLINES: Record<OrderStatus, string> = {
  PENDING: "Commande envoyée !",
  ACCEPTED: "C'est validé !",
  PREPARING: "Ça grille en cuisine.",
  READY: "C'est prêt !",
  PICKEDUP: "En route vers toi.",
  COMPLETE: "Bon appétit !",
  DECLINED: "Désolé…",
};

interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order extends DocumentData {
  id: string;
  status: OrderStatus;
  items?: OrderItem[];
  total?: number;
  userAddress?: string;
  restaurantName?: string;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream font-ui text-ink antialiased">
      <Head>
        <title>{`Suivi de commande — ${BRAND.name}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>
      <Checker roll="left" />
      <header className="mx-auto flex max-w-xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-script text-[40px] leading-none text-red no-underline">
          {BRAND.name}
        </Link>
        <span className="font-ui text-xs font-extrabold uppercase tracking-tagline">Suivi de commande</span>
      </header>
      <main className="mx-auto max-w-xl px-6 pb-16">{children}</main>
    </div>
  );
}

export default function OrderTracking() {
  const { query } = useRouter();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (typeof query.id !== "string") return;
    // Live updates: the page changes as soon as the restaurant updates the order
    return onSnapshot(
      doc(db, "orders", query.id),
      (snap) => setOrder(snap.exists() ? ({ ...snap.data(), id: snap.id } as Order) : null),
      () => setOrder(null)
    );
  }, [query.id]);

  if (order === undefined) {
    return (
      <Shell>
        <div className="flex justify-center py-24" aria-label="Chargement">
          <motion.span
            className="h-12 w-12 rounded-full border-[5px] border-red/25 border-t-red"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </Shell>
    );
  }
  if (order === null) {
    return (
      <Shell>
        <div className="flex flex-col items-start gap-6 py-16">
          <h1 className="display m-0 text-display-m">Commande introuvable.</h1>
          <Link href="/" className="btn btn-ink px-7 py-4">
            Retour au menu
          </Link>
        </div>
      </Shell>
    );
  }

  const declined = order.status === "DECLINED";
  const stepIndex = Math.max(0, STEPS.indexOf(order.status));
  const progress = stepIndex / (STEPS.length - 1);

  return (
    <Shell>
      <section className="flex flex-col gap-4 pb-10 pt-6">
        <motion.p
          className="m-0 flex items-center gap-2 text-sm font-extrabold uppercase tracking-eyebrow text-red-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {!declined && order.status !== "COMPLETE" && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red" />
            </span>
          )}
          {STATUS[order.status]?.label || "En attente"}
        </motion.p>
        <AnimatePresence mode="wait">
          <motion.h1
            key={order.status}
            className="display m-0 text-[clamp(44px,10vw,72px)] leading-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            {HEADLINES[order.status] || HEADLINES.PENDING}
          </motion.h1>
        </AnimatePresence>
        {order.status === "PENDING" && (
          <p className="m-0 text-[17px] leading-relaxed text-text-secondary">
            Le restaurant va confirmer ta commande. Garde ton téléphone à portée de main.
          </p>
        )}
        {declined && (
          <p className="m-0 text-[17px] leading-relaxed text-text-secondary">
            Le restaurant ne peut pas préparer ta commande pour le moment.
          </p>
        )}
      </section>

      {!declined && (
        <ol className="relative m-0 mb-10 list-none p-0">
          {/* Track and its red fill */}
          <span aria-hidden="true" className="absolute bottom-7 left-[17px] top-7 w-0.5 bg-ink/15" />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-7 left-[17px] top-7 w-0.5 origin-top bg-red"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: progress }}
            transition={{ duration: 1, ease: EASE_OUT }}
          />
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <motion.li
                key={s}
                className={`relative flex items-center gap-4 py-2.5 ${i <= stepIndex ? "text-ink" : "text-ink/35"}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <motion.span
                  className={`relative z-10 flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 text-sm font-black ${
                    i <= stepIndex ? "border-red bg-red text-white" : "border-ink/20 bg-cream"
                  }`}
                  animate={current ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={current ? { duration: 1.6, repeat: Infinity } : undefined}
                >
                  {done ? <CheckIcon width={16} height={16} /> : i + 1}
                </motion.span>
                <span className={`text-[15px] uppercase tracking-desc ${current ? "font-black" : "font-bold"}`}>
                  {STATUS[s].label}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}

      <motion.div
        className="rounded-card border-2 border-ink bg-cream-warm p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT }}
      >
        <h2 className="m-0 mb-3 text-[13px] font-extrabold uppercase tracking-label text-text-label">Détails</h2>
        {(order.items || []).map((i) => (
          <div key={i.dishId} className="flex justify-between gap-4 border-b-2 border-red/70 py-2.5 last:border-b-0">
            <span className="text-[15px] font-black uppercase [font-stretch:110%]">
              {i.quantity} × {i.name}
            </span>
            <span className="tabular-nums">{formatDA(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-extrabold uppercase tracking-micro">À payer à la livraison</span>
          <span className="-rotate-3 rounded-tag bg-red px-4 py-1 text-[26px] font-black italic text-white">
            {formatDA(order.total)}
          </span>
        </div>
        {order.userAddress && <p className="m-0 mt-4 text-sm text-text-muted">Livraison : {order.userAddress}</p>}
      </motion.div>

      <Link href="/" className="btn btn-ink btn-shine mt-8 w-full py-4">
        Commander à nouveau
      </Link>
    </Shell>
  );
}
