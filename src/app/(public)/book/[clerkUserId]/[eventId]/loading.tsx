import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
      <div className="text-3xl font-bold text-center text-muted-foreground ">
        Loading...
      </div>
      <LoaderCircle className="animate-spin text-muted-foreground size-24" />
    </div>
  );
}
