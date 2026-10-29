
import { round, score } from './score.js';

const dir = '/data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);

    try {
        const list = await listResult.json();

        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                            records: (level.records || []).sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(
                        `Failed to load level #${rank + 1} ${path}.`,
                    );

                    return [null, path];
                }
            }),
        );
    } catch {
        console.error('Failed to load list.');
        return null;
    }
}

export async function fetchDemonList() {
    const listResult = await fetch(`${dir}/_demon_list.json`);

    try {
        const list = await listResult.json();

        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(
                    `${dir}/demon-list/${path}.json`,
                );

                try {
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                        },
                        null,
                    ];
                } catch {
                    console.error(
                        `Failed to load Demon level #${rank + 1} ${path}.`,
                    );

                    return [null, path];
                }
            }),
        );
    } catch {
        console.error('Failed to load Demon List.');
        return null;
    }
}

export async function fetchEditors() {
    const result = await fetch(`${dir}/_editors.json`);

    try {
        return await result.json();
    } catch {
        console.error('Failed to load editors.');
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    if (!list) {
        return [[], []];
    }

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {
        if (!level) {
            errs.push(err);
            return;
        }

        const levelRank = rank + 1;

        // Verification
        if (level.verifier) {
            const verifier = Object.keys(scoreMap).find(
                user =>
                    user.toLowerCase() ===
                    level.verifier.toLowerCase(),
            ) || level.verifier;

            scoreMap[verifier] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            scoreMap[verifier].verified.push({
                rank: levelRank,
                level: level.name,
                score: score(
                    levelRank,
                    100,
                    level.percentToQualify,
                ),
                link: level.verification,
            });
        }

        // Records
        (level.records || []).forEach(record => {
            if (!record.user) {
                return;
            }

            const user = Object.keys(scoreMap).find(
                name =>
                    name.toLowerCase() ===
                    record.user.toLowerCase(),
            ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            const {
                completed,
                progressed,
            } = scoreMap[user];

            const points = score(
                levelRank,
                record.percent,
                level.percentToQualify,
            );

            if (record.percent === 100) {
                completed.push({
                    rank: levelRank,
                    level: level.name,
                    score: points,
                    link: record.link,
                });

                return;
            }

            progressed.push({
                rank: levelRank,
                level: level.name,
                percent: record.percent,
                score: points,
                link: record.link,
            });
        });
    });

    // Load packs
    let packs = {};

    try {
        const packsResult = await fetch(`${dir}/_packs.json`);

        if (packsResult.ok) {
            const packsData = await packsResult.json();
            packs = packsData[0] || {};
        }
    } catch (error) {
        console.error('Failed to load packs for leaderboard:', error);
    }

    // Calculate leaderboard
    const result = Object.entries(scoreMap).map(([user, scores]) => {
        const {
            verified,
            completed,
            progressed,
        } = scores;

        const total = [
            ...verified,
            ...completed,
            ...progressed,
        ].reduce((sum, record) => sum + record.score, 0);

        // A level counts as completed if completed or verified.
        const completedRanks = new Set([
            ...completed.map(record => record.rank),
            ...verified.map(record => record.rank),
        ]);

        // Each completely completed pack gives +10 points.
        let packPoints = 0;

        Object.entries(packs).forEach(([packName, pack]) => {
            const packLevels = pack.levels || [];

            if (packLevels.length === 0) {
                return;
            }

            const completedPack = packLevels.every(
                rank => completedRanks.has(rank),
            );

            if (completedPack) {
                packPoints += 10;
                console.log(
                    `${user} completed ${packName}: +10 points`,
                );
            }
        });

        return {
            user,
            total: round(total + packPoints),
            ...scores,
        };
    });

    return [
        result.sort((a, b) => b.total - a.total),
        errs,
    ];
}
