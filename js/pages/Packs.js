
import { fetchLeaderboard, fetchList } from '../content.js';

export default {
    data: () => ({
        packs: [],
        loading: true,
        error: null,
        totalPlayers: 0,
    }),

    template: `
        <main v-if="loading" class="page-packs">
            <div class="packs-container">
                <p>Loading packs...</p>
            </div>
        </main>

        <main v-else class="page-packs">
            <div class="packs-container">

                <div class="packs-header">
                    <h1>Packs</h1>
                    <p>Complete packs of levels from The GD List.</p>
                </div>

                <div v-if="error" class="packs-error">
                    {{ error }}
                </div>

                <div v-else-if="packs.length === 0" class="packs-empty">
                    No packs available.
                </div>

                <div
                    v-for="pack in packs"
                    :key="pack.name"
                    class="pack"
                >

                    <div class="pack-header">
                        <div class="pack-title">
                            <h2>{{ pack.name }}</h2>

                            <p class="pack-description">
                                {{ pack.description }}
                            </p>
                        </div>

                        <div class="pack-count">
                            <strong>{{ pack.levels.length }}</strong>
                            <span>levels</span>
                        </div>
                    </div>

                    <div class="pack-statistics">
                        <div class="pack-stat">
                            <strong>{{ pack.completedBy }}</strong>
                            <span>Players completed</span>
                        </div>

                        <div class="pack-stat">
                            <strong>{{ pack.totalPlayers }}</strong>
                            <span>Players with records</span>
                        </div>

                        <div class="pack-stat">
                            <strong>{{ pack.completionRate }}%</strong>
                            <span>Completion rate</span>
                        </div>
                    </div>

                    <div class="pack-progress">
                        <div
                            class="pack-progress-fill"
                            :style="{ width: pack.completionRate + '%' }"
                        ></div>
                    </div>

                    <div class="pack-levels">
                        <div
                            v-for="(level, index) in pack.levels"
                            :key="level.key"
                            class="pack-level"
                        >

                            <div class="pack-level-number">
                                {{ index + 1 }}
                            </div>

                            <div class="pack-level-info">
                                <div class="pack-level-name">
                                    {{ level.name }}
                                </div>

                                <div class="pack-level-position">
                                    {{ level.position ? '#' + level.position : 'Not ranked' }}
                                </div>
                            </div>

                            <div class="pack-level-completions">
                                {{ level.completedBy }} / {{ pack.totalPlayers }}
                                <span>players</span>
                            </div>

                        </div>
                    </div>

                    <div class="pack-footer">
                        <span>
                            <strong>+10 points</strong> leaderboard bonus
                        </span>

                        <span
                            v-if="pack.completedBy > 0"
                            class="pack-status complete"
                        >
                            {{ pack.completedBy }} completed
                        </span>

                        <span v-else class="pack-status">
                            Not completed yet
                        </span>
                    </div>

                </div>
            </div>
        </main>
    `,

    async mounted() {
        try {
            const [packsResponse, listData, leaderboardData] =
                await Promise.all([
                    fetch('/data/_packs.json'),
                    fetchList(),
                    fetchLeaderboard(),
                ]);

            if (!packsResponse.ok) {
                throw new Error(
                    `Could not load _packs.json (${packsResponse.status})`
                );
            }

            if (!listData) {
                throw new Error('Could not load the Main List.');
            }

            const packsData = await packsResponse.json();
            const packData = packsData[0] || {};

            const [leaderboard] = leaderboardData;

            // Main List: level name -> position.
            const levels = listData
                .map(([level], index) => {
                    if (!level) return null;

                    return {
                        name: level.name,
                        position: index + 1,
                    };
                })
                .filter(Boolean);

            const normalize = value =>
                String(value || '').trim().toLowerCase();

            // Each player's completed and verified levels.
            const playerCompletions = leaderboard.map(player => {
                const completedNames = new Set();

                [...(player.completed || []), ...(player.verified || [])]
                    .forEach(record => {
                        if (record.level) {
                            completedNames.add(normalize(record.level));
                        }
                    });

                return {
                    user: player.user,
                    completedNames,
                };
            });

            this.totalPlayers = playerCompletions.length;

            this.packs = Object.entries(packData).map(
                ([name, pack]) => {
                    const packLevels = (pack.levels || []).map(
                        levelName => {
                            const normalizedName = normalize(levelName);

                            const levelInfo = levels.find(
                                level =>
                                    normalize(level.name) === normalizedName
                            );

                            const completedBy = playerCompletions.filter(
                                player =>
                                    player.completedNames.has(normalizedName)
                            ).length;

                            return {
                                key: normalizedName,
                                name: levelInfo?.name || levelName,
                                position: levelInfo?.position || null,
                                completedBy,
                            };
                        }
                    );

                    const completedBy = playerCompletions.filter(player =>
                        packLevels.length > 0 &&
                        packLevels.every(level =>
                            player.completedNames.has(level.key)
                        )
                    ).length;

                    const completionRate = this.totalPlayers > 0
                        ? Math.round(
                            (completedBy / this.totalPlayers) * 100
                        )
                        : 0;

                    return {
                        name,
                        description: pack.description || '',
                        levels: packLevels,
                        completedBy,
                        totalPlayers: this.totalPlayers,
                        completionRate,
                    };
                }
            );

        } catch (error) {
            console.error('Failed to load packs:', error);
            this.error = 'Could not load packs. Check the console for details.';
        }

        this.loading = false;
    },
};
