import { motion } from 'framer-motion';

const steps = [
  { number: '01', title: 'Cadastre seu negócio', description: 'Em 5 minutos você cria sua loja e adiciona seus produtos.' },
  { number: '02', title: 'Partilhe o link', description: 'Envie o link da sua loja no WhatsApp, Instagram ou Facebook.' },
  { number: '03', title: 'Cliente escolhe', description: 'Ele vê seus produtos, seleciona o que quer e confirma o pedido.' },
  { number: '04', title: 'Você recebe no WhatsApp', description: 'Pedido organizado com nome, itens, data e total. Só confirmar!' },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0F172A' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Como{' '}
            <span style={{
              background: 'linear-gradient(135deg, #F97316, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>funciona?</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#CBD5E1' }}>
            4 passos simples para receber pedidos organizados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="relative text-center lg:text-left"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px" style={{ background: 'linear-gradient(to right, rgba(249,115,22,0.3), transparent)' }} />
              )}
              <div className="relative z-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #3B82F6)',
                    boxShadow: '0 0 30px -8px rgba(249,115,22,0.4)',
                  }}
                >
                  <span className="text-2xl font-display font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-lg font-display font-bold mb-2" style={{ color: '#FFFFFF' }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
