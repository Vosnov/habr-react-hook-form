# Создание простого хука для работы с формами в React на основе `zod`

В мире фронтенд-разработки управление состоянием форм играет важную роль, особенно когда дело касается валидации, отправки данных и управления ошибками. Одним из популярных решений является библиотека `react-hook-form`, которая позволяет эффективно работать с формами, минимизируя количество ререндеров и упрощая взаимодействие с React-компонентами.

Однако что, если нам нужна более лёгкая или кастомизированная версия этой библиотеки? В этой статье мы рассмотрим, как создать простую самописную альтернативу `react-hook-form`, разберём её основные принципы работы и продемонстрируем, как можно управлять состоянием формы с минимальными затратами кода.

Этот процесс не только поможет лучше понять, как работают существующие решения, но и даст вам возможность адаптировать форму под свои потребности, избегая ненужного усложнения и лишних зависимостей.

Теперь давайте реализуем простую версию такой библиотеки, используя встроенный API `FormData` для сбора данных формы и `zod` для их валидации.

В конечном итоге будет форма из следующих полей:

- Логин\* - `string`
- Пароль\* - `string`
- Повторить пароль\* - `string` должен совпадать с `пароль`
- Возраст\* - `number` минимум 18 максимум 60, доступен ввод только чисел
- День рождения - `string` в формате ISO
- Умения\* - `string[]` минимум 2
- Файл\* - `File` только `.png`
- Запомни меня - `boolean`

