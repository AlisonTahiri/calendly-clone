import Navlink from "@/components/Navlink";
import { UserButton } from "@clerk/nextjs";
import { CalendarRange } from "lucide-react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex py-2 border-b bg-card">
        <nav className="font-medium flex items-center text-sm gap-6 container">
          <div className="flex items-center gap-2 font-semibold mr-auto">
            <CalendarRange className="size-6" />
            <span className="sr-only md:not-sr-only">Kalendari</span>
          </div>
          <Navlink href="/events">Events</Navlink>
          <Navlink href="/schedule">Schedule</Navlink>
          <div className="ml-auto size-10">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: { width: "100%", height: "100%" },
                },
              }}
            />
          </div>
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
