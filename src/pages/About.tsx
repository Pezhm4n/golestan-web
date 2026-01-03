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
import { useTranslation } from 'react-i18next';

interface TeamMember {
  id: string;
  nameFa: string;
  nameEn: string;
  icon: JSX.Element;
  roleKey: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'pezhman',
    nameFa: 'پژمان',
    nameEn: 'Pezhman',
    icon: <Brain className="h-4 w-4" />,
    roleKey: 'about.team.pezhmanRole',
    github: 'https://github.com/Pezhm4n',
    linkedin: 'https://www.linkedin.com/in/pezhman-sarmadi/',
    email: 'pksarmadi@gmail.com',
  },
  {
    id: 'shayan',
    nameFa: 'شایان',
    nameEn: 'Shayan',
    icon: <ServerCog className="h-4 w-4" />,
    roleKey: 'about.team.shayanRole',
    github: 'https://github.com/shayan-shm',
  },
  {
    id: 'mahyar',
    nameFa: 'مهیار',
    nameEn: 'Mahyar',
    icon: <BarChart3 className="h-4 w-4" />,
    roleKey: 'about.team.mahyarRole',
    github: 'https://github.com/HTIcodes',
    linkedin: 'https://www.linkedin.com/in/mahyar-hemmati-0a81a1320/',
  },
  {
    id: 'aydin',
    nameFa: 'آیدین',
    nameEn: 'Aydin',
    icon: <Bot className="h-4 w-4" />,
    roleKey: 'about.team.aydinRole',
    github: 'https://github.com/tig-ndi',
    linkedin: 'https://www.linkedin.com/in/aydinthr/',
  },
];

const About = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');
  const dir = isFa ? 'rtl' : 'ltr';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10"
      dir={dir}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            <span>{t('about.backToApp')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t('about.teamTitle')}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        {/* Intro / hero */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary border border-primary/20 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>{t('about.taglineChip')}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t('about.heroTitlePrefix')}
                <span className="text-primary">{t('about.teamName')}</span>
                {t('about.heroTitleSuffix')}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                {t('about.heroSubtitle')}
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
                    <span>{t('about.projectChip')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('about.projectName')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('about.projectDescription')}
              </p>
            </div>
          </Card>
        </section>

        {/* Team members */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t('about.teamMembersTitle')}
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
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {member.icon}
                    </div>
                    <h3 className="text-sm font-semibold">
                      {isFa ? member.nameFa : member.nameEn}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(member.roleKey)}
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
                  <h2 className="text-sm font-semibold">{t('about.telegramTitle')}</h2>
                  <p className="text-xs text-primary/90 max-w-sm">
                    {t('about.telegramDescription')}
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="https://t.me/golestoon_ir" target="_blank" rel="noreferrer">
                  <span className="ml-2">{t('about.telegramCta')}</span>
                </a>
              </Button>
            </div>
          </Card>

          {/* GitHub & contact */}
          <Card className="p-5 bg-card/80 border-border/70 backdrop-blur-sm rounded-xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-2">{t('about.githubSectionTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {t('about.githubSectionDescription')}
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
                    <span>{t('about.githubWebRepo')}</span>
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
                    <span>{t('about.githubAppRepo')}</span>
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-2">{t('about.contactSectionTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {t('about.contactSectionDescription')}
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
                    <span>{t('about.contactEmailCta')}</span>
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
                    <span>{t('about.contactGithubCta')}</span>
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {t('about.madeWithLove')}
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;