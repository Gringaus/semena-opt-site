const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export const EMAIL_ERROR_TITLE = 'Проверьте адрес почты';
export const EMAIL_ERROR_DESC = 'Введите корректный email, например name@company.ru';
