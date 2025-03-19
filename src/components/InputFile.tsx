import { FC, InputHTMLAttributes, useState } from 'react';

export const InputFile: FC<InputHTMLAttributes<HTMLInputElement>> = ({
  onChange,
  ...props
}) => {
  const [file, setFile] = useState<File>();

  return (
    <label className='input-file'>
      <input
        {...props}
        type='file'
        onChange={(e) => {
          onChange?.(e);
          const eFile = e.currentTarget.files?.item(0);
          if (eFile) {
            setFile(eFile);
          }
        }}
      />
      <span className='input-file-btn solid'>
        Выберите файл &nbsp;
        {props.required ? <b style={{ color: 'red' }}>*</b> : ''}
      </span>
      {file && <span className='input-file-text'>{file.name}</span>}
    </label>
  );
};
