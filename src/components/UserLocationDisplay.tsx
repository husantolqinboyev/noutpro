import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function UserLocationDisplay() {
  const [mapProvider, setMapProvider] = useState<'google' | 'yandex'>('google');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { location, loading, updateLocation, openInMaps } = useUserLocation(user?.id || '');

  const handleUpdateLocation = async () => {
    try {
      await updateLocation();
      toast.success('Joylashuv muvaffaqiyatli yangilandi!');
    } catch (error) {
      toast.error('Joylashuvni yangilashda xatolik yuz berdi. Iltimos, GPS ruxsatini tekshiring.');
    }
  };

  const handleOpenInMaps = (provider: 'google' | 'yandex') => {
    setMapProvider(provider);
    openInMaps(provider);
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Joylashuv
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {location ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Joriy joylashuv</p>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary">
                      {new Date(location.timestamp).toLocaleDateString('uz-UZ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Xaritada ko'rish
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xarita provayderini tanlang</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={mapProvider === 'google' ? 'default' : 'outline'}
                          onClick={() => handleOpenInMaps('google')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded" />
                          Google Maps
                        </Button>
                        <Button
                          variant={mapProvider === 'yandex' ? 'default' : 'outline'}
                          onClick={() => handleOpenInMaps('yandex')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 bg-yellow-500 rounded" />
                          Yandex Maps
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Tanlangan xarita provayderi orqali joylashuvingizni ko'rasiz
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateLocation}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  Yangilash
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Hozircha saqlangan joylashuv yo'q
              </p>
              <Button
                onClick={handleUpdateLocation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joylashuv aniqlanmoqda...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Joylashuvni aniqlash
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Eslatma:</p>
            <ul className="space-y-1">
              <li>• Joylashuvni aniqlash uchun GPS ruxsatini bering</li>
              <li>• Xaritada ko'rish uchun Google Maps yoki Yandex Maps tanlang</li>
              <li>• Joylashuv ma'lumotlari faqat siz uchun saqlanadi</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
