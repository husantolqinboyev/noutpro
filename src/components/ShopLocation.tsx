import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopSettings } from '@/hooks/useShopSettings';

export default function ShopLocation() {
    const { settings, loading } = useShopSettings();

    const openInMaps = (provider: 'google' | 'yandex') => {
        if (!settings) return;

        const url = provider === 'google'
            ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
            : `yandexmaps://maps.yandex.ru/?pt=${settings.longitude},${settings.latitude}&z=16&l=map`;

        if (provider === 'yandex') {
            window.location.href = url;
            // Fallback if app not installed
            setTimeout(() => {
                window.open(`https://yandex.uz/maps/?pt=${settings.longitude},${settings.latitude}&z=16&l=map`, '_blank');
            }, 500);
        } else {
            window.open(url, '_blank');
        }
    };

    if (loading || !settings) {
        return <div className="animate-pulse h-20 bg-hero-muted/10 rounded-lg" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-hero-foreground">Bizning manzil</p>
                    <p className="text-sm text-hero-muted">{settings.address}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:border-primary text-hero-muted hover:text-primary transition-all"
                    onClick={() => openInMaps('google')}
                >
                    <Navigation className="h-4 w-4 mr-2" />
                    Google Maps
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:border-primary text-hero-muted hover:text-primary transition-all"
                    onClick={() => openInMaps('yandex')}
                >
                    <Navigation className="h-4 w-4 mr-2" />
                    Yandex Maps
                </Button>
            </div>
        </div>
    );
}
