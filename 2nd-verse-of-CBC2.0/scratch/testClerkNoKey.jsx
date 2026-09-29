import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/react';
import { renderToString } from 'react-dom/server';

const App = () => {
  const { isLoaded } = useAuth();
  return <div>{isLoaded ? "LOADED" : "LOADING"}</div>;
}

const Root = () => (
  <ClerkProvider publishableKey={undefined}>
    <App />
  </ClerkProvider>
);

try {
  console.log(renderToString(<Root />));
} catch(e) {
  console.log("ERROR:", e.message);
}
