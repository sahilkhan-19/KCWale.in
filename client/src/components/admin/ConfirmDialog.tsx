import React from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  variant?: "danger" | "default"
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  onConfirm,
  isLoading = false,
  variant = "danger",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-container border-outline-variant/30 text-on-surface max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <div className="p-2 rounded-full bg-error/10">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
            )}
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-on-surface-variant text-sm mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
