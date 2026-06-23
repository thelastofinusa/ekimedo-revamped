"use client";
import * as React from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../shadcn/navigation-menu";
import { cn } from "@/lib/utils";
import { containerVariants } from "./container";
import { Logo } from "./logo";
import { useTotalItems } from "../providers/cart.provider";
import { Button, buttonVariants } from "../shadcn/button";
import { RiUser6Line } from "react-icons/ri";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { SlHandbag } from "react-icons/sl";
import { PiNewspaper, PiReceipt } from "react-icons/pi";
import { Separator } from "../shadcn/separator";
import { Skeleton } from "../shadcn/skeleton";
import Link from "next/link";
import { headerRoutes } from "@/constants/navigation";
import { Route } from "next";
import { QUERY_REVIEW_PERMISSION } from "@/sanity/queries/permission.query";
import { client, clientOptions } from "@/sanity/lib/client";

const FORCE_ACTIVE_ROUTES = [
  "/about-us",
  "/contact-us",
  "/pre-made/",
  "/orders/",
];

export const Header = () => {
  const { user } = useUser();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;

  const pathname = usePathname();
  const totalItems: number = useTotalItems();

  const isDynamicShopRoute =
    (pathname.startsWith("/pre-made/") && pathname !== "/pre-made") ||
    (pathname.startsWith("/orders/") && pathname !== "/orders");

  const forceActive = React.useMemo(
    () => isDynamicShopRoute || FORCE_ACTIVE_ROUTES.includes(pathname),
    [isDynamicShopRoute, pathname],
  );

  const lastScrollY = React.useRef<number>(0);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [hasPermission, setHasPermission] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (forceActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  React.useEffect(() => {
    if (!customerEmail) return;

    (async () => {
      const result = await client.fetch(
        QUERY_REVIEW_PERMISSION,
        { email: customerEmail },
        clientOptions,
      );

      setHasPermission(Boolean(result));
    })();
  }, [customerEmail]);

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
        <div className="flex w-full sm:max-w-[150px] justify-start">
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

        <div className="flex w-full sm:max-w-[150px] justify-end">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              href="/pre-made/checkout"
              className={buttonVariants({
                size: totalItems > 0 ? "sm" : "icon-sm",
                variant: isActive ? "default" : "secondary",
              })}
            >
              <SlHandbag className="size-4" />
              {totalItems > 0 && (
                <span className="font-mono text-xs tracking-tighter">
                  [{totalItems > 99 ? "99+" : totalItems}]
                </span>
              )}
              <span className="sr-only">Open cart ({totalItems} items)</span>
            </Link>

            <Button
              size="icon-sm"
              variant={isActive ? "default" : "secondary"}
              className="lg:hidden"
            >
              <HiOutlineMenuAlt4 className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>

            <div className="flex items-center gap-2">
              <Separator
                orientation="vertical"
                className="h-3! w-px bg-secondary"
              />

              <ClerkLoading>
                <Skeleton className="size-8 shadow-sm" />
              </ClerkLoading>

              <ClerkLoaded>
                <Show when="signed-in">
                  <Button
                    size="icon-sm"
                    variant={isActive ? "default" : "secondary"}
                  >
                    <UserButton
                      afterSwitchSessionUrl="/"
                      appearance={{ elements: { avatarBox: "h-9 w-9" } }}
                    >
                      <UserButton.MenuItems>
                        {/* Custom actions FIRST */}
                        <UserButton.Link
                          label="My Orders"
                          labelIcon={
                            <PiReceipt className="text-foreground mt-0.5 size-3.5" />
                          }
                          href="/orders"
                        />

                        <UserButton.Action label="manageAccount" />

                        {hasPermission && (
                          <UserButton.Link
                            label="Write a Review"
                            labelIcon={
                              <PiNewspaper className="text-foreground mt-0.5 size-3.5" />
                            }
                            href="/reviews/new"
                          />
                        )}

                        <UserButton.Action label="signOut" />
                      </UserButton.MenuItems>
                    </UserButton>
                  </Button>
                </Show>
                <Show when="signed-out" treatPendingAsSignedOut>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl={pathname}
                    fallbackRedirectUrl={pathname}
                    signUpForceRedirectUrl={pathname}
                    signUpFallbackRedirectUrl={pathname}
                  >
                    <Button
                      size="icon-sm"
                      variant={isActive ? "default" : "secondary"}
                    >
                      <RiUser6Line className="size-4.5" />
                      <span className="sr-only">Sign in</span>
                    </Button>
                  </SignInButton>
                </Show>
              </ClerkLoaded>
            </div>
          </div>
        </div>
      </header>
    </NavigationMenu>
  );
};
