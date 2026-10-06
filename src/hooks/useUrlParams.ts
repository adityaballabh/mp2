import { useSearchParams } from 'react-router-dom'

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Drop params at their default, and replace so edits don't pile up in history
  function setParam(name: string, value: string, defaultValue: string) {
    setSearchParams(
      (params) => {
        if (value === defaultValue) params.delete(name)
        else params.set(name, value)
        return params
      },
      { replace: true },
    )
  }

  return { searchParams, setParam }
}
