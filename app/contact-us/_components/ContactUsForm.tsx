"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const phoneRegex = /^(0|62)8[0-9]{8,11}$/;

const normalizePhone = (raw: string) => (raw.startsWith("0") ? `62${raw.slice(1)}` : raw);

const contactUsSchema = z.object({
  email: z.email("Email tidak valid"),
  phone_number: z
    .string()
    .regex(phoneRegex, "Nomor WhatsApp tidak valid (contoh: 08xxx atau 628xxx)"),
  message: z.string().min(1, "Pesan wajib diisi"),
});

type ContactUsFormValues = z.infer<typeof contactUsSchema>;

async function submitContactUs(payload: ContactUsFormValues) {
  const res = await fetch("/api/contact-us", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal mengirim pesan, coba lagi.");
  return res.json();
}

const ContactUsForm = () => {
  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsSchema),
    defaultValues: { email: "", phone_number: "", message: "" },
  });

  const {
    mutate,
    isPending,
    isSuccess,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (values: ContactUsFormValues) =>
      submitContactUs({
        ...values,
        phone_number: normalizePhone(values.phone_number),
      }),
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-stretch bg-card">
        <div className="flex w-10 shrink-0 items-center justify-center bg-secondary-gradient text-primary-foreground">
          <Mail className="size-4" />
        </div>
        <div className="w-full py-2 pl-4">
          <h2 className="text-sm font-semibold">Kirim Pesan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Kami akan menghubungi kamu lewat WhatsApp
          </p>
        </div>
      </div>

      <div className="bg-card-secondary p-4">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="size-6 text-success" />
            <p className="text-sm font-medium">Pesan terkirim</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Tim kami akan menghubungi kamu lewat WhatsApp.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                resetMutation();
                form.reset();
              }}
            >
              Kirim pesan lain
            </Button>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input {...field} type="email" placeholder="kamu@email.com" />
                    {fieldState.error && (
                      <span className="text-xs text-destructive">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="phone_number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Nomor WhatsApp</label>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="08xxxxxxxxxx"
                    />
                    {fieldState.error && (
                      <span className="text-xs text-destructive">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Pesan</label>
                  <Textarea {...field} rows={4} placeholder="Ada yang bisa kami bantu?" />
                  {fieldState.error && (
                    <span className="text-xs text-destructive">{fieldState.error.message}</span>
                  )}
                </div>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-xs text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Kamu akan dihubungi lewat nomor WhatsApp ini.
              </p>
              <Button type="submit" disabled={isPending} className="shrink-0">
                {isPending ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactUsForm;
