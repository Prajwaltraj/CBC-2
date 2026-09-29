import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/react';
import { renderToString } from 'react-dom/server';

const App = () => {
  const { isLoaded } = useAuth();
  return React.createElement('div', null, isLoaded ? "LOADED" : "LOADING");
}

const Root = () => React.createElement(ClerkProvider, { publishableKey: undefined }, React.createElement(App));

try {
  console.log(renderToString(React.createElement(Root)));
} catch(e) {
  console.log("ERROR:", e.message);
}
