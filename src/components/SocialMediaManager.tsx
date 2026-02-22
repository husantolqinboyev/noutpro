import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ExternalLink, MessageCircle, Instagram, Youtube } from 'lucide-react';
import { useSocialMediaLinks } from '@/hooks/useSocialMediaLinks';
import { SocialMediaLink } from '@/types/ai';
import { toast } from 'sonner';

export default function SocialMediaManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [newLink, setNewLink] = useState({
    platform: 'telegram' as 'telegram' | 'instagram' | 'youtube',
    url: ''
  });

  const { links, loading, addLink, updateLink, deleteLink } = useSocialMediaLinks();

  const handleAddLink = async () => {
    if (!newLink.url.trim()) {
      toast.error('URL manzilini kiriting');
      return;
    }

    const success = await addLink(newLink.platform, newLink.url);
    if (success) {
      setNewLink({ platform: 'telegram', url: '' });
      setIsAddDialogOpen(false);
      toast.success('Ijtimoiy tarmoq manzili qo\'shildi');
    }
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    const success = await updateLink(editingLink.id, editingLink.url, editingLink.isActive);
    if (success) {
      setEditingLink(null);
      toast.success('Ijtimoiy tarmoq manzili yangilandi');
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await deleteLink(id);
    if (success) {
      toast.success('Ijtimoiy tarmoq manzili o\'chirildi');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <MessageCircle className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return 'bg-blue-500';
      case 'instagram':
        return 'bg-pink-500';
      case 'youtube':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ijtimoiy tarmoqlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Yuklanmoqda...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ijtimoiy tarmoqlar boshqaruvi</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yangi manzil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi ijtimoiy tarmoq manzili</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Platforma</Label>
                <Select
                  value={newLink.platform}
                  onValueChange={(value: 'telegram' | 'instagram' | 'youtube') =>
                    setNewLink(prev => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">URL manzili</Label>
                <Input
                  id="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://t.me/username"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleAddLink}>Qo'shish</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Hozircha hech qanday ijtimoiy tarmoq manzili yo'q
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full text-white ${getPlatformColor(link.platform)}`}>
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{link.platform}</div>
                    <div className="text-sm text-muted-foreground">{link.url}</div>
                  </div>
                  <Badge variant={link.isActive ? 'default' : 'secondary'}>
                    {link.isActive ? 'Faol' : 'Faol emas'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={link.isActive}
                    onCheckedChange={(checked) => updateLink(link.id, link.url, checked)}
                  />
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLink(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manzilni tahrirlash</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-url">URL manzili</Label>
                          <Input
                            id="edit-url"
                            value={editingLink?.url || ''}
                            onChange={(e) => setEditingLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="edit-active">Faol</Label>
                          <Switch
                            id="edit-active"
                            checked={editingLink?.isActive || false}
                            onCheckedChange={(checked) => setEditingLink(prev => prev ? { ...prev, isActive: checked } : null)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingLink(null)}>
                            Bekor qilish
                          </Button>
                          <Button onClick={handleUpdateLink}>Saqlash</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
