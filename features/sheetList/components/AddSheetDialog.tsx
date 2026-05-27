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
import { Label } from '@/shared/components/label';

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: (name: string) => void;
  onClose: () => void;
};

export function AddSheetDialog({ open, onOpenChange, onSubmit, onClose }: Props) {
  const [name, setName] = useState('');

  const handleClick = () => {
    onSubmit(name);
    onClose();
  };

  useEffect(() => {
    setName('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>リストを追加</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="name" className="text-neutral-600">
            リスト名
          </Label>
          <Input
            id="name"
            value={name}
            placeholder="アイテム名を入力"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" disabled={name.trim() === ''} onClick={handleClick}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
