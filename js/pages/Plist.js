import { embed } from "../util.js";

export default {

    template: `
        <main v-if="loading">
            <p>Cargando...</p>
        </main>

        <main v-else class="page-list">

            <div class="list-container">

                <table class="list">

                    <tr
                        v-for="(level, i) in list"
                        :key="i"
                    >

                        <td class="rank">
                            <p class="type-label-lg">
                                #{{ i + 1 }}
                            </p>
                        </td>

                        <td
                            class="level"
                            :class="{ active: selected === i }"
                        >

                            <button @click="selected = i">

                                <span class="type-label-lg">
                                    {{ level.name }}
                                </span>

                            </button>

                        </td>

                    </tr>

                </table>

            </div>

            <div class="level-container">

                <div
                    v-if="level"
                    class="level"
                >

                    <h1>{{ level.name }}</h1>

                    <p>
                        <strong>Author:</strong>
                        {{ level.author }}
                    </p>

                    <p>
                        <strong>Verifier:</strong>
                        {{ level.verifier }}
                    </p>

                    <iframe
                        v-if="level.verification"
                        class="video"
                        :src="video"
                        frameborder="0"
                    ></iframe>

                    <ul class="stats">

                        <li>
                            <div class="type-title-sm">
                                ID
                            </div>

                            <p>
                                {{ level.id }}
                            </p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Password
                            </div>

                            <p>
                                {{ level.password || 'Free to Copy' }}
                            </p>
                        </li>

                    </ul>

                    <h2>Records</h2>

                    <table
                        class="records"
                        v-if="level.records && level.records.length"
                    >

                        <tr
                            v-for="record in level.records"
                            class="record"
                        >

                            <td class="percent">
                                <p>
                                    {{ record.percent }}%
                                </p>
                            </td>

                            <td class="user">

                                <a
                                    :href="record.link"
                                    target="_blank"
                                    class="type-label-lg"
                                >
                                    {{ record.user }}
                                </a>

                            </td>

                            <td class="hz">

                                <p>
                                    {{ record.hz }}Hz
                                </p>

                            </td>

                        </tr>

                    </table>

                    <p v-else>
                        No records yet.
                    </p>

                </div>

            </div>

        </main>
    `,

    data: () => ({
        list: [],
        loading: true,
        selected: 0
    }),

    computed: {

        level() {
            return this.list[this.selected];
        },

        video() {
            return embed(this.level.verification);
        }

    },

    async mounted() {

        const result =
            await fetch("/data/_plist.json");

        const paths =
            await result.json();

        this.list = await Promise.all(

            paths.map(async (path) => {

                const result =
                    await fetch(`/data/${path}.json`);

                return await result.json();

            })

        );

        this.loading = false;
    },

    methods: {
        embed
    }

};