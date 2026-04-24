import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteLogo from "@/components/site/SiteLogo";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const PageNotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border/60">
        <div className="container h-14 sm:h-16 flex items-center">
          <SiteLogo />
        </div>
      </header>

      <main className="flex-1 container flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--lime))]/40 text-[hsl(var(--forest))] text-xs uppercase tracking-wider font-semibold mb-6">
            <Icon name="Sprout" size={14} />
            Ошибка 404
          </div>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-semibold text-[hsl(var(--forest))] mb-4 sm:mb-6 leading-none break-words">
            Страница не&nbsp;взошла
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto">
            Здесь пусто — этой страницы не существует или она переехала. Вернитесь на главную или загляните в каталог.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12 sm:h-14 px-6 sm:px-8"
            >
              <Link to="/">
                <Icon name="Home" size={18} />
                На главную
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-12 sm:h-14 px-6 sm:px-8 border-[hsl(var(--forest))]/30 text-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/5"
            >
              <Link to="/#catalog">
                В каталог
                <Icon name="ArrowRight" size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageNotFound;