import type { Metadata } from "next";
import { CalendarPage } from "@/modules/calendar";

export const metadata: Metadata = { title: "Calendar" };

export default function Page() {
  return <CalendarPage />;
}
