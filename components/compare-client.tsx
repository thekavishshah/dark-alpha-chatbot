'use client';

import { useEffect, useState } from 'react';
import { useSession }          from 'next-auth/react';
import { toast }               from 'sonner';
import {
  ImageIcon,
  FileText,
  Loader2,
} from 'lucide-react';

import { Button }        from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet';
import { Textarea }      from '@/components/ui/textarea';
import { ModelSelector } from '@/components/model-selector';

/* ------------------------------------------------------------- */
type Resource = { id: string; name: string; kind: string };

/* Helper – read the model id cookie written by ModelSelector */
function getCurrentModelId(): string {
  if (typeof document === 'undefined') return 'gpt-4o';
  const m = document.cookie.match(/chatModelId=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : 'gpt-4o';
}

/* ------------------------------------------------------------- */
export default function CompareClient({ companyId }: { companyId: string }) {
  const { data: session } = useSession();          // may be null initially

  const [resources, setResources] = useState<Resource[]>([]);
  const [picked,    setPicked]    = useState<Set<string>>(new Set());

  const [question,  setQuestion]  = useState('');
  const [answer,    setAnswer]    = useState('');
  const [loading,   setLoading]   = useState(false);

  /* fetch resource list once ----------------------------------- */
  useEffect(() => {
    fetch(`/api/company/${companyId}/resources`)
      .then(r => r.json())
      .then(setResources)
      .catch(() => toast.error('Failed to load resources'));
  }, [companyId]);

  /* toggle helper ---------------------------------------------- */
  const toggle = (id: string) =>
    setPicked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ask the AI backend ----------------------------------------- */
  const askAI = async () => {
    if (!picked.size) {
      toast.warning('Select at least one resource');
      return;
    }
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch('/api/ai-compare', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          resourceIds: Array.from(picked),
          question,
          modelId   : getCurrentModelId(),
        }),
      }).then(r => r.json());

      setAnswer(res.answer ?? '(no answer)');
    } catch {
      toast.error('AI request failed');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* resource cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {resources.map(r => (
          <label
            key={r.id}
            className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-colors
                        ${picked.has(r.id) ? 'border-primary bg-primary/5' : ''}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={picked.has(r.id)}
              onChange={() => toggle(r.id)}
            />
            <span className="h-8 w-8 flex items-center justify-center rounded bg-muted">
              {r.kind === 'image' ? <ImageIcon className="h-4 w-4" />
                                  : <FileText  className="h-4 w-4" />}
            </span>
            <span className="truncate">{r.name}</span>
          </label>
        ))}
      </div>

      {/* sheet with Q&A */}
      <Sheet>
        <SheetTrigger asChild>
          <Button disabled={!picked.size}>Ask AI about selected</Button>
        </SheetTrigger>

        <SheetContent className="p-6 space-y-4 w-full sm:max-w-lg">
          <h2 className="font-semibold text-lg">AI comparison</h2>

          {/* model picker appears once session is ready */}
          {session && (
            <ModelSelector
              session={session!}
              selectedModelId={getCurrentModelId()}
              className="max-w-xs"
            />
          )}

          <Textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask a question comparing the docs…"
          />

          <Button onClick={askAI} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate answer'}
          </Button>

          {answer && (
            <pre className="mt-4 p-4 bg-muted rounded max-h-[40vh] overflow-auto whitespace-pre-wrap text-sm">
              {answer}
            </pre>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
