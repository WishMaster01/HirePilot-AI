import { useEffect, useState } from 'react'

export function useFetch(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) setLoading(true)
      })
      .then(() => fetcher())
      .then((result) => active && setData(result?.data ?? result))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [fetcher])

  return { data, loading, error }
}
