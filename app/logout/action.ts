"use server";

import { clearAuthCookie } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  await clearAuthCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}
