import { useEffect, useState } from "react";
import { Laptop, Smartphone, Headphones, Tablet, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import categoryLaptops from "@/assets/category-laptops.jpg";
import categoryPhones from "@/assets/category-phones.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";

const defaultImages: Record<string, string> = {
  laptops: categoryLaptops,
  phones: categoryPhones,
  accessories: categoryAccessories,
  tablets: categoryPhones,
  other: categoryAccessories,
};

const categoryLabels: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  laptops: { title: "Laptoplar va kompyuterlar", description: "Eng so'nggi modellar va kuchli konfiguratsiyalar", icon: <Laptop className="h-6 w-6" /> },
  phones: { title: "Telefonlar va gadjetlar", description: "Smartfonlar, planshetlar va boshqa gadjetlar", icon: <Smartphone className="h-6 w-6" /> },
  accessories: { title: "Original aksessuarlar", description: "Qoplar, zaryadlovchilar, quloqchinlar va boshqalar", icon: <Headphones className="h-6 w-6" /> },
  tablets: { title: "Planshetlar", description: "Eng zamonaviy planshetlar", icon: <Tablet className="h-6 w-6" /> },
  other: { title: "Boshqa mahsulotlar", description: "Turli xil texnika mahsulotlari", icon: <Package className="h-6 w-6" /> },
};

interface CategoryData {
  category: string;
  count: number;
}

const CategoriesSection = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((p) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setCategories(
          Object.entries(counts).map(([category, count]) => ({ category, count }))
        );
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Kategoriyalar</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Bizning do'konimizda barcha turdagi texnika mahsulotlari mavjud
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const info = categoryLabels[cat.category] || { title: cat.category, description: "", icon: <Package className="h-6 w-6" /> };
            const image = defaultImages[cat.category] || categoryAccessories;
            return (
              <div
                key={cat.category}
                className="group relative rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">{info.icon}</span>
                    <h3 className="text-xl font-bold text-primary-foreground">{info.title}</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/70 mb-2">{info.description}</p>
                  <span className="text-xs font-medium text-primary">
                    {cat.count}+ mahsulot →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
