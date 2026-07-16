"use client";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

export function DataTable({columns, data, empty = "No records", renderExpandedRow}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={cn("h-10 px-3 text-left font-medium text-muted-foreground whitespace-nowrap", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <Fragment key={ri}>
                  <tr className={cn("border-b last:border-0 hover:bg-muted/40", renderExpandedRow?.(row) ? "border-b-0 border-l-4 border-l-[#E53935]" : "")}>
                    {columns.map((c, ci) => (
                      <td key={ci} className={cn("p-3", c.className)}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && renderExpandedRow(row) && (
                    <tr className="border-b border-l-4 border-l-[#E53935] bg-slate-50/50">
                      <td colSpan={columns.length} className="p-0">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
