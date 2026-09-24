import type { Metadata } from "next";
import { PersonalPage } from "@/modules/personal";

export const metadata: Metadata = { title: "Personal" };

export default function Page() {
  return <PersonalPage />;
}
