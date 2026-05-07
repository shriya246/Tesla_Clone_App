import "server-only";

export interface CsvColumnDefinition<TRecord extends object> {
  key: Extract<keyof TRecord, string>;
  label: string;
}

function normalizeCsvValue(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value);
}

export function escapeCsvValue(value: unknown) {
  const normalized = normalizeCsvValue(value).replace(/\r\n/g, "\n");

  if (/["\n,]/.test(normalized)) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
}

export function serializeCsv<TRecord extends object>(
  columns: CsvColumnDefinition<TRecord>[],
  rows: TRecord[],
) {
  const headerRow = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}
