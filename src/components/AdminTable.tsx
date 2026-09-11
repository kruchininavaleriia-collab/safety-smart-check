import { useState } from "react";
import type { ResultRow } from "@/lib/results";

const STATUS_LABEL: Record<string, string> = {
  passed: "Пройдено",
  failed: "Провалено",
  timeout: "Таймаут",
};

export function AdminTable({ rows }: { rows: ResultRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-base text-muted-foreground">Записей пока нет.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Дата/Время (ISO)</th>
            <th className="px-4 py-3 font-semibold">Табельный номер</th>
            <th className="px-4 py-3 font-semibold">Результат</th>
            <th className="px-4 py-3 font-semibold">Балл</th>
            <th className="px-4 py-3 font-semibold">Подробнее</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <>
              <tr key={row.id} className="border-t border-border align-top">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{row.created_at}</td>
                <td className="px-4 py-3 text-foreground">{row.employee_id}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.status === "passed"
                        ? "font-semibold text-success"
                        : "font-semibold text-destructive"
                    }
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {row.score_correct}/{row.score_total}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="font-semibold text-primary underline underline-offset-4"
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  >
                    Подробнее
                  </button>
                </td>
              </tr>
              {expanded === row.id ? (
                <tr key={`${row.id}-details`} className="border-t border-border bg-muted/50">
                  <td colSpan={5} className="px-4 py-3 text-foreground">
                    <p className="text-sm">
                      Длительность: {row.duration_sec} сек. Вопросы с ошибками:
                    </p>
                    {row.failed_questions.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {row.failed_questions.map((qid) => (
                          <li
                            key={qid}
                            className="rounded-md bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive"
                          >
                            {qid}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">Ошибок не было.</p>
                    )}
                  </td>
                </tr>
              ) : null}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
