import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useParcelStore } from '../stores/parcelStore';
import { useRideStore } from '../stores/rideStore';
import type { ParcelRequest, Ride } from '../types';

export default function ParcelRequests() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { requests, getAvailableParcelRequests } = useParcelStore();
  const { rides } = useRideStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ParcelRequest | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState<string>('');
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  useEffect(() => {
    if (user) {
      getAvailableParcelRequests();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour voir les demandes de livraison.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedRide) return;

    setIsLoading(true);
    setError(null);

    try {
      await useParcelStore.getState().createParcelDelivery({
        request_id: selectedRequest.id,
        ride_id: selectedRide.id,
        driver_id: user.id,
        delivery_price: parseFloat(deliveryPrice)
      });

      await useParcelStore.getState().updateParcelRequest(selectedRequest.id, {
        status: 'accepted'
      });

      setShowAcceptForm(false);
      setSelectedRequest(null);
      setSelectedRide(null);
      setDeliveryPrice('');
      getAvailableParcelRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Demandes de livraison disponibles
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {showAcceptForm && selectedRequest ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Accepter la demande de livraison</h2>
              <form onSubmit={handleAcceptRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un trajet
                  </label>
                  <select
                    value={selectedRide?.id || ''}
                    onChange={(e) => {
                      const ride = rides.find(r => r.id === e.target.value);
                      setSelectedRide(ride || null);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez un trajet</option>
                    {rides.map((ride) => (
                      <option key={ride.id} value={ride.id}>
                        {ride.departure} → {ride.destination} ({new Date(ride.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix de livraison (CAD)
                  </label>
                  <input
                    type="number"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                    min={selectedRequest.price_offer}
                    step="0.01"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Prix minimum : {selectedRequest.price_offer} CAD
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAcceptForm(false);
                      setSelectedRequest(null);
                      setSelectedRide(null);
                      setDeliveryPrice('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'En cours...' : 'Accepter la livraison'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {request.pickup_location} → {request.delivery_location}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Date souhaitée : {new Date(request.requested_delivery_date).toLocaleDateString()}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium">Description :</span> {request.description || 'Non spécifié'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Poids :</span> {request.weight} kg
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Taille :</span>{' '}
                          {request.size === 'small' ? 'Petit' : request.size === 'medium' ? 'Moyen' : 'Grand'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {request.price_offer} CAD
                      </p>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowAcceptForm(true);
                          setDeliveryPrice(request.price_offer.toString());
                        }}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Accepter
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <p className="text-center text-gray-600">
                  Aucune demande de livraison disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}