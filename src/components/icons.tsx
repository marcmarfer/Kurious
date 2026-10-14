import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  strokeWidth?: number;
};

function Icon({
  children,
  strokeWidth = 2,
  className = "size-5",
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
    </Icon>
  );
}

export function SuitcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7.5h16v12H4zM9 7.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5M9 7.5v12M15 7.5v12" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6.5h16v13.5H4zM4 10.5h16M8 3.5v4M16 3.5v4" />
    </Icon>
  );
}

export function GroupIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4.5-5.8" />
    </Icon>
  );
}

export function FireIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2.5c.6 3.4 4.5 5 4.5 9.3a4.5 4.5 0 0 1-9 0c0-1.6.6-2.8 1.6-3.8.2 1.3.9 2.2 2 2.4.4-1.2.6-4.6.9-7.9z" />
    </Icon>
  );
}

export function ThumbUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 11v9M7 11l3.5-7.2a1.5 1.5 0 0 1 2.8.7V9h5.2a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7M7 11H4v9h3" />
    </Icon>
  );
}

export function ThumbDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 13V4M7 13l3.5 7.2a1.5 1.5 0 0 0 2.8-.7V15h5.2a2 2 0 0 0 2-2.4l-1.2-6a2 2 0 0 0-2-1.6H7M7 13H4V4h3" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return <ArrowRightIcon {...props} />;
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path
        d="M3.5 12h17M12 3.5c-2.6 2.4-3.6 5.3-3.6 8.5s1 6.1 3.6 8.5M12 3.5c2.6 2.4 3.6 5.3 3.6 8.5s-1 6.1-3.6 8.5"
        strokeWidth={1.6}
      />
    </Icon>
  );
}

export function CubeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7zM12 12l7.5-4.3M12 12v8.5M12 12L4.5 7.7" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </Icon>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.4" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function RailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3L5 21M16 3l3 18M6.5 8h11M5.8 13h12.4M5 18h14" />
    </Icon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 7.5v9l7.5-4.5z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  );
}

export function SeedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 22C8.4 18 7.5 14.6 7.7 12.3 7.9 10 9.6 8.7 12 8.7s4.1 1.3 4.3 3.6c.2 2.3-.7 5.7-4.3 9.7z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 8.7V4M12 5.6c-1.8-.7-3-1.8-3.6-3.3M12 5.6c1.8-.7 3-1.8 3.6-3.3" />
    </Icon>
  );
}

export function TreeLoadingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21V9M12 9C9 9 5.5 8 3.5 5.5M12 9C15 9 18.5 8 20.5 5.5M12 9C10.5 7 10 5 10 3M12 9C13.5 7 14 5 14 3" />
    </Icon>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" opacity=".35" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" />
    </Icon>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </Icon>
  );
}

export function RedoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
    </Icon>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
    </Icon>
  );
}

export function PinOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 9.6-4.8M18 10c0 2.1-.9 4.2-2.1 6.1M3 3l18 18M10.2 8.4a2.5 2.5 0 0 0 3.4 3.4" />
    </Icon>
  );
}
