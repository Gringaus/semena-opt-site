import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { CONTACT_API_URL } from "./data";
import PhoneInput from "./PhoneInput";
import { reachGoal, Goals } from "@/lib/metrika";
import { isValidEmail, EMAIL_ERROR_TITLE, EMAIL_ERROR_DESC, isValidPhone, PHONE_ERROR_TITLE, PHONE_ERROR_DESC } from "@/lib/validators";

const ContactsFooter = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [agree, setAgree] = useState(false);
  const sendingRef = useRef(false);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;
    if (!form.name || !form.phone || !form.email || !form.message) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast({ title: PHONE_ERROR_TITLE, description: PHONE_ERROR_DESC, variant: "destructive" });
      return;
    }
    if (!isValidEmail(form.email)) {
      toast({ title: EMAIL_ERROR_TITLE, description: EMAIL_ERROR_DESC, variant: "destructive" });
      return;
    }
    if (!agree) {
      toast({
        title: "Примите политику конфиденциальности",
        variant: "destructive",
      });
      return;
    }
    if (!CONTACT_API_URL) {
      toast({
        title: "Форма временно недоступна",
        description: "Пожалуйста, свяжитесь по телефону.",
      });
      return;
    }
    sendingRef.current = true;
    setSending(true);
    reachGoal(Goals.ContactFormSubmit, { source: 'main_form' });
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      reachGoal(Goals.ContactFormSuccess, { source: 'main_form' });
      toast({
        title: "Заявка отправлена",
        description: "Свяжемся с вами в ближайшее время.",
      });
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      toast({
        title: "Не удалось отправить",
        description: err instanceof Error ? err.message : "Попробуйте позже",
        variant: "destructive",
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <>
      <section
        id="contacts"
        className="bg-[hsl(var(--forest))] text-[hsl(var(--cream))] py-14 sm:py-20 lg:py-32 scroll-mt-20 sm:scroll-mt-24"
      >
        <div className="container">
          <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--lime))] mb-2 sm:mb-3">
            06 — Связь
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-10 sm:mb-16 leading-[0.95]">
            Позвоните — <em>подберём</em> <br />
            сорта под ваш регион.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="border-t border-[hsl(var(--cream))]/20 pt-5 sm:pt-8">
              <Icon
                name="Phone"
                size={24}
                className="text-[hsl(var(--lime))] mb-4 sm:mb-6"
              />
              <div className="text-xs uppercase tracking-wider opacity-60 mb-2">
                Телефоны
              </div>
              <a
                href="tel:+79206738383"
                onClick={() => reachGoal(Goals.PhoneClick, { phone: '+79206738383', source: 'footer' })}
                className="font-display text-lg sm:text-2xl lg:text-3xl mb-1 block whitespace-nowrap hover:text-[hsl(var(--lime))] transition-colors"
              >
                +7 (920) 673-83-83
              </a>
              <a
                href="tel:+79203418866"
                onClick={() => reachGoal(Goals.PhoneClick, { phone: '+79203418866', source: 'footer' })}
                className="font-display text-lg sm:text-2xl lg:text-3xl mb-2 block whitespace-nowrap hover:text-[hsl(var(--lime))] transition-colors"
              >
                +7 (920) 341-88-66
              </a>
              <div className="text-sm opacity-70">
                Пн–Пт: 9:00–17:00 · Сб: 9:00–14:00
              </div>
            </div>

            <div className="border-t border-[hsl(var(--cream))]/20 pt-5 sm:pt-8">
              <Icon
                name="Mail"
                size={24}
                className="text-[hsl(var(--lime))] mb-4 sm:mb-6"
              />
              <div className="text-xs uppercase tracking-wider opacity-60 mb-2">
                Почта
              </div>
              <a
                href="mailto:semena.37@mail.ru"
                onClick={() => reachGoal(Goals.EmailClick, { source: 'footer' })}
                className="font-display text-lg sm:text-2xl lg:text-3xl mb-1 block hover:text-[hsl(var(--lime))] transition-colors break-all"
              >
                semena.37@mail.ru
              </a>
              <div className="text-sm opacity-70">Ответим в течение часа</div>
            </div>

            <div className="border-t border-[hsl(var(--cream))]/20 pt-5 sm:pt-8 sm:col-span-2 md:col-span-1">
              <Icon
                name="MapPin"
                size={24}
                className="text-[hsl(var(--lime))] mb-4 sm:mb-6"
              />
              <div className="text-xs uppercase tracking-wider opacity-60 mb-2">
                Адрес
              </div>
              <div className="font-display text-xl sm:text-2xl lg:text-3xl mb-1">
                г. Иваново
              </div>
              <div className="text-sm opacity-70">ул. Зелёная, д. 19В</div>
            </div>
          </div>

          <div className="mb-12 sm:mb-20">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[hsl(var(--cream))]/20">
              <iframe
                title="Карта — г. Иваново, ул. Зелёная, д. 19В"
                src="https://yandex.ru/map-widget/v1/?ll=40.948929%2C57.006451&mode=search&text=%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2%D0%BE%20%D1%83%D0%BB.%20%D0%97%D0%B5%D0%BB%D1%91%D0%BD%D0%B0%D1%8F%2019%D0%92&z=16"
                width="100%"
                height="440"
                frameBorder="0"
                allowFullScreen
                className="block w-full h-[280px] sm:h-[380px] lg:h-[440px]"
              />
            </div>
            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="text-sm opacity-70">Приезжайте к нам на склад или закажите доставку по Иванову и области.</div>
              <a
                href="https://yandex.ru/maps/?rtext=~57.006451,40.948929&rtt=auto"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => reachGoal(Goals.RouteClick)}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-[hsl(var(--lime))] hover:bg-[hsl(var(--lime))]/90 text-[hsl(var(--forest))] h-12 sm:h-14 px-6 sm:px-8"
                >
                  <Icon name="Navigation" size={18} />
                  Построить маршрут
                </Button>
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 sm:gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--lime))] mb-2 sm:mb-3">
                Оставить заявку
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-5xl leading-[1] mb-4 sm:mb-6">
                Напишите нам — перезвоним в течение дня.
              </h3>
              <p className="text-sm opacity-70 max-w-sm">
                Расскажите, какие культуры и объёмы интересуют — подготовим
                индивидуальный прайс и рассчитаем доставку.
              </p>
            </div>
            <form
              onSubmit={submitForm}
              className="lg:col-span-7 bg-[hsl(var(--cream))] text-foreground rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 space-y-4 sm:space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Имя
                  </label>
                  <Input
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ваше имя"
                    className="h-12 rounded-xl border-border bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Телефон
                  </label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    className="h-12 rounded-xl border-border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.ru"
                  className="h-12 rounded-xl border-border bg-background"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Сообщение
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Какие культуры и объёмы вас интересуют?"
                  rows={4}
                  className="rounded-xl border-border bg-background resize-none"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <Checkbox
                  checked={agree}
                  onCheckedChange={(v) => setAgree(!!v)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  Я согласен с{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="underline hover:text-foreground"
                  >
                    политикой конфиденциальности
                  </Link>{" "}
                  и даю согласие на обработку персональных данных.
                </span>
              </label>
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="submit"
                  disabled={sending || !agree}
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12 sm:h-14 px-6 sm:px-8 shrink-0"
                >
                  {sending ? "Отправляем..." : "Отправить заявку"}
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="container py-6 sm:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <div>© 2026 Семена Оптом. Все права защищены.</div>
        <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
          <span>ИНН 371118162441</span>
          <span className="hidden md:inline">·</span>
          <Link
            to="/privacy"
            className="inline-flex items-center min-h-[44px] py-2 hover:text-foreground transition-colors underline"
          >
            Политика конфиденциальности
          </Link>
          <span className="hidden md:inline">·</span>
          <Link
            to="/admin"
            aria-label="Вход для администратора"
            className="inline-flex items-center gap-1.5 min-h-[44px] py-2 hover:text-foreground transition-colors"
          >
            <Icon name="Lock" size={14} />
            Вход для администратора
          </Link>
        </div>
      </footer>
    </>
  );
};

export default ContactsFooter;