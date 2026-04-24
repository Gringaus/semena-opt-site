import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SortableList } from '@/components/admin/SortableList';
import { CATALOG_URL, CatalogItem } from './adminTypes';
import { compressImage } from './imageCompress';
import UploadProgress from './UploadProgress';

const CatalogAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [editing, setEditing] = useState<(CatalogItem & { imgBase64?: string; imgFilename?: string; imgContentType?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ current: number; total: number } | null>(null);

  const load = async () => {
    const res = await fetch(CATALOG_URL);
    const data = await res.json();
    setItems((data.items || []).map((c: CatalogItem & { items?: string[] | string }) => ({ ...c, items: Array.isArray(c.items) ? c.items.join(', ') : (c.items || '') })));
  };

  useEffect(() => { load(); }, []);

  const onImgFile = async (file: File) => {
    setUploading({ current: 0, total: 1 });
    try {
      const c = await compressImage(file);
      setEditing((prev) => prev ? { ...prev, imgBase64: c.base64, imgFilename: c.filename, imgContentType: c.contentType, img: c.dataUrl } : prev);
      setUploading({ current: 1, total: 1 });
    } catch {
      toast({ title: 'Не удалось обработать фото', variant: 'destructive' });
    } finally {
      setTimeout(() => setUploading(null), 300);
    }
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

  const reorder = async (newItems: CatalogItem[]) => {
    const reordered = newItems.map((it, idx) => ({ ...it, sort: idx + 1 }));
    setItems(reordered);
    try {
      await Promise.all(reordered.map((it) => fetch(CATALOG_URL, {
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
            {uploading && <UploadProgress current={uploading.current} total={uploading.total} />}
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
            <Button onClick={save} disabled={loading || !!uploading} className="rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">{loading ? 'Сохраняем...' : uploading ? 'Обработка фото...' : 'Сохранить'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">Отмена</Button>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">Перетаскивайте карточки за ручку слева, чтобы изменить порядок.</div>
      <SortableList
        items={items}
        getId={(c) => c.id ?? c.name}
        onReorder={reorder}
        renderItem={(c) => (
          <Card className="p-4 rounded-2xl flex gap-4 items-center">
            {c.img ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-muted grid place-items-center shrink-0">
                <Icon name="Image" size={20} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg truncate">{c.name}</div>
              <div className="text-sm text-muted-foreground truncate">{c.count} сортов · {c.items}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(c)}><Icon name="Pencil" size={14} /></Button>
              <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(c.id!)}><Icon name="Trash2" size={14} /></Button>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default CatalogAdmin;