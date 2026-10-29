
export default {
    name: "ChallengeList",

    data() {
        return {
            challenges: [],
            loading: true,
            error: ""
        };
    },

    async mounted() {
        try {
            const response = await fetch("/data/_challengelist.json");

            if (!response.ok) {
                throw new Error("No se pudo cargar _challengelist.json");
            }

            const challengeNames = await response.json();

            const challengesData = await Promise.all(
                challengeNames.map(async (challengeName) => {
                    const fileName = `${challengeName}.json`;

                    const challengeResponse = await fetch(
                        `/data/${encodeURIComponent(fileName)}`
                    );

                    if (!challengeResponse.ok) {
                        throw new Error(
                            `No se pudo cargar el archivo: ${fileName}`
                        );
                    }

                    return await challengeResponse.json();
                })
            );

            this.challenges = challengesData;
        } catch (error) {
            console.error("Error al cargar The GD Challenge List:", error);
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    },

    template: `
        <main class="challenge-list-page">
            <header class="challenge-list-header">
                <h1>The GD Challenge List</h1>
                <p>Classic Mode challenges, from hardest to easiest.</p>
            </header>

            <div v-if="loading" class="challenge-list-message">
                Loading challenges...
            </div>

            <div v-else-if="error" class="challenge-list-error">
                <h2>Error loading challenges</h2>
                <p>{{ error }}</p>
            </div>

            <div
                v-else-if="challenges.length === 0"
                class="challenge-list-message"
            >
                No challenges have been added yet.
            </div>

            <section v-else class="challenge-list">
                <article
                    v-for="(challenge, index) in challenges"
                    :key="challenge.id ?? challenge.name"
                    class="challenge-card"
                >
                    <div class="challenge-position">
                        #{{ index + 1 }}
                    </div>

                    <div class="challenge-info">
                        <h2>{{ challenge.name }}</h2>

                        <p>
                            <strong>Author:</strong>
                            {{ challenge.author || "Unknown" }}
                        </p>

                        <p v-if="challenge.creators && challenge.creators.length">
                            <strong>Creators:</strong>
                            {{ challenge.creators.join(", ") }}
                        </p>

                        <p>
                            <strong>Verifier:</strong>
                            {{ challenge.verifier || "Unknown" }}
                        </p>

                        <p v-if="challenge.percentToQualify !== undefined">
                            <strong>Percent to qualify:</strong>
                            {{ challenge.percentToQualify }}%
                        </p>
                    </div>
                </article>
            </section>
        </main>
    `
};
