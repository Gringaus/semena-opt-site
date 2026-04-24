import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SortableList } from '@/components/admin/SortableList';
import { ARCHIVE_URL, ArchiveItem, NewsImageUpload } from './adminTypes';
import { compressImage } from './imageCompress';
import UploadProgress from './UploadProgress';
import AdaptiveImage from '@/components/site/AdaptiveImage';

const ArchiveAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [editing, setEditing] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ current: number; total: number } | null>(null);

  const load = async () => {
    const res = await fetch(ARCHIVE_URL);
    const data = await res.json();
    setItems((data.items || []).map((a: ArchiveItem & { content?: string[] | string }) => ({ ...a, content: Array.isArray(a.content) ? a.content.join('\n\n') : (a.content || '') })));
  };

  useEffect(() => { load(); }, []);

  const onImg = async (file: File) => {
    setUploading({ current: 0, total: 1 });
    try {
      const c = await compressImage(file);
      setEditing((prev) => prev ? { ...prev, imageBase64: c.base64, imageFilename: c.filename, imageContentType: c.contentType, image: c.dataUrl } : prev);
      setUploading({ current: 1, total: 1 });
    } catch {
      toast({ title: 'Не удалось обработать фото', variant: 'destructive' });
    } finally {
      setTimeout(() => setUploading(null), 300);
    }
  };

  const onGalleryFiles = async (files: FileList) => {
    const arr = Array.from(files);
    setUploading({ current: 0, total: arr.length });
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
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
      setUploading({ current: i + 1, total: arr.length });
    }
    setTimeout(() => setUploading(null), 300);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-display text-2xl sm:text-3xl">Архив ({items.length})</h2>
        <Button onClick={() => setEditing({ date: '', title: '', content: '', image: '', sort: 0 })} className="w-full sm:w-auto rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <Icon name="Plus" size={16} /> Добавить запись
        </Button>
      </div>

      {editing && (
        <Card className="p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="font-display text-xl">{editing.id ? 'Редактирование' : 'Новая запись'}</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Дата (напр. «Март 2026»)</label><Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></div>
            <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Порядок</label><Input type="number" value={editing.sort || 0} onChange={(e) => setEditing({ ...editing, sort: Number(e.target.value) })} /></div>
          </div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Заголовок</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Полный текст (абзацы через пустую строку)</label><Textarea rows={8} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          <div>
            <label className="text-xs uppercase text-muted-foreground mb-1 block">Картинка</label>
            {editing.image && (
              <div className="mb-3 max-w-md">
                <AdaptiveImage
                  src={editing.image}
                  alt="превью"
                  mode="fit"
                  maxHeightClass="max-h-80"
                  wrapperClassName="rounded-xl border border-border/60"
                />
                <div className="text-[11px] text-muted-foreground mt-1.5">Так фото будет отображаться на странице архива</div>
              </div>
            )}
            {uploading && <UploadProgress current={uploading.current} total={uploading.total} />}
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {editing.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/60 group">
                    <AdaptiveImage src={img} alt={`галерея ${i + 1}`} mode="cover-smart" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div><label className="text-xs uppercase text-muted-foreground mb-1 block">Slug (для URL, опционально)</label><Input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="авто-генерация если пусто" /></div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={save} disabled={loading || !!uploading} className="w-full sm:w-auto rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">{loading ? 'Сохраняем...' : uploading ? 'Обработка фото...' : 'Сохранить'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="w-full sm:w-auto rounded-full">Отмена</Button>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">Перетаскивайте записи за ручку слева, чтобы изменить порядок.</div>
      <SortableList
        items={items}
        getId={(a) => a.id ?? a.title}
        onReorder={reorder}
        renderItem={(a) => (
          <Card className="p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4">
            {a.image ? (
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-muted grid place-items-center shrink-0">
                <Icon name="Image" size={22} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">{a.date}</div>
              <div className="font-display text-base sm:text-lg line-clamp-2 sm:truncate">{a.title}</div>
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