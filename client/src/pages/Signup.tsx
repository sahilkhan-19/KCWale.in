import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { useGoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignupFormValues = z.infer<typeof signupSchema>

export const Signup: React.FC = () => {
  const { signup, sendOtp, googleAuth } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [otp, setOtp] = useState("")

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  const onInitialSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await sendOtp(data.email)
      toast.success("OTP sent to your email")
      setStep(2)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    try {
      const data = getValues()
      await signup(data.name, data.email, data.password, data.phone, otp)
      toast.success("Account created successfully!")
      navigate("/")
    } catch (err: any) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleSubmitting(true)
      setError(null)
      try {
        await googleAuth(tokenResponse.access_token)
        toast.success("Logged in with Google")
        navigate("/")
      } catch (err: any) {
        setError(err)
      } finally {
        setIsGoogleSubmitting(false)
      }
    },
    onError: () => {
      setError("Google Sign-In failed.")
    }
  })

  return (
    <div className="h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] z-10"></div>
        <img
          className="w-full h-full object-cover scale-105"
          src="/auth-bg.jpg"
          alt="KC Wale Gourmet Background"
        />
      </div>

      {/* Centered Glassmorphic Authentication Card */}
      <div className="relative z-10 w-full max-w-sm my-auto">
        <Card className="w-full bg-[#18181c]/65 backdrop-blur-xl border border-white/[0.08] text-white shadow-2xl p-4 md:p-5 rounded-[2rem]">
          <CardHeader className="space-y-0.5 text-center pb-1 relative">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="absolute left-0 top-1 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <img
              src="/logo.png"
              alt="KC Wale Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-sm shadow-black/10 border border-white/10 bg-white mx-auto mb-1.5"
            />
            <CardTitle className="font-sans text-2xl font-extrabold tracking-tight text-white">
              {step === 1 ? "Create Account" : "Verify Email"}
            </CardTitle>
            <CardDescription className="text-neutral-400 text-[11px] mt-0.5">
              {step === 1 
                ? "Sign up to get fresh premium meals delivered hot." 
                : "Enter the 6-digit OTP sent to your email."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2.5 pb-1 mt-2">
            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}
            
            {step === 1 ? (
              <form onSubmit={handleSubmit(onInitialSubmit)} className="space-y-2.5">
                {/* Full Name */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Alex Johnson"
                    {...register("name")}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-neutral-500 rounded-xl py-2 text-xs backdrop-blur-sm h-9"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-500 font-medium ml-1 mt-0.5">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-neutral-500 rounded-xl py-2 text-xs backdrop-blur-sm h-9"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 font-medium ml-1 mt-0.5">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Phone Number</label>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all backdrop-blur-sm h-9">
                    <span className="pl-4 text-xs text-neutral-500 font-medium">+91</span>
                    <input
                      type="tel"
                      placeholder=""
                      {...register("phone")}
                      className="w-full px-2 py-1.5 bg-transparent border-none text-white focus:ring-0 outline-none text-xs placeholder:text-neutral-500"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-500 font-medium ml-1 mt-0.5">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-neutral-500 rounded-xl py-2 text-xs pr-10 backdrop-blur-sm h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500 font-medium ml-1 mt-0.5">{errors.password.message}</p>
                  )}
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-3 h-9"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 ml-1 uppercase tracking-wider">6-Digit OTP</label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-neutral-500 rounded-xl py-4 text-center tracking-[0.5em] text-lg backdrop-blur-sm h-12"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer h-10 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>
              </form>
            )}

            {step === 1 && (
              <>
                {/* Divider */}
                <div className="relative flex py-0.5 items-center my-2">
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                  <span className="flex-shrink mx-4 text-neutral-500 text-[10px] font-semibold uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || isGoogleSubmitting}
                  onClick={() => googleLoginAction()}
                  className="w-full bg-black/40 hover:bg-black/60 text-white border border-white/10 font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer h-9"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-1 text-center text-xs text-neutral-500 border-t border-white/[0.04] pt-2 pb-0 mt-2">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

    </div>
  )
}
