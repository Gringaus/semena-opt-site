import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PRICES_URL, PriceItem } from './adminTypes';

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

export default PricesAdmin;
