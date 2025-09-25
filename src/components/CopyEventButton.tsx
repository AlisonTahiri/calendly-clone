"use client";

import { Copy, CopyCheck, CopyX } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { ButtonHTMLAttributes, useState } from "react";
import { VariantProps } from "class-variance-authority";

type CopyState = "idle" | "copied" | "error";

export default function CopyEventButton({
  eventId,
  clerkUserId,
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick"> & {
  eventId: string;
  clerkUserId: string;
  variant: VariantProps<typeof buttonVariants>["variant"];
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const CopyIcon = getCopyIcon(copyState);

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        navigator.clipboard
          .writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
          .then(() => {
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 2000);
          })

          .catch(() => {
            setCopyState("error");
            setTimeout(() => setCopyState("idle"), 2000);
          });
      }}
    >
      <CopyIcon className="mr-2 size-4" />
      {getChildren(copyState)}
    </Button>
  );
}

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return Copy;
    case "copied":
      return CopyCheck;
    default:
      return CopyX;
  }
}

function getChildren(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy Link";
    case "copied":
      return "Copied!";
    default:
      return "Error";
  }
}
