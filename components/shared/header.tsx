/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";
import { containerVariants } from "./container";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import Link from "next/link";
import { Route } from "next";
import { headerRoutes } from "@/constants/navigation";
import { Button } from "../ui/button";
import { CircleUserIcon, MenuIcon, ShoppingBagIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { FORCE_ACTIVE_ROUTES } from "@/constants/others";

export const Header = () => {
  const pathname = usePathname();

  const isDynamicShopRoute =
    (pathname.startsWith("/shop/") && pathname !== "/shop") ||
    (pathname.startsWith("/orders/") && pathname !== "/orders");

  const lastScrollY = React.useRef<number>(0);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);

  const forceActive = React.useMemo(
    () => isDynamicShopRoute || FORCE_ACTIVE_ROUTES.includes(pathname),
    [isDynamicShopRoute, pathname],
  );

  React.useEffect(() => {
    if (forceActive) {
      setIsActive(true);
      setIsScrolling(false);
      return;
    }

    setIsActive(false);
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;

      // mark scrolling
      setIsScrolling(true);

      // clear previous stop timer
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // scrolling stopped after 120ms
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 120);

      // direction logic
      if (currentY < lastScrollY.current || currentY < 80) {
        setIsActive(false);
      } else {
        setIsActive(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [forceActive]);

  return (
    <NavigationMenu
      viewport={false}
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-50 w-full max-w-full transition-all duration-300",
        {
          "bg-background md:bg-background/80 md:backdrop-blur-md": isActive,
          "mix-blend-difference": !isActive && isScrolling,
        },
      )}
    >
      <header
        className={containerVariants({
          className:
            "flex h-20 w-full items-center justify-between gap-6 lg:h-24",
        })}
      >
        <div className="flex w-full max-w-[150px] justify-start">
          <Logo
            href="/"
            srcDesktop="horizontal"
            color={isActive ? "charcoal" : "bone"}
            className="pointer-events-auto"
          />
        </div>

        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          <NavigationMenuList className="flex items-center justify-center gap-6">
            {pathname !== "/" && (
              <NavigationMenuItem className="pointer-events-auto">
                <Link
                  href="/"
                  className={cn(
                    "pointer-events-auto text-xs font-medium tracking-wider uppercase transition-colors",
                    !isActive && "text-secondary",
                  )}
                >
                  <span>Home</span>
                </Link>
              </NavigationMenuItem>
            )}
            {headerRoutes.map((item) => {
              const LinkRefactored =
                item.subroutes && item.subroutes?.length > 0 ? "p" : Link;

              return (
                <NavigationMenuItem
                  key={item.label}
                  className="pointer-events-auto"
                >
                  {item.subroutes && item.subroutes.length > 0 ? (
                    <NavigationMenuTrigger
                      className={cn("mt-1", !isActive && "text-secondary")}
                    >
                      <span>{item.label}</span>
                    </NavigationMenuTrigger>
                  ) : (
                    <LinkRefactored
                      key={item.path}
                      href={item.path as Route}
                      className={cn(
                        "pointer-events-auto text-xs font-medium tracking-wider uppercase transition-colors",
                        !isActive && "text-secondary",
                      )}
                    >
                      <span>{item.label}</span>
                    </LinkRefactored>
                  )}
                  {item.subroutes && item.subroutes.length > 0 && (
                    <NavigationMenuContent>
                      <ul className="pointer-events-auto w-44">
                        {item.subroutes.map((route) => (
                          <NavigationMenuLink key={route.path} asChild>
                            <Link
                              href={route.path as Route}
                              className="pointer-events-auto text-xs font-medium tracking-wider uppercase transition-colors"
                            >
                              <span>{route.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </div>

        <div className="flex w-full max-w-[150px] justify-end">
          <div className="pointer-events-auto flex items-center gap-2">
            <Button
              // size={totalItems > 0 ? "sm" : "icon-sm"}
              size="icon-sm"
              variant={isActive ? "default" : "secondary"}
            >
              <ShoppingBagIcon className="size-4" />
              <span className="sr-only">Open cart (10 items)</span>
            </Button>

            <Button
              size="icon-sm"
              variant={isActive ? "default" : "secondary"}
              className="lg:hidden"
            >
              <MenuIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>

            <div className="flex items-center gap-2">
              <React.Fragment>
                <Separator orientation="vertical" className="h-3! w-px" />
                <Button
                  size="icon-sm"
                  variant={isActive ? "default" : "secondary"}
                >
                  <CircleUserIcon className="size-4" />
                  <span className="sr-only">Sign in</span>
                </Button>
              </React.Fragment>
            </div>
          </div>
        </div>
      </header>
    </NavigationMenu>
  );
};
