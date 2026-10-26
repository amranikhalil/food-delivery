import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { BRAND } from "@/data/brand";
import { useCart } from "@/hooks/useCart";
import { fetchMenu, toSections, type MenuData } from "@/lib/menu";
import Checker from "@/components/site/Checker";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import MenuSections from "@/components/site/MenuSections";
import Infos from "@/components/site/Infos";
import CartDrawer from "@/components/site/CartDrawer";

// The menu is rendered on the server (fast first paint, good for Google),
// refreshed every 30 s on the server, and once more in the browser so
// changes made in the dashboard show up right away.
export const getStaticProps: GetStaticProps<MenuData> = async () => {
  const data = await fetchMenu();
  return { props: data, revalidate: data.live ? 30 : 5 };
};

export default function Home(initial: MenuData) {
  const [data, setData] = useState<MenuData>(initial);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchMenu().then((fresh) => alive && fresh.live && setData(fresh));
    return () => {
      alive = false;
    };
  }, []);

  const { restaurant, dishes } = data;
  const sections = useMemo(() => toSections(dishes), [dishes]);
  const cart = useCart(dishes);
  const menuHref = `#${sections[0]?.slug ?? "infos"}`;

  const nav = useMemo(
    () => [...sections.map((s) => ({ id: s.slug, label: s.name })), { id: "infos", label: "Infos" }],
    [sections]
  );

  const openCart = useCallback(() => {
    if (cart.count > 0) return setCartOpen(true);
    document.querySelector(menuHref)?.scrollIntoView({ behavior: "smooth" });
  }, [cart.count, menuHref]);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const title = `${BRAND.name} — ${BRAND.tagline} since ${BRAND.since}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24 sm:pb-0 bg-cream font-ui text-ink antialiased">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={BRAND.lead} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={BRAND.lead} />
        <meta property="og:image" content={BRAND.hero.image} />
      </Head>

      <Checker roll="left" />
      <Header nav={nav} cartCount={cart.count} cartTotal={cart.subtotal} onOrder={openCart} />

      <main>
        <Hero dishes={dishes} phone={restaurant.phone} menuHref={menuHref} />
        <MenuSections sections={sections} cart={cart} />
      </main>
      <Infos restaurant={restaurant} />

      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} restaurant={restaurant} menuHref={menuHref} />
    </div>
  );
}
