import { FC, InputHTMLAttributes } from 'react';

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
