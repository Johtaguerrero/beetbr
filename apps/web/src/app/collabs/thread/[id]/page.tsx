'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * This standalone chat page has been replaced by the unified messaging center.
 * Redirect users to /artist/messages with the chat ID as a query param.
 */
export default function CollabThreadRedirect() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const id = params.id as string;
        if (id) {
            router.replace(`/artist/messages?id=${id}`);
        } else {
            router.replace('/artist/messages');
        }
    }, [params.id, router]);

    return (
        <div className="flex h-screen items-center justify-center bg-beet-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-beet-green border-t-transparent" />
        </div>
    );
}
