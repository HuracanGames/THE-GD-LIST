export default {
    data: () => ({
        packs: {},
        loading: true,
    }),

    template: `
        <main v-if="loading">
            <p>Loading packs...</p>
        </main>

        <main v-else class="page-packs">

            <div class="packs-container">

                <div class="packs-header">
                    <h1>Packs</h1>
                    <p>Complete packs of levels from The GD List.</p>
                </div>

                <div
                    v-for="(pack, name) in packs"
                    class="pack"
                >

                    <div class="pack-header">

                        <div>
                            <h2>{{ name }}</h2>

                            <p class="pack-description">
                                {{ pack.description }}
                            </p>
                        </div>

                        <div class="pack-count">
                            <strong>{{ pack.levels.length }}</strong>
                            <span>levels</span>
                        </div>

                    </div>

                    <div class="pack-levels">

                        <div
                            v-for="(position, index) in pack.levels"
                            class="pack-level"
                        >

                            <div class="pack-level-number">
                                {{ index + 1 }}
                            </div>

                            <div class="pack-level-position">
                                #{{ position }}
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    `,

    async mounted() {

        try {

            const response = await fetch('/data/_packs.json');

            if (!response.ok) {
                throw new Error(
                    `Could not load _packs.json (${response.status})`
                );
            }

            const data = await response.json();

            this.packs = data[0];

        } catch (error) {

            console.error(
                'Failed to load packs:',
                error
            );

        }

        this.loading = false;
    },
};