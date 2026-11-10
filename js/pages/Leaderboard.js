import { fetchLeaderboard, fetchList } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';
import LeaderboardStatistics from './LeaderboardStatistics.js';

export default {
    components: {
        Spinner,
        LeaderboardStatistics,
    },

    data: () => ({
        leaderboard: [],
        players: {},
        packs: {},
        levels: [],
        loading: true,
        selected: 0,
        err: [],
        failedCubes: [],
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded:
                        {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">
                    <table class="board">
                        <tbody>
                            <tr
                                v-for="(ientry, i) in leaderboard"
                                :key="ientry.user"
                            >
                                <td class="rank">
                                    <p class="type-label-lg">
                                        #{{ i + 1 }}
                                    </p>
                                </td>

                                <td class="total">
                                    <p class="type-label-lg">
                                        {{ localize(ientry.total) }}
                                    </p>
                                </td>

                                <td
                                    class="user"
                                    :class="{ active: selected === i }"
                                >
                                    <button
                                        class="leaderboard-user-button"
                                        @click="selected = i"
                                    >
                                        <img
                                            v-if="cubeUrl(ientry.user)"
                                            :src="cubeUrl(ientry.user)"
                                            :alt="ientry.user + ' cube'"
                                            class="leaderboard-user-cube"
                                            @error="cubeFailed(ientry.user)"
                                        >

                                        <span
                                            v-else
                                            class="leaderboard-user-cube-placeholder"
                                        >
                                            ?
                                        </span>

                                        <span class="type-label-lg">
                                            {{ ientry.user }}
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="player-container" v-if="entry">
                    <div class="player">

                        <div class="player-profile">
                            <div class="player-profile-heading">

                                <div class="player-cube">
                                    <img
                                        v-if="cubeUrl(entry.user)"
                                        :src="cubeUrl(entry.user)"
                                        :alt="entry.user + ' cube'"
                                        @error="cubeFailed(entry.user)"
                                    >

                                    <div
                                        v-else
                                        class="player-cube-placeholder"
                                    >
                                        ?
                                    </div>
                                </div>

                                <div class="player-profile-info">
                                    <h1>
                                        #{{ selected + 1 }} {{ entry.user }}
                                    </h1>

                                    <p
                                        v-if="player && player.country"
                                        class="player-country"
                                    >
                                        {{ countryFlag(player.country) }}
                                        {{ countryName(player.country) }}
                                    </p>

                                    <p v-if="player && player.hardest">
                                        <strong>Hardest:</strong>
                                        <span v-if="player.hardestPosition">
                                            #{{ player.hardestPosition }}
                                        </span>
                                        {{ player.hardest }}
                                    </p>

                                    <p>
                                        <strong>Puntaje:</strong>
                                        {{ localize(entry.total) }}
                                    </p>

                                    <p>
                                        <strong>Niveles completados:</strong>
                                        {{ completedLevels.length }}
                                    </p>

                                    <p>
                                        <strong>Niveles verificados:</strong>
                                        {{ uniqueLevels(entry.verified).length }}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <!-- Rating Statistics -->
                        <section class="player-rating-statistics">
                            <h2>RATING STATISTICS</h2>

                            <div class="rating-statistics-summary">
                                <div class="rating-stat">
                                    <h3>{{ ratingStats.stars }}</h3>
                                    <p>Total Stars</p>
                                </div>

                                <div class="rating-stat">
                                    <h3>{{ ratingStats.completed }}</h3>
                                    <p>Rated Levels</p>
                                </div>

                                <div class="rating-stat">
                                    <h3>{{ ratingStats.featured }}</h3>
                                    <p>Featured Levels</p>
                                </div>
                            </div>

                            <h3>Difficulty Breakdown</h3>

                            <div class="rating-difficulty-list">
                                <div
                                    v-for="item in ratingStats.difficulties"
                                    :key="item.name"
                                    class="rating-difficulty-item"
                                >
                                    <span>{{ item.name }}</span>
                                    <strong>{{ item.count }}</strong>
                                </div>
                            </div>

                            <div v-if="ratingStats.demonTypes.length">
                                <h3>Demon Breakdown</h3>

                                <div class="rating-difficulty-list">
                                    <div
                                        v-for="item in ratingStats.demonTypes"
                                        :key="item.name"
                                        class="rating-difficulty-item"
                                    >
                                        <span>{{ item.name }}</span>
                                        <strong>{{ item.count }}</strong>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="player-level-summary">
                            <h2>NIVELES COMPLETADOS Y VERIFICADOS:</h2>

                            <div
                                v-if="completedLevels.length"
                                class="player-level-grid"
                            >
                                <span
                                    v-for="level in completedLevels"
                                    :key="level.key"
                                    class="player-level-grid-item"
                                >
                                    <a
                                        v-if="level.link"
                                        :href="level.link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {{ level.level }}
                                    </a>

                                    <span v-else>
                                        {{ level.level }}
                                    </span>
                                </span>
                            </div>

                            <p v-else>
                                Todavía no hay niveles registrados.
                            </p>
                        </section>

                        <details class="player-records">
                            <summary>Records:</summary>

                            <div class="player-records-content">

                                <h2
                                    v-if="entry.verified && entry.verified.length"
                                >
                                    Verified ({{ entry.verified.length }})
                                </h2>

                                <table class="table">
                                    <tbody>
                                        <tr
                                            v-for="(score, index) in (entry.verified || [])"
                                            :key="'verified-' + index"
                                        >
                                            <td class="rank">
                                                <p>#{{ score.rank }}</p>
                                            </td>

                                            <td class="level">
                                                <a
                                                    class="type-label-lg"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    :href="score.link"
                                                >
                                                    {{ score.level }}
                                                </a>
                                            </td>

                                            <td class="score">
                                                <p>
                                                    +{{ localize(score.score) }}
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h2
                                    v-if="entry.completed && entry.completed.length"
                                >
                                    Completed ({{ entry.completed.length }})
                                </h2>

                                <table class="table">
                                    <tbody>
                                        <tr
                                            v-for="(score, index) in (entry.completed || [])"
                                            :key="'completed-' + index"
                                        >
                                            <td class="rank">
                                                <p>#{{ score.rank }}</p>
                                            </td>

                                            <td class="level">
                                                <a
                                                    class="type-label-lg"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    :href="score.link"
                                                >
                                                    {{ score.level }}
                                                </a>
                                            </td>

                                            <td class="score">
                                                <p>
                                                    +{{ localize(score.score) }}
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h2
                                    v-if="entry.progressed && entry.progressed.length"
                                >
                                    Progressed ({{ entry.progressed.length }})
                                </h2>

                                <table class="table">
                                    <tbody>
                                        <tr
                                            v-for="(score, index) in (entry.progressed || [])"
                                            :key="'progressed-' + index"
                                        >
                                            <td class="rank">
                                                <p>#{{ score.rank }}</p>
                                            </td>

                                            <td class="level">
                                                <a
                                                    class="type-label-lg"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    :href="score.link"
                                                >
                                                    {{ score.percent }}% {{ score.level }}
                                                </a>
                                            </td>

                                            <td class="score">
                                                <p>
                                                    +{{ localize(score.score) }}
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>
                        </details>

                        <!-- Packs -->
                        <section
                            v-if="playerPacks.length > 0"
                            class="player-packs"
                        >
                            <h2>PACKS</h2>

                            <div class="player-packs-list">
                                <article
                                    v-for="pack in playerPacks"
                                    :key="pack.name"
                                    class="player-pack"
                                    :class="{ 'player-pack-complete': pack.isComplete }"
                                >
                                    <div class="player-pack-header">
                                        <div class="player-pack-title">
                                            <h3>{{ pack.name }}</h3>

                                            <p
                                                v-if="pack.description"
                                                class="player-pack-description"
                                            >
                                                {{ pack.description }}
                                            </p>
                                        </div>

                                        <div
                                            class="player-pack-status"
                                            :class="{ complete: pack.isComplete }"
                                        >
                                            <span v-if="pack.isComplete">
                                                ✓ Completed
                                            </span>

                                            <span v-else>
                                                {{ pack.completed }}/{{ pack.total }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="player-pack-progress-info">
                                        <span>
                                            {{ pack.completed }} of {{ pack.total }} levels
                                        </span>

                                        <strong>
                                            {{ pack.progress }}%
                                        </strong>
                                    </div>

                                    <div class="player-pack-progress">
                                        <div
                                            class="player-pack-progress-fill"
                                            :style="{ width: pack.progress + '%' }"
                                        ></div>
                                    </div>

                                    <div class="player-pack-levels">
                                        <div
                                            v-for="level in pack.levels"
                                            :key="level.key"
                                            class="player-pack-level"
                                            :class="{ completed: level.completed }"
                                        >
                                            <span class="player-pack-check">
                                                {{ level.completed ? '✓' : '○' }}
                                            </span>

                                            <span class="player-pack-name">
                                                {{ level.name }}
                                            </span>

                                            <span class="player-pack-level-status">
                                                {{ level.completed ? 'Completed' : 'Not completed' }}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        v-if="pack.isComplete"
                                        class="player-pack-reward"
                                    >
                                        <span>🏆</span>
                                        <strong>Pack completed</strong>
                                        <span>+10 points</span>
                                    </div>
                                </article>
                            </div>
                        </section>

                    </div>
                </div>

            </div>

            <!-- New statistics, charts, comparisons and games -->
            <LeaderboardStatistics />

        </main>
    `,

    computed: {
        entry() {
            return this.leaderboard[this.selected] || null;
        },

        player() {
            return this.entry
                ? this.playerFor(this.entry.user)
                : null;
        },

        completedLevels() {
            if (!this.entry) {
                return [];
            }

            const allScores = [
                ...(this.entry.completed || []),
                ...(this.entry.verified || []),
            ];

            const unique = new Map();

            allScores.forEach(score => {
                const name = String(score.level || '').trim();

                if (!name) {
                    return;
                }

                const key = name.toLocaleLowerCase();

                if (!unique.has(key)) {
                    unique.set(key, {
                        key,
                        level: name,
                        link: score.link || '',
                    });
                } else {
                    const existing = unique.get(key);

                    if (!existing.link && score.link) {
                        existing.link = score.link;
                    }
                }
            });

            return Array.from(unique.values()).sort((a, b) =>
                a.level.localeCompare(b.level, 'en', {
                    sensitivity: 'base',
                    numeric: true,
                })
            );
        },

        ratingStats() {
            const difficulties = [
                'Easy',
                'Normal',
                'Hard',
                'Harder',
                'Insane',
                'Demon',
            ];

            const demonTypes = [
                'Easy Demon',
                'Medium Demon',
                'Hard Demon',
                'Insane Demon',
                'Extreme Demon',
            ];

            const completedNames = new Set(
                this.completedLevels.map(level =>
                    level.level.trim().toLowerCase()
                )
            );

            const manualCompletions = this.player?.completions || [];

            manualCompletions.forEach(name => {
                if (typeof name === 'string') {
                    completedNames.add(name.trim().toLowerCase());
                }
            });

            const stats = {
                stars: 0,
                completed: 0,
                featured: 0,
                difficulties: difficulties.map(name => ({
                    name,
                    count: 0,
                })),
                demonTypes: demonTypes.map(name => ({
                    name,
                    count: 0,
                })),
            };

            this.levels.forEach(level => {
                const name = String(level.name || '').trim().toLowerCase();

                if (!name || !completedNames.has(name)) {
                    return;
                }

                const rating = level.rating;

                if (!rating || !rating.difficulty) {
                    return;
                }

                stats.completed++;
                stats.stars += Number(rating.stars) || 0;

                if (rating.featured === true) {
                    stats.featured++;
                }

                const difficulty = stats.difficulties.find(
                    item => item.name === rating.difficulty
                );

                if (difficulty) {
                    difficulty.count++;
                }

                if (rating.difficulty === 'Demon' && rating.demonType) {
                    const demon = stats.demonTypes.find(
                        item => item.name === rating.demonType
                    );

                    if (demon) {
                        demon.count++;
                    }
                }
            });

            return stats;
        },

        playerPacks() {
            if (!this.entry || !this.packs) {
                return [];
            }

            const completedNames = new Set(
                this.completedLevels.map(level =>
                    level.level.trim().toLowerCase()
                )
            );

            return Object.entries(this.packs).map(
                ([name, pack]) => {
                    const levels = (pack.levels || []).map(levelName => {
                        const normalizedName = String(levelName).trim().toLowerCase();

                        const levelData = this.levels.find(level =>
                            String(level.name || '').trim().toLowerCase() === normalizedName
                        );

                        const completed = completedNames.has(normalizedName);

                        return {
                            key: normalizedName,
                            name: levelData?.name || levelName,
                            completed,
                        };
                    });

                    const total = levels.length;
                    const completed = levels.filter(
                        level => level.completed
                    ).length;

                    const isComplete = total > 0 && completed === total;

                    return {
                        name,
                        description: pack.description || '',
                        total,
                        completed,
                        progress: total > 0
                            ? Math.round((completed / total) * 100)
                            : 0,
                        isComplete,
                        levels,
                    };
                }
            ).filter(pack => pack.completed > 0);
        },
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();

        this.leaderboard = leaderboard;
        this.err = err;

        try {
            const response = await fetch('./data/_players.json');

            if (!response.ok) {
                throw new Error(
                    `Could not load _players.json (${response.status})`
                );
            }

            this.players = await response.json();
        } catch (error) {
            console.error('Failed to load player profiles:', error);
            this.players = {};
        }

        try {
            const response = await fetch('./data/_packs.json');

            if (!response.ok) {
                throw new Error(
                    `Could not load _packs.json (${response.status})`
                );
            }

            const data = await response.json();
            this.packs = data[0] || {};
        } catch (error) {
            console.error('Failed to load packs:', error);
            this.packs = {};
        }

        try {
            const list = await fetchList();

            if (list) {
                this.levels = list.map(([level]) => level).filter(Boolean);
            }
        } catch (error) {
            console.error('Failed to load levels:', error);
        }

        this.loading = false;
    },

    methods: {
        localize,

        playerFor(username) {
            const target = String(username || '').trim().toLowerCase();

            const key = Object.keys(this.players).find(name =>
                name.trim().toLowerCase() === target
            );

            return key ? this.players[key] : null;
        },

        cubeUrl(username) {
            const player = this.playerFor(username);

            if (!player || !player.cubeUrl) {
                return '';
            }

            if (
                this.failedCubes.includes(
                    String(username).trim().toLowerCase()
                )
            ) {
                return '';
            }

            return player.cubeUrl;
        },

        cubeFailed(username) {
            const key = String(username || '').trim().toLowerCase();

            if (!this.failedCubes.includes(key)) {
                this.failedCubes.push(key);
            }

            console.error(
                `Could not load cube for ${username}. Check cubeUrl in data/_players.json and the image filename.`
            );
        },

        uniqueLevels(scores) {
            return Array.from(
                new Set(
                    (scores || [])
                        .map(score =>
                            String(score.level || '')
                                .trim()
                                .toLowerCase()
                        )
                        .filter(Boolean)
                )
            );
        },

        countryFlag(code) {
            if (!code || code.length !== 2) {
                return '';
            }

            return code
                .toUpperCase()
                .split('')
                .map(char =>
                    String.fromCodePoint(
                        127397 + char.charCodeAt(0)
                    )
                )
                .join('');
        },

        countryName(code) {
            const countries = {
                AR: 'Argentina',
                BO: 'Bolivia',
                BR: 'Brazil',
                CL: 'Chile',
                CO: 'Colombia',
                MX: 'Mexico',
                PE: 'Peru',
                UY: 'Uruguay',
                VE: 'Venezuela',
                ES: 'Spain',
                US: 'United States',
                CA: 'Canada',
                GB: 'United Kingdom',
                FR: 'France',
                DE: 'Germany',
                IT: 'Italy',
                PT: 'Portugal',
                PL: 'Poland',
                SE: 'Sweden',
                NO: 'Norway',
                FI: 'Finland',
                DK: 'Denmark',
                NL: 'Netherlands',
                BE: 'Belgium',
                AU: 'Australia',
                NZ: 'New Zealand',
                JP: 'Japan',
                KR: 'South Korea',
                CN: 'China',
            };

            return countries[code?.toUpperCase()] || code;
        },
    },
};