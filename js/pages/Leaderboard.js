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

                        <tr v-for="(ientry, i) in leaderboard">

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
                                :class="{ 'active': selected == i }"
                            >
                                <button @click="selected = i">
                                    <span class="type-label-lg">
                                        {{ ientry.user }}
                                    </span>
                                </button>
                            </td>

                        </tr>

                    </table>

                </div>

                <div class="player-container">

                    <div class="player">

                        <h1>
                            #{{ selected + 1 }} {{ entry.user }}
                        </h1>

                        <div v-if="player" class="player-profile">

                            <p
                                v-if="player.country"
                                class="player-country"
                            >
                                {{ countryFlag(player.country) }}
                                {{ countryName(player.country) }}
                            </p>

                            <div
                                v-if="player.hardest"
                                class="player-hardest"
                            >

                                <h3>Hardest</h3>

                                <p>
                                    <span v-if="player.hardestPosition">
                                        #{{ player.hardestPosition }}
                                    </span>

                                    {{ player.hardest }}
                                </p>

                            </div>

                        </div>

                        <!-- PACKS -->

                        <div
                            v-if="playerPacks.length > 0"
                            class="player-packs"
                        >

                            <h2>Packs</h2>

                            <div
                                v-for="pack in playerPacks"
                                class="player-pack"
                            >

                                <div class="player-pack-header">

                                    <div>
                                        <h3>
                                            {{ pack.name }}
                                        </h3>

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
                                        class="player-pack-level"
                                        :class="{
                                            completed: level.completed
                                        }"
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

                        <h3>
                            {{ entry.total }}
                        </h3>

                        <h2
                            v-if="
                                entry.verified &&
                                entry.verified.length > 0
                            "
                        >
                            Verified ({{ entry.verified.length }})
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in (entry.verified || [])"
                            >

                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
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

                        </table>

                        <h2
                            v-if="
                                entry.completed &&
                                entry.completed.length > 0
                            "
                        >
                            Completed ({{ entry.completed.length }})
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in (entry.completed || [])"
                            >

                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
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

                        </table>

                        <h2
                            v-if="
                                entry.progressed &&
                                entry.progressed.length > 0
                            "
                        >
                            Progressed ({{ entry.progressed.length }})
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in (entry.progressed || [])"
                            >

                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
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

                        </table>

                    </div>

                </div>

            </div>

        </main>
    `,

    computed: {

        entry() {
            return this.leaderboard[this.selected];
        },

        player() {

            if (!this.entry) {
                return null;
            }

            const leaderboardName = String(this.entry.user)
                .trim()
                .toLowerCase();

            const playerKey = Object.keys(this.players).find(name =>
                name.trim().toLowerCase() === leaderboardName
            );

            if (!playerKey) {
                return null;
            }

            return this.players[playerKey];
        },

        playerPacks() {

            if (!this.entry || !this.packs) {
                return [];
            }

            /*
             * Both Completed and Verified count
             * as completed levels for packs.
             */
            const completedRanks = new Set([
                ...(this.entry.completed || []).map(
                    score => score.rank
                ),

                ...(this.entry.verified || []).map(
                    score => score.rank
                ),
            ]);

            const packs = Object.entries(this.packs).map(
                ([name, pack]) => {

                    const levels = (pack.levels || []).map(
                        rank => {

                            const levelData =
                                this.levels[rank - 1];

                            return {
                                rank,
                                name:
                                    levelData?.name ||
                                    'Unknown Level',

                                completed:
                                    completedRanks.has(rank),
                            };

                        }
                    );

                    const completed = levels.filter(
                        level => level.completed
                    ).length;

                    return {
                        name,
                        description: pack.description,
                        total: levels.length,
                        completed,
                        levels,
                    };

                }
            );

            /*
             * Only show packs where the player
             * completed at least one level.
             */
            return packs.filter(
                pack => pack.completed > 0
            );
        },

    },

    async mounted() {

        const [leaderboard, err] =
            await fetchLeaderboard();

        this.leaderboard = leaderboard;
        this.err = err;

        /*
         * Load player profiles
         */
        try {

            const response =
                await fetch('./data/_players.json');

            if (!response.ok) {

                console.error(
                    'Could not load ./data/_players.json',
                    response.status
                );

            } else {

                this.players =
                    await response.json();

                console.log(
                    'Player profiles loaded:',
                    this.players
                );

            }

        } catch (error) {

            console.error(
                'Failed to load player profiles:',
                error
            );

        }

        /*
         * Load packs
         */
        try {

            const response =
                await fetch('./data/_packs.json');

            if (!response.ok) {
                throw new Error(
                    `Could not load _packs.json (${response.status})`
                );
            }

            const data =
                await response.json();

            this.packs = data[0];

            console.log(
                'Packs loaded:',
                this.packs
            );

        } catch (error) {

            console.error(
                'Failed to load packs:',
                error
            );

            this.packs = {};

        }

        /*
         * Load all levels so we can get
         * their real names.
         */
        const list = await fetchList();

        if (list) {

            this.levels = list.map(
                ([level]) => level
            );

        }

        this.loading = false;
    },

    methods: {

        localize,

        countryFlag(code) {

            if (!code || code.length !== 2) {
                return '';
            }

            return code
                .toUpperCase()
                .split('')
                .map(char =>
                    String.fromCodePoint(
                        127397 +
                        char.charCodeAt(0)
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

            return countries[
                code?.toUpperCase()
            ] || code;
        },

    },
};