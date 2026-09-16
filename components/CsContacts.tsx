import { MessageCircle, Send } from 'lucide-react';

// lucide-react dropped brand icons in this version — inline glyph, sized
// and stroked to match the rest of the lucide set.
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const WA_MESSAGE = encodeURIComponent('Halo Oemji, saya ingin bertanya');

export const CS_CONTACTS = [
  {
    platform: 'WhatsApp',
    handle: '+62 812-9945-4233',
    href: `https://wa.me/6281299454233?text=${WA_MESSAGE}`,
    icon: MessageCircle,
  },
  {
    platform: 'WhatsApp',
    handle: '+62 813-2913-8873',
    href: `https://wa.me/6281329138873?text=${WA_MESSAGE}`,
    icon: MessageCircle,
  },
  {
    platform: 'Telegram',
    handle: '@OemjiStoreCS',
    href: 'https://t.me/OemjiStoreCS',
    icon: Send,
  },
  {
    platform: 'Instagram',
    handle: '@oemji.store',
    href: 'https://www.instagram.com/oemji.store',
    icon: InstagramIcon,
  },
];
