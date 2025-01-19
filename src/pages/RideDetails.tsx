import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { usePaymentStore } from '../stores/paymentStore';
import PaymentForm from '../components/PaymentForm';
import type { PaymentFormData, Ride, Booking } from '../types';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createPayment, processPayment } = usePaymentStore();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchRideDetails = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(*),
          vehicle:vehicles(*),
          bookings(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Trajet non trouvé');
      setRide(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRideDetails();

      // Mettre en place la souscription aux changements
      const subscription = supabase
        .channel('ride_details_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rides',
            filter: `id=eq.${id}`
          },
          () => {
            fetchRideDetails();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `ride_id=eq.${id}`
          },
          () => {
            fetchRideDetails();
          }
        )
        .subscribe();

      // Nettoyer la souscription lors du démontage
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      // Rediriger vers la page de connexion avec un paramètre de retour
      navigate(`/login?redirect=/rides/${id}`);
      return;
    }

    if (!ride) return;

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            ride_id: id,
            passenger_id: user.id,
            seats: bookingSeats,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      setCurrentBooking(booking);
      
      // Créer le paiement
      await createPayment(
        booking.id,
        ride.price * bookingSeats,
        'credit_card'
      );

      setShowPaymentForm(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePayment = async (paymentData: PaymentFormData) => {
    if (!currentBooking) return;

    try {
      await processPayment(currentBooking.id, paymentData);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || "Ce trajet n'existe pas."}
          </div>
        </div>
      </div>
    );
  }

  const bookedSeats = ride.bookings?.reduce((acc, booking) => 
    booking.status === 'confirmed' ? acc + booking.seats : acc, 0) || 0;
  const availableSeats = ride.seats - bookedSeats;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {ride.departure} → {ride.destination}
              </h1>
              <p className="text-gray-600 mt-2">
                Le {new Date(ride.date).toLocaleDateString('fr-CA')} à {ride.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{ride.price} CAD</p>
              <p className="text-gray-600">{availableSeats} places disponibles</p>
            </div>
          </div>

          {/* Informations conducteur */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Conducteur</h2>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-blue-600">
                  {ride.driver?.first_name?.[0]}
                  {ride.driver?.last_name?.[0]}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">
                  {ride.driver?.first_name} {ride.driver?.last_name}
                </h3>
                <p className="text-gray-600">{ride.driver?.phone}</p>
              </div>
            </div>
          </div>

          {/* Véhicule */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Véhicule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Marque</p>
                <p className="font-semibold">{ride.vehicle?.brand}</p>
              </div>
              <div>
                <p className="text-gray-600">Modèle</p>
                <p className="font-semibold">{ride.vehicle?.model}</p>
              </div>
              <div>
                <p className="text-gray-600">Couleur</p>
                <p className="font-semibold">{ride.vehicle?.color}</p>
              </div>
              <div>
                <p className="text-gray-600">Immatriculation</p>
                <p className="font-semibold">{ride.vehicle?.plate_number}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {ride.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{ride.description}</p>
            </div>
          )}

          {/* Formulaire de réservation ou de paiement */}
          {!user ? (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Veuillez vous connecter pour réserver ce trajet
                </p>
                <Link
                  to={`/login?redirect=/rides/${id}`}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          ) : showPaymentForm ? (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Paiement</h2>
              <PaymentForm
                userEmail={user.email}
                amount={ride.price * bookingSeats}
                onSubmit={handlePayment}
                isLoading={isProcessingPayment}
              />
            </div>
          ) : user.id !== ride.driver_id && availableSeats > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Réserver</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de places
                  </label>
                  <select
                    value={bookingSeats}
                    onChange={(e) => setBookingSeats(parseInt(e.target.value))}
                    className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[...Array(availableSeats)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {ride.price * bookingSeats} CAD
                  </p>
                </div>
              </div>
              <button
                onClick={handleBooking}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réserver maintenant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}