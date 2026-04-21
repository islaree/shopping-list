'use client';

// react
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
// components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
  open: boolean;
  shareId: string | null;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void | Promise<void>;
};

export function ShareDialog({ open, shareId, onOpenChange, onSubmit }: Props) {
  const [disabled, setDisabled] = useState(false);

  const handleClick = () => {
    onSubmit();
  };

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
            <Button type="button" disabled={disabled} onClick={handleClick}>
              共有リンクを発行
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
