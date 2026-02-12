import Navbar from "@/components/Navbar";
import BannerSection from "@/components/BannerSection";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import ProductsSection from "@/components/ProductsSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BannerSection />
      <HeroSection />
      <CategoriesSection />
      <NewArrivalsSection />
      <ProductsSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Index;
