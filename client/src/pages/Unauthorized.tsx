import React from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Access Denied</h1>
          <p className="text-on-surface-variant text-sm">
            You do not have the required permissions to access this page. This area is restricted to administrators only.
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
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
