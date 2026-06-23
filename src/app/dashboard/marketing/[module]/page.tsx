import { ModulePlaceholder } from "@/components/layout/module-placeholder"

export default async function MarketingModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  return <ModulePlaceholder department="Marketing" module={module} />
}
