import { useEffect, useState } from "react";
import { Star, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const NewArrivalsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, old_price, rating, reviews_count, badge, image_url, category, stock_quantity")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setProducts(data as Product[]);
    };
    fetchNewArrivals();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString("uz-UZ") + " so'm";

  const getDiscountPercent = (price: number, oldPrice: number | null) => {
    if (!oldPrice || oldPrice <= price) return null;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
  };

  if (products.length === 0) return null;

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Yangi kelgan mahsulotlar</h2>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Eng so'nggi qo'shilgan mahsulotlarni ko'rib chiqing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
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
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3 mr-1" />Yangi
                    </Badge>
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
                        {p.old_price && (
                          <span className="block text-sm text-muted-foreground line-through">{formatPrice(p.old_price)}</span>
                        )}
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
        </div>
      </section>

      <ProductDetailDialog product={selectedProduct} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default NewArrivalsSection;
