import { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const logoSrc = new URL("../../../assets/logo-default.svg", import.meta.url).href;

type LogoProps = ComponentPropsWithoutRef<"img">;

export const Logo = ({ className, alt = "Rainbow Roots logo", ...props }: LogoProps) => {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn("h-auto w-32", className)}
      {...props}
    />
  );
};
