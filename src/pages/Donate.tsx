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
import { useTranslation } from 'react-i18next';

interface DonationOption {
  id: string;
  amount: number;
  emoji: string;
  icon: React.ReactNode;
  labelKey: string;
  descriptionKey: string;
  popular?: boolean;
}

const donationOptions: DonationOption[] = [
  {
    id: 'coffee',
    amount: 50000,
    emoji: '☕',
    icon: <Coffee className="h-6 w-6" />,
    labelKey: 'donate.options.coffeeLabel',
    descriptionKey: 'donate.options.coffeeDescription',
    popular: true,
  },
  {
    id: 'pizza',
    amount: 100000,
    emoji: '🍕',
    icon: <Pizza className="h-6 w-6" />,
    labelKey: 'donate.options.pizzaLabel',
    descriptionKey: 'donate.options.pizzaDescription',
  },
  {
    id: 'love',
    amount: 200000,
    emoji: '❤️',
    icon: <Heart className="h-6 w-6" />,
    labelKey: 'donate.options.loveLabel',
    descriptionKey: 'donate.options.loveDescription',
  },
  {
    id: 'custom',
    amount: 0,
    emoji: '✨',
    icon: <Sparkles className="h-6 w-6" />,
    labelKey: 'donate.options.customLabel',
    descriptionKey: 'donate.options.customDescription',
  },
];

const formatNumber = (num: number): string => {
  return num.toLocaleString('fa-IR');
};

/**
 * Normalize any digit string (English, Persian, Arabic-Indic) to plain 0-9
 * and strip common thousands separators.
 */
const normalizeNumberString = (value: string): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return value
    // Persian digits → ASCII
    .replace(/[۰-۹]/g, d => String(persianDigits.indexOf(d)))
    // Arabic-Indic digits → ASCII
    .replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)))
    // Remove commas and Arabic thousands separator
    .replace(/[,\u066C]/g, '')
    // Only keep ASCII digits
    .replace(/[^0-9]/g, '');
};

const Donate = () => {
  const [selectedOption, setSelectedOption] = useState<string>('coffee');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [showInSupporters, setShowInSupporters] = useState<boolean>(true);
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');

  const getSelectedAmount = (): number => {
    if (selectedOption === 'custom') {
      const normalized = normalizeNumberString(customAmount);
      return parseInt(normalized, 10) || 0;
    }
    return donationOptions.find(o => o.id === selectedOption)?.amount || 0;
  };

  const handleCustomAmountChange = (value: string) => {
    const normalized = normalizeNumberString(value);
    if (normalized) {
      const num = parseInt(normalized, 10);
      setCustomAmount(num.toLocaleString('fa-IR'));
    } else {
      setCustomAmount('');
    }
  };

  const handleDonate = () => {
    const amount = getSelectedAmount();
    if (amount < 10000) {
      return;
    }
    // Here you would integrate with your payment gateway.
    // Intentionally no console logging to avoid leaking donor details.
  };

  const selectedAmountFormatted = formatNumber(getSelectedAmount());

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-4 w-4" />
            <span className="text-sm">{t('donate.backToApp')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
            <span className="text-sm font-medium">{t('donate.pageTitle')}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero Section (kept) */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-primary/20 mb-6">
            <Heart className="h-10 w-10 text-pink-500 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {t('donate.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {t('donate.heroSubtitle')}
          </p>
        </div>

        {/* Under construction message */}
        <Card className="p-8 md:p-10 bg-card/70 backdrop-blur-md border-dashed border-primary/40 shadow-xl text-center animate-scale-in">
          <div className="flex justify-center mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            این بخش در حال بازسازی است
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed" dir="rtl">
            در حال آماده‌سازی نسخهٔ جدید و امن برای حمایت مالی از گلستون هستیم.
            به‌زودی امکان پرداخت با درگاه مطمئن و گزینه‌های متنوع مبلغ دوباره فعال می‌شود.
            از صبر و همراهی شما ممنونیم 💙
          </p>

          <Button
            asChild
            variant="outline"
            className="inline-flex items-center gap-2 mt-2"
          >
            <Link to="/">
              <ArrowRight className="h-4 w-4" />
              بازگشت به برنامه
            </Link>
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Donate;
