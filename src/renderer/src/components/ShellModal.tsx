import type { ReactNode } from 'react'
import { Modal } from '@heroui/react'

export function ShellModal({
  title,
  onClose,
  children,
  footer,
  className = 'sm:max-w-[400px]',
  keyboardDismissDisabled = false
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  className?: string
  keyboardDismissDisabled?: boolean
}) {
  return (
    <Modal.Backdrop
      isOpen
      isKeyboardDismissDisabled={keyboardDismissDisabled}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal.Container>
        <Modal.Dialog className={className}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>{footer}</Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
