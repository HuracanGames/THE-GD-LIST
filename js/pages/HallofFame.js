
export default {
    data() {
        return {
            levels: [],
            loading: true,
            error: false
        };
    },

    template: `
        <main class="page-list">
            <div class="level-container">
                <div class="level">
                    <h1>🏆 Hall of Fame</h1>

                    <p>
                        All levels that have reached #1
                        in The GD List.
                    </p>

                    <p v-if="loading">
                        Loading Hall of Fame...
                    </p>

                    <p v-else-if="error">
                        Failed to load Hall of Fame.
                    </p>

                    <p v-else-if="levels.length === 0">
                        No historical #1 levels have been added yet.
                    </p>

                    <table v-else class="records">
                        <tr>
                            <th>Level</th>
                            <th>Author</th>
                            <th>Achievement</th>
                            <th>Date</th>
                        </tr>

                        <tr
                            v-for="(level, i) in levels"
                            :key="level.name + i"
                            class="record"
                        >
                            <td>{{ level.name }}</td>
                            <td>{{ level.author }}</td>
                            <td>#{{ level.formerRank }}</td>
                            <td>{{ level.date }}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </main>
    `,

    async mounted() {
        try {
            const response = await fetch("/data/_halloffame.json");

            if (!response.ok) {
                throw new Error("Failed to load Hall of Fame data");
            }

            this.levels = await response.json();
        } catch (error) {
            this.error = true;
            console.error(error);
        } finally {
            this.loading = false;
        }
    }
};
