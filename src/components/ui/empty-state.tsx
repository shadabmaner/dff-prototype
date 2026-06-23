import { LucideIcon, Apple } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Apple,
  title,
  description,
  buttonText,
  onButtonClick,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`border-slate-200 shadow-sm mt-6 ${className}`}>
      <CardContent className="p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Icon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
          {buttonText && onButtonClick && (
            <Button
              onClick={onButtonClick}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {buttonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
