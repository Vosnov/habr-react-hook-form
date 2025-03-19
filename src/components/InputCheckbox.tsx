import { FC, InputHTMLAttributes, useId } from 'react';

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
