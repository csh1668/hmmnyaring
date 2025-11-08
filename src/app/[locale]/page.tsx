import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Shield, MessageSquare, Sparkles, Users, Globe, Star, Compass, Heart, Zap, Route } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function Home() {
  const session = await auth();
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="relative flex min-h-[85vh] w-full items-center justify-center px-4 gradient-hero overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 h-60 w-60 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative mx-auto w-full max-w-5xl text-center z-10">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 glass px-6 py-3 text-sm font-medium shadow-lg">
            <MapPin className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-foreground">{t('badge')}</span>
            <Star className="h-4 w-4 text-accent fill-accent" />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl mb-4">
            <span className="text-gradient-travel">{t('title')}</span>
            <br />
            <span className="text-foreground">{t('subtitle')}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-xl leading-relaxed text-muted-foreground sm:text-2xl lg:text-3xl max-w-3xl mx-auto font-light">
            {t('hero')}
            <br />
            <span className="text-foreground/90 font-medium">{t('heroSub')}</span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <>
                <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-lg gradient-travel text-white border-0 hover:opacity-90 shadow-lg">
                  <Link href="/dashboard">
                    <Compass className="mr-2 h-6 w-6" />
                    {t('ctaDashboard')}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-lg glass border-2">
                  <Link href="/courses">
                    <Route className="mr-2 h-6 w-6" />
                    {t('ctaCourses')}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-lg glass border-2">
                  <Link href="/guides">
                    <Globe className="mr-2 h-6 w-6" />
                    {t('ctaGuides')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg gradient-travel text-white border-0 hover:opacity-90 shadow-lg transform hover:scale-105 transition-all">
                  <Link href="/register">
                    <Zap className="mr-2 h-6 w-6" />
                    {t('ctaStart')}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto h-14 px-10 text-lg glass border-2 hover:border-primary">
                  <Link href="/login">{t('login')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="font-medium">{t('trustSafe')}</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-medium">{t('trustAI')}</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('trustChat')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {t('featureTitle')}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featureSubtitle')}
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: t('feature1Title'),
              description: t('feature1Desc'),
              color: 'accent',
            },
            {
              icon: Shield,
              title: t('feature2Title'),
              description: t('feature2Desc'),
              color: 'secondary',
            },
            {
              icon: MessageSquare,
              title: t('feature3Title'),
              description: t('feature3Desc'),
              color: 'primary',
            },
            {
              icon: MapPin,
              title: t('feature4Title'),
              description: t('feature4Desc'),
              color: 'primary',
            },
            {
              icon: Globe,
              title: t('feature5Title'),
              description: t('feature5Desc'),
              color: 'secondary',
            },
            {
              icon: Users,
              title: t('feature6Title'),
              description: t('feature6Desc'),
              color: 'accent',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-travel opacity-90" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-32">
          <Compass className="h-16 w-16 text-white mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="w-full sm:w-auto h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
            >
              <Link href="/courses">
                <Route className="mr-2 h-6 w-6" />
                {t('ctaCourses')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="w-full sm:w-auto h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold"
            >
              <Link href="/guides">
                <Globe className="mr-2 h-6 w-6" />
                {t('ctaGuides')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-10 text-lg border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary backdrop-blur-sm transition-all font-semibold"
              asChild
            >
              <Link href="/register">
                <Users className="mr-2 h-6 w-6" />
                {t('ctaGuideRegister')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
