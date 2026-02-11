import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function AdminAccessButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/entrar')}
      className="fixed top-5 right-5 z-50 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase cursor-pointer border-0"
      style={{
        background: 'linear-gradient(135deg, #C9A24D 0%, #E8C66A 50%, #B8902F 100%)',
        color: '#1a1a1a',
        boxShadow: '0 4px 20px rgba(201,162,77,0.25), 0 1px 4px rgba(0,0,0,0.15)',
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: [0, -2.5, 0],
      }}
      transition={{
        opacity: { duration: 0.5, ease: 'easeOut' },
        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 28px rgba(201,162,77,0.35), 0 2px 8px rgba(0,0,0,0.18)',
        scale: 1.03,
      }}
      whileTap={{ scale: 0.96 }}
    >
      Entrar
    </motion.button>
  );
}
