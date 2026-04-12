import type { FC } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Props = {
  title: string
  description: string
  children: React.ReactNode
}

export const AuthCard: FC<Props> = ({ title, description, children }) => (
  <div className="flex flex-col items-center gap-8 w-full max-w-md">
    <Card className="mx-auto w-full shadow-xl shadow-foreground/5 border-border/60">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
)
