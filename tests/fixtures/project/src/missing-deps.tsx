import { useEffect } from 'react'

export function Logger({ value }: { value: string }) {
  useEffect(() => {
    console.log(value)
  }, [])
  return null
}
