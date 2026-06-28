import React from "react"
import { Link } from "react-router-dom"

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0a0c] text-white border-t border-white/[0.03] pt-16 pb-24 md:pb-12 px-6">
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-6">
          
          {/* Left side: Logo & Branding */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="KC Wale Logo"
                className="w-10 h-10 object-contain rounded-lg bg-white"
              />
              <span className="font-headline text-lg font-light tracking-[0.2em] text-white uppercase select-none">
                KC WALE
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-4 max-w-xs leading-relaxed">
              Premium Cloud Kitchen serving delicious, fresh food right to your doorstep. Satisfy your cravings with our curated culinary delights.
            </p>
          </div>

          {/* Right side: Links columns */}
          <div className="flex flex-col sm:flex-row gap-12 md:gap-24 w-full md:w-auto">
            {/* USEFUL Column */}
            <div className="min-w-[160px]">
              <h3 className="text-[10px] tracking-[0.2em] font-semibold text-neutral-500 uppercase mb-4">
                USEFUL
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Link 
                  to="/" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
                <Link 
                  to="/orders" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Orders
                </Link>
                <Link 
                  to="/menu" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Menu
                </Link>
                <Link 
                  to="/cart" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Cart
                </Link>
              </div>
            </div>

            {/* SOCIAL Column */}
            <div className="min-w-[160px]">
              <h3 className="text-[10px] tracking-[0.2em] font-semibold text-neutral-500 uppercase mb-4">
                SOCIAL
              </h3>
              <div className="flex flex-col gap-y-3">
                <a 
                  href="https://www.instagram.com/cafe_night_with_kcwale?igsh=bGt2Z2FvaDYzdHBl" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Instagram
                </a>
                <a 
                  href="mailto:kcwale001@gmail.com" 
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Email
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Thin divider */}
        <div className="w-full border-t border-neutral-800/40 my-8 md:my-12"></div>

        {/* Large logo at bottom */}
        <div className="w-full overflow-hidden select-none">
          <h1 className="flex items-start text-[14vw] font-black text-[#17171a] tracking-tighter uppercase leading-none select-none">
            <span>KCWALE</span>
            <span className="text-[6vw] font-light mt-[0.5vw] ml-2">©</span>
          </h1>
        </div>
      </div>
    </footer>
  )
}
