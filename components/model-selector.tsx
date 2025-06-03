'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import type { Session } from 'next-auth';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

import { chatModels } from '@/lib/ai/models';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { cn } from '@/lib/utils';

export function ModelSelector({
  session,
  selectedModelId,
  className,
  ...btnProps
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  /* ── entitlement filter —────────────────────────────────────── */
  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType] ?? {
    availableChatModelIds: ['*'],
  };

  const availableChatModels = useMemo(() => {
    if (
      !availableChatModelIds ||
      availableChatModelIds.length === 0 ||
      availableChatModelIds.includes('*')
    ) {
      return chatModels;
    }
    return chatModels.filter((m) => availableChatModelIds.includes(m.id));
  }, [availableChatModelIds]);

  const selectedChatModel =
    availableChatModels.find((m) => m.id === optimisticModelId) ??
    availableChatModels[0];

  /* ── UI —────────────────────────────────────────────────────── */
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
          {...btnProps}
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      {/* 👇 Scrollable list: shows ~3-4 items, rest scrolls */}
      <DropdownMenuContent
        align="start"
        className="min-w-[300px] max-h-52 overflow-y-auto"
      >
        {availableChatModels.map((m) => (
          <DropdownMenuItem
            key={m.id}
            data-testid={`model-selector-item-${m.id}`}
            data-active={m.id === optimisticModelId}
            onSelect={() => {
              setOpen(false);
              startTransition(() => {
                setOptimisticModelId(m.id);
                saveChatModelAsCookie(m.id);
              });
            }}
            asChild
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 group/item"
            >
              <div className="flex flex-col items-start gap-1">
                <div>{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.description}
                </div>
              </div>
              <div className="opacity-0 group-data-[active=true]/item:opacity-100">
                <CheckCircleFillIcon />
              </div>
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
