import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
}

const BannerSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, image_url, link_url, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(5);
      if (data) setBanners(data);
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <section className="bg-background py-2">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {banners.map((b) => {
            const content = (
              <div
                key={b.id}
                className="relative rounded-xl overflow-hidden border border-border group cursor-pointer"
              >
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {b.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-sm font-medium text-primary-foreground">{b.title}</p>
                  </div>
                )}
              </div>
            );
            return b.link_url ? (
              <a key={b.id} href={b.link_url} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={b.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
