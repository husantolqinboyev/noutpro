import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-tech.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-hero overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Texnika mahsulotlari"
          className="w-full h-full object-cover opacity-40"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero via-hero/90 to-hero/50" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Yangi mahsulotlar mavjud
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-hero-foreground leading-tight mb-6">
            Texnika savdosi —{" "}
            <span className="text-gradient">tez, oson, ishonchli</span>
          </h1>

          <p className="text-lg text-hero-muted mb-8 max-w-lg">
            Laptoplar, telefonlar, gadjetlar va original aksessuarlar — eng yaxshi
            narxlarda. Buyurtmangizni hoziroq bering!
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="glow-green">
              Mahsulotlarni ko'rish
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Telegram orqali ro'yxatdan o'tish
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            {[
              { value: "500+", label: "Mahsulotlar" },
              { value: "1000+", label: "Mijozlar" },
              { value: "24/7", label: "Qo'llab-quvvatlash" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-hero-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
