import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import SearchRide from './pages/SearchRide';
import OfferRide from './pages/OfferRide';
import RequestParcelDelivery from './pages/RequestParcelDelivery';
import ParcelRequests from './pages/ParcelRequests';
import About from './pages/About';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RideDetails from './pages/RideDetails';

function App() {
  const { t } = useTranslation();
  const { user, initializeAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        initializeAuth();
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().signOut();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await useAuthStore.getState().signOut();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img 
                src="https://res.cloudinary.com/ddyrp671i/image/upload/v1736999481/ASAP/logo_asap.png" 
                alt="ASAP Covoiturage"
                className="h-10 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('common.home')}
              </Link>
              <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('common.howItWorks')}
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('common.about')}
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('common.contact')}
              </Link>
              {user && (
                <Link to="/parcel-requests" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Livraisons disponibles
                </Link>
              )}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Mon Profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('auth.login')}
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {t('auth.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:hidden">
              <button 
                className="p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <Bars3Icon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link 
                  to="/" 
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.home')}
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.howItWorks')}
                </Link>
                <Link 
                  to="/about" 
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.about')}
                </Link>
                <Link 
                  to="/contact" 
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.contact')}
                </Link>
                {user && (
                  <Link 
                    to="/parcel-requests" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Livraisons disponibles
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {user ? (
                    <>
                      <Link 
                        to="/profile" 
                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mon Profil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('auth.login')}
                      </Link>
                      <Link 
                        to="/register" 
                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('auth.register')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/search" element={<SearchRide />} />
        <Route path="/offer" element={<OfferRide />} />
        <Route path="/request-delivery" element={<RequestParcelDelivery />} />
        <Route path="/parcel-requests" element={<ParcelRequests />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rides/:id" element={<RideDetails />} />
        <Route path="/" element={
          <main className="pt-20">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    {t('home.welcome')}
                  </h1>
                  <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    {t('home.description')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                      to="/search"
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                    >
                      {t('home.findRide')}
                    </Link>
                    <Link
                      to="/offer"
                      className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
                    >
                      {t('home.offerRide')}
                    </Link>
                    <Link
                      to="/request-delivery"
                      className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                    >
                      Demander une livraison
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                  Pourquoi choisir ASAP Covoiturage ?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  {/* Fast Feature */}
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('features.fast.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('features.fast.description')}
                    </p>
                  </div>

                  {/* Secure Feature */}
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('features.secure.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('features.secure.description')}
                    </p>
                  </div>

                  {/* Economic Feature */}
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('features.economic.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('features.economic.description')}
                    </p>
                  </div>

                  {/* Delivery Feature */}
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Livraison de colis
                    </h3>
                    <p className="text-gray-600">
                      Profitez de nos trajets pour envoyer vos colis de manière économique et écologique
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-8">
                  Prêt à commencer l'aventure ?
                </h2>
                <Link
                  to="/register"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
                >
                  Rejoignez-nous maintenant
                </Link>
              </div>
            </section>
          </main>
        } />
      </Routes>
    </div>
  );
}

export default App;