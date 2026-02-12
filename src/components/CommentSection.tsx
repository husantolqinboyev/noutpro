import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Send, MessageSquare, User } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  rating: number | null;
  created_at: string;
  user_id: string;
  is_moderated: boolean;
}

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

const CommentSection = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("id, text, rating, created_at, user_id, is_moderated")
      .eq("product_id", productId)
      .eq("is_moderated", true)
      .order("created_at", { ascending: false });
    
    const commentList = (data as Comment[]) || [];
    setComments(commentList);

    // Fetch profiles for commenters
    const userIds = [...new Set(commentList.map(c => c.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      const map: Record<string, Profile> = {};
      (profileData || []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Izoh qoldirish uchun tizimga kiring");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      product_id: productId,
      user_id: user.id,
      text: newComment.trim(),
      rating,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Izohingiz admin tomonidan tasdiqlanganidan keyin ko'rinadi");
      setNewComment("");
      setRating(5);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Izohlar ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                <Star className={`h-5 w-5 transition-colors ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Izohingizni yozing..." rows={3} />
          <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Yuborilmoqda..." : "Izoh qoldirish"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Izoh qoldirish uchun{" "}
          <a href="/auth" className="text-primary hover:underline">tizimga kiring</a>
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hali izohlar yo'q</p>
        ) : (
          comments.map((c) => {
            const profile = profiles[c.user_id];
            return (
              <div key={c.id} className="bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {profile?.full_name || "Foydalanuvchi"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-3 w-3 ${star <= (c.rating || 0) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(c.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
                <p className="text-sm text-foreground">{c.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
