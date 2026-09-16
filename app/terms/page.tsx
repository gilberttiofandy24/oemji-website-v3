import type { Metadata } from "next";
import { getPublicTerms } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const { data } = await getPublicTerms();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Syarat dan Ketentuan</h1>
      <div
        className="mt-8 text-sm text-muted-foreground [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}
