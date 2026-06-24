import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import {
  useCartActions,
  useCartItem,
  useCartItems,
  useProductTotalQuantity,
  useTotalItems,
  useTotalPrice,
} from "@/components/providers/cart.provider";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { ButtonGroup, ButtonGroupText } from "@/components/shadcn/button-group";
import { useCartStock } from "@/hooks/cart-stock";
import { buttonVariants, Button } from "@/components/shadcn/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/shadcn/alert";
import { StockBadge } from "../shared/stockBadge";
import { Badge } from "@/components/shadcn/badge";
import { Loader, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { RiAlarmWarningLine } from "react-icons/ri";

export const CartSheet: React.FC<{
  children: React.ReactNode;
  openCart: boolean;
  setOpenCart: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ children, openCart, setOpenCart }) => {
  const items = useCartItems();
  const totalItems = useTotalItems();
  const totalPrice = useTotalPrice();
  const { removeItem } = useCartActions();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  return (
    <Sheet open={openCart} onOpenChange={setOpenCart}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Shopping Cart{" "}
            <span className="mb-0.5">
              {isLoading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                `[${totalItems}]`
              )}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Your cart is empty
              </h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                Add some items to get started
              </p>

              <SheetClose asChild>
                <Link
                  href="/pre-made"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Shop Pre-Made Dresses
                </Link>
              </SheetClose>
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* Stock Issues Banner */}
            {hasStockIssues && !isLoading && (
              <Alert variant="warning">
                <RiAlarmWarningLine />
                <AlertTitle>Stock Issues</AlertTitle>
                <AlertDescription>
                  Some items have stock issues. Please review before checkout.
                </AlertDescription>
              </Alert>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5">
              <div className="space-y-4 divide-y divide-zinc-200 py-4 dark:divide-zinc-800">
                {items.map((item, idx) => {
                  const stockInfo = stockMap.get(item.productId);
                  const currentStock = stockInfo?.currentStock ?? 999;
                  const isUnknown = !stockInfo && !isLoading;

                  const exceedsStock = stockInfo?.exceedsStock ?? false;
                  // Use 0 as fallback – better to be conservative than allow over-ordering
                  const isOutOfStock =
                    stockInfo?.isOutOfStock ?? (isUnknown ? false : true);
                  const hasIssue = isOutOfStock || exceedsStock;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "bg-card flex w-full gap-4 border p-4 shadow-xs",
                        hasIssue && "bg-red-50",
                      )}
                    >
                      <div
                        className={cn(
                          "relative aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 shadow-xs md:w-26 dark:bg-zinc-800",
                          isOutOfStock && "opacity-50",
                        )}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col">
                            <p className="font-serif text-base">{item.name}</p>
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-muted-foreground text-xs">
                                {item.selectedSize && (
                                  <span>Size: {item.selectedSize}</span>
                                )}
                                {item.selectedSize && item.selectedColor && (
                                  <span className="mx-1">|</span>
                                )}
                                {item.selectedColor && (
                                  <span>Color: {item.selectedColor}</span>
                                )}
                              </p>
                            )}
                            <p className="text-muted-foreground mt-1 text-sm font-medium">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="icon-xs"
                            aria-label="Remove item"
                            onClick={() => removeItem(item.itemId)}
                          >
                            <XIcon className="size-3" />
                            <span className="sr-only">Remove {item.name}</span>
                          </Button>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <AddToCartButton
                            itemId={item.itemId}
                            productId={item.productId}
                            name={item.name}
                            price={item.price}
                            image={item.image}
                            stock={currentStock}
                            isLoading={isLoading}
                          />

                          <StockBadge
                            productId={item.productId}
                            stock={currentStock}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {totalItems > 0 && (
              <SheetFooter className="bg-card">
                <div className="flex justify-between text-base font-medium text-zinc-900 dark:text-zinc-100">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <div className="mt-2 flex flex-col gap-2 text-center">
                  {hasStockIssues ? (
                    <Button disabled className="w-full" size="lg">
                      Resolve stock issues to checkout
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        href="/pre-made/checkout"
                        className={buttonVariants({
                          size: "lg",
                          className: "w-full",
                        })}
                      >
                        Proceed to Checkout
                      </Link>
                    </SheetClose>
                  )}

                  <p className="text-muted-foreground text-xs">
                    Shipping calculated at checkout
                  </p>
                </div>
              </SheetFooter>
            )}
          </React.Fragment>
        )}
      </SheetContent>
    </Sheet>
  );
};

interface AddToCartButtonProps {
  itemId?: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  className?: string;
  isLoading?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  itemId,
  productId,
  name,
  price,
  image,
  stock,
  className,
  isLoading,
}) => {
  const { addItem, updateQuantity } = useCartActions();
  const cartItem = useCartItem(itemId || "");
  const productTotalQuantity = useProductTotalQuantity(productId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isAtMax = productTotalQuantity >= stock;

  const handleAdd = () => {
    if (productTotalQuantity < stock) {
      if (itemId) {
        updateQuantity(itemId, quantityInCart + 1);
      } else {
        addItem({ productId, name, price, image }, 1);
      }
      toast.success(`Successfully added "${name}" to cart`);
    }
  };

  const handleDecrement = () => {
    if (quantityInCart > 0 && itemId) {
      updateQuantity(itemId, quantityInCart - 1);
    }
  };

  // Out of stock
  if (isOutOfStock) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }

  // Not in cart - show Add to Basket button
  if (quantityInCart === 0) {
    return (
      <Button onClick={handleAdd} size="xs" className={cn("w-full", className)}>
        Add to Basket
      </Button>
    );
  }

  // In cart - show quantity controls
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon-xs"
        type="button"
        aria-label="Decrement"
        className="shadow-none active:translate-x-0 active:translate-y-0"
        onClick={handleDecrement}
      >
        <MinusIcon className="size-3" />
      </Button>
      <ButtonGroupText className="shadow-none px-2 text-xs opacity-50 active:translate-y-0 active:translate-x-0">
        {quantityInCart}
      </ButtonGroupText>
      <Button
        variant="outline"
        size="icon-xs"
        type="button"
        aria-label="Increment"
        className="shadow-none active:translate-x-0 active:translate-y-0"
        onClick={handleAdd}
        disabled={isAtMax || isLoading}
      >
        <PlusIcon className="size-3" />
      </Button>
    </ButtonGroup>
  );
};
