"use client";

import { AuthForm } from "@/modules/auth/ui/LoginForm";
import { useParams } from "next/navigation";

type AuthMode = "login" | "register";

export default function Page() {
  const params = useParams<{ mode: string }>();
  const mode = params?.mode === "register" ? "register" : "login";

  return <AuthForm mode={mode as AuthMode} />;
}
