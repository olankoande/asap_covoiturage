import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useVehicleStore } from '../stores/vehicleStore';
import { useRideStore } from '../stores/rideStore';
import { useParcelStore } from '../stores/parcelStore';
import { GoogleMap, useLoadScript, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import AddVehicleForm from '../components/AddVehicleForm';
import type { Vehicle, ParcelRequest } from '../types';

import { MAPS_CONFIG, defaultMapCenter } from '../lib/maps';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

export default function OfferRide() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vehicles, getUserVehicles } = useVehicleStore();
  const { createRide } = useRideStore();
  const { requests, getAvailableParcelRequests } = useParcelStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState<ParcelRequest[]>([]);
  const [departureLocation, setDepartureLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [departureAutocomplete, setDepartureAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

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

  const { isLoaded, loadError } = useLoadScript({
    ...MAPS_CONFIG,
    version: "weekly"
  });

  useEffect(() => {
    if (user) {
      getUserVehicles(user.id);
      getAvailableParcelRequests();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <p className="text-gray-600 text-center">Veuillez vous connecter pour proposer un trajet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-center text-red-600">
              <p>Erreur lors du chargement de Google Maps.</p>
              <p className="text-sm mt-2">Veuillez rafraîchir la page ou réessayer plus tard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeparturePlaceSelect = () => {
    if (departureAutocomplete) {
      const place = departureAutocomplete.getPlace();
      if (place.geometry?.location) {
        const location = {
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setDepartureLocation(location);
        setRideData(prev => ({ ...prev, departure: location.address }));
        setMapCenter({ lat: location.lat, lng: location.lng });
      }
    }
  };

  const handleDestinationPlaceSelect = () => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry?.location) {
        const location = {
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setDestinationLocation(location);
        setRideData(prev => ({ ...prev, destination: location.address }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setError('Veuillez sélectionner un véhicule');
      return;
    }
    
    if (!departureLocation || !destinationLocation) {
      setError('Veuillez sélectionner les points de départ et d\'arrivée sur la carte');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createRide({
        driver_id: user.id,
        vehicle_id: selectedVehicle.id,
        departure: departureLocation.address,
        destination: destinationLocation.address,
        departure_location: `${departureLocation.lat},${departureLocation.lng}`,
        destination_location: `${destinationLocation.lat},${destinationLocation.lng}`,
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

  const handleVehicleAdded = () => {
    getUserVehicles(user.id);
    setShowAddVehicle(false);
  };

  const availableParcels = requests.filter(request => 
    request.status === 'pending' &&
    request.pickup_location === rideData.departure &&
    request.delivery_location === rideData.destination
  );

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

          {showAddVehicle ? (
            <div className="mb-8">
              <AddVehicleForm
                onSuccess={handleVehicleAdded}
                onCancel={() => setShowAddVehicle(false)}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {isLoaded && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de départ
                      </label>
                      <Autocomplete
                        onLoad={autocomplete => setDepartureAutocomplete(autocomplete)}
                        onPlaceChanged={handleDeparturePlaceSelect}
                      >
                        <input
                          type="text"
                          placeholder="Entrez le lieu de départ"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </Autocomplete>
                    </>
                  )}
                </div>

                <div>
                  {isLoaded && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <Autocomplete
                        onLoad={autocomplete => setDestinationAutocomplete(autocomplete)}
                        onPlaceChanged={handleDestinationPlaceSelect}
                      >
                        <input
                          type="text"
                          placeholder="Entrez la destination"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </Autocomplete>
                    </>
                  )}
                </div>
              </div>

              {/* Google Maps */}
              <div className="h-96 rounded-lg overflow-hidden">
                {loadError && (
                  <div className="h-full flex items-center justify-center bg-gray-100 text-gray-600">
                    Erreur de chargement de Google Maps
                  </div>
                )}
                {!isLoaded ? (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={defaultMapCenter.zoom}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      gestureHandling: 'cooperative'
                    }}
                  >
                    {departureLocation && (
                      <Marker
                        position={{ lat: departureLocation.lat, lng: departureLocation.lng }}
                        label={{
                          text: "D",
                          color: "white",
                          fontWeight: "bold"
                        }}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          fillColor: "#4F46E5",
                          fillOpacity: 1,
                          strokeColor: "#4338CA",
                          strokeWeight: 1,
                          scale: 12
                        }}
                      />
                    )}
                    {destinationLocation && (
                      <Marker
                        position={{ lat: destinationLocation.lat, lng: destinationLocation.lng }}
                        label={{
                          text: "A",
                          color: "white",
                          fontWeight: "bold"
                        }}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          fillColor: "#DC2626",
                          fillOpacity: 1,
                          strokeColor: "#B91C1C",
                          strokeWeight: 1,
                          scale: 12
                        }}
                      />
                    )}
                  </GoogleMap>
                )}
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
                {vehicles.length > 0 ? (
                  <div className="space-y-4">
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
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Ajouter un autre véhicule
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-600 mb-4">Vous n'avez pas encore de véhicule enregistré</p>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ajouter un véhicule
                    </button>
                  </div>
                )}
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

              {availableParcels.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demandes de livraison disponibles
                  </label>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                    {availableParcels.map(parcel => (
                      <label key={parcel.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedParcels.some(p => p.id === parcel.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParcels(prev => [...prev, parcel]);
                            } else {
                              setSelectedParcels(prev => prev.filter(p => p.id !== parcel.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Colis {parcel.size}</p>
                          <p className="text-sm text-gray-600">
                            {parcel.weight} kg - Prix proposé : {parcel.price_offer} CAD
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
          )}
        </div>
      </div>
    </div>
  );
}