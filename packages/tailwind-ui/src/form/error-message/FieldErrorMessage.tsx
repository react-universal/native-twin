import type { PropsWithChildren } from 'react';
import { Span } from '@universal-labs/primitives';
import type { FieldError } from 'react-hook-form';

interface IFieldErrorMessageProps extends PropsWithChildren {
  error?: FieldError;
}
export const FieldErrorMessage = (props: IFieldErrorMessageProps) => {
  if (!props.error?.message) {
    return null;
  }
  return (
    <Span className='text-error native:text-sm native:bottom-0 web:bottom-1 web:right-5 native:right-4 absolute ml-3'>
      {props.error?.message ?? ''}
    </Span>
  );
};
