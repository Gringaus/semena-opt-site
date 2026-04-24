import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AUTH_URL, Tab } from '@/components/admin/adminTypes';
import NewsAdmin from '@/components/admin/NewsAdmin';
import ArchiveAdmin from '@/components/admin/ArchiveAdmin';
import CatalogAdmin from '@/components/admin/CatalogAdmin';
import AccountAdmin from '@/components/admin/AccountAdmin';

const AdminPage = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('news');
  const [loggingIn, setLoggingIn] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
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

  const onCredentialsChanged = () => {
    toast({ title: 'Войдите заново', description: 'Данные для входа изменились.' });
    logout();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background grid place-items-center p-4 sm:p-6">
        <Card className="w-full max-w-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 inline-flex items-center gap-2">
            <Icon name="ArrowLeft" size={16} /> На сайт
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl mb-1 sm:mb-2">Админка</h1>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Введите логин и пароль</p>
          <form onSubmit={doLogin} className="space-y-4">
            <div>
              <Label className="mb-1 block">Логин</Label>
              <Input
                placeholder="admin"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="h-12"
                autoFocus
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Пароль</Label>
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button type="submit" disabled={loggingIn} className="w-full h-12 rounded-xl bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
              {loggingIn ? 'Входим...' : 'Войти'}
            </Button>
          </form>
        </Card>
        <Toaster />
      </div>
    );
  }

  const tabs: Tab[] = ['news', 'archive', 'catalog', 'account'];
  const tabLabel: Record<Tab, string> = {
    news: 'Новости',
    archive: 'Архив',
    catalog: 'Каталог',
    account: 'Аккаунт',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border/60">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">На сайт</span>
            </Link>
            <span className="hidden sm:inline text-muted-foreground">/</span>
            <div className="font-display text-lg sm:text-xl truncate">Админка</div>
          </div>
          <Button variant="ghost" onClick={logout} className="rounded-full h-9 sm:h-10 px-3 sm:px-4 text-sm shrink-0">
            <Icon name="LogOut" size={16} />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
        <div className="container flex gap-2 pb-3 overflow-x-auto flex-nowrap sm:flex-wrap -mx-1 px-1 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-full transition-colors ${
                tab === t ? 'bg-[hsl(var(--forest))] text-[hsl(var(--cream))]' : 'hover:bg-muted'
              }`}
            >
              {tabLabel[t]}
            </button>
          ))}
        </div>
      </header>

      <main className="container py-6 sm:py-10">
        {tab === 'news' && <NewsAdmin token={token} />}
        {tab === 'archive' && <ArchiveAdmin token={token} />}
        {tab === 'catalog' && <CatalogAdmin token={token} />}
        {tab === 'account' && <AccountAdmin token={token} onCredentialsChanged={onCredentialsChanged} />}
      </main>
      <Toaster />
    </div>
  );
};

export default AdminPage;