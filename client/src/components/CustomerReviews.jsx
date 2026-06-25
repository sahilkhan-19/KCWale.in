import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Aarav Sharma",
    avatar: "AS",
    rating: 5,
    review:
      "Absolutely the BEST chicken zinger pizza I've ever had! The crust was perfectly crispy and the chicken pieces were so flavorful. KCWALE is now my go-to for every craving!",
    timeAgo: "2 days ago",
  },
  {
    id: 2,
    name: "Priya Patel",
    avatar: "PP",
    rating: 5,
    review:
      "The BlueLagoon Mojito is a game-changer! So refreshing and beautifully presented. The momos were heavenly too. Can't stop ordering from here!",
    timeAgo: "5 days ago",
  },
  {
    id: 3,
    name: "Rohit Verma",
    avatar: "RV",
    rating: 4,
    review:
      "Tried the Chicken Zinger Burger and it was massive! Juicy chicken, great sauce. The quality is genuinely premium. Delivery was fast too!",
    timeAgo: "1 week ago",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    avatar: "SG",
    rating: 5,
    review:
      "Love that everything is Halal certified and freshly made. The fried momos with that spicy chutney are addictive! My whole family orders from KCWALE now.",
    timeAgo: "2 weeks ago",
  },
  {
    id: 5,
    name: "Kabir Khan",
    avatar: "KK",
    rating: 5,
    review:
      "KCWALE's food tastes like it's made with love! The pasta is creamy perfection and the shakes are thick and rich. Highly recommend to everyone!",
    timeAgo: "3 weeks ago",
  },
  {
    id: 6,
    name: "Ananya Reddy",
    avatar: "AR",
    rating: 4,
    review:
      "The wraps are underrated! Super filling and packed with flavor. Also tried their fries — crispy golden perfection. Will definitely order again!",
    timeAgo: "1 month ago",
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= rating
              ? "fill-orange-400 text-orange-400"
              : "fill-none text-white/20"
          }
        />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 2 },
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-500/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[2px] w-8 gradient-orange rounded-full" />
              <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              What our <span className="gradient-text">cravers</span> say:
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Real reviews from real food lovers
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 mt-6 md:mt-0">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Review Cards Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-5">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
              >
                <div className="group h-full rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-orange-500/20 hover:bg-white/[0.04]">
                  {/* Quote icon */}
                  <Quote
                    size={24}
                    className="text-orange-500/20 mb-4 group-hover:text-orange-500/40 transition-colors"
                  />

                  {/* Review text */}
                  <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-4">
                    &ldquo;{review.review}&rdquo;
                  </p>

                  {/* Rating */}
                  <div className="mb-4">
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Reviewer info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {review.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {review.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.timeAgo}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
