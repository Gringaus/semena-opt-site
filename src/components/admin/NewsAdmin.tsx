import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { NEWS_URL, NewsItem } from './adminTypes';

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

export default NewsAdmin;
