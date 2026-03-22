import { useEffect, ReactNode } from 'react'
import styled from 'styled-components'
import { X } from 'lucide-react'
import { Overlay, Card, IconButton } from '@/styles/ui'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widthMap = { sm: '24rem', md: '32rem', lg: '44rem' }

const ModalCard = styled(Card)<{ $size: 'sm' | 'md' | 'lg' }>`
  width: 100%;
  max-width: ${p => widthMap[p.$size]};
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid ${p => p.theme.border};
`

const ModalTitle = styled.h2`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${p => p.theme.text.primary};
  margin: 0;
`

const ModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export function Modal({ title, onClose, children, size = 'md' }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <ModalCard $size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <IconButton onClick={onClose}><X size={18} /></IconButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalCard>
    </Overlay>
  )
}
