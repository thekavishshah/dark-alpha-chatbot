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
import { chatModels } from '@/lib/ai/models';

export function AIAnswerButton({
  companyId,
  questionId,
  targetId = 'answerBox',
  instructionsId = 'customInstructions',
}: {
  companyId: string;
  questionId: string;
  /** id of the textarea that will receive the draft */
  targetId?: string;
  /** id of the input holding optional custom instructions */
  instructionsId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [modelId, setModelId] = useState('chat-model');

  async function handleClick() {
    try {
      setLoading(true);

      const instructionsInput = document.getElementById(
        instructionsId,
      ) as HTMLInputElement | HTMLTextAreaElement | null;

      const res = await fetch(
        `/api/companies/${companyId}/questions/${questionId}/ai-answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId,
            instructions: instructionsInput?.value ?? '',
          }),
        },
      ).then((r) => r.json());

      const textarea = document.getElementById(
        targetId,
      ) as HTMLTextAreaElement | null;

      if (textarea) {
        textarea.value = res.draft.trim();
        textarea.focus();
      } else {
        alert(`Could not find textarea with id "${targetId}".`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
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

      <Button onClick={handleClick} variant="secondary" type="button">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          '✦ Generate Answer'
        )}
      </Button>
    </div>
  );
}
