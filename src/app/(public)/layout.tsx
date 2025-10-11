import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <main className="container my-4">{children}</main>;
}
