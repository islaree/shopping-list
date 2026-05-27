type Props = {
  title: string;
  description?: string;
};

export function SheetListTitle({ title, description }: Props) {
  return (
    <div className="px-4">
      <div className="text-[13px] text-neutral-400">{title}</div>
      {description ? <div className="mt-2 text-sm text-neutral-500">{description}</div> : null}
    </div>
  );
}
