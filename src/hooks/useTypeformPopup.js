import { useCallback } from 'react'
import { createPopup } from '@typeform/embed'

const TYPEFORM_ID = 'ntT8GKqz'

export default function useTypeformPopup() {
  const openTypeform = useCallback((hiddenFields = {}) => {
    createPopup(TYPEFORM_ID, {
      hidden: hiddenFields,
    }).open()
  }, [])

  return openTypeform
}
