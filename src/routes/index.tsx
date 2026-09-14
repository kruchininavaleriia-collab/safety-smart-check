import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Проверка знаний по технике безопасности" },
      {
        name: "description",
        content:
          "Онлайн-самопроверка знаний по технике безопасности: 10 вопросов за 5 минут, результат сразу уходит руководителю.",
      },
      { property: "og:title", content: "Проверка знаний по технике безопасности" },
      {
        property: "og:description",
        content: "10 вопросов за 5 минут — подтвердите знание инструктажа по охране труда.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col justify-center px-4 py-10">
      <WelcomeScreen />
    </main>
  );
}
