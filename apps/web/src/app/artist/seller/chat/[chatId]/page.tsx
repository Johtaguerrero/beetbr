'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * This standalone marketplace chat page has been replaced by the unified messaging center.
 * Redirect users to /artist/messages with the chat ID as a query param.
 */
export default function MarketplaceChatRedirect() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const chatId = params.chatId as string;
        if (chatId) {
            router.replace(`/artist/messages?id=${chatId}`);
        } else {
            router.replace('/artist/messages');
        }
    }, [params.chatId, router]);

    return (
        <div className="flex h-screen items-center justify-center bg-beet-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-beet-green border-t-transparent" />
        </div>
    );
}
