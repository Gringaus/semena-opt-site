const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export const EMAIL_ERROR_TITLE = 'Проверьте адрес почты';
export const EMAIL_ERROR_DESC = 'Введите корректный email, например name@company.ru';

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (digits[0] !== '7' && digits[0] !== '8') return false;
  return true;
}

export const PHONE_ERROR_TITLE = 'Проверьте номер телефона';
export const PHONE_ERROR_DESC = 'Введите номер полностью в формате +7 (XXX) XXX-XX-XX';