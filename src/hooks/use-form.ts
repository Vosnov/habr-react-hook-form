import {
  FormEvent,
  FormEventHandler,
  InputHTMLAttributes,
  useState,
} from 'react';
import { z } from 'zod';

type UseFormConfig<TOutput> = {
  schema: z.Schema;
  onSubmit?: (
    values: TOutput,
    form: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  onError?: (err: unknown, form: FormEvent<HTMLFormElement>) => void;
  defaultState?: Partial<TOutput>;
};

const isZodObject = (schema: z.Schema): schema is z.AnyZodObject =>
  'shape' in schema;

const isZodEffect = (
  schema: z.Schema,
): schema is z.ZodEffects<z.AnyZodObject, unknown> =>
  'typeName' in schema._def &&
  schema._def.typeName === z.ZodFirstPartyTypeKind.ZodEffects;

export const useForm = <TOutput>({
  schema,
  onSubmit,
  defaultState = {},
  onError,
}: UseFormConfig<TOutput>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string[]>>>({});
  const formOnSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const data = await schema.parseAsync(
        Object.fromEntries(formData.entries()),
      );

      await onSubmit?.(data, e);

      if (Object.keys(errors).length) {
        setErrors({});
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.formErrors.fieldErrors);
      }

      onError?.(err, e);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorLabel = (name: keyof TOutput) => errors[name]?.join('. ');

  const hasError = (name: keyof TOutput) => Boolean(errors[name]?.length);

  const getRequired = (name: keyof TOutput): boolean => {
    if (isZodObject(schema)) {
      return !schema.shape[name].isOptional();
    }

    if (isZodEffect(schema)) {
      return !schema._def.schema.shape[name].isOptional();
    }

    return false;
  };

  const register = (
    name: keyof TOutput,
  ): InputHTMLAttributes<HTMLInputElement> => ({
    defaultChecked: Boolean(defaultState[name]),
    defaultValue: defaultState[name] ? String(defaultState[name]) : undefined,
    name: name as string,
    required: getRequired(name),

    /* 
      После нажатия на submit появляются не валидные поля. Валидными они остаются до тех пор пока
      снова не будет нажата кнопка submit. Такое поведение не очень корректно
      Нужно что бы поле проходило проверку валдации в момент редактирования
    */
    onChange: (e) => {
      const form = e.currentTarget.form;

      if (hasError(name) && form) {
        schema
          .parseAsync(Object.fromEntries(new FormData(form).entries()))
          .then(() => setErrors({}))
          .catch((err) => {
            const hasErrorChanges =
              Object.keys(errors).length !==
              Object.keys(err.formErrors.fieldErrors).length;

            if (err instanceof z.ZodError && hasErrorChanges) {
              setErrors(err.formErrors.fieldErrors);
            }
          });
      }
    },
  });

  return {
    onSubmit: formOnSubmit,
    getErrorLabel,
    hasError,
    register,
    isLoading,
    getRequired,
  };
};
