
import { store } from "../main.js";
import { embed } from "../util.js";
import { fetchDemonList } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: { Spinner, LevelAuthors },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">
            <div class="list-container list-container--cards">
                <table class="list list--cards" v-if="list && list.length">
                    <template v-for="([level, err], i) in list" :key="i">
                        <tr
                            :class="{
                                'list-card-active': selected === i
                            }"
                        >
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>

                            <td
                                class="level"
                                :class="{ active: selected === i }"
                            >
                                <button
                                    @click="level && selectLevel(i)"
                                    :aria-expanded="selected === i"
                                    :disabled="!level"
                                >
                                    <span class="level-thumbnail">
                                        <img
                                            v-if="level && youtubeThumbnail(level) && !thumbnailErrors[i]"
                                            :src="youtubeThumbnail(level)"
                                            :alt="(level?.name || 'Level') + ' thumbnail'"
                                            loading="lazy"
                                            @error="thumbnailErrors[i] = true"
                                        />

                                        <span
                                            v-else
                                            class="level-thumbnail-placeholder"
                                        >
                                            GD
                                        </span>
                                    </span>

                                    <span class="level-card-text">
                                        <span class="level-card-name type-label-lg">
                                            {{ level?.name || ('Error (' + err + '.json)') }}
                                        </span>

                                        <span class="level-card-author">
                                            {{
                                                level?.creator ||
                                                level?.author ||
                                                level?.creators?.map(creator =>
                                                    typeof creator === 'string'
                                                        ? creator
                                                        : creator.name
                                                ).join(', ') ||
                                                level?.verifier ||
                                                'Unknown'
                                            }}
                                        </span>
                                    </span>
                                </button>
                            </td>
                        </tr>

                        <tr
                            v-if="selected === i && level"
                            class="expanded-level-row"
                        >
                            <td colspan="2">
                                <div class="expanded-level">
                                    <h2>{{ level.name }}</h2>

                                    <LevelAuthors
                                        :author="level.creator || level.author"
                                        :creators="level.creators"
                                        :verifier="level.verifier"
                                    ></LevelAuthors>

                                    <p>
                                        <strong>Difficulty:</strong>
                                        Extreme Demon
                                    </p>

                                    <p>
                                        <strong>Status:</strong>
                                        {{ level.rated ? 'Rated' : 'Unrated' }}
                                    </p>

                                    <p>
                                        <strong>ID:</strong>
                                        {{ level.id || 'Not specified' }}
                                    </p>

                                    <p v-if="level.description">
                                        {{ level.description }}
                                    </p>

                                    <iframe
                                        v-if="video"
                                        class="video"
                                        :src="video"
                                        title="Level verification video"
                                        frameborder="0"
                                        allowfullscreen
                                    ></iframe>
                                </div>
                            </td>
                        </tr>
                    </template>
                </table>

                <div
                    v-if="list && list.length === 0"
                    class="level level-empty"
                >
                    <p>No levels have been added yet.</p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        list: [],
        loading: true,
        selected: -1,
        store,
        thumbnailErrors: {},
    }),

    computed: {
        level() {
            return this.selected >= 0
                ? this.list[this.selected]?.[0] || null
                : null;
        },

        video() {
            if (!this.level) {
                return "";
            }

            return embed(
                this.level.verification || this.level.video || ""
            );
        },
    },

    async mounted() {
        try {
            this.list = await fetchDemonList();

            if (!this.list) {
                this.list = [];
            }
        } catch (error) {
            console.error("Failed to load Demon List:", error);
            this.list = [];
        }

        this.loading = false;
    },

    methods: {
        selectLevel(index) {
            this.selected = this.selected === index ? -1 : index;
        },

        youtubeThumbnail(level) {
            const url = level?.verification || level?.video;

            if (typeof url !== "string" || !url.trim()) {
                return "";
            }

            let parsed;

            try {
                parsed = new URL(url.trim());
            } catch {
                return "";
            }

            const host = parsed.hostname.replace(/^www\./, "");
            let id = "";

            if (host === "youtu.be") {
                id = parsed.pathname.split("/").filter(Boolean)[0] || "";
            } else if (
                host === "youtube.com" ||
                host === "m.youtube.com" ||
                host === "youtube-nocookie.com"
            ) {
                id =
                    parsed.searchParams.get("v") ||
                    parsed.pathname.match(
                        /^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/
                    )?.[1] ||
                    "";
            }

            if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
                return "";
            }

            return "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
        },
    },
};
