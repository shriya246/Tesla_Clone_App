import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import type { ButtonVariant } from "@/types";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)] hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 focus-visible:outline-white",
  secondary:
    "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 focus-visible:outline-white/70",
};

export function AppButton({
  children,
  className = "",
  fullWidth = false,
  href,
  rel,
  target,
  type = "button",
  variant = "primary",
  ...props
}: AppButtonProps) {
  const classes = [
    "inline-flex min-h-[3.125rem] items-center justify-center rounded-full px-6 text-sm font-medium tracking-[0.02em] transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    fullWidth ? "w-full" : "w-full sm:w-auto",
    variantClasses[variant],
    className,
  ].join(" ");

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <a className={classes} href={href} rel={rel} target={target}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
