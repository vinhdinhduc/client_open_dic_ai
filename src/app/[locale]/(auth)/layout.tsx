export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages (login, register) không có Header và Footer
  return <>{children}</>;
}
