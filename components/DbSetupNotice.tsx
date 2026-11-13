import { Database } from "lucide-react"

export function DbSetupNotice({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-6">
      <div className="w-full space-y-4 rounded-4xl border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-primary">
          <Database className="size-5" />
          <span className="font-mono text-xs tracking-wider uppercase">
            TiDB Connection Required
          </span>
        </div>
        <h1 className="font-heading text-3xl font-medium text-balance">
          Connect TiDB Cloud to launch Gazetteer
        </h1>
        <p className="text-sm text-muted-foreground">
          Add your TiDB Cloud Starter{" "}
          <code className="font-mono">DATABASE_URL</code> to{" "}
          <code className="font-mono">.env.local</code> and initialize the
          schema:
        </p>
        <pre className="overflow-x-auto rounded-2xl border bg-muted/50 p-3 font-mono text-xs">
          {`cp .env.example .env.local\nnpm run db:setup`}
        </pre>
        <p className="font-mono text-xs text-muted-foreground">{message}</p>
      </div>
    </main>
  )
}
