import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Target,
  Sparkles,
  Brain,
  ServerCog,
  BarChart3,
  Bot,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeamMember {
  id: string;
  name: string;
  icon: JSX.Element;
  role: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'pezhman',
    name: 'پژمان',
    icon: <Brain className="h-4 w-4" />,
    role: 'مدیر پروژه، ایده‌پرداز و توسعه‌دهنده',
    github: 'https://github.com/Pezhm4n',
    linkedin: 'https://www.linkedin.com/in/pezhman-sarmadi/',
    email: 'pksarmadi@gmail.com',
  },
  {
    id: 'shayan',
    name: 'شایان',
    icon: <ServerCog className="h-4 w-4" />,
    role: 'توسعه‌دهنده API و دریافت اطلاعات',
    github: 'https://github.com/shayan-shm',
  },
  {
    id: 'mahyar',
    name: 'مهیار',
    icon: <BarChart3 className="h-4 w-4" />,
    role: 'مسئول مستندسازی و تحلیل داده',
    github: 'https://github.com/HTIcodes',
    linkedin: 'https://www.linkedin.com/in/mahyar-hemmati-0a81a1320/',
  },
  {
    id: 'aydin',
    name: 'آیدین',
    icon: <Bot className="h-4 w-4" />,
    role: 'توسعه‌دهنده مدل هوش مصنوعی',
    github: 'https://github.com/tig-ndi',
    linkedin: 'https://www.linkedin.com/in/aydinthr/',
  },
];

const About = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به برنامه</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">درباره تیم چوپولوفسکی</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        {/* Intro / hero */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary border border-primary/20 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>یک تیم کوچک؛ یک ایده برای ساده‌تر شدن زندگی دانشجوها</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                ما تیم <span className="text-primary">چوپولوفسکی</span> هستیم
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                ما یک تیم دانشجویی هستیم که روی طراحی و توسعه ابزارهای کاربردی تمرکز داریم.
              </p>
            </div>
          </div>

          {/* Simple modern info card on the right */}
          <Card className="relative overflow-hidden border-border/70 bg-card/80 backdrop-blur-sm p-5 md:p-6">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20 opacity-70" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/t_600x600.png"
                  alt="Golestoon icon"
                  className="h-10 w-10 rounded-xl border border-border/70 object-cover"
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground border border-border/60">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span>درباره این پروژه</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    برنامه‌ریز درسی «گلستون»
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                این پروژه با هدف ساده‌سازی فرآیند برنامه‌ریزی درسی دانشجویان طراحی شده است.
                تلاش ما این بوده که با یک رابط کاربری شفاف و سریع، انتخاب و مدیریت دروس
                بدون پیچیدگی و سردرگمی انجام شود.
              </p>
            </div>
          </Card>
        </section>

        {/* Team members */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              اعضای تیم چوپولوفسکی
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {teamMembers.map(member => (
              <Card
                key={member.id}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/15"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-primary/5 via-transparent to-primary/15" />
                <div className="relative mb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">
                      {member.emoji}
                    </span>
                    <h3 className="text-sm font-semibold">{member.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {member.role}
                  </p>
                </div>

                <div className="relative mt-auto flex flex-wrap items-center gap-2">
                  {member.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-2.5 text-[11px] gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                    >
                      <a href={member.github} target="_blank" rel="noreferrer">
                        <Github className="h-3.5 w-3.5" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                  )}
                  {member.linkedin && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-2.5 text-[11px] gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                    >
                      <a href={member.linkedin} target="_blank" rel="noreferrer">
                        <Linkedin className="h-3.5 w-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    </Button>
                  )}
                  {member.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-2.5 text-[11px] gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                    >
                      <a href={`mailto:${member.email}`}>
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Project links & contact / footer section */}
        <section className="space-y-6">
          {/* Telegram channel - prominent */}
          <Card className="p-5 bg-primary/10 border-primary/40 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden">
                  <img
                    src="https://telegram.org/img/t_logo.svg"
                    alt="Telegram"
                    className="h-7 w-7"
                  />
                </div>
                <div className="space-y-1 text-right">
                  <h2 className="text-sm font-semibold">کانال تلگرام گلستون</h2>
                  <p className="text-xs text-primary/90 max-w-sm">
                    برای اطلاع از آخرین به‌روزرسانی‌ها و خبرهای پروژه، عضو کانال تلگرام ما شوید.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="https://t.me/golestoon_ir" target="_blank" rel="noreferrer">
                  <span className="ml-2">عضویت در کانال تلگرام</span>
                </a>
              </Button>
            </div>
          </Card>

          {/* GitHub & contact */}
          <Card className="p-5 bg-card/80 border-border/70 backdrop-blur-sm rounded-xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-2">پروژه در گیت‌هاب</h2>
              <p className="text-sm text-muted-foreground mb-3">
                سورس‌کد گلستون به‌صورت متن‌باز در گیت‌هاب منتشر شده است:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                >
                  <a
                    href="https://github.com/Pezhm4n/golestan-web"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>سورس وب (golestan-web)</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                >
                  <a
                    href="https://github.com/Pezhm4n/Golestoon"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>نسخه اپ (Golestoon)</span>
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-2">راه‌های ارتباطی</h2>
              <p className="text-sm text-muted-foreground mb-3">
                برای پیشنهاد، همکاری یا گزارش مشکل می‌توانید از یکی از راه‌های زیر استفاده کنید:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                >
                  <a href="mailto:pksarmadi@gmail.com">
                    <Mail className="h-3.5 w-3.5" />
                    <span>ایمیل تیم</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5 border-border/70 hover:border-primary/70 hover:bg-primary/10"
                >
                  <a href="https://github.com/Pezhm4n" target="_blank" rel="noreferrer">
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub پژمان</span>
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            ساخته شده با <span className="text-red-500">❤️</span> توسط تیم چوپولوفسکی
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;