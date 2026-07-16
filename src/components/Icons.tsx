type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function HeartIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L4.22 13.45 12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShoppingBagIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22v-7h6v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function PackageIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4L12 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="m4.5 7.7 7.5 4.1 7.5-4.1M12 12v8.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TagIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.5 13.2 13.2 20.5a2.2 2.2 0 0 1-3.1 0L3.5 13.9V4h9.9l7.1 7.1a1.5 1.5 0 0 1 0 2.1Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.4" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function BellIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.8h18C21 16 18 16 18 9Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21a2.3 2.3 0 0 0 4 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.8" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function UserIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
      <path d="M4 21a8 8 0 0 1 16 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.1 3.9A10.7 10.7 0 0 0 2.4 15.5L1 22l6.7-1.3A10.7 10.7 0 0 0 20.1 3.9Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 7.7c-.2.4-.6 1.1-.6 2 0 2.4 2.9 6.2 6.7 6.2.9 0 1.7-.4 2-.7.2-.2.3-.6.2-.9l-.8-1.8c-.1-.3-.4-.4-.7-.3l-1.1.4c-.3.1-.6 0-.8-.2-.8-.5-1.6-1.2-2.1-2.1-.2-.3-.3-.6-.1-.9l.4-1c.1-.3 0-.6-.3-.8L9.4 7c-.4-.1-.8.1-1.1.7Z"
        fill={color}
      />
    </svg>
  );
}

export function ClipboardIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11h8M8 15h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M7 6v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10 10v6M14 10v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <path d="m20 20-3.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ size = 18, color = "currentColor", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M22 18h-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="16" cy="6" r="2" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="6" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="20" cy="18" r="2" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}
