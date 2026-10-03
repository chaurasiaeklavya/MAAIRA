import { Collection } from '@/components/collection/Collection';
import { Contact } from '@/components/Contact';
import { Cursor } from '@/components/Cursor';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/hero/Hero';
import { House } from '@/components/House';
import { Showcase } from '@/components/showcase/Showcase';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Showcase />
        <House />
        <Collection />
        <Contact />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
