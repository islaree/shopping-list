const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-[#FAFAFA] pb-20"
      role="status"
      aria-label="シート詳細を読み込み中"
    >
      <div className="flex h-14 items-center gap-x-2 px-4" aria-hidden="true">
        <div className="size-5 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="px-4" aria-hidden="true">
        <div className="divide-y divide-[#F6F6F6] overflow-hidden rounded-[12px] border border-[#F6F6F6]">
          {skeletonRows.map((index) => (
            <div key={index} className="flex h-14 items-center gap-x-2 bg-white px-4">
              <div className="size-5 animate-pulse rounded-[6px] bg-neutral-100" />
              <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">読み込み中</span>
    </div>
  );
}
