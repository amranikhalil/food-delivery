import { AnimatePresence, motion } from "framer-motion";
import { MinusIcon, PlusIcon } from "./icons";

const swap = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

/** "AJOUTER" pill that turns into a − qty + stepper once the dish is in the cart. */
export default function QtyControl({
  name,
  quantity,
  onAdd,
  onRemove,
}: {
  name: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative flex h-11 items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            type="button"
            {...swap}
            whileTap={{ scale: 0.92 }}
            onClick={onAdd}
            className="btn btn-outline h-11 px-5 text-[13px]"
            aria-label={`Ajouter ${name} au panier`}
          >
            <PlusIcon width={16} height={16} />
            Ajouter
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            {...swap}
            className="flex h-11 items-center gap-1 rounded-full bg-ink p-1 text-white"
            role="group"
            aria-label={`Quantité de ${name}`}
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              aria-label={`Retirer un ${name}`}
            >
              <MinusIcon width={16} height={16} />
            </motion.button>
            <span className="relative h-6 w-7 overflow-hidden text-center font-ui text-[17px] font-black tabular-nums" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quantity}
                  className="absolute inset-0"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 35 }}
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={onAdd}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red transition-colors hover:bg-red-dark"
              aria-label={`Ajouter un ${name}`}
            >
              <PlusIcon width={16} height={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
