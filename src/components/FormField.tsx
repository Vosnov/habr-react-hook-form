import { PropsWithChildren } from 'react';
import { useForm } from '../hooks/use-form';
import classNames from 'classnames';

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
