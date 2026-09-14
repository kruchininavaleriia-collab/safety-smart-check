import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminTable } from "@/components/AdminTable";
import { fetchResults } from "@/lib/results";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Админ-панель — результаты проверок по ТБ" },
      { name: "description", content: "Последние 50 результатов проверки знаний по технике безопасности." },
      { property: "og:title", content: "Админ-панель — результаты проверок по ТБ" },
      { property: "og:description", content: "Последние 50 результатов проверки знаний по ТБ." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Результаты проверок</h1>
      <p className="mt-2 text-base text-muted-foreground">Последние 50 записей.</p>
      <div className="mt-6">
        {isLoading ? (
          <p className="text-base text-muted-foreground">Загрузка…</p>
        ) : error ? (
          <p className="text-base text-destructive">Не удалось загрузить результаты.</p>
        ) : (
          <AdminTable rows={data ?? []} />
        )}
      </div>
    </main>
  );
}
