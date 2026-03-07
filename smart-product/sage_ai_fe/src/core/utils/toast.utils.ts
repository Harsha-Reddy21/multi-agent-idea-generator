interface ShowToastParams {
  addToast: (toast: {
    toastMessage: string | React.ReactElement
    variant: 'success' | 'error' | 'warning' | 'info'
    position: 'top' | 'bottom'
    align: 'left' | 'center' | 'right'
    dismissible: boolean
    timeout: number
    autoDismiss: boolean
  }) => void
  message: string | React.ReactElement
  variant?: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export const showToast = ({
  addToast,
  message,
  variant = 'success',
  timeout = 6000,
}: ShowToastParams) => {
  addToast({
    toastMessage: message,
    variant,
    position: 'top',
    align: 'center',
    dismissible: true,
    timeout,
    autoDismiss: true,
  })
}
