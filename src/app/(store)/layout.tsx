import { CartDrawer } from '@/components/commerce/CartDrawer';
import { CartProvider } from '@/components/commerce/CartProvider';
import { LiveAnnouncer } from '@/components/commerce/LiveAnnouncer';
import { WishlistProvider } from '@/components/commerce/WishlistProvider';
import { Cursor } from '@/components/Cursor';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { loadShell } from '@/server/shell';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { nav, cart, signedIn } = await loadShell();
  return (
    <CartProvider initial={cart}>
      <WishlistProvider signedIn={signedIn}>
        <Header nav={nav} signedIn={signedIn} />
        <main id="main">{children}</main>
        <Footer nav={nav} />
        <CartDrawer />
        <LiveAnnouncer />
        <Cursor />
      </WishlistProvider>
    </CartProvider>
  );
}
