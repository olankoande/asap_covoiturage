import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import type { Ride } from '../types';

export default function SearchRide() {
  const { t } = useTranslation();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    departure: '',
    destination: '',
    date: '',
    maxPrice: '',
    minSeats: '1'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fonction pour charger les trajets disponibles
  const loadAvailableRides = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(*),
          vehicle:vehicles(*),
          bookings(*)
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setRides(data || []);
    } catch (err) {
      console.error('Error loading rides:', err);
      setError('Une erreur est survenue lors du chargement des trajets');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les trajets au montage du composant
  useEffect(() => {
    loadAvailableRides();

    // Mettre en place la souscription aux changements
    const subscription = supabase
      .channel('rides_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides'
        },
        () => {
          loadAvailableRides();
        }
      )
      .subscribe();

    // Nettoyer la souscription lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(*),
          vehicle:vehicles(*),
          bookings(*)
        `)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (filters.departure) {
        query = query.ilike('departure', `%${filters.departure}%`);
      }
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      if (filters.date) {
        query = query.eq('date', filters.date);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;

      let filteredRides = data || [];

      // Appliquer les filtres supplémentaires
      if (filters.maxPrice) {
        filteredRides = filteredRides.filter(
          ride => ride.price <= parseFloat(filters.maxPrice)
        );
      }

      if (filters.minSeats) {
        filteredRides = filteredRides.filter(ride => {
          const bookedSeats = ride.bookings?.reduce((acc, booking) => 
            booking.status === 'confirmed' ? acc + booking.seats : acc, 0) || 0;
          return (ride.seats - bookedSeats) >= parseInt(filters.minSeats);
        });
      }

      setRides(filteredRides);
    } catch (err) {
      console.error('Error searching rides:', err);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Rechercher un trajet
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de départ
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.departure}
                    onChange={(e) => setFilters(prev => ({ ...prev, departure: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Montreal, QC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.destination}
                    onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Toronto, ON"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                Filtres avancés
              </button>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix maximum (CAD)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Places minimum
                    </label>
                    <input
                      type="number"
                      value={filters.minSeats}
                      onChange={(e) => setFilters(prev => ({ ...prev, minSeats: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              {isLoading ? 'Recherche en cours...' : 'Rechercher'}
            </button>
          </form>

          {/* Résultats de recherche */}
          {rides.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {rides.length} trajet{rides.length > 1 ? 's' : ''} disponible{rides.length > 1 ? 's' : ''}
              </h2>
              <div className="space-y-4">
                {rides.map((ride) => {
                  const bookedSeats = ride.bookings?.reduce((acc, booking) => 
                    booking.status === 'confirmed' ? acc + booking.seats : acc, 0) || 0;
                  const availableSeats = ride.seats - bookedSeats;

                  return (
                    <div
                      key={ride.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ride.departure} → {ride.destination}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {new Date(ride.date).toLocaleDateString('fr-CA')} à {ride.time}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-gray-600">
                              <UserIcon className="w-5 h-5 mr-1" />
                              {availableSeats} place{availableSeats > 1 ? 's' : ''} disponible{availableSeats > 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium">Véhicule :</span>
                              <span className="ml-1">{ride.vehicle?.brand} {ride.vehicle?.model}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-600">
                              Conducteur : {ride.driver?.first_name} {ride.driver?.last_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {ride.price} CAD
                          </p>
                          <Link
                            to={`/rides/${ride.id}`}
                            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !isLoading && (
            <div className="mt-12 text-center text-gray-600">
              Aucun trajet disponible pour ces critères de recherche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}