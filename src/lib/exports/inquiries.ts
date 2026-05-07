import "server-only";

import { getAllInquiries } from "@/lib/db/admin";
import { serializeCsv, type CsvColumnDefinition } from "@/lib/exports/csv";

interface InquiryExportRow {
  id: string;
  type: string;
  status: string;
  priority: string;
  name: string;
  email: string;
  phone: string;
  productSlug: string;
  itemType: string;
  message: string;
  operationalTags: string;
  userIntentLevel: string;
  recommendationEligible: boolean;
  createdAt: string;
  lastAutomatedAt: string;
  userName: string;
  userEmail: string;
}

const inquiryExportColumns: CsvColumnDefinition<InquiryExportRow>[] = [
  { key: "id", label: "ID" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "productSlug", label: "Product Slug" },
  { key: "itemType", label: "Item Type" },
  { key: "message", label: "Message" },
  { key: "operationalTags", label: "Operational Tags" },
  { key: "userIntentLevel", label: "User Intent Level" },
  { key: "recommendationEligible", label: "Recommendation Eligible" },
  { key: "createdAt", label: "Created At" },
  { key: "lastAutomatedAt", label: "Last Automated At" },
  { key: "userName", label: "User Name" },
  { key: "userEmail", label: "User Email" },
];

export async function getInquiryExportRows(): Promise<InquiryExportRow[]> {
  const inquiries = await getAllInquiries();

  return inquiries.map((inquiry) => ({
    id: inquiry.id,
    type: inquiry.type,
    status: inquiry.status,
    priority: inquiry.priority,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone ?? "",
    productSlug: inquiry.productSlug ?? "",
    itemType: inquiry.itemType ?? "",
    message: inquiry.message,
    operationalTags: inquiry.operationalTags.join("|"),
    userIntentLevel: inquiry.userIntentLevel ?? "",
    recommendationEligible: Boolean(inquiry.recommendationEligible),
    createdAt: inquiry.createdAt.toISOString(),
    lastAutomatedAt: inquiry.lastAutomatedAt?.toISOString() ?? "",
    userName: inquiry.userName ?? "",
    userEmail: inquiry.userEmail ?? "",
  }));
}

export async function buildInquiryExportCsv() {
  return serializeCsv(inquiryExportColumns, await getInquiryExportRows());
}
