import { FC, InputHTMLAttributes } from 'react';

export const FormInput: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      className={'form-field__input'}
      {...props}
    />
  );
};
