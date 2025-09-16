import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary/10 text-primary-foreground hover:bg-primary/20 border-primary/20",
				secondary:
					"border-transparent bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border-secondary/20",
				destructive:
					"border-transparent bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20",
				outline: "text-foreground border-border hover:bg-muted/50",
				success: "border-transparent bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20",
				warning: "border-transparent bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

function Badge({
	className,
	variant,
	...props
}) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
