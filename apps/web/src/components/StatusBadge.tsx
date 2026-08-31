import type { JokeStatus } from '@punchline-hq/api-client'
import { Badge } from '@punchline-hq/ui/components/badge'

const styles: Record<JokeStatus, string> = {
  draft: 'border-amber-200 bg-amber-50 text-amber-700',
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  archived: 'border-slate-200 bg-slate-100 text-slate-500',
}

export function StatusBadge({ status }: { status: JokeStatus }) {
  return <Badge className={styles[status]}>{status}</Badge>
}
