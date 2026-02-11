import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AdminAccessButton() {
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => navigate('/entrar')}
            className="fixed top-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center border cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderColor: 'rgba(255,255,255,0.15)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2), 0 0 20px rgba(201,162,77,0.08)',
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.08, boxShadow: '0 4px 24px rgba(0,0,0,0.2), 0 0 28px rgba(201,162,77,0.18)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="w-[18px] h-[18px] text-white/60 transition-colors duration-200 group-hover:text-white/80" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          sideOffset={8}
          className="rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xl"
          style={{
            background: 'rgba(15,18,32,0.92)',
            backdropFilter: 'blur(8px)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          Área do Gestor
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
