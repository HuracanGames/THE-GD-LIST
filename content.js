import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);

    try {
        const list = await listResult.json();

        return await Promise.all(
            list.map(async (path, rank) => {

                const levelResult =
                    await fetch(`${dir}/${path}.json`);

                try {

                    const level =
                        await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];

                } catch {

                    console.error(
                        `Failed to load level #${rank + 1} ${path}.`
                    );

                    return [null, path];
                }
            }),
        );

    } catch {

        console.error(`Failed to load list.`);

        return null;
    }
}

export async function fetchEditors() {

    try {

        const editorsResults =
            await fetch(`${dir}/_editors.json`);

        const editors =
            await editorsResults.json();

        return editors;

    } catch {

        return null;
    }
}

export async function fetchLeaderboard() {

    const list = await fetchList();

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {

        if (err) {

            errs.push(err);

            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) =>
                u.toLowerCase() ===
                level.verifier.toLowerCase(),
        ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };

        const { verified } =
            scoreMap[verifier];

        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(
                rank + 1,
                100,
                level.percentToQualify
            ),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {

            const user = Object.keys(scoreMap).find(
                (u) =>
                    u.toLowerCase() ===
                    record.user.toLowerCase(),
            ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            const {
                completed,
                progressed
            } = scoreMap[user];

            if (record.percent === 100) {

                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(
                        rank + 1,
                        100,
                        level.percentToQualify
                    ),
                    link: record.link,
                });

                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(
                    rank + 1,
                    record.percent,
                    level.percentToQualify
                ),
                link: record.link,
            });

        });

    });

    /*
     * Load packs
     */
    let packs = {};

    try {

        const packsResult =
            await fetch(`${dir}/_packs.json`);

        if (packsResult.ok) {

            const packsData =
                await packsResult.json();

            packs = packsData[0] || {};

        }

    } catch (error) {

        console.error(
            'Failed to load packs for leaderboard:',
            error
        );

    }

    /*
     * Calculate the leaderboard.
     */
    const res = Object.entries(scoreMap).map(
        ([user, scores]) => {

            const {
                verified,
                completed,
                progressed
            } = scores;

            const total = [
                verified,
                completed,
                progressed
            ]
                .flat()
                .reduce(
                    (prev, cur) =>
                        prev + cur.score,
                    0
                );

            /*
             * A level counts as completed if:
             *
             * - The player has a 100% record
             * - OR the player verified the level
             *
             * A Set prevents the same level from
             * being counted twice.
             */
            const completedRanks = new Set([
                ...completed.map(
                    record => record.rank
                ),

                ...verified.map(
                    record => record.rank
                ),
            ]);

            /*
             * Each completely completed pack
             * gives +10 points.
             */
            let packPoints = 0;

            Object.entries(packs).forEach(
                ([packName, pack]) => {

                    const packLevels =
                        pack.levels || [];

                    if (
                        packLevels.length === 0
                    ) {
                        return;
                    }

                    const completedPack =
                        packLevels.every(
                            rank =>
                                completedRanks.has(rank)
                        );

                    if (completedPack) {

                        packPoints += 10;

                        console.log(
                            `${user} completed ${packName}: +10 points`
                        );
                    }

                }
            );

            return {
                user,

                total: round(
                    total + packPoints
                ),

                ...scores,
            };

        }
    );

    // Sort by total score
    return [
        res.sort(
            (a, b) =>
                b.total - a.total
        ),
        errs
    ];
}