"use client";

import { CrudListPage } from "@/components/admin/crud-list-page";

export default function Page() {
  return (
    <CrudListPage
      title="Brands"
      description="Product brands"
      endpoint="/brands"
      searchPlaceholder="Search brands..."
    />
  );
}
