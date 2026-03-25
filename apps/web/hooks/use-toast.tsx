'use client'

import { toast as sonnerToast } from 'sonner'

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

function toast({ title, description, action }: ToastProps) {
  return sonnerToast(title as string, {
    description,
    action,
  })
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}

export { useToast, toast }