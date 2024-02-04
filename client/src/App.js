import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { LanguageProvider } from "./contexts/LanguageContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { RecipientProvider } from "./contexts/RecipientContext";
import { LoadingProvider } from "./contexts/LoadingContext";

import { Landing } from './pages/Landing';
import { Changelog } from './pages/Changelog';

function App() {
  const LazyHome = lazy(() => import("./pages/Home"))

  return (
    <LanguageProvider>
      <ConfigProvider>
        <LoadingProvider>
          <AuthProvider>
            <Routes>
              <Route path="/*" element={
                <SocketProvider>
                  <RecipientProvider>
                    <Suspense>
                      <LazyHome />
                    </Suspense>
                  </RecipientProvider>
                </SocketProvider>
              } />
              <Route path="/landing/*" element={<Landing />} />
              <Route path="/changelog" element={<Changelog />} />
            </Routes>
          </AuthProvider>
        </LoadingProvider>
      </ConfigProvider>
    </LanguageProvider>
  );
}

export default App;
