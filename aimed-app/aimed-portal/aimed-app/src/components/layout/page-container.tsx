interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="min-h-dvh pt-[72px] pb-safe lg:pt-0 lg:ml-60 overflow-y-auto">
      {children}
    </main>
  );
}
