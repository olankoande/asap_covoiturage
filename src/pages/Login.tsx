import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer l'URL de redirection depuis les paramètres de recherche
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Rediriger vers l'URL de redirection si elle existe, sinon vers la page d'accueil
      navigate(redirectUrl || '/');
    } catch (err: any) {
      setError("Identifiants invalides. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('auth.loginTitle')}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </button>

            <p className="text-center text-gray-600 mt-4">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
                {t('auth.registerNow')}
              </Link>
            </p>
          </form>

          {/* Test Account Information */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Compte de test :</h2>
            <p className="text-blue-700">Email : test@example.com</p>
            <p className="text-blue-700">Mot de passe : password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}