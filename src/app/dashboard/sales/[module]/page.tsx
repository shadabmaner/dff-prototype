import { ModulePlaceholder } from "@/components/layout/module-placeholder"

export default async function SalesModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  return <ModulePlaceholder department="Sales" module={module} />
}
