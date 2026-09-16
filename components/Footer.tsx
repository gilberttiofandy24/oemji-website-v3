import Image from "next/image";
import Link from "next/link";
import { CS_CONTACTS } from "@/components/CsContacts";

const FOOTER_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Syarat dan Ketentuan", href: "/terms" },
  { label: "Contact Us", href: "/contact-us" },
];

const COPYRIGHT_YEAR = 2026;

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border bg-background-secondary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-name.png"
              alt="Oemji"
              width={120}
              height={32}
              loading="eager"
            />
          </Link>
          <p className="text-sm text-muted-foreground">
            Top up diamond, UC, dan item game favoritmu dengan proses instan dan
            harga terbaik.
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">
            Navigasi
          </span>
          <ul className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">
            Customer Service
          </span>
          <ul className="flex flex-col gap-2">
            {CS_CONTACTS.map((contact) => (
              <li key={contact.href}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <contact.icon className="size-4 shrink-0" />
                  {contact.platform}: {contact.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {COPYRIGHT_YEAR} PT OEMJI DIGITAL NIAGA. Semua hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
