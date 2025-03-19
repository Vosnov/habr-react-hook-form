import { z } from 'zod';
/* 
  FormData возвращает строку. Даже если поле будет пустым, то вернётся пустая строка.
  Этот препроцессор заменяет пустую строку на undefined для удобства в дальнейшей валидации
*/
export const zodFormString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value ? String(value) : undefined), schema);

/*
  Заменяет строку на number или undefined
*/
export const zodFormNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }, schema);

/*
  Заменяет строку на ISOString или undefined
*/
export const zodFormDate = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value ? new Date(String(value)).toISOString() : undefined),
    schema,
  );

export const zodFormCheckbox = z
  .string({ message: 'Обязательное поле' })
  .transform((v) => v === 'on');
