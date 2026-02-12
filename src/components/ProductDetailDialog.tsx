import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import CommentSection from "@/components/CommentSection";
import ImagePreviewDialog from "@/components/ImagePreviewDialog";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  old_price: number | null;
  rating: number | null;
  reviews_count: number | null;
  badge: string | null;
  image_url: string | null;
  category?: string;
  stock_quantity?: number;
}

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailDialog = ({ product, open, onOpenChange }: Props) => {
  const { addItem } = useCart();
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!product || !open) return;
    setActiveIndex(0);
    const fetchImages = async () => {
      const { data } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true });
      
      const urls: string[] = [];
      if (product.image_url) urls.push(product.image_url);
      if (data) {
        data.forEach((img: any) => {
          if (!urls.includes(img.image_url)) urls.push(img.image_url);
        });
      }
      setImages(urls.length > 0 ? urls : product.image_url ? [product.image_url] : []);
    };
    fetchImages();
  }, [product, open]);

  if (!product) return null;

  const formatPrice = (price: number) => price.toLocaleString("uz-UZ") + " so'm";
  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {images.length > 0 && (
              <div className="space-y-3">
                <div
                  className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => setPreviewOpen(true)}
                >
                  <img src={images[activeIndex]} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-foreground opacity-0 group-hover:opacity-70 transition-opacity" />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + images.length) % images.length); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % images.length); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 hover:bg-background transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-foreground" />
                      </button>
                    </>
                  )}
                  {discount && (
                    <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-sm">-{discount}%</Badge>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeIndex ? "border-primary" : "border-border"}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {product.badge && <Badge className="bg-primary text-primary-foreground">{product.badge}</Badge>}
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium text-foreground">{product.rating || 0}</span>
                <span className="text-sm text-muted-foreground">({product.reviews_count || 0} izoh)</span>
              </div>
              {product.description && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
              {product.stock_quantity !== undefined && <p className="text-sm text-muted-foreground">Omborda: {product.stock_quantity} dona</p>}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                  {product.old_price && <span className="block text-sm text-muted-foreground line-through">{formatPrice(product.old_price)}</span>}
                </div>
                <Button onClick={handleAddToCart} size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />Savatchaga
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <CommentSection productId={product.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog images={images} initialIndex={activeIndex} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  );
};

export default ProductDetailDialog;
