import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  PlusCircle,
  ExternalLink,
  Calendar,
  Building2,
  MessageCircle,
  SlidersHorizontal,
} from "lucide-react";

import {
  getCompanyById,
  getResourcesByCompanyId,
} from "@/lib/db/queries";
import DeleteCompanyButton from "./delete-company-button";
import ResourceCard from "./resource-card";

/* ------------------------------------------------------------------ */
export default async function CompanyDetail({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  /* Next 15: params is a Promise */
  const { uid } = await params;

  const company   = await getCompanyById(uid);
  const resources = await getResourcesByCompanyId(uid);

  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        {/* Back */}
        <Link
          href="/admin/companies"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>

        {/* Heading row ------------------------------------------------ */}
        <div className="space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {company.name}
                  </h1>
                  <Badge variant="secondary">{company.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created {company.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Link href={`/admin/companies/${company.id}/questions`}>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4" />
                Questions
              </Button>
            </Link>

            <div className="flex gap-2">
              <Link href={`/admin/companies/${company.id}/edit`}>
                <Button variant="outline">Edit Company</Button>
              </Link>
              <DeleteCompanyButton companyId={company.id} />
            </div>
          </header>

          {/* Tabs ------------------------------------------------------ */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview ------------------------------------------------ */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {company.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      {/* website */}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground font-medium">
                          Website
                        </dt>
                        <dd>
                          <a
                            href={company.website ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:underline inline-flex items-center gap-1"
                          >
                            {company.website ?? "-"}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                      </div>

                      {/* contact */}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground font-medium">
                          Contact
                        </dt>
                        <dd>
                          <a
                            href={`mailto:${company.email}`}
                            className="text-foreground hover:underline"
                          >
                            {company.email}
                          </a>
                        </dd>
                      </div>

                      {/* created / updated */}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground font-medium">
                          Created
                        </dt>
                        <dd className="text-foreground">
                          {company.createdAt.toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground font-medium">
                          Updated
                        </dt>
                        <dd className="text-foreground">
                          {company.updatedAt.toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Resources ------------------------------------------------ */}
            <TabsContent value="resources" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  Resources
                </h2>

                <div className="flex gap-3">
                  <Link
                    href={`/admin/companies/${company.id}/resources/compare`}
                    className="inline-flex items-center gap-2"
                  >
                    <Button variant="outline">
                      <SlidersHorizontal className="h-4 w-4" />
                      Compare
                    </Button>
                  </Link>

                  <Link
                    href={`/admin/companies/${company.id}/resources/new`}
                    className="inline-flex items-center gap-2"
                  >
                    <Button>
                      <PlusCircle className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resourceId={r.id}
                    resourceName={r.name}
                    resourceDescription={r.description ?? ""}
                    resourceKind={r.kind}
                    companyId={company.id}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Activity ------------------------------------------------- */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Activity log will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
