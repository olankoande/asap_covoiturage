import React from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            À propos d'ASAP Covoiturage
          </h1>

          <div className="prose max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Notre Mission
              </h2>
              <p className="text-gray-600">
                ASAP Covoiturage a pour mission de rendre les déplacements plus accessibles, 
                économiques et écologiques. Nous connectons les conducteurs ayant des places 
                disponibles avec des passagers partageant le même itinéraire, créant ainsi 
                une communauté de transport collaborative et responsable.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <ul className="space-y-4 text-gray-600">
                <li>
                  <strong className="text-gray-900">Confiance :</strong> Nous construisons 
                  une communauté basée sur la confiance mutuelle et la transparence.
                </li>
                <li>
                  <strong className="text-gray-900">Écologie :</strong> Nous contribuons 
                  à réduire l'empreinte carbone en optimisant l'utilisation des véhicules.
                </li>
                <li>
                  <strong className="text-gray-900">Innovation :</strong> Nous développons 
                  constamment de nouvelles solutions pour améliorer l'expérience de covoiturage.
                </li>
                <li>
                  <strong className="text-gray-900">Communauté :</strong> Nous favorisons 
                  les connexions humaines et le partage d'expériences.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Notre Engagement
              </h2>
              <p className="text-gray-600">
                Nous nous engageons à offrir une plateforme sûre, fiable et conviviale 
                pour tous nos utilisateurs. Chaque trajet est assuré, et nous vérifions 
                l'identité de nos membres pour garantir votre sécurité.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Notre Impact
              </h2>
              <p className="text-gray-600">
                En choisissant ASAP Covoiturage, vous participez à la réduction des 
                émissions de CO2, à la décongestion des routes et à la création d'une 
                économie collaborative plus durable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}