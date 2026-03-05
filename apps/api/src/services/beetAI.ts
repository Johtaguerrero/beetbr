// ============================================================
// BeetAI Service — MVP Score + Recommendations
// ============================================================

import { prisma } from '../lib/prisma';
import { ArtistProfile, Metrics } from '@beetbr/shared';

/**
 * Calculate the Score Beet (0–100) from artist metrics.
 *
 * Formula:
 *  30% Growth (weeklyGrowth normalized 0–100)
 *  25% Engagement (engagement %)
 *  25% Retention (retention %)
 *  20% Consistency (consistency score)
 */
export function calculateScoreBeet(metrics: {
    weeklyGrowth: number;  // percentage, e.g. 15 = 15%
    engagement: number;    // percentage 0–100
    retention: number;     // percentage 0–100
    consistency: number;   // 0–100
}): number {
    const growthNormalized = Math.min(metrics.weeklyGrowth * 2, 100); // 50%+ growth -> 100
    const score =
        growthNormalized * 0.3 +
        metrics.engagement * 0.25 +
        metrics.retention * 0.25 +
        metrics.consistency * 0.2;
    return Math.round(Math.min(Math.max(score, 0), 100) * 10) / 10;
}

/**
 * Update the scoreBeet field on an artist's profile from their current metrics.
 */
export async function refreshArtistScore(artistProfileId: string): Promise<number> {
    const metrics = await prisma.metrics.findUnique({ where: { artistId: artistProfileId } });
    if (!metrics) return 0;

    const score = calculateScoreBeet({
        weeklyGrowth: metrics.weeklyGrowth,
        engagement: metrics.engagement,
        retention: metrics.retention,
        consistency: metrics.consistency,
    });

    await prisma.artistProfile.update({
        where: { id: artistProfileId },
        data: { scoreBeet: score },
    });

    return score;
}

/**
 * Suggest relevant hashtags based on genre.
 */
export function suggestHashtags(genres: string[]): string[] {
    const genreMap: Record<string, string[]> = {
        Funk: ['#FunkBR', '#FunkCarioca', '#FunkPaulista', '#BaileFunk', '#Pancadao'],
        Trap: ['#TrapBR', '#TrapNacional', '#SoundTrap', '#BrTrap'],
        'R&B': ['#RnBBR', '#SoulBrasileiro', '#RnBNacional', '#UrbanBR'],
        Pop: ['#PopBR', '#PopNacional', '#MusicaPop', '#HitBR'],
        Samba: ['#SambaBR', '#SambaRaiz', '#SambaEsquema', '#SambaNaChuva'],
        Forro: ['#Forro', '#ForroBR', '#ForroUniversitario', '#AxeForró'],
        MPB: ['#MPB', '#MusicaPopularBrasileira', '#MusicaBrasileira'],
        Sertanejo: ['#Sertanejo', '#SertanejoUniversitario', '#SertanejoRaiz', '#SertanexBR'],
        Rock: ['#RockBR', '#RockNacional', '#AlternativeRockBR'],
        Eletrônico: ['#EDMBrasileiro', '#TechnoNacional', '#EletronicoBR'],
        Gospel: ['#MusicaGospel', '#GospelBR', '#LouvoreEAdoracao'],
        Indie: ['#IndieBR', '#IndieNacional', '#AlternativeBR'],
    };

    const hashtags = new Set<string>();
    hashtags.add('#BeatBR'); // always include platform tag
    hashtags.add('#NovaMusica');

    for (const genre of genres) {
        const tags = genreMap[genre] || [];
        tags.slice(0, 3).forEach((t) => hashtags.add(t));
    }

    return Array.from(hashtags).slice(0, 10);
}

/**
 * Recommend artists for an industry profile based on niche/region/score.
 */
export async function recommendArtistsForIndustry(industryProfileId: string, limit = 5) {
    const industry = await prisma.industryProfile.findUnique({
        where: { id: industryProfileId },
    });
    if (!industry) return [];

    // Fetch artists that match niches/state OR top scores
    const artists = await prisma.artistProfile.findMany({
        where: {
            availableForBooking: true,
            scoreBeet: { gte: 60 },
            OR: [
                { state: industry.state },             // same state
                { genres: { hasSome: industry.niches } }, // overlapping genres/niches
            ],
        },
        orderBy: { scoreBeet: 'desc' },
        take: limit * 3,
        include: { metrics: true },
    });

    // Calculate match % = overlap of niches/genres + geographic bonus
    const scored = artists.map((a: any) => {
        const genreOverlap = a.genres.filter((g: string) => industry.niches.includes(g)).length;
        const geoBonus = a.state === industry.state ? 10 : 0;
        const matchScore = Math.round(
            (genreOverlap / Math.max(industry.niches.length, 1)) * 70 +
            geoBonus +
            (a.scoreBeet / 100) * 20
        );
        return { ...a, matchScore: Math.min(matchScore, 99) };
    });

    return (scored as (ArtistProfile & { matchScore: number })[])
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
}

