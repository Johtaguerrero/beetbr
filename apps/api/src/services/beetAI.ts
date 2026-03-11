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
}, completionScore: number = 0): number {
    const growthNormalized = Math.min(metrics.weeklyGrowth * 2, 100); // 50%+ growth -> 100

    // 70% Metrics, 30% Profile Completion
    const metricsScore =
        growthNormalized * 0.3 +
        metrics.engagement * 0.25 +
        metrics.retention * 0.25 +
        metrics.consistency * 0.2;

    const finalScore = (metricsScore * 0.7) + (completionScore * 0.3);

    return Math.round(Math.min(Math.max(finalScore, 0), 100) * 10) / 10;
}

/**
 * Calculate completion score (0-100) based on profile richness.
 */
export function calculateProfileScore(artist: any): number {
    let score = 0;

    // Core (30 pts)
    if (artist.avatarUrl) score += 5;
    if (artist.coverUrl) score += 5;
    if (artist.bio && artist.bio.length > 10) score += 5;
    if (artist.bioFull && artist.bioFull.length > 50) score += 10;
    if (artist.city && artist.state) score += 5;

    // Artistic Class (15 pts)
    if (artist.genres && artist.genres.length > 0) score += 5;
    if (artist.subGenres && artist.subGenres.length > 0) score += 5;
    if (artist.roles && artist.roles.length > 0) score += 5;

    // Professional (35 pts)
    if (artist.professionalQuestions && Object.keys(artist.professionalQuestions).length > 5) score += 20;
    if (artist.availabilityStatus) score += 5;
    if (artist.portfolioPdfUrl) score += 10;

    // Social/Presence (20 pts)
    let socialCount = 0;
    if (artist.instagram) socialCount++;
    if (artist.spotifyUrl) socialCount++;
    if (artist.youtubeUrl) socialCount++;
    if (artist.tiktokUrl) socialCount++;
    if (artist.website) socialCount++;
    score += Math.min(socialCount * 4, 20);

    return score;
}

/**
 * Update the scoreBeet field on an artist's profile from their current metrics.
 */
export async function refreshArtistScore(artistProfileId: string): Promise<number> {
    const artist = await prisma.artistProfile.findUnique({
        where: { id: artistProfileId },
        include: { metrics: true }
    });

    if (!artist || !artist.metrics) return 0;

    const completionScore = calculateProfileScore(artist);

    const score = calculateScoreBeet({
        weeklyGrowth: artist.metrics.weeklyGrowth,
        engagement: artist.metrics.engagement,
        retention: artist.metrics.retention,
        consistency: artist.metrics.consistency,
    }, completionScore);

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

