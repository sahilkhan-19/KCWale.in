import { motion } from "framer-motion";
import { ShieldCheck, ChefHat, Gem } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Halal & FSSAI Certified",
    description:
      "Every dish is 100% Halal and FSSAI certified. We follow the highest food safety standards so you can enjoy with complete peace of mind.",
    gradient: "from-green-500/20 to-emerald-500/10",
    iconColor: "text-green-400",
    borderColor: "hover:border-green-500/30",
  },
  {
    icon: ChefHat,
    title: "Freshly Homemade Food",
    description:
      "Made fresh to order with handpicked ingredients. No preservatives, no shortcuts — just authentic homemade goodness in every bite.",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-400",
    borderColor: "hover:border-orange-500/30",
  },
  {
    icon: Gem,
    title: "Premium Quality",
    description:
      "We use only premium-grade ingredients sourced from trusted suppliers. Taste the difference quality makes with every order.",
    gradient: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-400",
    borderColor: "hover:border-purple-500/30",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.3, duration: 0.8 },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/3 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/3 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-[2px] w-8 gradient-orange rounded-full" />
            <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">
              Our Promise
            </span>
            <div className="h-[2px] w-8 gradient-orange rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Why Choose <span className="gradient-text">KCWALE</span>?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            We don&apos;t just serve food — we serve trust, quality, and love on a plate.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`group relative rounded-2xl border border-white/5 bg-gradient-to-br ${feature.gradient} p-8 transition-all duration-500 ${feature.borderColor} hover:shadow-xl cursor-default`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon size={28} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/[0.02] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
