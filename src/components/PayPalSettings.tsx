import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function PayPalSettings() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    paypal_email: 'olankoande@myyahoo.com',
    business_name: '',
    is_business: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          paypal_email: formData.paypal_email,
          paypal_business_name: formData.business_name,
          paypal_is_business: formData.is_business
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Configuration PayPal</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          Configuration PayPal mise à jour avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email PayPal
          </label>
          <input
            type="email"
            value={formData.paypal_email}
            onChange={(e) => setFormData(prev => ({ ...prev, paypal_email: e.target.value }))}
            placeholder="olankoande@myyahoo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            L'adresse email associée à votre compte PayPal pour recevoir les paiements
          </p>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_business}
              onChange={(e) => setFormData(prev => ({ ...prev, is_business: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              J'utilise un compte PayPal Business
            </span>
          </label>
        </div>

        {formData.is_business && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={formData.is_business}
            />
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Important :</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Assurez-vous que votre compte PayPal est vérifié</li>
          <li>• Pour les comptes Business, activez la réception de paiements</li>
          <li>• Configurez vos préférences de paiement dans votre compte PayPal</li>
        </ul>
      </div>
    </div>
  );
}