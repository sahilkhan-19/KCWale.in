import React, { useState } from "react"
import { Check } from "lucide-react"

export const GetInTouch: React.FC = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScRMJIH6sLc0Bw6_LhmIvFSRG7xZgDDB3bzEikwgNuVJyAUSw/formResponse"
    
    // Construct Form Data
    const formData = new FormData()
    formData.append("emailAddress", email)
    formData.append("entry.471414997", `${firstName} ${lastName}`.trim())
    formData.append("entry.1948342791", email)
    formData.append("entry.913847746", message)

    try {
      // Use no-cors mode to bypass CORS policy issues (Google Form submissions go through successfully)
      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      })
      
      setIsSubmitted(true)
      setFirstName("")
      setLastName("")
      setEmail("")
      setMessage("")
    } catch (err) {
      console.error("Form submission error:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full bg-[#f3f0ef] text-[#131313] py-16 md:py-24 px-6">
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Text and Contact details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-tight select-none">
              Get in &mdash; <br />
              touch with us
            </h2>
            <p className="text-neutral-600 mt-6 text-sm md:text-base leading-relaxed">
              We're here to help! Whether you have a question about our services, need assistance with your account, or want to provide feedback, our team is ready to assist you.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Email:</span>
              <a 
                href="mailto:kcwale001@gmail.com" 
                className="text-lg md:text-xl font-medium text-neutral-900 hover:text-primary transition-colors"
              >
                kcwale001@gmail.com
              </a>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Phone:</span>
              <a 
                href="tel:+919876543210" 
                className="text-lg md:text-xl font-medium text-neutral-900 hover:text-primary transition-colors"
              >
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100">
            {isSubmitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-950 mb-2">Message Sent!</h3>
                <p className="text-neutral-600 max-w-sm">
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700 block">First Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your first name..."
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700 block">Last Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your last name..."
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 block">Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Message TextArea */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 block">How can we help you?</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Enter your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:bg-white resize-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-sm font-semibold text-red-500">{error}</p>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-75 text-white font-bold py-3 pl-6 pr-3 rounded-full flex items-center gap-3 transition-all duration-200 shadow-lg shadow-black/15 group active:scale-95"
                  >
                    <span className="text-sm font-semibold tracking-wide">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </span>
                    <span className="bg-white text-neutral-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
