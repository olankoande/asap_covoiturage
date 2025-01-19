import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useParcelStore } from '../stores/parcelStore';

export default function RequestParcelDelivery() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createParcelRequest } = useParcelStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location: '',
    delivery_location: '',
    description: '',
    weight: '',
    size: 'small' as 'small' | 'medium' | 'large',
    requested_delivery_date: '',
    price_offer: ''
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour demander une livraison.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createParcelRequest({
        sender_id: user.id,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        description: formData.description || null,
        weight: parseFloat(formData.weight),
        size: formData.size,
        requested_delivery_date: formData.requested_delivery_date,
        price_offer: parseFloat(formData.price_offer)
      });

      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Demander une livraison de colis
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de ramassage
                </label>
                <input
                  type="text"
                  value={formData.pickup_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de livraison
                </label>
                <input
                  type="text"
                  value={formData.delivery_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du colis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as 'small' | 'medium' | 'large' }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="small">Petit</option>
                  <option value="medium">Moyen</option>
                  <option value="large">Grand</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix proposé (CAD)
                </label>
                <input
                  type="number"
                  value={formData.price_offer}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_offer: e.target.value }))}
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de livraison souhaitée
              </label>
              <input
                type="date"
                value={formData.requested_delivery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, requested_delivery_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
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
              {isLoading ? 'Publication en cours...' : 'Publier la demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}