import { useRef } from "react";
import { motion } from "framer-motion";
import type { Cart } from "@/hooks/useCart";
import { flyToCart } from "@/lib/flyToCart";
import { formatDA } from "@/lib/format";
import type { Dish, MenuSection } from "@/types/menu";
import { EASE_OUT } from "../motion";
import DishImage from "./DishImage";
import QtyControl from "./QtyControl";
import { CheckerTitle, SwashTitle } from "./SectionTitle";

interface ItemProps {
  dish: Dish;
  index: number;
  cart: Cart;
}

/** Quantity control + "throw the photo into the cart" animation */
function useAddToCart(dish: Dish, cart: Cart) {
  const imgRef = useRef<HTMLImageElement>(null);
  return {
    imgRef,
    control: (
      <QtyControl
        name={dish.name}
        quantity={cart.qty[dish.id] || 0}
        onAdd={() => {
          cart.add(dish.id);
          flyToCart(imgRef.current);
        }}
        onRemove={() => cart.remove(dish.id)}
      />
    ),
  };
}

/** Burger style: photo above, NAME ……… PRICE, ingredients. Red rule on top like the printed menu. */
function ListItem({ dish, index, cart }: ItemProps) {
  const { imgRef, control } = useAddToCart(dish, cart);
  return (
    <motion.article
      className="group relative flex flex-col gap-3.5 py-7"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: (index % 3) * 0.12 } } }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-0.5 origin-left bg-red"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE_OUT } } }}
      />
      {/* Photo backgrounds are the same cream as the section, so the food looks cut out */}
      <motion.div
        className="self-center"
        variants={{
          hidden: { opacity: 0, y: 40, rotate: -8, scale: 0.8 },
          show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 180, damping: 14 } },
        }}
      >
        <div className="transition-transform duration-500 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-2 group-hover:-rotate-[4deg] group-hover:scale-[1.08]">
          <DishImage
            ref={imgRef}
            src={dish.image}
            alt={dish.name}
            emoji={dish.emoji}
            sizes="220px"
            className="h-[170px] w-[220px]"
          />
        </div>
      </motion.div>
      <motion.div
        className="flex flex-col gap-3.5"
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } } }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="menu-name m-0 min-w-0 break-words">{dish.name}</h3>
          <p className="menu-price m-0">{formatDA(dish.price)}</p>
        </div>
        {dish.description && <p className="menu-desc m-0">{dish.description}</p>}
      </motion.div>
      <motion.div
        className="mt-auto pt-1"
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      >
        {control}
      </motion.div>
    </motion.article>
  );
}

/** Highlights the numbers in red: "TENDERS 10 PIÈCES" */
const withRedNumbers = (name: string) =>
  name.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={i} className="text-red">
        {part}
      </span>
    ) : (
      part
    )
  );

/** Tender style: outlined card, photo, title, description, slanted red price tag. */
function CardItem({ dish, index, cart }: ItemProps) {
  const { imgRef, control } = useAddToCart(dish, cart);
  return (
    <motion.article
      className="group flex flex-col gap-4 rounded-card border-2 border-ink bg-cream-warm p-7 transition-shadow duration-300 hover:shadow-[8px_8px_0_#141414]"
      initial={{ opacity: 0, y: 60, rotate: index % 2 ? 1.5 : -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      whileHover={{ y: -6, x: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: (index % 2) * 0.12 }}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-700 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-[-2deg] group-hover:scale-[1.06]">
          <DishImage
            ref={imgRef}
            src={dish.image}
            alt={dish.name}
            emoji={dish.emoji}
            sizes="(max-width: 720px) 90vw, 560px"
            className="h-[220px] w-full sm:h-[250px]"
          />
        </div>
      </div>
      <h3 className="m-0 font-ui text-[26px] font-black uppercase leading-[1.05] text-ink [font-stretch:110%] sm:text-[30px]">
        {withRedNumbers(dish.name)}
      </h3>
      {dish.description && <p className="menu-desc m-0">{dish.description}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-1.5">
        <p className="m-0 origin-left -rotate-3 rounded-tag bg-red px-[22px] py-1.5 font-ui text-[34px] font-black italic text-white transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] group-hover:-rotate-6 group-hover:scale-110">
          {formatDA(dish.price)}
        </p>
        {control}
      </div>
    </motion.article>
  );
}

export default function MenuSections({ sections, cart }: { sections: MenuSection[]; cart: Cart }) {
  return (
    <>
      {sections.map((section) =>
        section.layout === "list" ? (
          <section
            key={section.slug}
            id={section.slug}
            aria-labelledby={`${section.slug}-title`}
            className="scroll-mt-20 border-t-2 border-ink bg-cream py-22"
          >
            <div className="mx-auto flex max-w-container flex-col gap-12 px-6">
              <CheckerTitle id={`${section.slug}-title`}>{section.name}</CheckerTitle>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-x-12 gap-y-2">
                {section.dishes.map((dish, i) => (
                  <ListItem key={dish.id} dish={dish} index={i} cart={cart} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section
            key={section.slug}
            id={section.slug}
            aria-labelledby={`${section.slug}-title`}
            className="scroll-mt-20 bg-cream-warm py-22"
          >
            <div className="mx-auto flex max-w-container flex-col gap-12 px-6">
              <SwashTitle id={`${section.slug}-title`}>{section.name}</SwashTitle>
              <div className="grid gap-7 min-[720px]:grid-cols-2">
                {section.dishes.map((dish, i) => (
                  <CardItem key={dish.id} dish={dish} index={i} cart={cart} />
                ))}
              </div>
            </div>
          </section>
        )
      )}
    </>
  );
}
