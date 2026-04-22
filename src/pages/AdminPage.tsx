import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AUTH_URL, Tab } from '@/components/admin/adminTypes';
import NewsAdmin from '@/components/admin/NewsAdmin';
import ArchiveAdmin from '@/components/admin/ArchiveAdmin';
import CatalogAdmin from '@/components/admin/CatalogAdmin';
import PricesAdmin from '@/components/admin/PricesAdmin';

const AdminPage = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('news');
  const [loggingIn, setLoggingIn] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setPassword('');
      toast({ title: 'Добро пожаловать', description: 'Вы вошли в админку.' });
    } catch (err) {
      toast({ title: 'Не удалось войти', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-6">
        <Card className="w-full max-w-md p-8 rounded-3xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2">
            <Icon name="ArrowLeft" size={16} /> На сайт
          </Link>
          <h1 className="font-display text-3xl mb-2">Админка</h1>
          <p className="text-sm text-muted-foreground mb-6">Введите пароль для входа</p>
          <form onSubmit={login} className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              autoFocus
            />
            <Button type="submit" disabled={loggingIn} className="w-full h-12 rounded-xl bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
              {loggingIn ? 'Входим...' : 'Войти'}
            </Button>
          </form>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
              <Icon name="ArrowLeft" size={16} /> На сайт
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="font-display text-xl">Админка</div>
          </div>
          <Button variant="ghost" onClick={logout} className="rounded-full">
            <Icon name="LogOut" size={16} /> Выйти
          </Button>
        </div>
        <div className="container flex gap-2 pb-3 flex-wrap">
          {(['news', 'archive', 'catalog', 'prices'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                tab === t ? 'bg-[hsl(var(--forest))] text-[hsl(var(--cream))]' : 'hover:bg-muted'
              }`}
            >
              {t === 'news' ? 'Новости' : t === 'archive' ? 'Архив' : t === 'catalog' ? 'Каталог' : 'Прайс-листы'}
            </button>
          ))}
        </div>
      </header>

      <main className="container py-10">
        {tab === 'news' && <NewsAdmin token={token} />}
        {tab === 'archive' && <ArchiveAdmin token={token} />}
        {tab === 'catalog' && <CatalogAdmin token={token} />}
        {tab === 'prices' && <PricesAdmin token={token} />}
      </main>
      <Toaster />
    </div>
  );
};

export default AdminPage;
