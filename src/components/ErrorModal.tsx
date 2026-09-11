import { AnimatePresence, motion } from "framer-motion";

export function ErrorModal({
  open,
  explanation,
  onClose,
}: {
  open: boolean;
  explanation: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.94, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-[500px] rounded-2xl border-2 border-destructive bg-card p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-destructive">Ответ неверный</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              Ответ неверный. Ознакомьтесь с вопросом еще раз и выберите правильный вариант.
            </p>
            <p className="mt-4 rounded-xl bg-muted p-4 text-base leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Почему это важно: </span>
              {explanation}
            </p>
            <button
              autoFocus
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-destructive px-6 py-4 text-lg font-bold text-destructive-foreground transition active:scale-[0.99] hover:opacity-90"
            >
              ОК
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
