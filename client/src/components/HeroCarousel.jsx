import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

import pizzaImg from "@/assets/images/chicken-zinger-pizza.png";
import burgerImg from "@/assets/images/chicken-zinger-burger.png";
import mojitoImg from "@/assets/images/blue-lagoon-mojito.png";
import momosImg from "@/assets/images/fried-momos.png";

const heroItems = [
  {
    id: 1,
    title: "Special Chicken Zinger Pizza",
    description:
      "A flavor explosion! Crispy fried chicken zinger strips loaded on a cheesy pizza base with our signature spicy sauce and fresh veggies.",
    price: 349,
    image: pizzaImg,
    accentColor: "#ea580c",
    glowFrom: "rgba(234, 88, 12, 0.25)",
    glowTo: "rgba(234, 88, 12, 0.08)",
    bgGradient: "radial-gradient(ellipse at 70% 50%, rgba(234,88,12,0.12) 0%, transparent 70%)",
  },
  {
    id: 2,
    title: "Special Chicken Zinger Burger",
    description:
      "The ultimate crunch! Juicy chicken zinger patty with melted cheese, crispy lettuce, and our secret KC sauce in a toasted sesame bun.",
    price: 199,
    image: burgerImg,
    accentColor: "#d97706",
    glowFrom: "rgba(217, 119, 6, 0.25)",
    glowTo: "rgba(217, 119, 6, 0.08)",
    bgGradient: "radial-gradient(ellipse at 70% 50%, rgba(217,119,6,0.12) 0%, transparent 70%)",
  },
  {
    id: 3,
    title: "BlueLagoon Mojito",
    description:
      "Dive into refreshment! A stunning blue curaçao mojito with fresh mint, lime, and crushed ice — the perfect cool-down companion.",
    price: 129,
    image: mojitoImg,
    accentColor: "#0ea5e9",
    glowFrom: "rgba(14, 165, 233, 0.3)",
    glowTo: "rgba(14, 165, 233, 0.08)",
    bgGradient: "radial-gradient(ellipse at 70% 50%, rgba(14,165,233,0.1) 0%, transparent 70%)",
  },
  {
    id: 4,
    title: "Fried Momos",
    description:
      "Golden-crispy fried dumplings stuffed with seasoned chicken, served with our fiery red chili chutney. Crunch into happiness!",
    price: 149,
    image: momosImg,
    accentColor: "#dc2626",
    glowFrom: "rgba(220, 38, 38, 0.25)",
    glowTo: "rgba(220, 38, 38, 0.08)",
    bgGradient: "radial-gradient(ellipse at 70% 50%, rgba(220,38,38,0.1) 0%, transparent 70%)",
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const currentItem = heroItems[selectedIndex];

  return (
    <section className="relative w-full pt-24 md:pt-32 pb-8 overflow-hidden">
      {/* Ambient background glow that changes color with the active slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${selectedIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Primary glow - right side where image is */}
          <div
            className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[130px]"
            style={{ background: currentItem.glowFrom }}
          />
          {/* Secondary softer glow - spreads wider */}
          <div
            className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px]"
            style={{ background: currentItem.glowTo }}
          />
          {/* Subtle top-left hint */}
          <div
            className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full blur-[120px]"
            style={{ background: currentItem.glowTo }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        {/* Section badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="h-1 w-8 rounded-full gradient-orange" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">
            🔥 Hot Selling
          </span>
        </motion.div>

        {/* Carousel */}
        <div className="relative" ref={emblaRef}>
          <div className="flex">
            {heroItems.map((item, index) => (
              <div key={item.id} className="flex-[0_0_100%] min-w-0">
                {/* Slide container — no borders, no card frame */}
                <div
                  className="relative min-h-[400px] md:min-h-[460px] lg:min-h-[500px]"
                  style={{ background: item.bgGradient }}
                >
                  <div className="flex flex-col md:flex-row items-center h-full">
                    {/* Left - Content */}
                    <div className="flex-1 relative z-10 px-2 md:px-6 lg:px-10 pt-8 md:pt-0 order-2 md:order-1">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          >
                            {/* Accent line */}
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: 48 }}
                              transition={{ delay: 0.3, duration: 0.4 }}
                              className="h-1 rounded-full mb-5"
                              style={{ background: item.accentColor }}
                            />

                            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                              {item.title}
                            </h2>
                            <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                              {item.description}
                            </p>

                            <div className="flex items-end gap-8 mb-8">
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">
                                  Price
                                </span>
                                <p className="text-4xl md:text-5xl font-black gradient-text">
                                  ₹{item.price}
                                </p>
                              </div>
                            </div>

                            <Button size="lg" className="group text-base px-8">
                              <ShoppingBag
                                size={18}
                                className="group-hover:rotate-12 transition-transform duration-300"
                              />
                              Order Now
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Right - Image (floating, no frame) */}
                    <div className="flex-1 relative flex items-center justify-center order-1 md:order-2 h-[280px] md:h-[460px] lg:h-[500px]">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.div
                            key={`img-${item.id}`}
                            initial={{ opacity: 0, scale: 0.7, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -30 }}
                            transition={{
                              duration: 0.7,
                              type: "spring",
                              bounce: 0.25,
                            }}
                            className="relative w-full h-full flex items-center justify-center"
                          >
                            {/* Multi-layer ambient glow behind the food */}
                            <div
                              className="absolute w-[70%] h-[70%] rounded-full blur-[80px] opacity-60"
                              style={{ background: item.glowFrom }}
                            />
                            <div
                              className="absolute w-[90%] h-[90%] rounded-full blur-[120px] opacity-30"
                              style={{ background: item.glowTo }}
                            />

                            {/* The food image — uses CSS mask to fade edges into the background */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className="relative z-10 w-[80%] md:w-[90%] lg:w-[95%] max-w-[460px] h-auto object-contain"
                              style={{
                                maskImage:
                                  "radial-gradient(ellipse 85% 85% at 50% 50%, black 35%, transparent 100%)",
                                WebkitMaskImage:
                                  "radial-gradient(ellipse 85% 85% at 50% 50%, black 35%, transparent 100%)",
                                filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
                              }}
                            />

                            {/* Subtle floating particles / sparkle effect */}
                            <motion.div
                              animate={{
                                y: [-8, 8, -8],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="absolute top-[15%] right-[20%] w-2 h-2 rounded-full"
                              style={{ background: item.accentColor }}
                            />
                            <motion.div
                              animate={{
                                y: [6, -6, 6],
                                opacity: [0.2, 0.5, 0.2],
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                              }}
                              className="absolute bottom-[25%] left-[15%] w-1.5 h-1.5 rounded-full"
                              style={{ background: item.accentColor }}
                            />
                            <motion.div
                              animate={{
                                y: [-5, 10, -5],
                                x: [-3, 3, -3],
                                opacity: [0.2, 0.4, 0.2],
                              }}
                              transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5,
                              }}
                              className="absolute top-[30%] left-[25%] w-1 h-1 rounded-full"
                              style={{ background: item.accentColor }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons — minimal, translucent */}
          <button
            onClick={scrollPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots Indicator — refined */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          {heroItems.map((item, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className="transition-all duration-500 rounded-full cursor-pointer"
              style={
                selectedIndex === index
                  ? {
                      width: 32,
                      height: 8,
                      background: `linear-gradient(135deg, ${item.accentColor}, ${item.accentColor}aa)`,
                      boxShadow: `0 0 12px ${item.accentColor}44`,
                    }
                  : {
                      width: 8,
                      height: 8,
                      background: "rgba(255,255,255,0.15)",
                    }
              }
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
