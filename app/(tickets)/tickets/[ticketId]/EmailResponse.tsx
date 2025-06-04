'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { db, ticket } from '@/lib/db';
import { eq } from 'drizzle-orm';

import { AIDraftButton } from '@/components/ai-draft-button';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------ */
/*  Load ticket on the server side (RSC)                        */
/* ------------------------------------------------------------ */
async function getTicket(id: string) {
  return db
    .select({
      id: ticket.id,
      title: ticket.title,
      createdAt: ticket.createdAt,
    })
    .from(ticket)
    .where(eq(ticket.id, id))
    .limit(1)
    .then((rows) => rows[0]);
}

/* ------------------------------------------------------------ */
/*  Page Component                                              */
/* ------------------------------------------------------------ */
export default function EmailResponsePage({
  params,
}: {
  params: { id: string };
}) {
  const t = use(getTicket(params.id));
  if (!t) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Header ------------------------------------------------ */}
      <h1 className="text-2xl font-semibold">Send Email Response</h1>
      <p className="text-muted-foreground">
        Compose an email response that will be sent to the requester.
      </p>

      {/* Basic fields ----------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            defaultValue="support@yourcompany.com"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            defaultValue="(recipient email)"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          defaultValue={`Re: ${t.title}`}
        />
      </div>

      {/* ✦  AI Draft Button + Textarea ------------------------ */}
      <AIDraftButton ticketId={t.id} />

      {/* Existing action buttons (send / save) ---------------- */}
      <div className="mt-6 flex gap-3">
        <Button variant="default">Send Email & Close Ticket</Button>
        <Button variant="outline">Save Draft</Button>
        <Button variant="secondary">Send Email Only</Button>
      </div>
    </div>
  );
}
