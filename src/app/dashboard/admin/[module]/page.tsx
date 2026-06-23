import { ModulePlaceholder } from "@/components/layout/module-placeholder"

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  return <ModulePlaceholder department="Admin" module={module} />
}
