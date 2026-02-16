export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-aimed-gray-50 px-4 py-12 md:py-20 flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
