import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ARCHIVE_URL, ArchiveItem } from './adminTypes';

const ArchiveAdmin = ({ token }: { token: string }) => {
  const [items, setItems] = useState<ArchiveItem[]>([]);

  const load = async () => {
    const res = await fetch(ARCHIVE_URL);
    const data = await res.json();
    setItems((data.items || []).map((a: ArchiveItem & { content?: string[] | string }) => ({ ...a, content: Array.isArray(a.content) ? a.content.join('\n\n') : (a.content || '') })));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm('Удалить запись архива? Это действие необратимо.')) return;
    await fetch(ARCHIVE_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Удалено' });
    await load();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-display text-2xl sm:text-3xl">Архив ({items.length})</h2>
      </div>

      <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-[hsl(var(--lime))]/15 border border-[hsl(var(--lime))]/40 text-sm">
        <Icon name="Info" size={18} className="text-[hsl(var(--forest))] shrink-0 mt-0.5" />
        <div className="text-[hsl(var(--forest))]">
          Записи в архив попадают автоматически — когда на главной появляется новая новость, самая старая переносится сюда. Здесь можно только удалять записи.
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 rounded-2xl text-center text-muted-foreground">
          <Icon name="FileText" size={28} className="mx-auto mb-3 opacity-60" />
          В архиве пока нет записей.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id ?? a.title} className="p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4">
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
                <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => remove(a.id!)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchiveAdmin;
