/* ------------------------------------------------------------------ */
/*  View *or* Edit a resource – mode chosen with ?edit=1              */
/* ------------------------------------------------------------------ */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { eq } from 'drizzle-orm';
import { Pencil, ArrowLeft } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { db } from '@/lib/db/queries';
import { resources as tbl } from '@/lib/db/schema';

/*-------------------------------------------------------------------*/
export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: { uid: string; resourceId: string };
  searchParams: { edit?: string };
}) {
  const { uid, resourceId } = params;
  const editing = searchParams?.edit === '1';

  /* --- load ------------------------------------------------------ */
  const resource =
    (
      await db
        .select()
        .from(tbl)
        .where(eq(tbl.id, resourceId))
        .limit(1)
    )[0];

  /* If not found → back to company */
  if (!resource) redirect(`/admin/companies/${uid}`);

  /* ---------------- EDIT MODE ------------------------------------ */
  if (editing) {
    /** server-action to persist changes */
    async function save(formData: FormData) {
      'use server';
      const content = formData.get('content') as string;
      await db
        .update(tbl)
        .set({ content })
        .where(eq(tbl.id, resourceId));
      redirect(`/admin/companies/${uid}/resources/${resourceId}`);
    }

    return (
      <div className="big-container block-space-mini space-y-6">
        <Link
          href={`/admin/companies/${uid}/resources/${resourceId}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Link>

        <form action={save} className="space-y-4">
          <h1 className="text-2xl font-semibold">
            Edit “{resource.name}”
          </h1>

          <Textarea
            name="content"
            defaultValue={resource.content ?? ''}
            className="min-h-[60vh]"
          />

          <Button type="submit">Save changes</Button>
        </form>
      </div>
    );
  }

  /* ---------------- VIEW MODE ------------------------------------ */
  return (
    <div className="big-container block-space-mini space-y-6">
      <Link
        href={`/admin/companies/${uid}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to company
      </Link>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{resource.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {resource.description ?? ''}
            </p>
          </div>

          <Button
            size="icon"
            variant="outline"
            asChild
            title="Edit"
            aria-label="Edit"
          >
            <Link
              href={{
                pathname: `/admin/companies/${uid}/resources/${resourceId}`,
                query: { edit: '1' },
              }}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="prose dark:prose-invert max-w-none">
          <Markdown>{resource.content ?? ''}</Markdown>
        </CardContent>
      </Card>
    </div>
  );
}
