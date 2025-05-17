import Link from "next/link";

interface NavItemProps {
  href: string;
  title: string;
  className?: string;
}

export function NavItem({ href, title }: NavItemProps) {
  return (
    <li className="font-sans font-semibold text-base">
      <Link href={href}>{title}</Link>
    </li>
  );
}
