interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="flex h-[72px] items-center justify-between border-b border-aimed-gray-200 bg-aimed-white px-8">
      <div>
        <h1 className="text-xl font-semibold text-aimed-black">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-aimed-gray-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
