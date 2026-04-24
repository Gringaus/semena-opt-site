import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { NEWS_URL, NewsItem, NewsImageUpload } from './adminTypes';
import { compressImage } from './imageCompress';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isoToLabel = (iso: string): string => {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const day = parseInt(m[3], 10);
  const month = parseInt(m[2], 10) - 1;
  if (month < 0 || month > 11) return iso;
  return `${day} ${MONTHS[month]}`;
};

const labelToIso = (label: string): string => {
  if (!label) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  const parts = label.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return '';
  const day = parseInt(parts[0], 10);
  const monthIdx = MONTHS.findIndex((m) => parts[1].startsWith(m.slice(0, 4)));
  if (!day || monthIdx < 0) return '';
  const y = new Date().getFullYear();
  return `${y}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

  const onNewsImg = async (file: File) => {
    try {
      const c = await compressImage(file);
      setEditing((prev) => prev ? { ...prev, imageBase64: c.base64, imageFilename: c.filename, imageContentType: c.contentType, image: c.dataUrl } : prev);
    } catch {
      toast({ title: 'Не удалось обработать фото', variant: 'destructive' });
    }
  };

  const onGalleryFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        const c = await compressImage(file);
        setEditing((prev) => {
          if (!prev) return prev;
          const upload: NewsImageUpload = { base64: c.base64, filename: c.filename, contentType: c.contentType };
          return {
            ...prev,
            images: [...(prev.images || []), c.dataUrl],
            imagesUploads: [...(prev.imagesUploads || []), upload],
          };
        });
      } catch {
        toast({ title: `Ошибка обработки ${file.name}`, variant: 'destructive' });
      }
    }
  };

  const removeGalleryImage = (idx: number) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const current = prev.images || [];
      const target = current[idx];
      const isDataUrl = typeof target === 'string' && target.startsWith('data:');
      const newImages = current.filter((_, i) => i !== idx);
      let newUploads = prev.imagesUploads || [];
      if (isDataUrl) {
        const dataUrls = current.filter((s) => typeof s === 'string' && s.startsWith('data:'));
        const uploadIdx = dataUrls.indexOf(target);
        if (uploadIdx >= 0) {
          newUploads = newUploads.filter((_, i) => i !== uploadIdx);
        }
      }
      return { ...prev, images: newImages, imagesUploads: newUploads };
    });
  };

  const save = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = { ...editing };
      if (payload.imageBase64 && payload.image?.startsWith('data:')) {
        payload.image = '';
      }
      payload.images = (payload.images || []).filter((s) => !s.startsWith('data:'));
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

  const dateIso = useMemo(() => editing ? labelToIso(editing.date) : '', [editing?.date]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl">Новости ({items.length})</h2>
        <Button onClick={() => setEditing({ date: isoToLabel(todayIso()), tag: 'Новость', title: '', text: '', content: '', image: '', published: true, images: [], imagesUploads: [] })} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <Icon name="Plus" size={16} /> Добавить
        </Button>
      </div>

      {editing && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div className="font-display text-xl">{editing.id ? 'Редактирование' : 'Новая новость'}</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-muted-foreground mb-1 block">Дата</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateIso}
                  onChange={(e) => {
                    const iso = e.target.value;
                    setEditing({ ...editing, date: iso ? isoToLabel(iso) : '' });
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" className="rounded-full shrink-0" onClick={() => setEditing({ ...editing, date: isoToLabel(todayIso()) })}>
                  Сегодня
                </Button>
              </div>
              {editing.date && <div className="text-xs text-muted-foreground mt-1">Отображение на сайте: «{editing.date}»</div>}
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground mb-1 block">Тег</label>
              <Select value={editing.tag || 'Новость'} onValueChange={(v) => setEditing({ ...editing, tag: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Новость">Новость</SelectItem>
                  <SelectItem value="Поступление">Поступление</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div>
            <label className="text-xs uppercase text-muted-foreground mb-1 block">Галерея — дополнительные фото</label>
            <p className="text-xs text-muted-foreground mb-2">На сайте отобразятся миниатюрами, при клике раскрываются во весь экран.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { if (e.target.files?.length) { onGalleryFiles(e.target.files); e.target.value = ''; } }}
              className="block w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-[hsl(var(--forest))] file:text-[hsl(var(--cream))] file:cursor-pointer mb-3"
            />
            {editing.images && editing.images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {editing.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/60 group">
                    <img src={img} alt={`галерея ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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