import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Globe,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Cart", to: "/cart" },
  { label: "Orders", to: "/orders" },
];

const categories = [
  "Pizza",
  "Burgers",
  "Sandwich",
  "Momos",
  "Shakes",
  "Mojitos",
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black/40">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
                <span className="text-white font-bold text-base">KC</span>
              </div>
              <span className="text-2xl font-bold gradient-text">KCWALE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Craving something delicious? We deliver hot, fresh, and
              homemade food straight to your door. Every bite made with love.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/kcwale"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-300"
                aria-label="Instagram"
              >
                <Globe size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                aria-label="YouTube"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-orange-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Categories
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/menu?category=${cat}`}
                    className="text-sm text-muted-foreground hover:text-orange-400 transition-colors duration-200"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-orange-400 mt-0.5 shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  Kota, Rajasthan, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-orange-400 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-orange-400 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  hello@kcwale.in
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-orange-400 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  11:00 AM – 11:00 PM
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} KCWALE. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" />{" "}
            in India
          </p>
        </div>
      </div>

      {/* Extra padding for mobile bottom nav */}
      <div className="h-20 md:h-0" />
    </footer>
  );
}