![](https://habrastorage.org/webt/fn/rm/lo/fnrmloq9g8weslcoolmwfhlfpvw.png)

### Полный пример формы на CodeSandbox

[![Edit Vosnov/habr-react-hook-form/main](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/Vosnov/habr-react-hook-form/main?import=true&embed=1)

Для начала давайте начнем с простых компонентов. Сверстаем компоненты `Input`, `InputNumber`, `InputCheckbox`

<details>

<summary>Input</summary>

```tsx
export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      className={'form-field__input'}
      {...props}
    />
  );
};
```

</details>

<details>

<summary>InputNumber</summary>

```tsx
export const InputNumber: FC<InputHTMLAttributes<HTMLInputElement>> = ({
  onChange,
  ...props
}) => (
  <input
    className={'form-field__input'}
    onChange={(e) => {
      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
      onChange?.(e);
    }}
    {...props}
  />
);
```

</details>

<details>

<summary>InputCheckbox</summary>

```tsx
type InputCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const InputCheckbox: FC<InputCheckboxProps> = ({ label, ...props }) => {
  const id = useId();

  return (
    <>
      <input
        {...props}
        className='custom-checkbox'
        type='checkbox'
        id={id}
        defaultValue={'on'}
      />
      <label htmlFor={id}>{label}</label>
    </>
  );
};
```

</details>

Компонент с формой (пока ещё не финальный вариант. Без валидации и без отображения ошибок. Финальный вариант будет в конце статьи)

```tsx
export const FormExample = () => {
  const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        type='text'
        placeholder='Логин'
        name='login'
      />
      <Input
        type='password'
        placeholder='Пароль'
        name='password'
      />
      <Input
        type='password'
        placeholder='Повторите пароль'
        name='repeatPassword'
      />
      <InputNumber
        type='text'
        placeholder='Возраст'
        name='age'
      />
      <Input
        type='date'
        placeholder='День рождения'
        name='date'
      />
      <InputCheckbox
        label='Запомни меня'
        name='rememberMe'
      />
      <button
        disabled={isLoading}
        type='submit'
      >
        Отправить
      </button>
    </form>
  );
};
```

Итак, давайте рассмотрим его работу. При нажатии на кнопку `Отправить`, получим в консоли следующий объект.

```typescript
{
  login: "password",
  password: "123",
  repeatPassword: "123",
  age: "50",
  birthday: "2025-03-12",
  rememberMe: "on",
}
```

Если оставить все поля пустыми

При использовании `FormData` стоит учесть несколько особенностей. `FormData` содержит в себе ключ - значение (тип может быть только `string` или `Blob`). В нашем случае мы получили объект в котором все поля типа `string`, что не совсем корректно. Эти особенности `FormData` можно нивелировать с помощью библиотеки `zod`, которая предоставляет методы для валидации полей, плюсом может преобразовать поля в нужный нам тип.

Вот `zod` схема, которая позволит на валидировать и трансформировать поля нужным нам образом:

```typescript
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
    date: zodFormDate(z.string().optional()),
    rememberMe: zodFormCheckbox.optional(),
  })
  .refine((v) => v.password === v.repeatPassword, {
    message: 'Пароли должны совпадать',
    path: ['repeatPassword'],
  });
```

Тут представлены несколько препроцессоров, которые позволяет модифицировать входные данные и придать им необходимый формат перед передачей их на валидацию. Объясню на примере `zodFormNumber`. `FormData` возвращает по умолчанию `""`, даже если поле было не запалено. Нам же нужно, что бы при пустом поле оно возвращало `undefined`, а при заполненном поле приводило его к типу `number` если это возможно. Этими преобразованиями и занимается препроцессор `zodFormNumber`. Далее в схеме указываем, что поле `age` является обязательным, и устанавливаем ему ограничения в 18 - 60

Далее в `form` меняем пропс `onSubmit` на следующий:

```tsx
<form
  noValidate // Отключаем автоматическию браузерную валидацию т.к этим теперь занимается zod
  onSubmit={async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const data = await schema.parseAsync(
        Object.fromEntries(formData.entries()),
      );

      console.log(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log(err.formErrors.fieldErrors);
      }
    }
  }}
>
  ...
</form>
```

При нажатии на кнопку `Отправить` если форма валидна то мы получим объект нужного нам формата. Если форма не валидна в консоли отобразятся объект с массивом из ошибок, которые мы сможем отображать под инпутами

```typescript
{
  age: ['Минимум 18 лет'],
  login: ['Введите валидный логин'],
  password: ['Введите валидный пароль'],
  repeatPassword: ['Введите валидный пароль'],
}
```

# Хук `useForm`

Напишем кастомный хук `useForm`. Который может принимать набор значений по умолчанию `defaultState`, саму схему валидации `schema` и 2 функции `onSubmit` `onError`. На практике же в `onSubmit` мы получаем валидные значения и можем отправить их на сервер. В `onError` можем дополнительно обработать ошибки и показать например модалку с предупреждением.

```typescript
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
      снова не будет нажада кнопка submit. Такое поведение не очень корректно
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
```

Напишем компонент обертку для полей. В которой будут отображаться ошибки, заголовок поля, и маркер обозначения обязательности поля.

```tsx
type FormField<T> = {
  form: ReturnType<typeof useForm<T>>;
  name: keyof T;
  label?: string;
};

export function FormField<T>({
  form,
  label,
  children,
  name,
}: PropsWithChildren<FormField<T>>) {
  const hasError = form.hasError(name);

  return (
    <div
      className={classNames('form-field', {
        'form-field_invalid': hasError,
      })}
    >
      {label && (
        <p className='form-field__label'>
          {label}
          &nbsp;
          {form.getRequired(name) ? <b style={{ color: 'red' }}>*</b> : ''}
        </p>
      )}
      {children}
      {hasError && (
        <p className='form-field__message'>{form.getErrorLabel(name)}</p>
      )}
    </div>
  );
}
```

Используем этот хук в компоненте с формой:

```tsx
type UserFormData = z.infer<typeof schema>;

export const FormExample = () => {
  const form = useForm<UserFormData>({
    schema: schema,
    onSubmit: async (value) => console.log(value),
    onError: console.log,
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
```

В большинстве случаев таких форм будет достаточно. Самое интересное что с таким подходом соблюдается полная типизация в функцию `register` не получится передать название поля, которого нет в схеме и есть `typescript` подсказки по другими полям в форме

# Кастомные поля

Далее добавим кастомное поле с возможностью выбора множества тегов.

<details>

<summary>TabSelect</summary>

```tsx
type TabSelectOption = {
  value: string;
  label: string;
};

type TabSelectProps = InputHTMLAttributes<HTMLInputElement> & {
  options: TabSelectOption[];
};

export const TabSelect: FC<TabSelectProps> = ({
  options,
  defaultValue,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [selectedValue, setSelectedValue] = useState<Set<string>>(() =>
    defaultValue ? new Set(JSON.parse(defaultValue as string)) : new Set(),
  );

  const selectHandler = (value: string) => {
    return () => {
      setSelectedValue((prev) => {
        const newSet = new Set(prev);

        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }

        if (ref.current) {
          ref.current.value = JSON.stringify(Array.from(newSet.keys()));

          props.onChange?.({
            currentTarget: ref.current,
            target: ref.current,
          } as React.ChangeEvent<HTMLInputElement>);
        }

        return newSet;
      });
    };
  };

  return (
    <>
      <input
        ref={ref}
        type='hidden'
        style={{ display: 'none' }}
        {...props}
      />
      <div className='button-select__buttons'>
        {options.map((option) => (
          <button
            className={classNames({ solid: !selectedValue.has(option.value) })}
            key={option.value}
            type='button'
            onClick={selectHandler(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
};
```

</details>

Из-за особенности `FormData` все поля в форме должны иметь `<input>`, иначе они просто не попадут в объект `FormData`. Для этого мы создаем скрытый инпут `<input type='hidden'>` и с помощью `useRef` прокидываем ему референс ссылку для того что бы установить ему `value` которое будет `JSON` строкой из состоящей из массива тегов. Напоминаю в `FormData` может содержаться только `string` или `Blob`, для этого мы и преобразуем массив тегов в `JSON`

По такому принципу можно создавать поля любой сложности

В схему добавим соответсвующее поле `skills`:

```typescript
const schema = z
  .object({
    ...
    skills: zodFormString(
      z
        .string()
        .default('[]')
        .transform((v) => JSON.parse(v) as string[])
        .refine((v) => v.length >= 2, { message: 'Минимум 2 скилла' }),
    ),
```

И прокинем в форму этот компонент:

```tsx
<TabSelect
  options={[
    { label: 'CSS', value: 'css' },
    { label: 'JavaScript', value: 'js' },
    { label: 'React', value: 'react' },
    { label: 'HTML', value: 'html' },
  ]}
  label='Умения'
  {...register('skills')}
/>
```

# Контролируемые и неконтролируемые компоненты

Как вы могли заметить в данной реализации мы используем неконтролируемые компоненты, так как это позволяет:

- Избежать лишних ререндеров, так как значения не хранятся в state.
- Использовать FormData для удобного сбора данных.
- Упростить интеграцию с нативными HTML-формами.

Если же вы не знакомы с этой концепцией, кратко её опишу:

В React существует два подхода к работе с формами: контролируемые и неконтролируемые компоненты.

- <b>Контролируемые</b> компоненты управляют значениями полей через состояние `useState`. Каждое изменение поля вызывает ререндер компонента, что позволяет точно контролировать ввод.

- <b>Неконтролируемые</b> компоненты используют `ref` или `FormData` для получения значений напрямую из DOM-элементов, а не хранят их в стейте. Это снижает количество ререндеров и делает работу с формами более производительной.

# Полезные ссылки

- [Документация zod](https://zod.dev/)
- [Полный пример формы на GitHub](https://github.com/Vosnov/habr-react-hook-form)
