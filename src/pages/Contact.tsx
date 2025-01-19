import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Contactez-nous
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Nos Coordonnées
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-blue-800">
                  <EnvelopeIcon className="w-5 h-5" />
                  <a href="mailto:contact@kikandi.com" className="hover:text-blue-600">
                    contact@kikandi.com
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-blue-800">
                  <PhoneIcon className="w-5 h-5" />
                  <a href="tel:+14189567421" className="hover:text-blue-600">
                    +1 (418) 956-7421
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Horaires de Support
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>Lundi - Vendredi : 9h00 - 18h00</p>
                <p>Samedi : 10h00 - 15h00</p>
                <p>Dimanche : Fermé</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}