
import { fetchLeaderboard, fetchList } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
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

                        <div
                            v-if="playerPacks.length > 0"
                            class="player-packs"
                        >
                            <h2>Packs</h2>

                            <div
                                v-for="pack in playerPacks"
                                :key="pack.name"
                                class="player-pack"
                            >
                                <div class="player-pack-header">
                                    <div>
                                        <h3>{{ pack.name }}</h3>
                                        <p>
                                            {{ pack.completed }} /
                                            {{ pack.total }}
                                            completed
                                        </p>
                                    </div>
                                </div>

                                <div class="player-pack-levels">
                                    <div
                                        v-for="level in pack.levels"
                                        :key="level.rank"
                                        class="player-pack-level"
                                        :class="{ completed: level.completed }"
                                    >
                                        <span class="player-pack-check">
                                            {{ level.completed ? '✓' : '○' }}
                                        </span>

                                        <span class="player-pack-rank">
                                            #{{ level.rank }}
                                        </span>

                                        <span class="player-pack-name">
                                            {{ level.name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
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

        playerPacks() {
            if (!this.entry || !this.packs) {
                return [];
            }

            const completedRanks = new Set([
                ...(this.entry.completed || []).map(
                    score => Number(score.rank)
                ),
                ...(this.entry.verified || []).map(
                    score => Number(score.rank)
                ),
            ]);

            const packs = Object.entries(this.packs).map(
                ([name, pack]) => {
                    const levels = (pack.levels || []).map(rank => {
                        const levelData = this.levels[rank - 1];

                        return {
                            rank,
                            name: levelData?.name || 'Unknown Level',
                            completed: completedRanks.has(Number(rank)),
                        };
                    });

                    return {
                        name,
                        description: pack.description,
                        total: levels.length,
                        completed: levels.filter(
                            level => level.completed
                        ).length,
                        levels,
                    };
                }
            );

            return packs.filter(pack => pack.completed > 0);
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
                this.levels = list.map(([level]) => level);
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
