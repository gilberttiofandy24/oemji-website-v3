import type { Metadata } from "next";
import ContactChannels from "./_components/ContactChannels";
import ContactUsForm from "./_components/ContactUsForm";

export const metadata: Metadata = {
  title: "Contact Us",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <div className="bg-background mt-15">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <h1 className="text-xl font-semibold">Hubungi Kami</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kirim pesan lewat form, atau chat langsung di bawah.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="order-2 md:order-1 md:col-span-2">
            <ContactUsForm />
          </div>
          <div className="order-1 md:order-2">
            <ContactChannels />
          </div>
        </div>
      </div>
    </div>
  );
}
