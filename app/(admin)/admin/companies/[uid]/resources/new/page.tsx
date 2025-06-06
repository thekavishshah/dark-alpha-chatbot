/* ------------------------------------------------------------------ */
/*  “Add Resource” – server component                                 */
/* ------------------------------------------------------------------ */

import Link               from 'next/link';
import { ArrowLeft }      from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

import NewResourceForm    from '@/components/forms/new-resource-form';
import { getCompanyNameById } from '@/lib/db/queries';

/*-------------------------------------------------------------------*/
export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  /* 1️⃣  Next 15:  params is a Promise — you MUST await it. */
  const { uid } = await params;

  /* 2️⃣  Fetch the company name (may return null)            */
  const company = await getCompanyNameById(uid);
  const companyName = company?.name ?? 'Company';   // never undefined

  /* 3️⃣  Render                                                 */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
        {/* back-link */}
        <Link
          href={`/admin/companies/${uid}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Company Details
        </Link>

        {/* main card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Add New Resource&nbsp;to&nbsp;{companyName}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* client component handles file upload / form */}
            <NewResourceForm companyId={uid} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
