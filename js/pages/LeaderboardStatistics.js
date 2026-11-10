import { fetchLeaderboard, fetchList } from '../content.js';

export default {
    data: () => ({
        leaderboard: [],
        levels: [],
        players: {},
        loading: true,

        selectedA: '',
        selectedB: '',

        gameMode: 'verifier',
        gameQuestion: null,
        gameFeedback: '',
        gameScore: 0,
        gameAttempts: 0,
    }),

    template: `
        <section class="leaderboard-statistics">

            <div class="statistics-heading">
                <h1>Leaderboard Statistics</h1>
                <p>Explore players, levels and records from The GD List.</p>
            </div>

            <div v-if="loading" class="statistics-loading">
                Loading statistics...
            </div>

            <template v-else>

                <!-- OVERVIEW -->
                <section class="statistics-section">
                    <h2>Overview</h2>

                    <div class="statistics-cards">
                        <article class="statistics-card">
                            <span>Players</span>
                            <strong>{{ leaderboard.length }}</strong>
                        </article>

                        <article class="statistics-card">
                            <span>Main List Levels</span>
                            <strong>{{ levels.length }}</strong>
                        </article>

                        <article class="statistics-card">
                            <span>Verifications</span>
                            <strong>{{ totalVerifications }}</strong>
                        </article>

                        <article class="statistics-card">
                            <span>First Victories</span>
                            <strong>{{ firstVictors.length }}</strong>
                        </article>
                    </div>
                </section>

                <!-- CARTESIAN GRAPH -->
                <section class="statistics-section">
                    <h2>Player Cartesian Comparison</h2>
                    <p class="statistics-description">
                        Each point represents a player.
                        X = completed and verified levels.
                        Y = Classic Score.
                    </p>

                    <div class="statistics-chart">
                        <svg viewBox="0 0 700 340" role="img"
                             aria-label="Player comparison scatter plot">

                            <line x1="65" y1="25" x2="65" y2="285"
                                  class="chart-axis"/>
                            <line x1="65" y1="285" x2="665" y2="285"
                                  class="chart-axis"/>

                            <line v-for="i in 4" :key="'grid-' + i"
                                  x1="65" :y1="285 - i * 60"
                                  x2="665" :y2="285 - i * 60"
                                  class="chart-grid"/>

                            <text x="350" y="330" class="chart-label">
                                Completed levels
                            </text>

                            <text x="15" y="160"
                                  transform="rotate(-90 15 160)"
                                  class="chart-label">
                                Classic Score
                            </text>

                            <g v-for="(player, index) in leaderboard"
                               :key="player.user">

                                <circle
                                    :cx="chartX(player)"
                                    :cy="chartY(player)"
                                    r="7"
                                    class="chart-point"
                                >
                                    <title>
                                        {{ player.user }} -
                                        {{ player.total }} points
                                    </title>
                                </circle>

                                <text
                                    :x="chartX(player) + 9"
                                    :y="chartY(player) - 8"
                                    class="chart-player-label"
                                >
                                    {{ player.user }}
                                </text>
                            </g>
                        </svg>
                    </div>
                </section>

                <!-- TOP PLAYERS -->
                <section class="statistics-section">
                    <h2>Player Rankings</h2>

                    <div class="statistics-ranking">
                        <div v-for="(player, index) in topPlayers"
                             :key="player.user"
                             class="statistics-ranking-row">

                            <strong>#{{ index + 1 }}</strong>
                            <span>{{ player.user }}</span>
                            <span>{{ player.total }} pts</span>
                        </div>
                    </div>
                </section>

                <!-- DIFFICULTY DISTRIBUTION -->
                <section class="statistics-section">
                    <h2>Level Difficulty Distribution</h2>

                    <div class="statistics-bars">
                        <div v-for="item in difficultyDistribution"
                             :key="item.name"
                             class="statistics-bar-row">

                            <span>{{ item.name }}</span>

                            <div class="statistics-bar">
                                <div
                                    class="statistics-bar-fill"
                                    :style="{ width: item.percentage + '%' }"
                                ></div>
                            </div>

                            <strong>{{ item.count }}</strong>
                        </div>
                    </div>
                </section>

                <!-- PLAYER COMPARISON -->
                <section class="statistics-section">
                    <h2>Player Comparison</h2>

                    <div class="statistics-selectors">
                        <select v-model="selectedA">
                            <option value="">Select player 1</option>
                            <option v-for="player in leaderboard"
                                    :key="player.user"
                                    :value="player.user">
                                {{ player.user }}
                            </option>
                        </select>

                        <span>VS</span>

                        <select v-model="selectedB">
                            <option value="">Select player 2</option>
                            <option v-for="player in leaderboard"
                                    :key="player.user"
                                    :value="player.user">
                                {{ player.user }}
                            </option>
                        </select>
                    </div>

                    <div v-if="comparisonA && comparisonB"
                         class="statistics-comparison">

                        <div class="comparison-player">
                            <h3>{{ comparisonA.user }}</h3>
                            <p>{{ comparisonA.total }} points</p>
                        </div>

                        <div class="comparison-player">
                            <h3>{{ comparisonB.user }}</h3>
                            <p>{{ comparisonB.total }} points</p>
                        </div>

                        <div v-for="metric in comparisonMetrics"
                             :key="metric.name"
                             class="comparison-metric">

                            <span>{{ metric.name }}</span>

                            <div class="comparison-values">
                                <strong>{{ metric.a }}</strong>
                                <div class="comparison-track">
                                    <div
                                        class="comparison-fill comparison-fill-a"
                                        :style="{ width: metric.widthA + '%' }"
                                    ></div>
                                </div>
                            </div>

                            <div class="comparison-values">
                                <strong>{{ metric.b }}</strong>
                                <div class="comparison-track">
                                    <div
                                        class="comparison-fill comparison-fill-b"
                                        :style="{ width: metric.widthB + '%' }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p v-else class="statistics-description">
                        Select two players to compare their statistics.
                    </p>
                </section>

                <!-- GAMES -->
                <section class="statistics-section statistics-games">
                    <h2>Mini Games</h2>
                    <p class="statistics-description">
                        Test your knowledge of The GD List.
                    </p>

                    <div class="statistics-game-modes">
                        <button
                            v-for="game in gameModes"
                            :key="game.id"
                            :class="{ active: gameMode === game.id }"
                            @click="startGame(game.id)"
                        >
                            {{ game.name }}
                        </button>
                    </div>

                    <div v-if="gameQuestion" class="statistics-game">

                        <div class="game-score">
                            Score: {{ gameScore }} /
                            {{ gameAttempts }}
                        </div>

                        <h3>{{ gameQuestion.prompt }}</h3>

                        <div class="game-options">
                            <button
                                v-for="option in gameQuestion.options"
                                :key="option"
                                :disabled="!!gameFeedback"
                                @click="answerGame(option)"
                            >
                                {{ option }}
                            </button>
                        </div>

                        <p v-if="gameFeedback"
                           class="game-feedback"
                           :class="{ correct: gameFeedback === 'Correct!' }">
                            {{ gameFeedback }}
                        </p>

                        <button
                            v-if="gameFeedback"
                            class="game-next"
                            @click="startGame(gameMode)"
                        >
                            Next Question
                        </button>
                    </div>

                    <p v-else class="statistics-description">
                        Not enough data for this game yet.
                    </p>
                </section>

            </template>
        </section>
    `,

    computed: {
        topPlayers() {
            return [...this.leaderboard]
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
        },

        totalVerifications() {
            return this.levels.filter(level =>
                String(level.verifier || '').trim()
            ).length;
        },

        firstVictors() {
            return this.levels
                .map(level => {
                    const firstRecord = (level.records || []).find(
                        record => Number(record.percent) === 100
                    );

                    return firstRecord
                        ? { level: level.name, user: firstRecord.user }
                        : null;
                })
                .filter(item => item && item.user);
        },

        difficultyDistribution() {
            const difficulties = [
                'Easy', 'Normal', 'Hard',
                'Harder', 'Insane', 'Demon'
            ];

            const counts = difficulties.map(name => ({
                name,
                count: this.levels.filter(level =>
                    level.rating?.difficulty === name
                ).length,
                percentage: 0,
            }));

            const max = Math.max(
                1,
                ...counts.map(item => item.count)
            );

            counts.forEach(item => {
                item.percentage = item.count / max * 100;
            });

            return counts;
        },

        comparisonA() {
            return this.leaderboard.find(
                player => player.user === this.selectedA
            );
        },

        comparisonB() {
            return this.leaderboard.find(
                player => player.user === this.selectedB
            );
        },

        comparisonMetrics() {
            if (!this.comparisonA || !this.comparisonB) {
                return [];
            }

            const a = this.comparisonA;
            const b = this.comparisonB;

            const values = [
                {
                    name: 'Classic Score',
                    a: a.total,
                    b: b.total,
                },
                {
                    name: 'Completed Levels',
                    a: this.completedCount(a),
                    b: this.completedCount(b),
                },
                {
                    name: 'Verified Levels',
                    a: (a.verified || []).length,
                    b: (b.verified || []).length,
                },
                {
                    name: 'Progressed Records',
                    a: (a.progressed || []).length,
                    b: (b.progressed || []).length,
                },
            ];

            return values.map(metric => {
                const max = Math.max(1, metric.a, metric.b);

                return {
                    ...metric,
                    widthA: metric.a / max * 100,
                    widthB: metric.b / max * 100,
                };
            });
        },

        gameModes() {
            return [
                { id: 'verifier', name: 'Who Verified It?' },
                { id: 'firstVictor', name: 'First Victor' },
                { id: 'rank', name: 'Guess the Rank' },
                { id: 'higherLower', name: 'Higher or Lower' },
                { id: 'points', name: 'Who Has More Points?' },
            ];
        },
    },

    methods: {
        completedCount(player) {
            const names = new Set([
                ...(player.completed || []),
                ...(player.verified || []),
            ].map(item => String(item.level || '').toLowerCase()));

            return names.size;
        },

        chartX(player) {
            const max = Math.max(
                1,
                ...this.leaderboard.map(item => this.completedCount(item))
            );

            return 65 + this.completedCount(player) / max * 560;
        },

        chartY(player) {
            const max = Math.max(
                1,
                ...this.leaderboard.map(item => Number(item.total) || 0)
            );

            return 285 - (Number(player.total) || 0) / max * 240;
        },

        shuffle(items) {
            return [...items].sort(() => Math.random() - 0.5);
        },

        makeQuestion(prompt, correct, options = []) {
            const wrongOptions = [...new Set(
                options.filter(option =>
                    option !== null &&
                    option !== undefined &&
                    String(option).trim() !== '' &&
                    option !== correct
                )
            )];

            const selectedWrongOptions = this.shuffle(wrongOptions).slice(0, 3);

            return {
                prompt,
                correct,
                options: this.shuffle([
                    correct,
                    ...selectedWrongOptions,
                ]),
            };
        },

        startGame(mode) {
            this.gameMode = mode;
            this.gameFeedback = '';
            this.gameQuestion = null;

            let question;

            if (mode === 'verifier') {
                const available = this.levels.filter(level =>
                    level.verifier &&
                    String(level.verifier).trim()
                );

                if (!available.length) return;

                const level = available[
                    Math.floor(Math.random() * available.length)
                ];

                question = this.makeQuestion(
                    `Who verified ${level.name}?`,
                    level.verifier,
                    available.map(item => item.verifier)
                );
            }

            if (mode === 'firstVictor') {
                const available = this.firstVictors;

                if (!available.length) return;

                const item = available[
                    Math.floor(Math.random() * available.length)
                ];

                question = this.makeQuestion(
                    `Who was the First Victor of ${item.level}?`,
                    item.user,
                    available.map(entry => entry.user)
                );
            }

            if (mode === 'rank') {
                const available = this.levels.filter(level =>
                    level.name
                );

                if (!available.length) return;

                const index = Math.floor(Math.random() * available.length);
                const level = available[index];

                question = this.makeQuestion(
                    `What is the position of ${level.name}?`,
                    `#${index + 1}`,
                    available.map((item, i) => `#${i + 1}`)
                );
            }

            if (mode === 'higherLower') {
                if (this.levels.length < 2) return;

                const pair = this.shuffle(this.levels).slice(0, 2);
                const a = this.levels.findIndex(item => item.name === pair[0].name) + 1;
                const b = this.levels.findIndex(item => item.name === pair[1].name) + 1;

                const correct = a < b
                    ? pair[0].name
                    : pair[1].name;

                question = this.makeQuestion(
                    `Which level is higher on the Main List: ${pair[0].name} or ${pair[1].name}?`,
                    correct,
                    [pair[0].name, pair[1].name]
                );
            }

            if (mode === 'points') {
                if (this.leaderboard.length < 2) return;

                const pair = this.shuffle(this.leaderboard).slice(0, 2);

                const correct = pair[0].total >= pair[1].total
                    ? pair[0].user
                    : pair[1].user;

                question = this.makeQuestion(
                    `Who has more Classic Score: ${pair[0].user} or ${pair[1].user}?`,
                    correct,
                    [pair[0].user, pair[1].user]
                );
            }

            this.gameQuestion = question || null;
        },

        answerGame(option) {
            if (!this.gameQuestion || this.gameFeedback) return;

            this.gameAttempts++;

            if (option === this.gameQuestion.correct) {
                this.gameScore++;
                this.gameFeedback = 'Correct!';
            } else {
                this.gameFeedback =
                    `Incorrect! Correct answer: ${this.gameQuestion.correct}`;
            }
        },
    },

    async mounted() {
        try {
            const [leaderboard] = await fetchLeaderboard();
            this.leaderboard = leaderboard || [];

            const list = await fetchList();
            this.levels = (list || [])
                .map(([level]) => level)
                .filter(Boolean);

            this.selectedA = this.leaderboard[0]?.user || '';
            this.selectedB = this.leaderboard[1]?.user || '';

            this.startGame('verifier');
        } catch (error) {
            console.error('Failed to load leaderboard statistics:', error);
        }

        this.loading = false;
    },
};