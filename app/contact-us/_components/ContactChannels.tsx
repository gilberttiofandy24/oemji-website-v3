import { CS_CONTACTS } from "@/components/CsContacts";

const ContactChannels = () => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Chat langsung
      </p>
      <div className="flex flex-col gap-2">
        {CS_CONTACTS.map((contact) => (
          <a
            key={contact.href}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-card-secondary"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary-gradient text-primary-foreground">
              <contact.icon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold">{contact.platform}</span>
              <span className="truncate text-xs text-muted-foreground">{contact.handle}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ContactChannels;
