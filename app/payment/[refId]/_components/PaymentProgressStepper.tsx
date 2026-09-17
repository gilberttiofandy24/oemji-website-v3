"use client";

import { Check, CreditCard, Loader2, ShoppingBag, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "complete" | "current" | "upcoming" | "error";

interface Step {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  state: StepState;
}

function buildSteps(status: string): Step[] {
  const isPaid = status !== "PENDING_PAYMENT";
  const isDone = status === "SUCCESS";
  const isFailed = status === "FAILED";
  const processingState: StepState = isFailed ? "error" : isDone ? "complete" : isPaid ? "current" : "upcoming";
  const doneState: StepState = isDone ? "complete" : "upcoming";

  return [
    {
      key: "created",
      label: "Pesanan Dibuat",
      description: "Pesanan kamu sudah dibuat",
      icon: <ShoppingBag className="size-4" />,
      state: "complete",
    },
    {
      key: "payment",
      label: "Pembayaran",
      description: "Selesaikan pembayaran kamu",
      icon: <CreditCard className="size-4" />,
      state: isPaid ? "complete" : "current",
    },
    {
      key: "processing",
      label: isFailed ? "Gagal" : "Diproses",
      description: isFailed ? "Pesanan kamu gagal diproses" : "Pesanan kamu sedang diproses",
      icon:
        processingState === "error" ? (
          <XCircle className="size-4" />
        ) : (
          <Loader2 className={cn("size-4", processingState === "current" && "animate-spin")} />
        ),
      state: processingState,
    },
    {
      key: "done",
      label: "Selesai",
      description: "Pesanan kamu berhasil dikirim",
      icon: <Check className="size-4" />,
      state: doneState,
    },
  ];
}

const PaymentProgressStepper = ({ status }: { status: string }) => {
  const steps = buildSteps(status);

  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <li key={step.key} className="flex flex-col gap-2">
          <div className="flex items-center">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                step.state === "complete" && "border-success bg-success text-success-foreground",
                step.state === "current" && "border-primary text-primary",
                step.state === "upcoming" && "border-border text-muted-foreground/50",
                step.state === "error" && "border-destructive bg-destructive text-destructive-foreground",
              )}
            >
              {step.icon}
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1",
                  step.state === "complete" ? "bg-success" : step.state === "error" ? "bg-destructive" : "bg-border",
                )}
              />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-semibold sm:text-sm",
                step.state === "upcoming"
                  ? "text-muted-foreground"
                  : step.state === "current"
                    ? "text-primary"
                    : step.state === "error"
                      ? "text-destructive"
                      : "text-foreground",
              )}
            >
              {step.label}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default PaymentProgressStepper;
