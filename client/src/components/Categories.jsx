import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { name: "Pizza", emoji: "🍕", color: "from-red-500/20 to-orange-500/20" },
  { name: "Burgers", emoji: "🍔", color: "from-amber-500/20 to-yellow-500/20" },
  { name: "Sandwich", emoji: "🥪", color: "from-yellow-500/20 to-green-500/20" },
  { name: "Pasta", emoji: "🍝", color: "from-orange-500/20 to-red-500/20" },
  { name: "Chizza", emoji: "🍗", color: "from-rose-500/20 to-pink-500/20" },
  { name: "Fries", emoji: "🍟", color: "from-yellow-500/20 to-amber-500/20" },
  { name: "Momos", emoji: "🥟", color: "from-pink-500/20 to-rose-500/20" },
  { name: "Shakes", emoji: "🥤", color: "from-purple-500/20 to-pink-500/20" },
  { name: "Mojitos", emoji: "🍹", color: "from-cyan-500/20 to-blue-500/20" },
  { name: "Wraps", emoji: "🌯", color: "from-green-500/20 to-emerald-500/20" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.3, duration: 0.6 },
  },
};

export default function Categories() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-[2px] w-8 gradient-orange rounded-full" />
            <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">
              Explore
            </span>
            <div className="h-[2px] w-8 gradient-orange rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Browse by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            From sizzling pizzas to refreshing mojitos — pick your craving
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/menu?category=${cat.name}`)}
              className={`group relative flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border border-white/5 bg-gradient-to-br ${cat.color} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5`}
            >
              <span className="text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                {cat.emoji}
              </span>
              <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                {cat.name}
              </span>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
