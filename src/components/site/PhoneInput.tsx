import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  id?: string;
  name?: string;
}

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  let d = digits;
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  const p1 = d.slice(1, 4);
  const p2 = d.slice(4, 7);
  const p3 = d.slice(7, 9);
  const p4 = d.slice(9, 11);
  let out = '+7';
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ')';
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = '+7 (___) ___-__-__', required, className, autoComplete = 'tel', id, name = 'phone' }, ref) => {
    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const next = formatPhone(e.target.value);
          onChange(next);
        }}
        onFocus={(e) => {
          if (!e.target.value) onChange('+7 ');
        }}
        className={className}
      />
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
