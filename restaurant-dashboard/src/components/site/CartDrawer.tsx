import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Cart } from "@/hooks/useCart";
import { formatDA } from "@/lib/format";
import { loadSavedCustomer, placeOrder, validateCustomer, type CustomerForm } from "@/lib/orders";
import type { Restaurant } from "@/types/menu";
import Checker from "./Checker";
import DishImage from "./DishImage";
import { ArrowIcon, BackIcon, BagIcon, CloseIcon } from "./icons";
import QtyControl from "./QtyControl";

type Step = "cart" | "checkout";

// Steps slide in from the side they come from
const stepMotion = {
  variants: {
    enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
  } satisfies Variants,
  initial: "enter",
  animate: "center",
  exit: "exit",
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
} as const;

export default function CartDrawer({
  open,
  onClose,
  cart,
  restaurant,
  menuHref,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  restaurant: Restaurant;
  menuHref: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState<CustomerForm>({ name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setForm((f) => ({ ...f, ...loadSavedCustomer() })), []);

  // Lock page scroll, close with Escape, keep focus in the panel
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep("cart");
      setError("");
    }
  }, [open]);

  const total = cart.subtotal + restaurant.deliveryFee;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validateCustomer(form, cart.count);
    if (problem) return setError(problem);
    setError("");
    setSending(true);
    try {
      const id = await placeOrder(form, cart.lines, restaurant);
      cart.clear();
      router.push(`/commande/${id}`);
    } catch (err) {
      console.error(err);
      setError("La commande n'a pas pu être envoyée. Réessaie.");
      setSending(false);
    }
  };

  const field = (key: keyof CustomerForm) => ({
    value: form[key],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={step === "cart" ? "Ton panier" : "Livraison"}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col overflow-hidden bg-cream font-ui text-ink shadow-drawer outline-none sm:border-l-2 sm:border-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
          >
            <Checker roll="left" />
            <div className="flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-5">
              {step === "checkout" ? (
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-button hover:text-red-dark"
                >
                  <BackIcon width={18} height={18} /> Panier
                </button>
              ) : (
                <h2 className="display m-0 text-[36px] leading-none">Ton panier</h2>
              )}
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-ink"
                aria-label="Fermer le panier"
              >
                <CloseIcon />
              </motion.button>
            </div>

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
              <AnimatePresence mode="wait" initial={false} custom={step === "checkout" ? 1 : -1}>
                {step === "cart" ? (
                  <motion.div key="cart" custom={-1} {...stepMotion} className="px-6 py-4">
                    {cart.count === 0 ? (
                      <div className="flex flex-col items-center gap-5 py-16 text-center">
                        <motion.div
                          className="flex h-24 w-24 items-center justify-center rounded-full bg-red text-white"
                          animate={{ rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <BagIcon width={40} height={40} />
                        </motion.div>
                        <p className="m-0 text-lg">Ton panier est vide.</p>
                        <a href={menuHref} onClick={onClose} className="btn btn-ink px-7 py-4">
                          Voir le menu
                        </a>
                      </div>
                    ) : (
                      <ul className="m-0 list-none p-0">
                        <AnimatePresence initial={false}>
                          {cart.lines.map((line) => (
                            <motion.li
                              key={line.dishId}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0, x: 80 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-b-2 border-red/80 last:border-b-0"
                            >
                              <div className="flex items-center gap-4 py-4">
                                <DishImage
                                  src={line.image}
                                  alt=""
                                  emoji={line.emoji}
                                  sizes="72px"
                                  className="h-16 w-[72px] flex-none"
                                  imgClassName="rounded-lg"
                                  emojiClassName="text-[28px]"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="m-0 text-[15px] font-black uppercase tracking-desc [font-stretch:115%]">
                                    {line.name}
                                  </p>
                                  <p className="m-0 mt-0.5 text-sm text-text-muted">{formatDA(line.price * line.quantity)}</p>
                                </div>
                                <QtyControl
                                  name={line.name}
                                  quantity={line.quantity}
                                  onAdd={() => cart.add(line.dishId)}
                                  onRemove={() => cart.remove(line.dishId)}
                                />
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </motion.div>
                ) : (
                  <motion.form
                    key="checkout"
                    id="checkout-form"
                    custom={1}
                    {...stepMotion}
                    onSubmit={submit}
                    noValidate
                    className="flex flex-col gap-4 px-6 py-6"
                  >
                    <h2 className="display m-0 text-[40px] leading-none">Livraison</h2>
                    <Field label="Ton nom">
                      <input className="field" autoComplete="name" placeholder="Ex : Karim" {...field("name")} />
                    </Field>
                    <Field label="Téléphone">
                      <input
                        className="field"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0550 12 34 56"
                        {...field("phone")}
                      />
                    </Field>
                    <Field label="Adresse">
                      <input
                        className="field"
                        autoComplete="street-address"
                        placeholder="Quartier, rue, bâtiment"
                        {...field("address")}
                      />
                    </Field>
                    <Field label="Repère ou remarque">
                      <textarea
                        className="field resize-none"
                        rows={2}
                        placeholder="À côté de la pharmacie, sans oignon…"
                        {...field("note")}
                      />
                    </Field>
                    <p className="m-0 rounded-2xl border-2 border-dashed border-ink/40 px-4 py-3 text-sm text-text-secondary">
                      Tu paies en espèces à la livraison.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {cart.count > 0 && (
              <div className="border-t-2 border-ink bg-white px-6 pb-6 pt-4">
                <dl className="m-0 mb-4 space-y-1 text-[15px]">
                  <div className="flex justify-between text-text-muted">
                    <dt>Sous-total</dt>
                    <dd className="m-0 tabular-nums">{formatDA(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <dt>Livraison</dt>
                    <dd className="m-0 tabular-nums">{formatDA(restaurant.deliveryFee)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 text-[22px] font-black [font-stretch:115%]">
                    <dt>TOTAL</dt>
                    <dd className="m-0 tabular-nums">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={total}
                          className="inline-block"
                          initial={{ y: -14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 14, opacity: 0 }}
                        >
                          {formatDA(total)}
                        </motion.span>
                      </AnimatePresence>
                    </dd>
                  </div>
                </dl>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto", x: [0, -8, 8, -4, 0] }}
                      exit={{ opacity: 0, height: 0 }}
                      className="m-0 mb-3 text-sm font-bold text-red-dark"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                {step === "cart" ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep("checkout")}
                    className="btn btn-red btn-shine group w-full py-4"
                  >
                    Continuer
                    <ArrowIcon width={18} height={18} className="transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    form="checkout-form"
                    disabled={sending}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-red btn-shine w-full py-4 disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <motion.span
                          className="h-4 w-4 rounded-full border-[3px] border-white/40 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Envoi…
                      </>
                    ) : (
                      `Commander · ${formatDA(total)}`
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] font-extrabold uppercase tracking-micro text-text-label">{label}</span>
      {children}
    </label>
  );
}
