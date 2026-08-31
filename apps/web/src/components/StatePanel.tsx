import { AlertTriangle, LoaderCircle } from 'lucide-react'

export function StatePanel({
  kind,
  title,
  detail,
}: {
  kind: 'loading' | 'error' | 'empty'
  title: string
  detail?: string | undefined
}) {
  return (
    <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-violet-50 text-violet-600">
          {kind === 'loading' ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {detail ? (
          <p className="mt-2 max-w-md text-sm text-slate-500">{detail}</p>
        ) : null}
      </div>
    </div>
  )
}
