import { ModulePlaceholder } from "@/components/layout/module-placeholder"

export default async function DoctorModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module } = await params
  return <ModulePlaceholder department="Doctor" module={module} />
}
