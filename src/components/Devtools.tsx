import { useEffect, useState, type ComponentType } from 'react'

export const Devtools = () => {
  const [DevtoolsComponent, setDevtoolsComponent] = useState<ComponentType<
    Record<string, never>
  > | null>(null)

  useEffect(() => {
    import('@tanstack/react-router-devtools').then((mod) => {
      setDevtoolsComponent(() => mod.TanStackRouterDevtools)
    })
  }, [])

  if (!DevtoolsComponent) return null

  return <DevtoolsComponent />
}
