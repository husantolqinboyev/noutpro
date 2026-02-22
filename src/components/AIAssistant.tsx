import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, Heart, Star, ShoppingBag } from 'lucide-react';
import { useAIUsage } from '@/hooks/useAIUsage';
import { useUserState } from '@/hooks/useUserState';
import { useAuth } from '@/hooks/useAuth';
import { getGroqResponse } from '@/lib/groq';
import { toast } from 'sonner';

interface AIAssistantProps {
  className?: string;
}

export default function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMood, setUserMood] = useState('');
  
  const { user } = useAuth();
  const { usage, canUseAI, remainingUses, incrementUsage } = useAIUsage(user?.id || '');
  const { userState, updateUserState } = useUserState(user?.id || '');

  const generateResponse = async (userMessage: string) => {
    try {
      const systemPrompt = `Siz "Speedy Gadgets Hub" uchun AI yordamchisiz. Sizning vazifangiz:
1. Foydalanuvchilarga mahsulotlar taklif qilish
2. Ularning holatini tushunib, ularni maqtash va rag'batlantirish
3. Do'stona va samimiy bo'lish
4. O'zbek tilida javob berish

Agar foydalanuvchi o'z holati haqida aytgan bo'lsa, uni har doim maqtang va rag'batlantiring.
Mahsulotlar taklif qilganda, ularning ehtiyojlarini hisobga oling.

Joriy foydalanuvchi holati: ${userState?.mood || 'noma\'lum'}
Foydalanuvchi xabari: ${userMessage}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await getGroqResponse(messages);
      
      return response.choices?.[0]?.message?.content || 'Kechirasiz, nimadir xato ketdi.';
    } catch (error) {
      console.error('AI response error:', error);
      return 'Kechirasiz, hozircha AI yordam berishda muammo bor. Iltimos, keyinroq urinib ko\'ring.';
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !canUseAI || !user) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    const success = await incrementUsage();
    if (!success) {
      toast.error('Kechirasiz, bugungi foydalanish limiti to\'lgan.');
      setIsLoading(false);
      return;
    }

    try {
      const aiResponse = await generateResponse(userMessage);
      setMessages([...newMessages, { role: 'assistant' as const, content: aiResponse }]);

      if (userMessage.toLowerCase().includes('holatim') || userMessage.toLowerCase().includes('kayfiyatim')) {
        await updateUserState('user_shared', userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Xabar yuborishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodUpdate = async (mood: string) => {
    if (!user) return;
    
    setUserMood(mood);
    await updateUserState(mood, `Foydalanuvchi o'z holatini ${mood} deb belgiladi.`);
    toast.success('Holatingiz qabul qilindi! AI sizning kayfiyatingizni hisobga oladi.');
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback>
            <Bot className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">AI Yordamchi</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={canUseAI ? 'default' : 'destructive'}>
              {remainingUses}/5 foydalanish
            </Badge>
            {userState && (
              <Badge variant="outline">
                Kayfiyat: {userState.mood}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Kayfiyatingiz:</span>
          {['Yaxshi', 'Oddiy', 'Charchagan', 'Quvnoq', 'Tashvishli'].map((mood) => (
            <Button
              key={mood}
              variant={userMood === mood ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMoodUpdate(mood)}
              className="flex items-center gap-1"
            >
              {mood === 'Yaxshi' && <Heart className="h-3 w-3" />}
              {mood === 'Quvnoq' && <Star className="h-3 w-3" />}
              {mood === 'Charchagan' && <ShoppingBag className="h-3 w-3" />}
              {mood}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Assalom alaykum! Men sizning AI yordamchingizman.</p>
              <p className="text-sm mt-1">Mahsulotlar haqida so'rang yoki o'z holatingizni baham ko'ring!</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI yordamchiga xabar yozing..."
            className="flex-1 min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!canUseAI || isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || !canUseAI || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!canUseAI && (
          <div className="text-center text-sm text-destructive">
            Bugungi foydalanish limiti to'lgan. Ertaga qaytib ko'ring!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
