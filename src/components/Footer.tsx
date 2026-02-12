import { Phone, Mail, MapPin, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-hero py-16 border-t border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-3">NOUTPRO</h3>
            <p className="text-sm text-hero-muted leading-relaxed">
              Texnika savdosi — tez, oson, ishonchli. Eng yaxshi narxlarda sifatli mahsulotlar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-hero-foreground mb-4">Sahifalar</h4>
            <ul className="space-y-2 text-sm text-hero-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Bosh sahifa</a></li>
              <li><a href="#categories" className="hover:text-primary transition-colors">Kategoriyalar</a></li>
              <li><a href="#products" className="hover:text-primary transition-colors">Mahsulotlar</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-hero-foreground mb-4">Aloqa</h4>
            <ul className="space-y-3 text-sm text-hero-muted">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +998 90 123 45 67
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                info@noutpro.uz
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Toshkent, O'zbekiston
              </li>
            </ul>
          </div>

          {/* Telegram */}
          <div>
            <h4 className="font-semibold text-hero-foreground mb-4">Telegram bot</h4>
            <p className="text-sm text-hero-muted mb-4">
              Ro'yxatdan o'tish va buyurtma berish uchun Telegram botimizga qo'shiling.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
              @NoutproBot
            </a>
          </div>
        </div>

        <div className="border-t border-border/10 mt-12 pt-6 text-center text-sm text-hero-muted">
          © 2026 NOUTPRO. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
