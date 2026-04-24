import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { AUTH_URL } from '@/components/admin/adminTypes';

interface Props {
  token: string;
  onCredentialsChanged?: () => void;
}

const AccountAdmin = ({ token, onCredentialsChanged }: Props) => {
  const [currentLogin, setCurrentLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(AUTH_URL, { headers: { 'X-Auth-Token': token } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.login) {
          setCurrentLogin(d.login);
          setNewLogin((prev) => prev || d.login);
        }
      })
      .catch(() => {});
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }
    if (newLogin.trim().length < 3) {
      toast({ title: 'Логин минимум 3 символа', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 4) {
      toast({ title: 'Пароль минимум 4 символа', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({
          currentPassword,
          newLogin: newLogin.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      toast({ title: 'Сохранено', description: 'Данные для входа обновлены.' });
      setCurrentLogin(data.login || newLogin.trim());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onCredentialsChanged?.();
    } catch (err) {
      toast({
        title: 'Не удалось сохранить',
        description: err instanceof Error ? err.message : '',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl max-w-xl">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
          <Icon name="UserCog" size={20} className="text-[hsl(var(--lime))]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl sm:text-2xl">Учётные данные</h2>
          <p className="text-sm text-muted-foreground truncate">
            Текущий логин: <b>{currentLogin || '—'}</b>
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label className="mb-1 block">Текущий пароль</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Нужен для подтверждения"
            required
          />
        </div>

        <div className="border-t border-border/60 pt-4" />

        <div>
          <Label className="mb-1 block">Новый логин</Label>
          <Input
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            placeholder="admin"
            required
          />
        </div>

        <div>
          <Label className="mb-1 block">Новый пароль</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Минимум 4 символа"
            required
          />
        </div>

        <div>
          <Label className="mb-1 block">Повторите новый пароль</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-xl bg-[hsl(var(--forest))] text-[hsl(var(--cream))]"
        >
          {saving ? 'Сохраняем...' : 'Сохранить изменения'}
        </Button>
      </form>
    </Card>
  );
};

export default AccountAdmin;