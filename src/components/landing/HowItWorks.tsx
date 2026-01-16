import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Cadastre seu negócio',
    description: 'Em 5 minutos você cria sua loja e adiciona seus produtos.',
  },
  {
    number: '02',
    title: 'Partilhe o link',
    description: 'Envie o link da sua loja no WhatsApp, Instagram ou Facebook.',
  },
  {
    number: '03',
    title: 'Cliente escolhe',
    description: 'Ele vê seus produtos, seleciona o que quer e confirma o pedido.',
  },
  {
    number: '04',
    title: 'Você recebe no WhatsApp',
    description: 'Pedido organizado com nome, itens, data e total. Só confirmar!',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Como <span className="text-primary">funciona?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 passos simples para receber pedidos organizados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-glow">
                  <span className="text-2xl font-display font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2 text-center lg:text-left">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-center lg:text-left">
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
