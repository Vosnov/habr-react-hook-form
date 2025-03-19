import { z } from 'zod';

export const zodFormString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value && String(value).length > 0 ? String(value) : undefined),
    schema,
  );

export const zodFormNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }, schema);

export const zodFormDate = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value ? new Date(String(value)).toISOString() : undefined),
    schema,
  );

export const zodFormCheckbox = z
  .string({ message: 'Обязательное поле' })
  .transform((v) => v === 'on');
