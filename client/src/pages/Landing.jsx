import { Header } from "../components/Header";
import Hero from "../components/Hero";
import MainSection from "../components/MainSection";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";

const Landing = () => {
  return (
    <div className="bg-white text-gray-700">
      <Header />
      <main>
        <Hero />
        <MainSection />
        <Testimonials/>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
