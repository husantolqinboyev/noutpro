import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, Shield, Home, Package, LayoutGrid, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useAuth();
  const { totalItems, setIsOpen } = useCart();

  const links = [
    { label: "Bosh sahifa", href: "#", icon: <Home className="h-4 w-4" /> },
    { label: "Mahsulotlar", href: "#products", icon: <Package className="h-4 w-4" /> },
    { label: "Kategoriyalar", href: "#categories", icon: <LayoutGrid className="h-4 w-4" /> },
    { label: "Aloqa", href: "#contact", icon: <Phone className="h-4 w-4" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hero border-b border-border/10 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="text-2xl font-bold text-gradient">
          NOUTPRO
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex items-center gap-1.5 text-hero-muted hover:text-primary transition-colors text-sm font-medium"
            >
              {l.icon}
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-hero-muted hover:text-primary"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>

          {!loading && user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" className="text-hero-muted hover:text-primary" onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-hero-muted hover:text-primary" onClick={() => navigate("/dashboard")}>
                <User className="h-4 w-4 mr-1" />
                Kabinet
              </Button>
              <Button variant="ghost" size="icon" className="text-hero-muted hover:text-primary" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4 mr-2" />
              Kirish
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-hero-muted hover:text-primary"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </Button>
          <button
            className="text-hero-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-hero border-t border-border/10 px-4 pb-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex items-center gap-2 py-3 text-hero-muted hover:text-primary transition-colors text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {l.icon}
              {l.label}
            </a>
          ))}
          {!loading && user ? (
            <div className="space-y-2 mt-2">
              {isAdmin && (
                <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary" onClick={() => { navigate("/admin"); setMobileOpen(false); }}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>
                <User className="h-4 w-4 mr-2" />
                Kabinet
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-hero-muted" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Chiqish
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" className="w-full mt-3" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>
              <User className="h-4 w-4 mr-2" />
              Kirish
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
