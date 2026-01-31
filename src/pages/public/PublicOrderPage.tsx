import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Store } from 'lucide-react';
import { usePublicBusiness } from '@/hooks/useBusiness';
import { useCreateOrder } from '@/hooks/useOrders';
import { useTransactionValidation } from '@/hooks/useTransactionValidation';
import { OrderStepper } from '@/components/order/OrderStepper';
import { ProductStep } from '@/components/order/ProductStep';
import { DeliveryStep } from '@/components/order/DeliveryStep';
import { PaymentStep } from '@/components/order/PaymentStep';
import { ConfirmationStep } from '@/components/order/ConfirmationStep';
import { OrderFormData } from '@/types/database';
import { toast } from 'sonner';

const initialFormData: OrderFormData = {
  orderType: '',
  orderDescription: '',
  quantity: 1,
  clientName: '',
  clientPhone: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryAddress: '',
  notes: '',
  paymentMethod: null,
  transactionCode: '',
  amountPaid: 0,
  paymentMessage: '',
};

export default function PublicOrderPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = usePublicBusiness(slug || '');
  const createOrder = useCreateOrder();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);

  // Determine total steps based on payment requirement
  const showPaymentStep = business?.payment_required ?? false;
  const totalSteps = showPaymentStep ? 4 : 3;

  // Map visual step to actual step considering payment
  const getActualStep = (visualStep: number) => {
    if (!showPaymentStep && visualStep >= 3) {
      return visualStep + 1; // Skip payment step
    }
    return visualStep;
  };

  const handleUpdateForm = (data: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    // If moving to confirmation step, create the order first
    if (currentStep === (showPaymentStep ? 3 : 2)) {
      try {
        if (business) {
          await createOrder.mutateAsync({
            businessId: business.id,
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
            deliveryDate: formData.deliveryDate,
            deliveryTime: formData.deliveryTime || undefined,
            deliveryAddress: formData.deliveryAddress || undefined,
            notes: formData.notes || undefined,
            orderDescription: formData.orderDescription,
            quantity: formData.quantity,
            orderType: formData.orderType,
            paymentMethod: formData.paymentMethod || undefined,
            transactionCode: formData.transactionCode || undefined,
            amountPaid: formData.amountPaid || undefined,
            paymentConfirmed: showPaymentStep && !!formData.transactionCode,
          });
        }
      } catch (error) {
        console.error('Error creating order:', error);
        toast.error('Erro ao registrar encomenda. Tente novamente.');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return <Navigate to="/" replace />;
  }

  const renderStep = () => {
    const actualStep = getActualStep(currentStep);
    
    switch (actualStep) {
      case 1:
        return (
          <ProductStep
            formData={formData}
            onUpdate={handleUpdateForm}
            onNext={handleNext}
            businessType={business.business_type}
          />
        );
      case 2:
        return (
          <DeliveryStep
            formData={formData}
            onUpdate={handleUpdateForm}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        if (showPaymentStep) {
          return (
            <PaymentStep
              formData={formData}
              onUpdate={handleUpdateForm}
              onNext={handleNext}
              onBack={handleBack}
              business={business}
            />
          );
        }
        // Fall through to confirmation if no payment
        return (
          <ConfirmationStep
            formData={formData}
            onBack={handleBack}
            business={business}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            formData={formData}
            onBack={handleBack}
            business={business}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-foreground">{business.name}</h1>
              <p className="text-xs text-muted-foreground">Fazer encomenda</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="container max-w-lg mx-auto px-4">
        <OrderStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          showPayment={showPaymentStep}
        />
      </div>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="container max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="text-primary font-semibold">Agenda Smart</span>
        </p>
      </footer>
    </div>
  );
}
