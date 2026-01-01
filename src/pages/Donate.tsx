import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Coffee, 
  Pizza, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Users,
  Rocket,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface DonationOption {
  id: string;
  amount: number;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
}

const donationOptions: DonationOption[] = [
  {
    id: 'coffee',
    amount: 50000,
    label: 'یه قهوه',
    emoji: '☕',
    icon: <Coffee className="h-6 w-6" />,
    description: 'برای شروع یه روز پرانرژی',
    popular: true,
  },
  {
    id: 'pizza',
    amount: 100000,
    label: 'یه پیتزا',
    emoji: '🍕',
    icon: <Pizza className="h-6 w-6" />,
    description: 'برای یه شب کدنویسی',
  },
  {
    id: 'love',
    amount: 200000,
    label: 'عشق و انرژی',
    emoji: '❤️',
    icon: <Heart className="h-6 w-6" />,
    description: 'حمایت ویژه از تیم',
  },
  {
    id: 'custom',
    amount: 0,
    label: 'مبلغ دلخواه',
    emoji: '✨',
    icon: <Sparkles className="h-6 w-6" />,
    description: 'هر مبلغی که دوست داری',
  },
];

const formatNumber = (num: number): string => {
  return num.toLocaleString('fa-IR');
};

const Donate = () => {
  const [selectedOption, setSelectedOption] = useState<string>('coffee');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [showInSupporters, setShowInSupporters] = useState<boolean>(true);
  const { t } = useSettings();

  const getSelectedAmount = (): number => {
    if (selectedOption === 'custom') {
      return parseInt(customAmount.replace(/,/g, '')) || 0;
    }
    return donationOptions.find(o => o.id === selectedOption)?.amount || 0;
  };

  const handleCustomAmountChange = (value: string) => {
    // Remove non-numeric characters except comma
    const numeric = value.replace(/[^\d]/g, '');
    if (numeric) {
      setCustomAmount(parseInt(numeric).toLocaleString('fa-IR'));
    } else {
      setCustomAmount('');
    }
  };

  const handleDonate = () => {
    const amount = getSelectedAmount();
    if (amount < 10000) {
      return;
    }
    // Here you would integrate with payment gateway
    console.log('Donating:', { amount, donorName, showInSupporters });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-4 w-4" />
            <span className="text-sm">بازگشت به برنامه</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-medium">حمایت از ما</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-primary/20 mb-6">
            <Heart className="h-10 w-10 text-pink-500 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            از گلستون حمایت کن 💙
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            این ابزار رایگانه و همیشه رایگان می‌مونه. اما اگه بهت کمک کرده، 
            می‌تونی با یه قهوه یا پیتزا انرژی تیم چوپولوفسکی رو شارژ کنی!
          </p>
        </div>


        {/* Donation Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            انتخاب مبلغ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {donationOptions.map((option, idx) => (
              <Card
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "relative p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] group",
                  "border-2",
                  selectedOption === option.id
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm",
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {option.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-pink-500 text-white text-[10px] px-2">
                    محبوب ⭐
                  </Badge>
                )}
                
                <div className="text-center">
                  <div className={cn(
                    "text-3xl mb-2 transition-transform duration-300",
                    selectedOption === option.id && "scale-110"
                  )}>
                    {option.emoji}
                  </div>
                  <div className="text-sm font-medium mb-1">{option.label}</div>
                  {option.amount > 0 ? (
                    <div className="text-lg font-bold text-primary">
                      {formatNumber(option.amount)}
                      <span className="text-xs text-muted-foreground mr-1">تومان</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div className={cn(
                  "absolute inset-0 rounded-lg ring-2 ring-primary transition-opacity duration-300 pointer-events-none",
                  selectedOption === option.id ? "opacity-100" : "opacity-0"
                )} />
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        {selectedOption === 'custom' && (
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50 animate-scale-in">
            <label className="block text-sm font-medium mb-3">مبلغ دلخواه (تومان)</label>
            <div className="relative">
              <Input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="مثلاً ۷۵,۰۰۰"
                className="text-lg h-12 pr-4 pl-16 text-center font-bold"
                dir="ltr"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                تومان
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              حداقل مبلغ: ۱۰,۰۰۰ تومان
            </p>
          </Card>
        )}

        {/* Donor Name (Optional) */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">نام شما (اختیاری)</label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={showInSupporters}
                onChange={(e) => setShowInSupporters(e.target.checked)}
                className="rounded border-border"
              />
              نمایش در صفحه حامیان
            </label>
          </div>
          <Input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="مثلاً: علی از تهران"
            className="h-11"
          />
        </Card>

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          disabled={getSelectedAmount() < 10000}
          className={cn(
            "w-full h-14 text-lg font-bold rounded-xl transition-all duration-300",
            "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90",
            "shadow-lg hover:shadow-xl hover:shadow-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Heart className="h-5 w-5 ml-2 animate-pulse" />
          حمایت با {formatNumber(getSelectedAmount())} تومان
        </Button>

        {/* Trust Badges */}
        <Card className="mt-8 p-6 bg-muted/30 border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield className="h-5 w-5 text-emerald-500" />,
                title: 'پرداخت امن',
                description: 'از درگاه‌های معتبر بانکی',
              },
              {
                icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
                title: 'اختیاری و بدون اجبار',
                description: 'برنامه همیشه رایگانه',
              },
              {
                icon: <Users className="h-5 w-5 text-pink-500" />,
                title: 'صفحه حامیان',
                description: 'نام شما در صفحه حامیان',
              },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{badge.icon}</div>
                <div>
                  <div className="text-sm font-medium">{badge.title}</div>
                  <div className="text-xs text-muted-foreground">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center mt-12 text-muted-foreground">
          <p className="text-sm mb-2">با تشکر از حمایت شما 💙</p>
          <p className="text-xs">تیم چوپولوفسکی</p>
        </div>
      </main>
    </div>
  );
};

export default Donate;
