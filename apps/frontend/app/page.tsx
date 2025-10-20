'use client';

import {useState} from "react";

export default function Page() {
    const [health, setHealth] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

    async function checkHealth() {
        setLoading(true);
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        setHealth(JSON.stringify(data));
        setLoading(false);
    }

    async function sendMessage() {
        setLoading(true);
        await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: 'Привет от фронта!', author: 'frontend' }),
        });
        const res = await fetch(`${API_URL}/messages`);
        const data = await res.json();
        setMessages(data.items);
        setLoading(false);
    }

    return (
        <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h1>Messenger — staging</h1>

            <button onClick={checkHealth} disabled={loading}>
                Проверить health
            </button>
            <button onClick={sendMessage} disabled={loading} style={{ marginLeft: 8 }}>
                Отправить сообщение
            </button>

            {health && <pre>Health: {health}</pre>}

            {messages.length > 0 && (
                <>
                    <h3>Сообщения:</h3>
                    <ul>
                        {messages.map((m) => (
                            <li key={m.id}>
                                <b>{m.author}:</b> {m.text}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    );
}