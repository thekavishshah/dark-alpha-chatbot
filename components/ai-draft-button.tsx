'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { chatModels } from '@/lib/ai/models';      // ← list used in the main dropdown

export function AIDraftButton({
  ticketId,
  targetId = 'emailResponse',
}: {
  ticketId: string;
  targetId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [modelId, setModelId] = useState('chat-model'); // GPT-4o (Omni)

  async function handleClick() {
    try {
      setLoading(true);

      const { draft } = await fetch(`/api/tickets/${ticketId}/ai-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      }).then((r) => r.json());

      const textarea = document.getElementById(
        targetId,
      ) as HTMLTextAreaElement | null;

      if (textarea) {
        textarea.value = draft.trim();
        textarea.focus();
      } else {
        alert(`Could not find textarea with id "${targetId}".`);
      }
    } catch (err) {
      console.error(err);
      alert('🤖  Draft generation failed. See console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Model selector */}
      <Select value={modelId} onValueChange={setModelId}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Choose model" />
        </SelectTrigger>
        <SelectContent>
          {chatModels.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AI button */}
      <Button type="button" variant="secondary" onClick={handleClick}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          '✦ AI Suggest Reply'
        )}
      </Button>
    </div>
  );
}
