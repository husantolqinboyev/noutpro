import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageUtils";
import type { Database } from "@/integrations/supabase/types";
import SocialMediaManager from "@/components/SocialMediaManager";
import {
  Plus, Package, ShoppingCart, MessageSquare, Image,
  ArrowLeft, Trash2, Edit, Eye, EyeOff, Save, X, Shield, UserPlus, Bell, Calendar, User, Link as LinkIcon, Settings, MapPin, ExternalLink
} from "lucide-react";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];
type Tab = "products" | "orders" | "comments" | "banners" | "roles" | "social" | "settings";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

import { useShopSettings } from "@/hooks/useShopSettings";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderProfiles, setOrderProfiles] = useState<Record<string, { full_name: string; phone: string | null }>>({});
  const [commentProfiles, setCommentProfiles] = useState<Record<string, { full_name: string }>>({});
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Shop settings
  const { settings: shopSettings, updateSettings } = useShopSettings();
  const [settingsForm, setSettingsForm] = useState({
    phone: "", email: "", address: "", telegram_bot_url: "", latitude: "", longitude: ""
  });

  useEffect(() => {
    if (shopSettings) {
      setSettingsForm({
        phone: shopSettings.phone,
        email: shopSettings.email,
        address: shopSettings.address,
        telegram_bot_url: shopSettings.telegram_bot_url || "https://t.me/Noutproo_bot",
        latitude: shopSettings.latitude.toString(),
        longitude: shopSettings.longitude.toString()
      });
    }
  }, [shopSettings]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateSettings({
      phone: settingsForm.phone,
      email: settingsForm.email,
      address: settingsForm.address,
      telegram_bot_url: settingsForm.telegram_bot_url,
      latitude: parseFloat(settingsForm.latitude) || 0,
      longitude: parseFloat(settingsForm.longitude) || 0
    });
    setLoading(false);
  };

  // Product form
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", old_price: "",
    category: "laptops", stock_quantity: "", badge: "", is_active: true, image_url: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([""]);

  // Banner form
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", link_url: "", sort_order: "0" });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  // Admin role form
  const [adminPhone, setAdminPhone] = useState("");

  // Order date filter
  const [orderDateFilter, setOrderDateFilter] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
      toast.error("Admin panelga kirishga ruxsat yo'q");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "products") fetchProducts();
      else if (activeTab === "orders") { fetchOrders(); setNewOrderCount(0); }
      else if (activeTab === "comments") fetchComments();
      else if (activeTab === "banners") fetchBanners();
    }
  }, [activeTab, isAdmin]);

  // Realtime order notifications
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        toast.info("🔔 Yangi buyurtma keldi!", { description: `Summa: ${(payload.new as any).total_amount?.toLocaleString("uz-UZ")} so'm`, duration: 8000 });
        setNewOrderCount((prev) => prev + 1);
        if (activeTab === "orders") fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    const orderList = (data as Order[]) || [];
    const userIds = [...new Set(orderList.map(o => o.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", userIds);
      const profileMap: Record<string, { full_name: string; phone: string | null }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });
      setOrderProfiles(profileMap);
    }
    setOrders(orderList);
    setLoading(false);
  };

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase.from("comments").select("*").order("created_at", { ascending: false });
    const commentList = (data as Comment[]) || [];
    const userIds = [...new Set(commentList.map(c => c.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const map: Record<string, { full_name: string }> = {};
      (profiles || []).forEach((p: any) => { map[p.user_id] = p; });
      setCommentProfiles(map);
    }
    setComments(commentList);
    setLoading(false);
  };

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  const uploadImage = async (file: File, bucket = "product-images"): Promise<string | null> => {
    try {
      const compressed = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, compressed);
      if (error) { toast.error("Rasm yuklashda xatolik"); return null; }
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      toast.error("Rasmni siqishda xatolik");
      return null;
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let mainImageUrl = editingProduct?.image_url || null;

    if (imageMode === "upload" && imageFiles.length > 0) {
      mainImageUrl = await uploadImage(imageFiles[0]);
    } else if (imageMode === "url" && productForm.image_url) {
      mainImageUrl = productForm.image_url;
    }

    const productData = {
      name: productForm.name, description: productForm.description,
      price: parseInt(productForm.price) || 0,
      old_price: productForm.old_price ? parseInt(productForm.old_price) : null,
      category: productForm.category, stock_quantity: parseInt(productForm.stock_quantity) || 0,
      badge: productForm.badge || null, is_active: productForm.is_active, image_url: mainImageUrl,
    };

    let productId = editingProduct?.id;

    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(productData).select("id").single();
      if (error) { toast.error(error.message); setLoading(false); return; }
      productId = data.id;
    }

    // Upload additional images
    if (productId) {
      if (imageMode === "upload" && imageFiles.length > 1) {
        for (let i = 1; i < imageFiles.length; i++) {
          const url = await uploadImage(imageFiles[i]);
          if (url) {
            await supabase.from("product_images").insert({ product_id: productId, image_url: url, sort_order: i });
          }
        }
      } else if (imageMode === "url") {
        const validUrls = additionalUrls.filter(u => u.trim());
        for (let i = 0; i < validUrls.length; i++) {
          await supabase.from("product_images").insert({ product_id: productId, image_url: validUrls[i].trim(), sort_order: i + 1 });
        }
      }
    }

    toast.success(editingProduct ? "Mahsulot yangilandi!" : "Mahsulot qo'shildi!");
    resetProductForm(); fetchProducts(); setLoading(false);
  };

  const resetProductForm = () => {
    setShowForm(false); setEditingProduct(null); setImageFiles([]); setImageMode("upload"); setExistingImages([]);
    setAdditionalUrls([""]);
    setProductForm({ name: "", description: "", price: "", old_price: "", category: "laptops", stock_quantity: "", badge: "", is_active: true, image_url: "" });
  };

  const editProduct = async (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, description: p.description, price: p.price.toString(),
      old_price: p.old_price?.toString() || "", category: p.category,
      stock_quantity: p.stock_quantity.toString(), badge: p.badge || "", is_active: p.is_active,
      image_url: p.image_url || "",
    });
    setImageMode(p.image_url?.startsWith("http") ? "url" : "upload");
    const { data } = await supabase.from("product_images").select("id, image_url").eq("product_id", p.id).order("sort_order");
    setExistingImages((data as any[]) || []);
    setAdditionalUrls([""]);
    setShowForm(true);
  };

  const deleteExistingImage = async (imageId: string) => {
    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) toast.error(error.message);
    else { setExistingImages(prev => prev.filter(img => img.id !== imageId)); toast.success("Rasm o'chirildi"); }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); fetchProducts(); }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Holat yangilandi"); fetchOrders(); }
  };

  const moderateComment = async (id: string, is_moderated: boolean) => {
    const { error } = await supabase.from("comments").update({ is_moderated }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(is_moderated ? "Tasdiqlandi" : "Rad etildi"); fetchComments(); }
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("O'chirildi"); fetchComments(); }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImageFile) { toast.error("Rasm tanlang"); return; }
    setLoading(true);
    const imageUrl = await uploadImage(bannerImageFile);
    if (!imageUrl) { setLoading(false); return; }
    const { error } = await supabase.from("banners").insert({
      title: bannerForm.title, image_url: imageUrl,
      link_url: bannerForm.link_url || null, sort_order: parseInt(bannerForm.sort_order) || 0,
    });
    if (error) toast.error(error.message); else toast.success("Banner qo'shildi!");
    setShowBannerForm(false); setBannerForm({ title: "", link_url: "", sort_order: "0" }); setBannerImageFile(null);
    fetchBanners(); setLoading(false);
  };

  const toggleBanner = async (id: string, is_active: boolean) => {
    await supabase.from("banners").update({ is_active }).eq("id", id);
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Banner o'chirildi"); fetchBanners();
  };

  const handleAssignAdmin = async () => {
    if (!adminPhone) { toast.error("Telefon raqamni kiriting"); return; }
    setLoading(true);
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("phone", adminPhone).maybeSingle();
    if (!profile) { toast.error("Bu telefon raqam bilan foydalanuvchi topilmadi"); setLoading(false); return; }
    const { data: existingRole } = await supabase.from("user_roles").select("id").eq("user_id", profile.user_id).eq("role", "admin").maybeSingle();
    if (existingRole) {
      toast.info("Bu foydalanuvchi allaqachon admin");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "admin" as any });
      if (error) toast.error(error.message); else toast.success("Admin muvaffaqiyatli tayinlandi!");
    }
    setAdminPhone(""); setLoading(false);
  };

  const formatPrice = (price: number) => price.toLocaleString("uz-UZ") + " so'm";

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setImageFiles(files);
  };

  const addUrlField = () => {
    if (additionalUrls.length < 3) setAdditionalUrls([...additionalUrls, ""]);
  };

  const updateUrlField = (index: number, value: string) => {
    const updated = [...additionalUrls];
    updated[index] = value;
    setAdditionalUrls(updated);
  };

  const removeUrlField = (index: number) => {
    setAdditionalUrls(additionalUrls.filter((_, i) => i !== index));
  };

  // Group orders by date
  const filteredOrders = orderDateFilter
    ? orders.filter(o => o.created_at.startsWith(orderDateFilter))
    : orders;

  const groupedOrders: Record<string, Order[]> = {};
  filteredOrders.forEach(o => {
    const date = new Date(o.created_at).toLocaleDateString("uz-UZ");
    if (!groupedOrders[date]) groupedOrders[date] = [];
    groupedOrders[date].push(o);
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Yuklanmoqda...</p></div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "products", label: "Mahsulotlar", icon: <Package className="h-4 w-4" /> },
    { key: "orders", label: "Buyurtmalar", icon: <ShoppingCart className="h-4 w-4" />, badge: newOrderCount || undefined },
    { key: "comments", label: "Izohlar", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "banners", label: "Bannerlar", icon: <Image className="h-4 w-4" /> },
    { key: "social", label: "Ijtimoiy tarmoqlar", icon: <LinkIcon className="h-4 w-4" /> },
    { key: "settings", label: "Sozlamalar", icon: <Settings className="h-4 w-4" /> },
    { key: "roles", label: "Rollar", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <Badge className="bg-primary text-primary-foreground">Admin</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <Button key={t.key} variant={activeTab === t.key ? "default" : "outline"} size="sm" onClick={() => setActiveTab(t.key)} className="flex items-center gap-2 relative">
              {t.icon}{t.label}
              {t.badge && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">Mahsulotlar ({products.length})</h2>
              <Button onClick={() => { resetProductForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-2" />Yangi mahsulot</Button>
            </div>
            {showForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-card-foreground">{editingProduct ? "Tahrirlash" : "Yangi mahsulot"}</h3>
                  <button onClick={resetProductForm}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Nomi</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></div>
                  <div><Label>Kategoriya</Label>
                    <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptops">Laptoplar</SelectItem>
                        <SelectItem value="phones">Telefonlar</SelectItem>
                        <SelectItem value="accessories">Aksessuarlar</SelectItem>
                        <SelectItem value="tablets">Planshetlar</SelectItem>
                        <SelectItem value="other">Boshqa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Narxi</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required /></div>
                  <div><Label>Eski narx</Label><Input type="number" value={productForm.old_price} onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })} /></div>
                  <div><Label>Miqdor</Label><Input type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} required /></div>
                  <div><Label>Badge</Label><Input value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Tavsif</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} /></div>
                  <div className="md:col-span-2">
                    <Label>Rasm usuli</Label>
                    <div className="flex gap-2 mb-2">
                      <Button type="button" variant={imageMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setImageMode("upload")}>Fayl yuklash (4 tagacha)</Button>
                      <Button type="button" variant={imageMode === "url" ? "default" : "outline"} size="sm" onClick={() => setImageMode("url")}>URL kiritish</Button>
                    </div>
                    {imageMode === "upload" ? (
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" multiple onChange={handleImageFilesChange} />
                        <p className="text-xs text-muted-foreground">Maksimal 4 ta rasm. Rasmlar avtomatik WebP formatiga o'tkaziladi va siqiladi.</p>
                        {imageFiles.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {imageFiles.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{i === 0 ? "Asosiy: " : ""}{f.name}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Asosiy rasm URL</Label>
                          <Input placeholder="https://example.com/main-image.jpg" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
                        </div>
                        <Label className="text-xs text-muted-foreground">Qo'shimcha rasmlar URL (3 tagacha)</Label>
                        {additionalUrls.map((url, i) => (
                          <div key={i} className="flex gap-2">
                            <Input
                              placeholder={`Qo'shimcha rasm ${i + 1} URL`}
                              value={url}
                              onChange={(e) => updateUrlField(i, e.target.value)}
                            />
                            {additionalUrls.length > 1 && (
                              <Button type="button" variant="outline" size="icon" onClick={() => removeUrlField(i)}><X className="h-4 w-4" /></Button>
                            )}
                          </div>
                        ))}
                        {additionalUrls.length < 3 && (
                          <Button type="button" variant="outline" size="sm" onClick={addUrlField}>
                            <Plus className="h-4 w-4 mr-1" />URL qo'shish
                          </Button>
                        )}
                      </div>
                    )}
                    {editingProduct && existingImages.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground">Mavjud qo'shimcha rasmlar:</Label>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {existingImages.map((img) => (
                            <div key={img.id} className="relative group">
                              <img src={img.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-border" />
                              <button type="button" onClick={() => deleteExistingImage(img.id)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end"><Button type="submit" disabled={loading}><Save className="h-4 w-4 mr-2" />{editingProduct ? "Yangilash" : "Qo'shish"}</Button></div>
                </form>
              </div>
            )}
            <div className="grid gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-card-foreground truncate">{p.name}</h3>
                      {p.badge && <Badge variant="secondary" className="text-xs">{p.badge}</Badge>}
                      {!p.is_active && <Badge variant="destructive" className="text-xs">Nofaol</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatPrice(p.price)} • {p.stock_quantity} dona • {p.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => editProduct(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {products.length === 0 && !loading && <p className="text-center text-muted-foreground py-8">Hali mahsulotlar yo'q</p>}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Buyurtmalar ({filteredOrders.length})</h2>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input type="date" value={orderDateFilter} onChange={(e) => setOrderDateFilter(e.target.value)} className="w-44" />
                {orderDateFilter && (
                  <Button variant="outline" size="sm" onClick={() => setOrderDateFilter("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {Object.entries(groupedOrders).map(([date, dateOrders]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{date}</h3>
                  <Badge variant="secondary">{dateOrders.length} ta</Badge>
                </div>
                <div className="grid gap-4">
                  {dateOrders.map((o) => {
                    const profile = orderProfiles[o.user_id];
                    return (
                      <div key={o.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-card-foreground">#{o.id.slice(0, 8)}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-sm text-primary font-semibold">{profile?.full_name || "Noma'lum"}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{profile?.phone || ""}</p>
                            <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("uz-UZ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatPrice(o.total_amount)}</p>
                            <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v as OrderStatus)}>
                              <SelectTrigger className="w-40 mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Kutilmoqda</SelectItem>
                                <SelectItem value="processing">Jarayonda</SelectItem>
                                <SelectItem value="shipped">Yuborildi</SelectItem>
                                <SelectItem value="delivered">Yetkazildi</SelectItem>
                                <SelectItem value="cancelled">Bekor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {o.notes && <p className="text-sm text-muted-foreground mt-2">{o.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && !loading && <p className="text-center text-muted-foreground py-8">Buyurtmalar yo'q</p>}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-6">Izohlar ({comments.length})</h2>
            <div className="grid gap-4">
              {comments.map((c) => {
                const profile = commentProfiles[c.user_id];
                return (
                  <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={c.is_moderated ? "default" : "secondary"}>{c.is_moderated ? "Tasdiqlangan" : "Kutilmoqda"}</Badge>
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{profile?.full_name || "Noma'lum"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("uz-UZ")}</span>
                        </div>
                        <p className="text-sm text-card-foreground">{c.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">Rating: {c.rating}/5</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="icon" onClick={() => moderateComment(c.id, !c.is_moderated)}>
                          {c.is_moderated ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-primary" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => deleteComment(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && !loading && <p className="text-center text-muted-foreground py-8">Izohlar yo'q</p>}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === "banners" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-foreground">Bannerlar ({banners.length})</h2>
              <Button onClick={() => setShowBannerForm(true)}><Plus className="h-4 w-4 mr-2" />Yangi banner</Button>
            </div>
            {showBannerForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-card-foreground">Yangi banner</h3>
                  <button onClick={() => setShowBannerForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Sarlavha</Label><Input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="Banner matni" /></div>
                  <div><Label>Havola (ixtiyoriy)</Label><Input value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} placeholder="https://..." /></div>
                  <div><Label>Tartib raqami</Label><Input type="number" value={bannerForm.sort_order} onChange={(e) => setBannerForm({ ...bannerForm, sort_order: e.target.value })} /></div>
                  <div><Label>Rasm</Label><Input type="file" accept="image/*" onChange={(e) => setBannerImageFile(e.target.files?.[0] || null)} required /></div>
                  <div className="flex items-end"><Button type="submit" disabled={loading}><Save className="h-4 w-4 mr-2" />Qo'shish</Button></div>
                </form>
              </div>
            )}
            <div className="grid gap-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  <img src={b.image_url} alt={b.title} className="w-24 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground truncate">{b.title || "Banner"}</h3>
                    <p className="text-sm text-muted-foreground">Tartib: {b.sort_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => toggleBanner(b.id, !b.is_active)}>
                      {b.is_active ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => deleteBanner(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && !loading && <p className="text-center text-muted-foreground py-8">Bannerlar yo'q</p>}
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <div>
            <SocialMediaManager />
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-6">Admin tayinlash</h2>
            <div className="bg-card border border-border rounded-xl p-6 max-w-md">
              <p className="text-sm text-muted-foreground mb-4">Foydalanuvchiga admin rolini berish uchun telefon raqamini kiriting.</p>
              <div className="space-y-4">
                <div><Label>Telefon raqam</Label><Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="+998901234567" /></div>
                <Button onClick={handleAssignAdmin} disabled={loading}><UserPlus className="h-4 w-4 mr-2" />Admin qilish</Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-6">Do'kon sozlamalari</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Telefon raqam</Label>
                    <Input
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="info@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>Manzil</Label>
                  <Textarea
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="Toshkent shahri, ..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Telegram Bot manzili</Label>
                  <Input
                    value={settingsForm.telegram_bot_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_bot_url: e.target.value })}
                    placeholder="https://t.me/Noutproo_bot"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Kenglik (Latitude)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:text-primary/80 p-0"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setSettingsForm(prev => ({
                                  ...prev,
                                  latitude: pos.coords.latitude.toString(),
                                  longitude: pos.coords.longitude.toString()
                                }));
                                toast.success("Koordinatalar o'rnatildi!");
                              },
                              (err) => toast.error("Joylashuvni aniqlab bo'lmadi: " + err.message)
                            );
                          } else {
                            toast.error("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
                          }
                        }}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Hozirgi joylashuv
                      </Button>
                    </div>
                    <Input
                      type="number"
                      step="any"
                      value={settingsForm.latitude}
                      onChange={(e) => setSettingsForm({ ...settingsForm, latitude: e.target.value })}
                      placeholder="41.311081"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Uzunlik (Longitude)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={settingsForm.longitude}
                      onChange={(e) => setSettingsForm({ ...settingsForm, longitude: e.target.value })}
                      placeholder="69.240562"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <span>Yordam:</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${settingsForm.latitude || 41.311081},${settingsForm.longitude || 69.240562}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Google Maps-da ko'rish <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={`https://yandex.uz/maps/?pt=${settingsForm.longitude || 69.240562},${settingsForm.latitude || 41.311081}&z=16&l=map`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Yandex Maps-da ko'rish <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Saqlash
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )
        }
      </div >
    </div >
  );
};

export default AdminPage;
