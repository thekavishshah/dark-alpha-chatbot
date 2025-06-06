/* ------------------------------------------------------------------ */
/*  Compare resources – server wrapper                                */
/* ------------------------------------------------------------------ */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import CompareClient from '@/components/compare-client';

export default async function CompareResourcesPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  /* ❗ await the promise first (fixes the Next-15 warning) */
  const { uid } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="big-container block-space-mini space-y-6">
        <Link
          href={`/admin/companies/${uid}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to company
        </Link>

        <h1 className="text-2xl font-semibold">Compare resources</h1>

        {/* client component */}
        <CompareClient companyId={uid} />
      </div>
    </div>
  );
}
