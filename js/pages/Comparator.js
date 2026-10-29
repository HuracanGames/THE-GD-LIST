
import { fetchList } from '../content.js';

export default {
    template: `
        <main class="comparator-page">
            <h1>Level Comparator</h1>
            <p>Compare two levels from The GD List.</p>

            <div v-if="loading">
                <p>Loading levels...</p>
            </div>

            <div v-else-if="error">
                <p>{{ error }}</p>
            </div>

            <template v-else>
                <div class="comparator-selectors">
                    <div class="comparator-field">
                        <label for="level-a">Level A</label>
                        <select id="level-a" v-model.number="first">
                            <option
                                v-for="(level, index) in levels"
                                :key="level.name"
                                :value="index"
                            >
                                #{{ index + 1 }} - {{ level.name }}
                            </option>
                        </select>
                    </div>

                    <div class="comparator-field">
                        <label for="level-b">Level B</label>
                        <select id="level-b" v-model.number="second">
                            <option
                                v-for="(level, index) in levels"
                                :key="level.name"
                                :value="index"
                            >
                                #{{ index + 1 }} - {{ level.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <p v-if="first === second" class="comparator-warning">
                    Select two different levels to compare them.
                </p>

                <div v-else class="comparator-results">
                    <section
                        v-for="index in [first, second]"
                        :key="index"
                        class="comparator-card"
                    >
                        <h2>
                            #{{ index + 1 }} — {{ levels[index].name }}
                        </h2>

                        <p>
                            <strong>Current position:</strong>
                            #{{ index + 1 }}
                        </p>

                        <p>
                            <strong>ID:</strong>
                            {{ levels[index].id || 'Not available' }}
                        </p>

                        <p>
                            <strong>Author:</strong>
                            {{ levels[index].author || 'Not available' }}
                        </p>

                        <p>
                            <strong>Verifier:</strong>
                            {{ levels[index].verifier || 'Not available' }}
                        </p>

                        <p>
                            <strong>Records:</strong>
                            {{ (levels[index].records || []).length }}
                        </p>
                    </section>
                </div>
            </template>
        </main>
    `,

    data() {
        return {
            levels: [],
            first: 0,
            second: 1,
            loading: true,
            error: '',
        };
    },

    async mounted() {
        try {
            const result = await fetchList();

            if (!Array.isArray(result)) {
                throw new Error('The level list could not be loaded.');
            }

            this.levels = result
                .filter(([level]) => level)
                .map(([level]) => level);

            if (this.levels.length < 2) {
                throw new Error('At least two levels are needed.');
            }
        } catch (error) {
            console.error('Level Comparator error:', error);
            this.error =
                'Could not load levels. Check the browser console and the list files.';
        } finally {
            this.loading = false;
        }
    },
};
