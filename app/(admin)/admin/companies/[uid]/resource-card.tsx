"use client";

import React, { startTransition } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FileText, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { deleteResource } from "@/lib/actions/delete-resource";

/* ------------------------------------------------------------------ */
/*  Resource card with working View / Edit links                      */
/* ------------------------------------------------------------------ */
export default function ResourceCard({
  resourceId,
  resourceName,
  resourceDescription,
  resourceKind,
  companyId,
}: {
  resourceId: string;
  resourceName: string;
  resourceDescription: string | null;
  resourceKind: string;
  companyId: string;
}) {
  /* build the two destinations once */
  const viewHref = `/admin/companies/${companyId}/resources/${resourceId}`;
  const editHref = {
    pathname: viewHref,
    query: { edit: "1" },
  } as const;

  /* choose icon */
  const Icon =
    resourceKind === "jpg" ||
    resourceKind === "jpeg" ||
    resourceKind === "png" ||
    resourceKind === "gif" ||
    resourceKind === "webp" ||
    resourceKind === "image"
      ? ImageIcon
      : FileText;

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        {/* header row */}
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>

          {/* ░░░ menu ░░░ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* -- view ------------------------------------------------ */}
              <DropdownMenuItem asChild inset>
                <Link href={viewHref}>View</Link>
              </DropdownMenuItem>

              {/* -- edit ------------------------------------------------ */}
              <DropdownMenuItem asChild inset>
                <Link href={editHref}>Edit</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />


              {/* -- delete ---------------------------------------------- */}
              <DropdownMenuItem
                inset
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  deleteResource(resourceId, companyId).then((res) =>
                    res.success
                      ? toast.success(res.message)
                      : toast.error(res.message),
                  );
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* body */}
        <h4 className="font-semibold mb-2">{resourceName}</h4>
        {resourceDescription && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-2 line-clamp-2">
            {resourceDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
