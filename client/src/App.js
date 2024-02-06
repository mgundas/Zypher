import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux'

import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import { Landing } from './pages/Landing';
import { Changelog } from './pages/Changelog';

function App() {
  const LazyHome = lazy(() => import("./pages/Home"))
  const { theme } = useSelector(state => state.globals)

  useEffect(() => {
    document.querySelector('html').setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <LanguageProvider>
      <LoadingProvider>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={
              <SocketProvider>
                <Suspense>
                  <LazyHome />
                </Suspense>
              </SocketProvider>
            } />
            <Route path="/landing/*" element={<Landing />} />
            <Route path="/changelog" element={<Changelog />} />
          </Routes>
        </AuthProvider>
      </LoadingProvider>
    </LanguageProvider>
  );
}

export default App;
