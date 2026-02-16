export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-aimed-gray-50 px-4 py-8 md:py-20 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-sm my-auto shrink-0">
        {children}
      </div>
    </div>
  );
}
