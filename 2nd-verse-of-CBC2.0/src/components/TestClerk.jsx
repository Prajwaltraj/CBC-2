import { useSignUp, useSignIn } from '@clerk/react';
import { useEffect } from 'react';

export default function TestClerk() {
  const { signUp } = useSignUp();
  useEffect(() => {
    if (signUp) {
      console.log("[DEBUG CLERK] signUp object:", signUp);
      let proto = Object.getPrototypeOf(signUp);
      console.log("[DEBUG CLERK] prototype:", Object.getOwnPropertyNames(proto));
    }
  }, [signUp]);
  return null;
}
