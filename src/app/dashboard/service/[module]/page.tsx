import { ModulePlaceholder } from "@/components/layout/module-placeholder"

export default async function ServiceModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  return <ModulePlaceholder department="Service" module={module} />
}
