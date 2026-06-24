"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { buttonVariants } from "@/components/shadcn/button";
import { headerRoutes } from "@/constants/navigation";
import { Route } from "next";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export const MenuSheet: React.FC<{
  children: React.ReactNode;
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ children, openMenu, setOpenMenu }) => {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(false);
      return;
    }

    fetch("/api/admin")
      .then((res) => res.json())
      .then((data: { isAdmin?: boolean }) => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [isSignedIn]);

  const flattenedRoutes: { label: string; path: string }[] =
    headerRoutes.flatMap((route) => {
      if ("subroutes" in route && route.subroutes) {
        return route.subroutes;
      }

      if ("path" in route && route.path) {
        return [
          {
            label: route.label,
            path: route.path,
          },
        ];
      }

      return [];
    });

  return (
    <Sheet open={openMenu} onOpenChange={setOpenMenu}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent background="dark">
        <SheetHeader className="border-b-border/10 bg-black/30">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col justify-center p-8 md:px-12">
          <nav className="flex flex-col gap-4">
            {pathname !== "/" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + 0 * 0.05 }}
                onClick={() => setOpenMenu(false)}
              >
                <Link
                  href="/"
                  className="group flex w-fit items-baseline gap-4"
                >
                  <span className="font-serif text-2xl transition-all duration-500 md:text-3xl">
                    Home
                  </span>
                </Link>
              </motion.div>
            )}
            {flattenedRoutes.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => setOpenMenu(false)}
              >
                <Link
                  href={item.path as Route}
                  className="group flex w-fit items-baseline gap-4"
                >
                  <span className="font-serif text-2xl transition-all duration-500 md:text-3xl">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {isAdmin && (
          <SheetFooter className="flex flex-row items-center gap-4 bg-black/20">
            <SheetClose asChild>
              <Link
                target="_blank"
                href={"/studio" as Route}
                onClick={() => setOpenMenu(false)}
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "flex-1",
                })}
              >
                Admin Dashboard
              </Link>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
