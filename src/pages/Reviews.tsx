import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useReviewStore } from '../stores/reviewStore';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

export default function Reviews() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { reviews, getUserReviews, createReview } = useReviewStore();
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    if (user) {
      getUserReviews(user.id);
    }
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createReview({
        reviewer_id: user.id,
        reviewed_id: '', // TODO: Add reviewed user ID
        ride_id: '', // TODO: Add ride ID
        rating: newReview.rating,
        comment: newReview.comment
      });
      setNewReview({ rating: 0, comment: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour accéder aux avis.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Avis et évaluations
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Liste des avis reçus */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Avis reçus
            </h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {review.reviewer?.avatar_url ? (
                          <img
                            src={review.reviewer.avatar_url}
                            alt={`${review.reviewer.first_name} ${review.reviewer.last_name}`}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {review.reviewer?.first_name?.[0]}
                              {review.reviewer?.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.reviewer?.first_name} {review.reviewer?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-center text-gray-500">
                  Aucun avis reçu pour le moment.
                </p>
              )}
            </div>
          </div>

          {/* Formulaire pour laisser un avis */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Laisser un avis
            </h2>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      {star <= newReview.rating ? (
                        <StarIcon className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarIconOutline className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publier l'avis
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}