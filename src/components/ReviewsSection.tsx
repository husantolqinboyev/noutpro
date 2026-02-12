import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  text: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  profile_name?: string;
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("comments")
        .select("id, text, rating, created_at, user_id")
        .eq("is_moderated", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        // Fetch profile names
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const nameMap: Record<string, string> = {};
        profiles?.forEach((p) => { nameMap[p.user_id] = p.full_name; });

        setReviews(data.map((c) => ({ ...c, profile_name: nameMap[c.user_id] || "Foydalanuvchi" })));
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Bugun";
    if (days === 1) return "Kecha";
    if (days < 7) return `${days} kun oldin`;
    if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
    return `${Math.floor(days / 30)} oy oldin`;
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Mijozlar fikrlari</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Bizning xizmatimizdan foydalangan mijozlarimiz fikrlari
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {getInitials(r.profile_name || "F")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-card-foreground text-sm">{r.profile_name}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</div>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
