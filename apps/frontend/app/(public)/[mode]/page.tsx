import {AuthForm} from "../../../modules/auth/ui/LoginForm";
import {notFound} from "next/navigation";

type PageProps = {
    params: { mode: string }
}

export default async function AuthPage({ params }: PageProps) {
    const { mode } = await params

    if (mode !== 'login' && mode !== 'register') {
        notFound()
    }

    return <AuthForm mode={mode} />
}
