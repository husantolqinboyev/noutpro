import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, User, Save, Package, Clock } from "lucide-react";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    telegram_id: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        telegram_id: profile.telegram_id || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        telegram_id: profileForm.telegram_id,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profil yangilandi!");
      await refreshProfile();
    }
    setLoading(false);
  };

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: "Kutilmoqda", variant: "secondary" },
    processing: { label: "Jarayonda", variant: "default" },
    shipped: { label: "Yuborildi", variant: "default" },
    delivered: { label: "Yetkazildi", variant: "default" },
    cancelled: { label: "Bekor qilingan", variant: "destructive" },
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p>Yuklanmoqda...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Mening hisobim</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Profil
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-4 w-4 mr-2" />
            Buyurtmalarim
          </Button>
        </div>

        {activeTab === "profile" && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Profil ma'lumotlari</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label>To'liq ism</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Ismingiz"
                  />
                </div>
                <div>
                  <Label>Telefon raqam</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <Label>Telegram ID</Label>
                  <Input
                    value={profileForm.telegram_id}
                    onChange={(e) => setProfileForm({ ...profileForm, telegram_id: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                </div>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Buyurtmalarim ({orders.length})
            </h2>
            <div className="grid gap-4">
              {orders.map((o) => {
                const s = statusMap[o.status] || { label: o.status, variant: "secondary" as const };
                return (
                  <div key={o.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                        <p className="font-medium text-card-foreground mt-1">
                          Buyurtma #{o.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {o.total_amount.toLocaleString("uz-UZ")} so'm
                        </p>
                        <Badge variant={s.variant} className="mt-1">{s.label}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8">Hali buyurtmalar yo'q</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
