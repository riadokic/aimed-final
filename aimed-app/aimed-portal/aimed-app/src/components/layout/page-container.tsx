interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="min-h-screen pt-[72px] lg:pt-0 lg:ml-60">
      {children}
    </main>
  );
}
