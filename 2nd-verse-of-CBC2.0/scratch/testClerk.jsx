import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/react';
import { renderToString } from 'react-dom/server';

const App = () => {
  const { isLoaded } = useAuth();
  return <div>{isLoaded ? "LOADED" : "LOADING"}</div>;
}

const Root = () => (
  <ClerkProvider publishableKey="pk_test_c3RlYWR5LWRvYmVybWFuLTI5NTkuY2xlcmsuYWNjb3VudHMuZGV2JA">
    <App />
  </ClerkProvider>
);

console.log(renderToString(<Root />));
