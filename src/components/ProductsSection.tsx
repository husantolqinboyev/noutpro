import { useEffect, useState } from "react";
import { Star, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import ProductDetailDialog from "@/components/ProductDetailDialog";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  rating: number | null;
  reviews_count: number | null;
  badge: string | null;
  image_url: string | null;
  category: string;
  stock_quantity: number;
}

const categories = [
  { key: "all", label: "Barchasi" },
  { key: "laptops", label: "Laptoplar" },
  { key: "phones", label: "Telefonlar" },
  { key: "tablets", label: "Planshetlar" },
  { key: "accessories", label: "Aksessuarlar" },
];

const fallbackProducts: Product[] = [];

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, old_price, rating, reviews_count, badge, image_url, category, stock_quantity")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setProducts(data as Product[]);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatPrice = (price: number) => price.toLocaleString("uz-UZ") + " so'm";

  const getDiscountPercent = (price: number, oldPrice: number | null) => {
    if (!oldPrice || oldPrice <= price) return null;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
  };

  return (
    <>
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">Mashhur mahsulotlar</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Eng ko'p sotilgan va mijozlar tomonidan yuqori baholangan mahsulotlar
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Button
                  key={c.key}
                  variant={activeCategory === c.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(c.key)}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const discount = getDiscountPercent(p.price, p.old_price);
              return (
              <div
                key={p.id}
                onClick={() => { setSelectedProduct(p); setDialogOpen(true); }}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Rasm yo'q</div>
                  )}
                  {p.badge && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{p.badge}</Badge>}
                  {discount && (
                    <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-card-foreground mb-2">{p.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium text-card-foreground">{p.rating || 0}</span>
                    <span className="text-sm text-muted-foreground">({p.reviews_count || 0} izoh)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                      {p.old_price && <span className="block text-sm text-muted-foreground line-through">{formatPrice(p.old_price)}</span>}
                    </div>
                    <Button size="icon" variant="default" onClick={(e) => handleAddToCart(e, p)}>
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Mahsulot topilmadi</p>
          )}
        </div>
      </section>

      <ProductDetailDialog product={selectedProduct} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default ProductsSection;
