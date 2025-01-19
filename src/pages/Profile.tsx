import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useVehicleStore } from '../stores/vehicleStore';
import { useParcelStore } from '../stores/parcelStore';
import ImageUpload from '../components/ImageUpload';
import PayPalSettings from '../components/PayPalSettings';
import AddVehicleForm from '../components/AddVehicleForm';
import type { User, Booking, Ride, ParcelRequest, ParcelDelivery } from '../types';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  created_at: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { vehicles, getUserVehicles } = useVehicleStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBookings();
      getUserVehicles(user.id);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Erreur lors du chargement du profil');
    }
  };

  const fetchBookings = async () => {
    try {
      if (!user) return;

      // Première requête pour les réservations en tant que passager
      const { data: passengerBookings, error: passengerError } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(
            *,
            driver:profiles(*)
          ),
          passenger:profiles(*)
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      if (passengerError) throw passengerError;

      // Deuxième requête pour les réservations en tant que conducteur
      const { data: driverBookings, error: driverError } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides(
            *,
            driver:profiles(*)
          ),
          passenger:profiles(*)
        `)
        .eq('ride.driver_id', user.id)
        .order('created_at', { ascending: false });

      if (driverError) throw driverError;

      // Dédupliquer les réservations par ID avant de les combiner
      const bookingsMap = new Map();
      
      // Ajouter les réservations du passager
      passengerBookings?.forEach(booking => {
        bookingsMap.set(booking.id, booking);
      });
      
      // Ajouter les réservations du conducteur (écrasera les doublons s'il y en a)
      driverBookings?.forEach(booking => {
        bookingsMap.set(booking.id, booking);
      });

      // Convertir la Map en tableau et trier
      const sortedBookings = Array.from(bookingsMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setBookings(sortedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Erreur lors du chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      setError(null);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour accéder à votre profil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mon Profil
              </h2>

              <div className="mb-6">
                <ImageUpload
                  bucket="profile-images"
                  currentImage={profile?.avatar_url}
                  onUploadComplete={(url) => {
                    if (profile) {
                      setProfile({ ...profile, avatar_url: url });
                    }
                  }}
                  className="w-32 h-32 mx-auto"
                />
                {profile?.wallet_balance !== undefined && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Solde du compte</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.wallet_balance.toFixed(2)} CAD
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profile?.first_name || ''}
                    onChange={(e) => profile && setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profile?.last_name || ''}
                    onChange={(e) => profile && setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => profile && setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </form>
            </div>
          </div>

          {/* PayPal Settings */}
          <div className="mt-8">
            <PayPalSettings />
          </div>

          {/* Véhicules et Réservations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Véhicules */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mes Véhicules
                </h2>
                {!showAddVehicle && (
                  <button
                    onClick={() => setShowAddVehicle(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter un véhicule
                  </button>
                )}
              </div>

              {showAddVehicle ? (
                <AddVehicleForm
                  onSuccess={() => {
                    getUserVehicles(user.id);
                    setShowAddVehicle(false);
                  }}
                  onCancel={() => setShowAddVehicle(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="aspect-w-4 aspect-h-3 mb-4">
                        <img
                          src={vehicle.image_url || 'https://via.placeholder.com/400x300'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-semibold text-lg">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-gray-600">
                        {vehicle.color} - {vehicle.plate_number}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Réservations */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mes Réservations
              </h2>

              {isLoading ? (
                <p className="text-center text-gray-600">Chargement...</p>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.ride?.departure} → {booking.ride?.destination}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(booking.ride?.date || '').toLocaleDateString()} à{' '}
                            {booking.ride?.time}
                          </p>
                          <p className="text-gray-600 mt-2">
                            {booking.passenger_id === user.id ? (
                              <>
                                Conducteur : {booking.ride?.driver?.first_name}{' '}
                                {booking.ride?.driver?.last_name}
                              </>
                            ) : (
                              <>
                                Passager : {booking.passenger?.first_name}{' '}
                                {booking.passenger?.last_name}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed'
                              ? 'Confirmé'
                              : booking.status === 'cancelled'
                              ? 'Annulé'
                              : 'En attente'}
                          </span>
                          <p className="mt-2 text-2xl font-bold text-blue-600">
                            {booking.ride?.price} CAD
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  Aucune réservation pour le moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}