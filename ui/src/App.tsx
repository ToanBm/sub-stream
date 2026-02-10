import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { VideoPlayerPage } from './pages/VideoPlayerPage';
import { SubscribePage } from './pages/SubscribePage';
import { AccountPage } from './pages/AccountPage';
import { usePasskey } from './hooks/usePasskey';
import { useSubscription } from './hooks/useSubscription';

function App() {
  const { register, login, logout, address, credentialId, publicKey, isRegistered } = usePasskey();
  const { subscribe, status: subscriptionStatus } = useSubscription(credentialId, publicKey, address);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-[var(--color-text)]">
        {/* NBC-style color stripe at very top */}
        <div className="nbc-stripe" />
        <Header
          address={address}
          isRegistered={isRegistered}
          onLogin={login}
          onRegister={register}
          onLogout={logout}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<HomePage filter="movie" />} />
          <Route path="/series" element={<HomePage filter="series" />} />
          <Route path="/watch/:id" element={<VideoPlayerPage isRegistered={isRegistered} onRegister={register} onLogin={login} />} />
          <Route
            path="/subscribe"
            element={
              <SubscribePage
                address={address}
                isRegistered={isRegistered}
                subscribe={subscribe}
                subscriptionStatus={subscriptionStatus}
                onRegister={register}
              />
            }
          />
          <Route path="/account" element={<AccountPage address={address} isRegistered={isRegistered} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
