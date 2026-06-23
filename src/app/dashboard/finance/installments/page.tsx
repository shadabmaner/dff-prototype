import InstallmentsListClient from "./installments-client"

export default async function InstallmentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedParams = await searchParams
  const patientProgramId = typeof resolvedParams?.patientProgramId === 'string' ? resolvedParams.patientProgramId : undefined

  return <InstallmentsListClient patientProgramId={patientProgramId} />
}