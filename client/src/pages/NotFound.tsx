import React from "react"
import { useNavigate } from "react-router-dom"
import { Compass, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
          <Compass className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">404</h1>
          <h2 className="text-xl font-bold text-on-surface">Page Not Found</h2>
          <p className="text-on-surface-variant text-sm">
            Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border-border text-on-surface hover:bg-surface-variant"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/95 text-primary-foreground"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
