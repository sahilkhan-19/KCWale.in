import { motion } from "framer-motion";
import HeroCarousel from "@/components/HeroCarousel";
import Categories from "@/components/Categories";
import WhyChooseUs from "@/components/WhyChooseUs";
import CustomerReviews from "@/components/CustomerReviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <HeroCarousel />
      <Categories />
      <WhyChooseUs />
      <CustomerReviews />
      <Footer />
    </motion.main>
  );
}
