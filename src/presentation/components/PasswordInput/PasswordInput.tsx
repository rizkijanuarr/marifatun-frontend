import { useState } from 'react';

type Props = {
  name: string;
  placeholder: string;
  ariaLabel: string;
};

export const PasswordInput = ({ name, placeholder, ariaLabel }: Props) => {
  const [show, setShow] = useState(false);
  return (
    <label className="auth-field auth-field--password">
      <input type={show ? 'text' : 'password'} name={name} autoComplete="new-password" placeholder={placeholder} />
      <button type="button" className={`auth-eye ${show ? 'is-revealed' : ''}`} aria-label={ariaLabel} onClick={() => setShow((s) => !s)}>
        <svg className="auth-eye__icon auth-eye__icon--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
        <svg className="auth-eye__icon auth-eye__icon--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a19.77 19.77 0 0 1 4.22-5.32"/><path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a19.8 19.8 0 0 1-3.17 4.19"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M2 2l20 20"/></svg>
      </button>
    </label>
  );
};
