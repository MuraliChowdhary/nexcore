import Navbar from '../components/navbar';
import Hero from '../components/hero';
import Features from '../components/features';
import HowItWorks from '../components/how-it-works';
import CollaborationPreview from '../components/collaboratoin-preview';
import Differentiation from '../components/differentiation';
import CTASection from '../components/cta-section';
import Footer from '../components/footer';

export default function Home() {
  return (
    <main className="bg-white text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CollaborationPreview />
      <Differentiation />
      <CTASection />
      <Footer />
    </main>
  );
}
