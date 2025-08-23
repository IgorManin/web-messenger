export const metadata = { title: "Messenger" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        {children}
        </body>
        </html>
    );
}
