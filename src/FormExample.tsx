import { z } from 'zod';
import { useForm } from './hooks/use-form';
import {
  zodFormCheckbox,
  zodFormDate,
  zodFormNumber,
  zodFormString,
} from './shared/zod-utils';
import { Input } from './components/Input';
import { FormField } from './components/FormField';
import { InputNumber } from './components/InputNumber';
import { TabSelect } from './components/TabSelect';
import { InputFile } from './components/InputFile';
import { InputCheckbox } from './components/InputCheckbox';

const schema = z
  .object({
    login: zodFormString(z.string({ message: 'Введите валидный логин' })),
    password: zodFormString(z.string({ message: 'Введите валидный пароль' })),
    repeatPassword: zodFormString(
      z.string({ message: 'Введите валидный пароль' }),
    ),
    age: zodFormNumber(
      z
        .number({ message: 'Обязательное поле' })
        .min(18, 'Минимум 18 лет')
        .max(60, 'Максимум 60 лет'),
    ),
    rememberMe: zodFormCheckbox.optional(),
    skills: zodFormString(
      z
        .string({ message: 'Минимум 2 скилла' })
        .default('[]')
        .transform((v) => JSON.parse(v) as string[])
        .refine((v) => v.length >= 2, { message: 'Минимум 2 скилла' }),
    ),
    date: zodFormDate(z.string().optional()),
    file: z
      .instanceof(File)
      .refine((v) => Boolean(v.size), { message: 'Фото обязательное' })
      .refine((v) => /png$/g.test(v.type), {
        message: 'Фото должно быть в формате png',
      }),
  })
  .refine((v) => v.password === v.repeatPassword, {
    message: 'Пароли должны совпадать',
    path: ['repeatPassword'],
  });

type UserFormData = z.infer<typeof schema>;

export const FormExample = () => {
  const form = useForm<UserFormData>({
    schema: schema,
    onSubmit: async (value) => console.log(value),
    onError: (e, setErrors, form) => {
      console.log(e, setErrors, form);

      form.currentTarget.reset();
      // if (isAxiosError(e)) {
      //    setErros(...)
      //    form.currentTarget.reset()
      // }
    },
    defaultState: {
      rememberMe: true,
    },
  });

  const { register, onSubmit, isLoading } = form;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
    >
      <FormField
        label='Логин'
        name={'login'}
        form={form}
      >
        <Input
          type='text'
          placeholder='Логин'
          {...register('login')}
        />
      </FormField>

      <FormField
        label='Пароль'
        name={'password'}
        form={form}
      >
        <Input
          type='password'
          placeholder='Пароль'
          {...register('password')}
        />
      </FormField>

      <FormField
        label='Повторите пароль'
        name={'repeatPassword'}
        form={form}
      >
        <Input
          type='password'
          placeholder='Повторите пароль'
          {...register('repeatPassword')}
        />
      </FormField>

      <FormField
        label='Возраст'
        name={'age'}
        form={form}
      >
        <InputNumber
          type='text'
          placeholder='Возраст'
          {...register('age')}
        />
      </FormField>

      <FormField
        label='День рождения'
        name={'date'}
        form={form}
      >
        <Input
          type='date'
          placeholder='День рождения'
          {...register('date')}
        />
      </FormField>

      <FormField
        form={form}
        name={'skills'}
        label='Умения'
      >
        <TabSelect
          options={[
            { label: 'CSS', value: 'css' },
            { label: 'JavaScript', value: 'js' },
            { label: 'React', value: 'react' },
            { label: 'HTML', value: 'html' },
          ]}
          {...register('skills')}
        />
      </FormField>

      <FormField
        name={'file'}
        form={form}
      >
        <InputFile {...register('file')} />
      </FormField>

      <FormField
        form={form}
        name='rememberMe'
      >
        <InputCheckbox
          label='Запомни меня'
          {...register('rememberMe')}
        />
      </FormField>

      <button
        disabled={isLoading}
        type='submit'
      >
        Отправить
      </button>
    </form>
  );
};
