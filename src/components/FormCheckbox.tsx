import { FC, InputHTMLAttributes, useId } from 'react';

type FormCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const FormCheckbox: FC<FormCheckboxProps> = ({ label, ...props }) => {
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
