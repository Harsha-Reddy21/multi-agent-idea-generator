export interface EnhancedAIRegistryFormProps {
  isOpen: boolean
  onClose: () => void
  submissionId: string
  aiRegistryFormId?: string
  onSuccess?: () => void | Promise<void>
}
