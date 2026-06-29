import React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { menuService } from "../services/menu.service"
import { FoodCard } from "../components/FoodCard"
import { Star, Bike, ShieldCheck, Flame, ChevronRight, ChevronLeft, Quote } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "Aditya Sharma",
    role: "Late-night Craver",
    review: "The Special Chicken Zinger Pizza is absolute heaven! The crust is so crispy and the cheese is perfectly melted. Definitely my late-night go-to in Aligarh.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Priya Singh",
    role: "Gourmet Foodie",
    review: "I'm extremely picky about pasta, but the Chicken Alfredo Pasta blew me away. So rich, creamy, and loaded with perfectly seasoned chicken. Highly recommended!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Mohd. Anas",
    role: "Spice Enthusiast",
    review: "The Peri Peri Chicken Zinger Burger has the perfect kick! The chicken fillet is massive and stays super juicy. Paired with a Blue Lagoon Mojito, it's a complete mood.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Riya Varshney",
    role: "Momos Lover",
    review: "Kurkure Masala Momos are a game-changer! The outer crunch is incredibly satisfying and the masala stuffing is super flavorful. Clean packaging too!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Kabir Mehta",
    role: "Dessert Fanatic",
    review: "Tried the Blueberry Shake and Classic Margherita pizza last night. The shake was thick and delicious, and the pizza base was incredibly soft. KC WALE never disappoints!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  }
]

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [activeTestimonial, setActiveTestimonial] = React.useState(2)

  // Fetch featured items
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: menuService.getFeaturedProducts,
  })

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center shadow-2xl border border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent z-10"></div>
          <img
            className="w-full h-full object-cover"
            src="https://res.cloudinary.com/dxu24wv1q/image/upload/v1782403615/kcwale_banner_az1aky.jpg"
            alt="KC Wale Banner"
          />
        </div>

        <div className="relative z-20 px-6 md:px-16 max-w-2xl space-y-6 py-8 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-semibold"
            >
              <Bike className="w-3.5 h-3.5 text-primary animate-pulse" />
              We Deliver Across Aligarh
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Halal & FSSAI Certified
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-0 select-none cursor-default"
          >
            {/* Line 1: Night with */}
            <div className="flex items-baseline font-headline">
              <span className="text-7xl md:text-8xl font-extralight italic text-primary leading-none">N</span>
              <span className="text-5xl md:text-6xl font-extrabold tracking-tighter -ml-1 text-white leading-none">ight</span>
              <span className="text-2xl md:text-3xl font-extralight text-white/40 italic ml-2 lowercase leading-none">&nbsp;with</span>
            </div>

            {/* Line 2: KC WALE */}
            <div className="flex items-baseline mt-[-8px] md:mt-[-16px]">
              <span className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-primary leading-none">KC</span>
              <span className="text-4xl md:text-6xl font-extralight tracking-[0.2em] uppercase font-headline text-white/95 ml-3 leading-none border-b border-white/15 pb-1">WALE</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2 max-w-lg"
          >
            <p className="font-headline text-lg md:text-xl text-primary font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Freshly Prepared. Premium Quality. Delivered Hot.
            </p>
            <p className="text-white/70 text-xs md:text-sm font-light font-body leading-relaxed">
              Experience the ultimate cloud kitchen in Aligarh. From gourmet burgers and sizzling pizzas to crispy wraps and refreshing drinks, we prepare every meal fresh to order and deliver it piping hot to your door.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(255,107,53,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/menu")}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-500 text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-xl shadow-primary/20 cursor-pointer"
            >
              Order Now
            </motion.button>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-xs font-semibold">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                <span>4.7 Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-current" />
              Customer Favorites
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-background">Hot Selling Items</h2>
            <p className="text-on-surface-variant text-xs md:text-sm mt-0.5">Freshly prepared, packed hot, delivered fast.</p>
          </div>
          <button
            onClick={() => navigate("/menu")}
            className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
          >
            View Menu <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-surface-container-low rounded-[24px] border border-outline-variant h-[340px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <FoodCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Cooked Fresh</h3>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Every dish is cooked fresh only after your order is received, ensuring maximum flavor.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bike className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Super-Fast Delivery</h3>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Our optimized delivery fleet brings your food straight to your door in under 30 minutes.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Premium Packaging</h3>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
            We use specialized insulated packaging to retain heat and guarantee safety.
          </p>
        </div>
      </section>

      {/* What Our Cravers Say (Testimonials 3D Cover Flow Carousel) */}
      <section className="space-y-8 pt-4 pb-8 overflow-hidden">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            HEAR FROM OUR COMMUNITY
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background">
            What Our Cravers Say
          </h2>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1 max-w-md mx-auto">
            Real feedback from Aligarh's most passionate food lovers.
          </p>
        </div>

        {/* 3D Cover Flow Carousel Wrapper */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
          <div className="relative w-full h-[300px] flex items-center justify-center [perspective:1200px]">
            {testimonials.map((t, index) => {
              const count = testimonials.length;
              let diff = index - activeTestimonial;
              if (diff < -count / 2) diff += count;
              if (diff > count / 2) diff -= count;
              const absDiff = Math.abs(diff);

              // Position properties based on offset
              const xPos = diff * 220; // card spacing
              const rotY = diff * -30; // 3D angle
              const scaleVal = 1 - absDiff * 0.15;
              const opacityVal = absDiff > 1 ? 0 : 1 - absDiff * 0.45;
              const zIdx = 10 - absDiff;
              const isCenter = diff === 0;

              return (
                <motion.div
                  key={t.id}
                  style={{
                    transformStyle: "preserve-3d"
                  }}
                  animate={{
                    x: xPos,
                    scale: scaleVal,
                    opacity: opacityVal,
                    rotateY: rotY,
                    zIndex: zIdx,
                    filter: isCenter ? "blur(0px)" : "blur(1.5px)"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25
                  }}
                  onClick={() => setActiveTestimonial(index)}
                  className={`absolute w-[290px] sm:w-[380px] h-[240px] p-6 rounded-2xl bg-surface-container-low border border-outline-variant/35 shadow-2xl flex flex-col justify-between cursor-pointer transition-colors duration-300 ${
                    isCenter ? "border-primary/45 bg-surface-container" : "hover:bg-surface-container-low/80"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Stars & Quote Icon */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-7 h-7 text-primary/10 rotate-180" />
                    </div>

                    {/* Review text */}
                    <p className="text-on-surface-variant font-body text-xs md:text-sm leading-relaxed italic line-clamp-4 select-none">
                      "{t.review}"
                    </p>
                  </div>


                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-5 mt-4">
            <button
              onClick={() =>
                setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
              }
              className="p-2.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-md active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Indicator Dots */}
            <div className="flex gap-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === activeTestimonial ? "w-6 bg-primary" : "w-2 bg-outline-variant/60"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
              }
              className="p-2.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-md active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
