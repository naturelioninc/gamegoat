import { redirect } from "next/navigation";
export const metadata = { title: "My Account" };

export default async function AccountPage() {
  redirect("https://account.xmasgoat.com/dashboard");
}
