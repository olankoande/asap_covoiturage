import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PaymentFormProps {
  amount: number;
  onSubmit: (data: { paymentId: string; amount: string }) => Promise<void>;
  isLoading: boolean;
  userEmail?: string;
}

export default function PaymentForm({ amount, onSubmit, isLoading, userEmail }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleProcessingError = (message: string) => {
    if (isMounted) {
      setError(message);
      setIsProcessing(false);
    }
  };

  const handlePaypalApprove = async (data: any) => {
    if (!isMounted) return;

    try {
      setIsProcessing(true);
      await onSubmit({
        paymentId: data.orderID,
        amount: amount.toString(),
      });
    } catch (error) {
      console.error('Payment error:', error);
      handleProcessingError('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      if (isMounted) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
        <p className="font-medium mb-2">Montant à payer : {amount.toFixed(2)} CAD</p>
        <p className="text-sm mb-2">Le paiement sera traité de manière sécurisée par PayPal</p>
        <p className="text-sm text-blue-800 bg-blue-100 p-2 rounded">
          ⚠️ Important : Veuillez autoriser les popups pour ce site afin de procéder au paiement PayPal
        </p>
      </div>

      <PayPalScriptProvider options={{
        "client-id": "ASBXxhN8XUC8rSwpVIMh0WrqyNmif-ZWA3Wn9y5j4p-JbG-IR41oG4ea6qWNWW1w81o_Dc122iCgHGaj",
        currency: "CAD",
        intent: "capture",
        commit: true,
        "merchant-id": "olankoande@myyahoo.com"
      }}>
        <div className={`relative ${isProcessing || isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {(isProcessing || isLoading) && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="text-blue-600">Traitement en cours...</div>
            </div>
          )}
          
          <PayPalButtons
            style={{
              layout: "vertical",
              shape: "rect",
              color: "blue"
            }}
            disabled={isLoading || isProcessing}
            forceReRender={[amount, userEmail]}
            createOrder={(data, actions) => {
              if (!isMounted) return Promise.reject('Component unmounted');

              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: amount.toFixed(2),
                    currency_code: "CAD",
                  },
                  description: "Réservation ASAP Covoiturage",
                  payee: {
                    email_address: "olankoande@myyahoo.com"
                  }
                }],
                application_context: {
                  shipping_preference: "NO_SHIPPING",
                  user_action: "PAY_NOW",
                  brand_name: "ASAP Covoiturage",
                  ...(userEmail && { payer: { email_address: userEmail } })
                }
              });
            }}
            onApprove={async (data, actions) => {
              if (!isMounted) return;

              if (actions.order) {
                try {
                  const details = await actions.order.capture();
                  await handlePaypalApprove(details);
                } catch (error) {
                  console.error('Capture error:', error);
                  handleProcessingError('Une erreur est survenue lors de la capture du paiement.');
                }
              }
            }}
            onCancel={() => {
              if (isMounted) {
                setError('Le paiement a été annulé. Vous pouvez réessayer quand vous voulez.');
              }
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              if (!isMounted) return;
              
              if (err.message?.includes('popup')) {
                handleProcessingError(
                  'Le popup PayPal a été bloqué. Pour autoriser les popups :\n' +
                  '1. Cherchez l\'icône de blocage de popup dans la barre d\'adresse\n' +
                  '2. Cliquez dessus et sélectionnez "Toujours autoriser..."\n' +
                  '3. Cliquez à nouveau sur "Payer" pour réessayer'
                );
              } else {
                handleProcessingError(
                  'Une erreur est survenue avec PayPal. Veuillez réessayer dans quelques instants.'
                );
              }
            }}
          />
        </div>
      </PayPalScriptProvider>

      <div className="mt-6 text-sm text-gray-500">
        <p className="text-center mb-2">🔒 Paiement sécurisé via PayPal</p>
        <ul className="space-y-1">
          <li>• Autorisation des popups requise</li>
          <li>• Paiement par carte bancaire ou compte PayPal</li>
          <li>• Transaction sécurisée et cryptée</li>
          <li>• Protection acheteur PayPal incluse</li>
        </ul>
        {error && error.includes('popup') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            <p className="font-medium mb-1">Comment autoriser les popups :</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Cherchez l'icône de blocage dans la barre d'adresse du navigateur</li>
              <li>Cliquez sur l'icône et sélectionnez "Toujours autoriser les popups pour ce site"</li>
              <li>Rafraîchissez la page et réessayez le paiement</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}