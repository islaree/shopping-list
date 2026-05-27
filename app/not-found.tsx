import Link from 'next/link';

import { Button } from '@/shared/components/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-neutral-500">404</div>
        <h1 className="mt-2 text-2xl font-bold">ページが見つかりません</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          お探しのページは移動したか、削除された可能性があります。
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/sheets">シート一覧へ</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">ホームへ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
