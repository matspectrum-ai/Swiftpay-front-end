import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-primary/12 text-primary border-primary/20 dark:bg-primary/10 dark:border-primary/25",
        secondary:
          "bg-muted text-muted-foreground border-transparent",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/12 dark:border-destructive/25",
        warning:
          "bg-warning/10 text-warning border-warning/20 dark:bg-warning/12 dark:border-warning/25",
        success:
          "bg-success/10 text-success border-success/20 dark:bg-success/12 dark:border-success/25",
        outline:
          "border-border text-foreground bg-transparent",
        ghost:
          "border-transparent bg-muted text-muted-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
