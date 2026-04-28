import { notFound } from "next/navigation";

import { InquiryDetailCard } from "@/components/admin/InquiryDetailCard";
import { getInquiryById } from "@/lib/db/admin";

interface AdminInquiryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminInquiryDetailPage({
  params,
}: AdminInquiryDetailPageProps) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <InquiryDetailCard inquiry={inquiry} />
      </div>
    </section>
  );
}
