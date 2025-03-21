import { FC, InputHTMLAttributes } from 'react';

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      className={'form-field__input'}
      {...props}
    />
  );
};
