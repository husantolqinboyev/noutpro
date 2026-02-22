import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle, Instagram, Youtube } from 'lucide-react';
import { usePublicSocialMedia } from '@/hooks/usePublicSocialMedia';

export default function SocialMediaLinks() {
  const { links, loading } = usePublicSocialMedia();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <MessageCircle className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'instagram':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'youtube':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Yuklanmoqda...</div>
        </CardContent>
      </Card>
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Bizni kuzatib boring</h3>
          <p className="text-sm text-muted-foreground">Ijtimoiy tarmoqlarda biz bilan bog'laning</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <Button
              key={link.id}
              asChild
              className={`${getPlatformColor(link.platform)} text-white`}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {getPlatformIcon(link.platform)}
                <span className="capitalize">{link.platform}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
