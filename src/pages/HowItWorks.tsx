import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques clics pour accéder à toutes les fonctionnalités.',
      icon: <CheckCircleIcon className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Recherchez ou proposez un trajet',
      description: 'Trouvez le trajet qui vous convient ou proposez vos places disponibles.',
      icon: <CheckCircleIcon className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Réservez en toute sécurité',
      description: 'Effectuez votre réservation et payez en ligne de manière sécurisée.',
      icon: <CheckCircleIcon className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Voyagez ensemble',
      description: 'Rencontrez votre conducteur ou vos passagers et partagez votre trajet.',
      icon: <CheckCircleIcon className="w-8 h-8 text-blue-600" />
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Comment ça marche ?
          </h1>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">{step.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Pourquoi choisir ASAP Covoiturage ?
            </h2>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Économisez sur vos frais de transport
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Réduisez votre empreinte carbone
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Voyagez en toute sécurité avec des utilisateurs vérifiés
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Profitez d'une assurance pendant vos trajets
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}