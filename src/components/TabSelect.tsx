import { FC, InputHTMLAttributes, useRef, useState } from 'react';
import classNames from 'classnames';

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
