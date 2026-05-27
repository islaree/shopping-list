'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Button } from '@/shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Input } from '@/shared/components/input';

type Props = {
  open: boolean;
  shareId: string | null;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void | Promise<void>;
};

export function ShareDialog({ open, shareId, onOpenChange, onSubmit }: Props) {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (shareId) setDisabled(true);
  }, [shareId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>リストを共有する</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-2">
          {shareId && <Input value={`${window.location.origin}/share/${shareId}`} readOnly />}
        </div>
        <DialogFooter>
          {shareId ? (
            <Button type="button">共有するリストを更新</Button>
          ) : (
            <Button type="button" disabled={disabled} onClick={onSubmit}>
              共有リンクを発行
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
