'use client';

import { useBoundStore } from '@/stores/useBoundStore';
import { ShoppingListModel } from '@/types/shopping-list';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Loader, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type Props = {
  sheet: ShoppingListModel;
  onClose: () => void;
};

export function SheetShareDialog({ sheet, onClose }: Props) {
  const [shareId, setShareIdState] = useState(sheet.shareId);
  const [isLoading, setIsLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const { setShareId } = useBoundStore(
    useShallow((state) => ({
      setShareId: state.setShareId,
    })),
  );

  useEffect(() => {
    setShareIdState(sheet.shareId);
  }, [sheet.shareId]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = useMemo(() => {
    if (!shareId || !origin) return '';
    return `${origin}/share/${shareId}`;
  }, [origin, shareId]);

  const handleCopy = async (url: string, shouldNotify = true) => {
    await navigator.clipboard.writeText(url);
    if (shouldNotify) {
      toast.success('共有リンクをコピーしました');
    }
  };

  const handleShare = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheet: {
            name: sheet.name,
            items: sheet.items,
            categories: sheet.categories,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('share failed');
      }

      const data = await res.json();
      setShareId(sheet.id, data.id);
      setShareIdState(data.id);

      const sharedUrl = `${window.location.origin}/share/${data.id}`;
      try {
        await handleCopy(sharedUrl, false);
        toast.success(
          shareId ? '共有リンクを再発行してコピーしました' : '共有リンクを発行してコピーしました',
        );
      } catch {
        toast.success(shareId ? '共有リンクを再発行しました' : '共有リンクを発行しました');
        toast.error('クリップボードへのコピーに失敗しました');
      }
    } catch {
      toast.error('共有リンクの発行に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="font-medium">リストを共有する</div>
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="space-y-4 px-4 py-4">
        {isLoading && <Loader className="animate-spin" />}
        <div className="space-y-2">
          <div className="text-sm text-neutral-500">
            共有リンクを発行すると、このシートの内容が `/share/[id]` で開けます。
          </div>
          {shareUrl && <Input value={shareUrl} readOnly />}
        </div>
        <div className="flex gap-2">
          {shareUrl && (
            <Button type="button" variant="outline" onClick={() => handleCopy(shareUrl)}>
              <Copy className="size-4" />
              コピー
            </Button>
          )}
          <Button type="button" onClick={handleShare} disabled={isLoading}>
            {shareUrl ? '共有リンクを再発行' : '共有リンクを発行'}
          </Button>
        </div>
      </div>
    </div>
  );
}
