import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SortableList } from '@/components/admin/SortableList';
import { ARCHIVE_URL, ArchiveItem } from './adminTypes';

const ArchiveAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [editing, setEditing] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(ARCHIVE_URL);
    const data = await res.json();
    setItems((data.items || []).map((a: ArchiveItem & { content?: string[] | string }) => ({ ...a, content: Array.isArray(a.content) ? a.content.join('\n\n') : (a.content || '') })));
  };

  useEffect(() => { load(); }, []);

  const onImg = (file: File) => {
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
      const res = await fetch(ARCHIVE_URL, {
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
    if (!confirm('Удалить запись архива?')) return;
    await fetch(ARCHIVE_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Удалено' });
    await load();
  };

  const reorder = async (newItems: ArchiveItem[]) => {
    const reordered = newItems.map((it, idx) => ({ ...it, sort: idx + 1 }));
    setItems(reordered);
    try {
      await Promise.all(reordered.map((it) => fetch(ARCHIVE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify(it),
      })));
    } catch {
      toast({ title: 'Не удалось сохранить порядок', variant: 'destructive' });
      await load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl">Архив ({items.length})</h2>
        <Button onClick={() => setEditing({ date: '', title: '', content: '', image: '', sort: 0 })} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <Icon name="Plus" size={16} /> Добавить запись
        </Button>
      </div>

      {editing && (
        <Card className="p-6 rounded-2xl space-y-4">
          <div className="font-display text-xl">{editing.id ? 'Редактирование' : 'Новая запись'}</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Дата (напр. «Март 2026»)</label><Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Порядок</label><Input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} /></div>
          </div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Заголовок</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Полный текст (абзацы через пустую строку)</label><Textarea rows={8} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-1 block">Картинка</label>
            {editing.image && (
              <div className="mb-3 aspect-[16/9] rounded-xl overflow-hidden max-w-md border border-border/60">
                <img src={editing.image} alt="превью" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImg(f); }}
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
            <Button onClick={save} disabled={loading} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">{loading ? 'Сохраняем...' : 'Сохранить'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">Отмена</Button>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">Перетаскивайте записи за ручку слева, чтобы изменить порядок.</div>
      <SortableList
        items={items}
        getId={(a) => a.id ?? a.title}
        onReorder={reorder}
        renderItem={(a) => (
          <Card className="p-5 rounded-2xl flex items-center gap-4">
            {a.image ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-muted grid place-items-center shrink-0">
                <Icon name="Image" size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">{a.date}</div>
              <div className="font-display text-lg truncate">{a.title}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(a)}><Icon name="Pencil" size={14} /></Button>
              <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(a.id!)}><Icon name="Trash2" size={14} /></Button>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default ArchiveAdmin;
