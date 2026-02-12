import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Send, Phone, KeyRound } from "lucide-react";

const TELEGRAM_BOT_URL = "https://t.me/noutpro_bot";

const AuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"start" | "otp">("start");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code) {
      toast.error("Telefon raqam va kodni kiriting");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ phone, code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tasdiqlashda xatolik");
      }

      // Sign in with email/password returned from edge function
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success("Muvaffaqiyatli kirdingiz!");
      navigate("/");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-hero-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Bosh sahifaga
        </button>

        <div className="bg-card rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gradient mb-2">NOUTPRO</h1>
            <p className="text-muted-foreground">Telegram orqali kirish</p>
          </div>

          {step === "start" && (
            <div className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-sm">
                {[
                  "Telegram botimizga o'ting va /start tugmasini bosing",
                  '"Telefon raqamni ulashish" tugmasini bosing',
                  "Bot sizga tasdiqlash kodini yuboradi",
                  "Kodni shu yerga kiriting",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-foreground">{text}</p>
                  </div>
                ))}
              </div>

              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="default" className="w-full" size="lg">
                  <Send className="h-5 w-5 mr-2" />
                  Telegram botga o'tish
                </Button>
              </a>

              <Button variant="outline" className="w-full" onClick={() => setStep("otp")}>
                <KeyRound className="h-4 w-4 mr-2" />
                Kodni kiritish
              </Button>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefon raqam</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+998901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Telegramda ulashgan raqamingiz
                </p>
              </div>

              <div>
                <Label htmlFor="code">Tasdiqlash kodi</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("start")}
                className="w-full text-sm text-primary hover:underline"
              >
                ← Orqaga
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
