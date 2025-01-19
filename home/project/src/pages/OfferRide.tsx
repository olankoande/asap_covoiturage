import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useVehicleStore } from '../stores/vehicleStore';
import { useRideStore } from '../stores/rideStore';
import type { Vehicle } from '../types';

export default function OfferRide() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vehicles, getUserVehicles } = useVehicleStore();
  const { createRide } = useRideStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rideData, setRideData] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    seats: '1',
    description: '',
    payment_methods: ['cash'] as ('cash' | 'credit_card')[]
  });

  useEffect(() => {
    if (user) {
      getUserVehicles(user.id);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour proposer un trajet.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createRide({
        driver_id: user.id,
        vehicle_id: selectedVehicle.id,
        departure: rideData.departure,
        destination: rideData.destination,
        date: rideData.date,
        time: rideData.time,
        price: parseFloat(rideData.price),
        seats: parseInt(rideData.seats),
        description: rideData.description || null,
        payment_methods: rideData.payment_methods
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
            Proposer un trajet
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
                  Lieu de départ
                </label>
                <input
                  type="text"
                  value={rideData.departure}
                  onChange={(e) => setRideData(prev => ({ ...prev, departure: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={rideData.destination}
                  onChange={(e) => setRideData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={rideData.date}
                  onChange={(e) => setRideData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={rideData.time}
                  onChange={(e) => setRideData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par place (CAD)
                </label>
                <input
                  type="number"
                  value={rideData.price}
                  onChange={(e) => setRideData(prev => ({ ...prev, price: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de places
                </label>
                <input
                  type="number"
                  value={rideData.seats}
                  onChange={(e) => setRideData(prev => ({ ...prev, seats: e.target.value }))}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Véhicule
              </label>
              <select
                value={selectedVehicle?.id || ''}
                onChange={(e) => {
                  const vehicle = vehicles.find(v => v.id === e.target.value);
                  setSelectedVehicle(vehicle || null);
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionnez un véhicule</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modes de paiement acceptés
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.payment_methods.includes('cash')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRideData(prev => ({
                          ...prev,
                          payment_methods: [...prev.payment_methods, 'cash']
                        }));
                      } else {
                        setRideData(prev => ({
                          ...prev,
                          payment_methods: prev.payment_methods.filter(m => m !== 'cash')
                        }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Espèces</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.payment_methods.includes('credit_card')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRideData(prev => ({
                          ...prev,
                          payment_methods: [...prev.payment_methods, 'credit_card']
                        }));
                      } else {
                        setRideData(prev => ({
                          ...prev,
                          payment_methods: prev.payment_methods.filter(m => m !== 'credit_card')
                        }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Carte de crédit</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={rideData.description}
                onChange={(e) => setRideData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Publication en cours...' : 'Publier le trajet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}