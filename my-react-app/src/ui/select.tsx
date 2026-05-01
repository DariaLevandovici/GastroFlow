"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { cn } from "./utils";

type DropdownSide = "top" | "bottom";
const MIN_CONTENT_SPACE = 220;

const SelectSideContext = React.createContext<{
  side: DropdownSide;
  setSide: (side: DropdownSide) => void;
} | null>(null);

function getPreferredSide(trigger: HTMLElement | null): DropdownSide {
  if (!trigger || typeof window === "undefined") return "bottom";
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  return spaceBelow >= MIN_CONTENT_SPACE ? "bottom" : "top";
}

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [side, setSide] = React.useState<DropdownSide>("bottom");

  return (
    <SelectSideContext.Provider value={{ side, setSide }}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </SelectSideContext.Provider>
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  const sideContext = React.useContext(SelectSideContext);

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-dropdown-side={sideContext?.side ?? "bottom"}
      onPointerDown={(event) => {
        sideContext?.setSide(getPreferredSide(event.currentTarget));
        onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        const opensMenu = event.key === "Enter" || event.key === " " || event.key === "ArrowDown";
        if (opensMenu) {
          sideContext?.setSide(getPreferredSide(event.currentTarget));
        }
        onKeyDown?.(event);
      }}
      className={cn(
        "border-gray-700 data-[placeholder]:text-gray-500 [&_svg:not([class*='text-'])]:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/35 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full items-center justify-between gap-2 rounded-xl border bg-[#1f1f1f] px-4 py-2 text-sm text-white whitespace-nowrap transition-[color,box-shadow,border-color,border-radius] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-11 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        sideContext?.side === "bottom"
          ? "data-[state=open]:rounded-b-none data-[state=open]:border-b-0"
          : "data-[state=open]:rounded-t-none data-[state=open]:border-t-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 0,
  side = "bottom",
  avoidCollisions = false,
  collisionPadding = 8,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const sideContext = React.useContext(SelectSideContext);
  const resolvedSide = sideContext?.side ?? side;

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-dropdown-side={resolvedSide}
        className={cn(
          "bg-[#242424] text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto box-border border border-gray-700 shadow-md data-[side=bottom]:rounded-b-xl data-[side=bottom]:rounded-t-none data-[side=bottom]:border-t-0 data-[side=top]:rounded-t-xl data-[side=top]:rounded-b-none data-[side=top]:border-b-0",
          position === "popper" && "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]",
          className
        )}
        position={position}
        sideOffset={sideOffset}
        side={resolvedSide}
        avoidCollisions={avoidCollisions}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "w-full p-1 box-border",
            position === "popper" &&
            "max-h-[min(20rem,var(--radix-select-content-available-height))] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-blue-900/25 focus:text-white hover:bg-blue-900/15 [&_svg:not([class*='text-'])]:text-gray-400 relative flex w-full cursor-pointer items-center gap-2 rounded-xl py-2 pr-8 pl-3 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
