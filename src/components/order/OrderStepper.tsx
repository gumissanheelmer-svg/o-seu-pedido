import { motion } from 'framer-motion';
import { Check, Package, Truck, CreditCard, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStepperProps {
  currentStep: number;
  totalSteps: number;
  showPayment: boolean;
}

const steps = [
  { icon: Package, label: 'Produto' },
  { icon: Truck, label: 'Entrega' },
  { icon: CreditCard, label: 'Pagamento' },
  { icon: Send, label: 'Confirmar' },
];

export function OrderStepper({ currentStep, totalSteps, showPayment }: OrderStepperProps) {
  // Filter out payment step if not required
  const activeSteps = showPayment 
    ? steps 
    : steps.filter(s => s.label !== 'Pagamento');

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2 z-0">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${((currentStep - 1) / (activeSteps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {activeSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground shadow-glow',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span 
                className={cn(
                  'text-xs mt-2 font-medium transition-colors',
                  isCurrent && 'text-primary',
                  isCompleted && 'text-success',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
