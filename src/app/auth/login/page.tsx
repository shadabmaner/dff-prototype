import LoginClient from "./login-client"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedParams = await searchParams
  // Use callbackUrl from middleware if present, otherwise default to dashboard
  const callbackUrl = resolvedParams?.callbackUrl
  const next = typeof callbackUrl === 'string' ? callbackUrl : "/dashboard"

  return <LoginClient next={next} />
}
