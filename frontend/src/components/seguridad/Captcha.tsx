import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface CaptchaProps {
  onVerify: (token: string) => void;
  resetKey: number;
}

export default function Captcha({ onVerify, resetKey }: CaptchaProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  return (
    <div className="flex justify-center py-3">
      <Turnstile
        key={resetKey}
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={() => onVerify('')}
        onError={() => onVerify('')}
        options={{
          theme: 'light',
          language: 'es',
          appearance: 'always'
        }}
      />
    </div>
  );
}