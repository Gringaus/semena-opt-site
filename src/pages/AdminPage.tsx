import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const AUTH_URL = 'https://functions.poehali.dev/1fb7ab54-3a59-45b3-ba0e-11a67ac583d5';
const NEWS_URL = 'https://functions.poehali.dev/aef555b4-f74a-4447-9294-470c7ea276e9';
const CATALOG_URL = 'https://functions.poehali.dev/9eabe422-fd0a-4167-afb7-acc6cf903f76';
const PRICES_URL = 'https://functions.poehali.dev/e8b0609f-fa31-42bd-bba6-84527f2c03fb';

type Tab = 'news' | 'catalog' | 'prices';

interface NewsItem { id?: number; slug?: string; date: string; tag: string; title: string; text: string; content: string; image?: string; imageBase64?: string; imageFilename?: string; imageContentType?: string; published?: boolean }
interface CatalogItem { id?: number; name: string; count: number; img: string; items: string; sort?: number }
interface PriceItem { id: number; name: string; size: string; date: string; url: string }

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
        <div className="container flex gap-2 pb-3">
          {(['news', 'catalog', 'prices'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                tab === t ? 'bg-[hsl(var(--forest))] text-[hsl(var(--cream))]' : 'hover:bg-muted'
              }`}
            >
              {t === 'news' ? 'Новости' : t === 'catalog' ? 'Каталог' : 'Прайс-листы'}
            </button>
          ))}
        </div>
      </header>

      <main className="container py-10">
        {tab === 'news' && <NewsAdmin token={token} />}
        {tab === 'catalog' && <CatalogAdmin token={token} />}
        {tab === 'prices' && <PricesAdmin token={token} />}
      </main>
      <Toaster />
    </div>
  );
};

const NewsAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(NEWS_URL);
    const data = await res.json();
    setItems((data.items || []).map((n: NewsItem & { content?: string[] | string }) => ({ ...n, content: Array.isArray(n.content) ? n.content.join('\n\n') : (n.content || '') })));
  };

  useEffect(() => { load(); }, []);

  const onNewsImg = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setEditing((prev) => prev ? { ...prev, imageBase64: base64, imageFilename: file.name, imageContentType: file.type, image: result } : prev);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = { ...editing };
      if (payload.imageBase64 && payload.image?.startsWith('data:')) {
        payload.image = '';
      }
      const res = await fetch(NEWS_URL, {
        method: editing.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      toast({ title: 'Сохранено' });
      setEditing(null);
      await load();
    } catch (err) {
      toast({ title: 'Ошибка', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить новость?')) return;
    await fetch(NEWS_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Удалено' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl">Новости ({items.length})</h2>
        <Button onClick={() => setEditing({ date: '', tag: 'Новость', title: '', text: '', content: '', image: '', published: true })} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <Icon name="Plus" size={16} /> Добавить
        </Button>
      </div>

      {editing && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div className="font-display text-xl">{editing.id ? 'Редактирование' : 'Новая новость'}</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Дата (напр. «18 апреля»)</label><Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Тег</label><Input value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} /></div>
          </div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Заголовок</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Краткое описание</label><Textarea rows={2} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} /></div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Полный текст (абзацы через пустую строку)</label><Textarea rows={8} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-1 block">Главная картинка</label>
            {editing.image && (
              <div className="mb-3 aspect-[16/9] rounded-xl overflow-hidden max-w-md border border-border/60">
                <img src={editing.image} alt="превью" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onNewsImg(f); }}
              className="block w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-[hsl(var(--forest))] file:text-[hsl(var(--cream))] file:cursor-pointer mb-2"
            />
            <Input
              value={editing.imageBase64 ? '' : (editing.image || '')}
              onChange={(e) => setEditing({ ...editing, image: e.target.value, imageBase64: undefined, imageFilename: undefined, imageContentType: undefined })}
              placeholder="или вставьте ссылку https://..."
            />
          </div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Slug (для URL, опционально)</label><Input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="авто-генерация если пусто" /></div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={loading} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
              {loading ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">Отмена</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((n) => (
          <Card key={n.id} className="p-5 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">{n.date} · {n.tag}</div>
              <div className="font-display text-lg truncate">{n.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{n.text}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(n)}><Icon name="Pencil" size={14} /></Button>
              <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(n.id!)}><Icon name="Trash2" size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CatalogAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [editing, setEditing] = useState<(CatalogItem & { imgBase64?: string; imgFilename?: string; imgContentType?: string }) | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(CATALOG_URL);
    const data = await res.json();
    setItems((data.items || []).map((c: CatalogItem & { items?: string[] | string }) => ({ ...c, items: Array.isArray(c.items) ? c.items.join(', ') : (c.items || '') })));
  };

  useEffect(() => { load(); }, []);

  const onImgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setEditing((prev) => prev ? { ...prev, imgBase64: base64, imgFilename: file.name, imgContentType: file.type, img: result } : prev);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = { ...editing };
      if (payload.imgBase64 && payload.img?.startsWith('data:')) {
        payload.img = '';
      }
      const res = await fetch(CATALOG_URL, {
        method: editing.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка');
      toast({ title: 'Сохранено' });
      setEditing(null);
      await load();
    } catch (err) {
      toast({ title: 'Ошибка', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;
    await fetch(CATALOG_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Удалено' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl">Каталог ({items.length})</h2>
        <Button onClick={() => setEditing({ name: '', count: 0, img: '', items: '', sort: 0 })} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <Icon name="Plus" size={16} /> Добавить категорию
        </Button>
      </div>

      {editing && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div className="font-display text-xl">{editing.id ? 'Редактирование' : 'Новая категория'}</div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Название</label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Количество сортов</label><Input type="number" value={editing.count} onChange={(e) => setEditing({ ...editing, count: Number(e.target.value) })} /></div>
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Порядок</label><Input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} /></div>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-1 block">Картинка категории</label>
            {editing.img && (
              <div className="mb-3 aspect-[4/3] rounded-xl overflow-hidden max-w-xs border border-border/60">
                <img src={editing.img} alt="превью" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImgFile(f); }}
              className="block w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-[hsl(var(--forest))] file:text-[hsl(var(--cream))] file:cursor-pointer mb-2"
            />
            <Input
              value={editing.imgBase64 ? '' : editing.img}
              onChange={(e) => setEditing({ ...editing, img: e.target.value, imgBase64: undefined, imgFilename: undefined, imgContentType: undefined })}
              placeholder="или вставьте ссылку https://..."
            />
          </div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Сорта (через запятую)</label><Textarea rows={2} value={editing.items} onChange={(e) => setEditing({ ...editing, items: e.target.value })} placeholder="Томаты, Огурцы, Перец" /></div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={loading} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">{loading ? 'Сохраняем...' : 'Сохранить'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">Отмена</Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <Card key={c.id} className="p-4 rounded-2xl">
            {c.img && <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3"><img src={c.img} alt={c.name} className="w-full h-full object-cover" /></div>}
            <div className="font-display text-xl mb-1">{c.name}</div>
            <div className="text-sm text-muted-foreground mb-3">{c.count} сортов · {c.items}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => setEditing(c)}><Icon name="Pencil" size={14} /> Изменить</Button>
              <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(c.id!)}><Icon name="Trash2" size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PricesAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');

  const load = async () => {
    const res = await fetch(PRICES_URL);
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const res = await fetch(PRICES_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
          body: JSON.stringify({
            name: name || file.name,
            filename: file.name,
            fileBase64: base64,
            contentType: file.type,
          }),
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        toast({ title: 'Файл загружен' });
        setName('');
        await load();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast({ title: 'Ошибка', variant: 'destructive' });
      setUploading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить прайс-лист?')) return;
    await fetch(PRICES_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Удалено' });
    await load();
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl">Прайс-листы ({items.length})</h2>

      <Card className="p-6 rounded-2xl space-y-4">
        <div className="font-display text-xl">Загрузить новый прайс</div>
        <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Название (необязательно)</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Овощи и зелень — весна 2026" /></div>
        <div>
          <label className="text-xs uppercase text-muted-foreground mb-1 block">Файл (PDF / XLSX)</label>
          <input
            type="file"
            accept=".pdf,.xlsx,.xls"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-[hsl(var(--forest))] file:text-[hsl(var(--cream))] file:cursor-pointer"
          />
        </div>
        {uploading && <div className="text-sm text-muted-foreground">Загружаем...</div>}
      </Card>

      <div className="space-y-3">
        {items.map((p) => (
          <Card key={p.id} className="p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                <Icon name="FileText" size={20} className="text-[hsl(var(--lime))]" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.size} · {p.date}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="rounded-full"><Icon name="Download" size={14} /></Button>
              </a>
              <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(p.id)}><Icon name="Trash2" size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;