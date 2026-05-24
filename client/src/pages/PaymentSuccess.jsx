import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reservationId = searchParams.get('reservation');
  const checkoutId = searchParams.get('checkout_id');
  const provider = searchParams.get('provider'); // Get provider from URL

  useEffect(() => {
    const verifyPaymentAndRedirect = async () => {
      try {
        const token = localStorage.getItem('token');

        // Verify payment if checkout_id is present
        if (checkoutId && reservationId) {
          console.log('Verifying payment...');
          console.log('Provider:', provider);

          // Determine which provider to use based on URL param or try both
          const providerToUse = provider || 'chargily'; // Default to chargily for local payments

          try {
            if (providerToUse === 'chargily') {
              // Try Chargily first
              // ✅ CORRECTION LIGNE 30 : backticks au lieu de guillemets simples
              await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/verify-chargily-payment`,
                {
                  checkout_id: checkoutId,
                  reservation_id: reservationId
                },
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
              console.log('✅ Chargily payment verified successfully');
            } else {
              // Try Stripe
              // ✅ CORRECTION LIGNE 44 : backticks au lieu de guillemets simples
              await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/verify-payment`,
                {
                  checkoutId,
                  provider: 'stripe',
                  reservationId
                },
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
              console.log('✅ Stripe payment verified successfully');
            }
          } catch (firstError) {
            console.log('First provider verification failed, trying other provider...');
            // If first provider fails, try the other one
            try {
              if (providerToUse === 'chargily') {
                // Try Stripe as fallback
                // ✅ CORRECTION LIGNE 59 : backticks au lieu de guillemets simples
                await axios.post(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/verify-payment`,
                  {
                    checkoutId,
                    provider: 'stripe',
                    reservationId
                  },
                  {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }
                );
                console.log('✅ Stripe payment verified successfully (fallback)');
              } else {
                // Try Chargily as fallback
                // ✅ CORRECTION LIGNE 68 : backticks au lieu de guillemets simples
                await axios.post(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/verify-chargily-payment`,
                  {
                    checkout_id: checkoutId,
                    reservation_id: reservationId
                  },
                  {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }
                );
                console.log('✅ Chargily payment verified successfully (fallback)');
              }
            } catch (secondError) {
              console.log('Payment verification skipped (test mode or error)');
            }
          }
        }

        // Redirect to dashboard with reservation param
        navigate(`/dashboard?reservation=${reservationId}`);
      } catch (error) {
        console.error('Error in payment success:', error);
        // Still redirect even if verification fails
        navigate(`/dashboard?reservation=${reservationId}`);
      }
    };

    verifyPaymentAndRedirect();
  }, [navigate, reservationId, checkoutId, provider]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a] mx-auto mb-4"></div>
        <p className="text-[#1a4a36] text-lg">Vérification du paiement...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;