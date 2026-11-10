
import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";

import {
    fetchEditors,
    fetchList,
    fetchImpossibleList,
    fetchUnverifiedList,
    fetchHistory
} from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">
            <div
                class="list-container"
                :class="{ 'list-container--cards': viewMode === 'cards' }"
            >
                <div class="list-tabs">
                    <button
                        :class="{ active: viewMode === 'classic' }"
                        @click="setView('classic')"
                    >
                        Classic
                    </button>

                    <button
                        :class="{ active: viewMode === 'cards' }"
                        @click="setView('cards')"
                    >
                        Boxes
                    </button>

                    <button
                        :class="{ active: viewMode === 'time-machine' }"
                        @click="setView('time-machine')"
                    >
                        Time Machine
                    </button>

                    <button
                        class="list-settings-button"
                        @click="settingsOpen = !settingsOpen"
                        :aria-expanded="settingsOpen"
                        title="List settings"
                    >
                        ⚙
                    </button>
                </div>

                <div v-if="settingsOpen" class="list-settings">
                    <h3>List Settings</h3>

                    <label>
                        <input
                            type="checkbox"
                            :checked="showImpossible"
                            @change="toggleImpossible"
                        />
                        Impossible Levels
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            :checked="showUnverified"
                            @change="toggleUnverified"
                        />
                        Unverified
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            :checked="showLegacy"
                            @change="toggleLegacy"
                        />
                        LEGACY
                    </label>
                </div>

                <!-- TIME MACHINE -->
                <section
                    v-if="viewMode === 'time-machine'"
                    class="time-machine"
                >
                    <h2>Time Machine</h2>

                    <p>
                        Explore previous versions of The GD List
                        and compare their rankings.
                    </p>

                    <div v-if="!history.length" class="time-machine-empty">
                        <p>No historical snapshots available.</p>
                        <p>
                            Check that data/history/_history.json
                            exists and contains snapshots.
                        </p>
                    </div>

                    <template v-else>
                        <div class="time-machine-controls">
                            <div>
                                <label for="history-date">
                                    Select a date
                                </label>

                                <select
                                    id="history-date"
                                    v-model.number="selectedHistoryIndex"
                                >
                                    <option
                                        v-for="option in historyOptions"
                                        :key="option.index"
                                        :value="option.index"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label for="compare-date">
                                    Compare with
                                </label>

                                <select
                                    id="compare-date"
                                    v-model.number="compareHistoryIndex"
                                >
                                    <option :value="-1">
                                        No comparison
                                    </option>

                                    <option
                                        v-for="option in historyOptions"
                                        :key="'compare-' + option.index"
                                        :value="option.index"
                                        :disabled="option.index === selectedHistoryIndex"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div
                            v-if="selectedHistory"
                            class="time-machine-info"
                        >
                            <h3>
                                {{ formatHistoryDate(selectedHistory.date) }}
                            </h3>

                            <p>
                                {{ selectedHistory.levels.length }}
                                levels in this snapshot.
                            </p>
                        </div>

                        <div
                            v-if="selectedHistory && compareHistory"
                            class="time-machine-comparison"
                        >
                            <h3>Comparison</h3>

                            <p>
                                Comparing
                                {{ formatHistoryDate(selectedHistory.date) }}
                                with
                                {{ formatHistoryDate(compareHistory.date) }}.
                            </p>

                            <div class="time-machine-stats">
                                <div>
                                    <strong>{{ comparisonStats.improved }}</strong>
                                    <span>Improved</span>
                                </div>

                                <div>
                                    <strong>{{ comparisonStats.declined }}</strong>
                                    <span>Declined</span>
                                </div>

                                <div>
                                    <strong>{{ comparisonStats.new }}</strong>
                                    <span>New levels</span>
                                </div>

                                <div>
                                    <strong>{{ comparisonStats.removed }}</strong>
                                    <span>Removed levels</span>
                                </div>
                            </div>
                        </div>

                        <div class="time-machine-table-wrapper">
                            <table class="list time-machine-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Level</th>
                                        <th v-if="compareHistory">
                                            Change
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr
                                        v-for="(levelName, index) in selectedHistory?.levels || []"
                                        :key="index + '-' + levelName"
                                    >
                                        <td class="rank">
                                            <p class="type-label-lg">
                                                #{{ index + 1 }}
                                            </p>
                                        </td>

                                        <td class="level">
                                            <span class="level-card-name type-label-lg">
                                                {{ levelName }}
                                            </span>
                                        </td>

                                        <td
                                            v-if="compareHistory"
                                            class="time-machine-change"
                                        >
                                            <span
                                                :class="getLevelChange(levelName).class"
                                            >
                                                {{ getLevelChange(levelName).text }}
                                            </span>
                                        </td>
                                    </tr>

                                    <tr
                                        v-if="selectedHistory?.levels?.length === 0"
                                    >
                                        <td colspan="3">
                                            No levels in this snapshot.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div
                            v-if="compareHistory && comparisonRemoved.length"
                            class="time-machine-removed"
                        >
                            <h3>Removed levels</h3>

                            <p>
                                These levels appeared in the comparison
                                snapshot but are missing from the selected one.
                            </p>

                            <ul>
                                <li
                                    v-for="item in comparisonRemoved"
                                    :key="item.name"
                                >
                                    {{ item.name }}
                                    <span>#{{ item.position }}</span>
                                </li>
                            </ul>
                        </div>
                    </template>
                </section>

                <!-- Level Search -->
                <div
                    class="list-search"
                    v-if="viewMode !== 'time-machine'"
                >
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search levels, authors or verifiers..."
                        aria-label="Search levels"
                    />

                    <button
                        v-if="searchQuery"
                        @click="searchQuery = ''"
                        title="Clear search"
                    >
                        ✕
                    </button>
                </div>

                <!-- Impossible Levels -->
                <table
                    class="list"
                    :class="{ 'list--cards': viewMode === 'cards' }"
                    v-if="viewMode !== 'time-machine' && showImpossible && filteredImpossibleList.length"
                >
                    <tbody>
                        <tr class="list-section">
                            <td colspan="2">
                                <p class="type-label-lg">
                                    - Impossible Levels -
                                </p>
                            </td>
                        </tr>

                        <tr
                            v-for="([level, err, originalIndex], i) in filteredImpossibleList"
                            :key="'impossible-' + originalIndex"
                            :class="{ 'list-card-error': !level }"
                        >
                            <td class="rank">
                                <p class="type-label-lg">
                                    #{{ originalIndex + 1 }}
                                </p>
                            </td>

                            <td class="level">
                                <div>
                                    <span class="level-card-name type-label-lg">
                                        {{ level?.name || ('Error (' + err + '.json)') }}
                                    </span>

                                    <span
                                        v-if="level?.author"
                                        class="level-card-author"
                                    >
                                        ({{ level.author }})
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Unverified -->
                <table
                    class="list"
                    :class="{ 'list--cards': viewMode === 'cards' }"
                    v-if="viewMode !== 'time-machine' && showUnverified && filteredUnverifiedList.length"
                >
                    <tbody>
                        <tr class="list-section">
                            <td colspan="2">
                                <p class="type-label-lg">
                                    - Unverified -
                                </p>
                            </td>
                        </tr>

                        <tr
                            v-for="([level, err, originalIndex], i) in filteredUnverifiedList"
                            :key="'unverified-' + originalIndex"
                            :class="{ 'list-card-error': !level }"
                        >
                            <td class="rank">
                                <p class="type-label-lg">
                                    #{{ originalIndex + 1 }}
                                </p>
                            </td>

                            <td class="level">
                                <div>
                                    <span class="level-card-name type-label-lg">
                                        {{ level?.name || ('Error (' + err + '.json)') }}
                                    </span>

                                    <span
                                        v-if="level?.author"
                                        class="level-card-author"
                                    >
                                        ({{ level.author }})
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Main List -->
                <table
                    class="list"
                    :class="{ 'list--cards': viewMode === 'cards' }"
                    v-if="viewMode !== 'time-machine' && list"
                >
                    <template
                        v-for="([level, err, originalIndex], i) in filteredList"
                        :key="originalIndex"
                    >
                        <tr
                            v-if="i === 0 && searchQuery.trim()"
                            class="list-section"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- Search Results -</p>
                            </td>
                        </tr>

                        <tr
                            v-if="!searchQuery.trim() && originalIndex === 0"
                            class="list-section list-section--principal"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- Principal -</p>
                            </td>
                        </tr>

                        <tr
                            v-if="!searchQuery.trim() && originalIndex === 20 && !showLegacy"
                            class="list-section list-section--extended"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- Extended -</p>
                            </td>
                        </tr>

                        <tr
                            v-if="!searchQuery.trim() && originalIndex === 20 && showLegacy"
                            class="list-section"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- LEGACY -</p>
                            </td>
                        </tr>

                        <tr
                            v-if="!searchQuery.trim() && originalIndex === 40 && !showLegacy"
                            class="list-section list-section--voyage"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- Voyage List -</p>
                            </td>
                        </tr>

                        <tr
                            v-if="!searchQuery.trim() && originalIndex === 55 && !showLegacy"
                            class="list-section list-section--frontier"
                        >
                            <td colspan="2">
                                <p class="type-label-lg">- Frontier List -</p>
                            </td>
                        </tr>

                        <tr
                            :class="{
                                'list-card-active': selected === originalIndex,
                                'list-card-error': !level
                            }"
                        >
                            <td class="rank">
                                <p class="type-label-lg">#{{ originalIndex + 1 }}</p>
                            </td>

                            <td
                                class="level"
                                :class="{
                                    active: selected === originalIndex,
                                    error: !level
                                }"
                            >
                                <button
                                    @click="selectLevel(originalIndex)"
                                    :disabled="!level"
                                    :aria-expanded="viewMode === 'cards' && selected === originalIndex"
                                >
                                    <span
                                        v-if="viewMode === 'cards'"
                                        class="level-thumbnail"
                                    >
                                        <img
                                            v-if="youtubeThumbnail(level) && !thumbnailErrors[originalIndex]"
                                            :src="youtubeThumbnail(level)"
                                            :alt="(level?.name || 'Level') + ' thumbnail'"
                                            loading="lazy"
                                            @error="thumbnailErrors[originalIndex] = true"
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

                                        <span
                                            v-if="viewMode === 'cards' && level"
                                            class="level-card-author"
                                        >
                                            {{ level.author || level.verifier || 'The GD List' }}
                                        </span>
                                    </span>
                                </button>
                            </td>
                        </tr>

                        <tr
                            v-if="viewMode === 'cards' && selected === originalIndex && level"
                            class="expanded-level-row"
                        >
                            <td colspan="2">
                                <div class="expanded-level">
                                    <h2>{{ level.name }}</h2>

                                    <LevelAuthors
                                        :author="level.author"
                                        :creators="level.creators"
                                        :verifier="level.verifier"
                                    ></LevelAuthors>

                                    <iframe
                                        class="video"
                                        :src="video"
                                        title="Level verification video"
                                        frameborder="0"
                                        allowfullscreen
                                    ></iframe>

                                    <div class="expanded-stats">
                                        <div>
                                            <strong>Points when completed</strong>
                                            <p>
                                                {{ score(originalIndex + 1, 100, level.percentToQualify) }}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>ID</strong>
                                            <p>{{ level.id }}</p>
                                        </div>

                                        <div>
                                            <strong>Password</strong>
                                            <p>{{ level.password || 'Free to Copy' }}</p>
                                        </div>
                                    </div>

                                    <h3>Records</h3>

                                    <p v-if="originalIndex + 1 <= 75">
                                        <strong>{{ level.percentToQualify }}%</strong>
                                        or better to qualify
                                    </p>

                                    <p v-else-if="originalIndex + 1 <= 150">
                                        <strong>100%</strong>
                                        or better to qualify
                                    </p>

                                    <p v-else>
                                        This level does not accept new records.
                                    </p>

                                    <table class="records">
                                        <tbody>
                                            <tr
                                                v-for="record in level.records || []"
                                                :key="record.user + record.percent"
                                                class="record"
                                            >
                                                <td class="percent">
                                                    <p>{{ record.percent }}%</p>
                                                </td>

                                                <td class="user">
                                                    <a
                                                        :href="record.link"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="type-label-lg"
                                                    >
                                                        {{ record.user }}
                                                    </a>
                                                </td>

                                                <td class="mobile">
                                                    <img
                                                        v-if="record.mobile"
                                                        :src="'/assets/phone-landscape' + (store.dark ? '-dark' : '') + '.svg'"
                                                        alt="Mobile"
                                                    />
                                                </td>

                                                <td class="hz">
                                                    <p>{{ record.hz }}Hz</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h3>Position History</h3>

                                    <table class="records">
                                        <tbody>
                                            <tr
                                                v-for="(entry, index) in level.PositionHistory || []"
                                                :key="index"
                                                class="record"
                                            >
                                                <td class="percent">
                                                    <p>#{{ entry.position }}</p>
                                                </td>

                                                <td class="user">
                                                    <p>{{ entry.date }}</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </template>

                    <tr v-if="filteredList.length === 0">
                        <td colspan="2">
                            <p class="type-label-lg" style="text-align: center; padding: 20px;">
                                No levels found.
                            </p>
                        </td>
                    </tr>
                </table>

                <p
                    v-if="viewMode !== 'time-machine' && searchQuery.trim() && filteredImpossibleList.length === 0 && filteredUnverifiedList.length === 0 && filteredList.length === 0"
                    class="type-label-lg"
                    style="text-align: center; padding: 20px;"
                >
                    No levels found.
                </p>
            </div>

            <div
                class="level-container"
                v-if="viewMode === 'classic'"
            >
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>

                    <LevelAuthors
                        :author="level.author"
                        :creators="level.creators"
                        :verifier="level.verifier"
                    ></LevelAuthors>

                    <iframe
                        class="video"
                        id="videoframe"
                        :src="video"
                        title="Level verification video"
                        frameborder="0"
                    ></iframe>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>

                    <h2>Records</h2>

                    <p v-if="selected + 1 <= 75">
                        <strong>{{ level.percentToQualify }}%</strong>
                        or better to qualify
                    </p>

                    <p v-else-if="selected + 1 <= 150">
                        <strong>100%</strong>
                        or better to qualify
                    </p>

                    <p v-else>
                        This level does not accept new records.
                    </p>

                    <table class="records">
                        <tbody>
                            <tr
                                v-for="record in level.records || []"
                                :key="record.user + record.percent"
                                class="record"
                            >
                                <td class="percent">
                                    <p>{{ record.percent }}%</p>
                                </td>

                                <td class="user">
                                    <a
                                        :href="record.link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="type-label-lg"
                                    >
                                        {{ record.user }}
                                    </a>
                                </td>

                                <td class="mobile">
                                    <img
                                        v-if="record.mobile"
                                        :src="'/assets/phone-landscape' + (store.dark ? '-dark' : '') + '.svg'"
                                        alt="Mobile"
                                    />
                                </td>

                                <td class="hz">
                                    <p>{{ record.hz }}Hz</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h2>Position History</h2>

                    <table class="records">
                        <tbody>
                            <tr
                                v-for="(entry, i) in level.PositionHistory || []"
                                :key="i"
                                class="record"
                            >
                                <td class="percent">
                                    <p>#{{ entry.position }}</p>
                                </td>

                                <td class="user">
                                    <p>{{ entry.date }}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="level level-empty">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container" v-if="viewMode !== 'time-machine'">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p
                            class="error"
                            v-for="error in errors"
                            :key="error"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by
                            <a
                                href="https://tsl.pages.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                TheShittyList
                            </a>
                        </p>
                    </div>

                    <template v-if="editors">
                        <h3>List Editors</h3>

                        <ol class="editors">
                            <li v-for="editor in editors" :key="editor.name">
                                <img
                                    :src="'/assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'"
                                    :alt="editor.role"
                                />

                                <a
                                    v-if="editor.link"
                                    class="type-label-lg link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    :href="editor.link"
                                >
                                    {{ editor.name }}
                                </a>

                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3>Submission Requirements</h3>

                    <p>
                        Achieved the record without using hacks
                        (however, FPS bypass is allowed, up to 360fps)
                    </p>

                    <p>
                        Achieved the record on the level that is listed
                        on the site - please check the level ID before
                        you submit a record
                    </p>

                    <p>
                        Have either source audio or clicks/taps in the video.
                        Edited audio only does not count
                    </p>

                    <p>
                        The recording must have a previous attempt and
                        entire death animation shown before the completion,
                        unless the completion is on the first attempt.
                        Everyplay records are exempt from this
                    </p>

                    <p>
                        The recording must also show the player hit the
                        endwall, or the completion will be invalidated.
                    </p>

                    <p>Do not use secret routes or bug routes</p>

                    <p>
                        Do not use easy modes, only a record of the
                        unmodified level qualifies
                    </p>

                    <p>
                        Once a level falls onto the Legacy List,
                        we accept records for it for 24 hours after it
                        falls off, then afterwards we never accept
                        records for said level
                    </p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        list: [],
        impossibleList: [],
        unverifiedList: [],
        editors: [],
        history: [],

        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        thumbnailErrors: {},
        toggledShowcase: false,
        settingsOpen: false,

        searchQuery: "",

        selectedHistoryIndex: 0,
        compareHistoryIndex: -1,

        showImpossible:
            localStorage.getItem("thegdlist-show-impossible") === "true",

        showUnverified:
            localStorage.getItem("thegdlist-show-unverified") === "true",

        showLegacy:
            localStorage.getItem("thegdlist-show-legacy") === "true",

        viewMode: ["classic", "cards", "time-machine"].includes(
            localStorage.getItem("thegdlist-list-view")
        )
            ? localStorage.getItem("thegdlist-list-view")
            : "classic",
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

            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },

        filteredList() {
            const query = this.searchQuery.trim();

            return this.list
                .map(([level, err], index) => [level, err, index])
                .filter(([level]) => {
                    return !query || this.matchesSearch(level, query);
                });
        },

        filteredImpossibleList() {
            const query = this.searchQuery.trim();

            return this.impossibleList
                .map(([level, err], index) => [level, err, index])
                .filter(([level]) => {
                    return !query || this.matchesSearch(level, query);
                });
        },

        filteredUnverifiedList() {
            const query = this.searchQuery.trim();

            return this.unverifiedList
                .map(([level, err], index) => [level, err, index])
                .filter(([level]) => {
                    return !query || this.matchesSearch(level, query);
                });
        },

        historyOptions() {
            const dateCounts = {};

            return this.history.map((snapshot, index) => {
                const date = snapshot.date || "Unknown date";

                dateCounts[date] = (dateCounts[date] || 0) + 1;

                const totalForDate = this.history.filter(
                    item => item.date === date
                ).length;

                return {
                    index,
                    label: totalForDate > 1
                        ? `${this.formatHistoryDate(date)} — Version ${dateCounts[date]}`
                        : this.formatHistoryDate(date),
                };
            });
        },

        selectedHistory() {
            return this.history[this.selectedHistoryIndex] || null;
        },

        compareHistory() {
            return this.compareHistoryIndex >= 0
                ? this.history[this.compareHistoryIndex] || null
                : null;
        },

        comparisonStats() {
            if (!this.selectedHistory || !this.compareHistory) {
                return {
                    improved: 0,
                    declined: 0,
                    new: 0,
                    removed: 0,
                };
            }

            let improved = 0;
            let declined = 0;
            let newLevels = 0;

            const previousPositions = new Map(
                this.compareHistory.levels.map((name, index) => [
                    this.normalizeLevelName(name),
                    index + 1,
                ])
            );

            const currentNames = new Set(
                this.selectedHistory.levels.map(name =>
                    this.normalizeLevelName(name)
                )
            );

            this.selectedHistory.levels.forEach((name, index) => {
                const previousPosition = previousPositions.get(
                    this.normalizeLevelName(name)
                );

                if (previousPosition === undefined) {
                    newLevels++;
                    return;
                }

                const currentPosition = index + 1;

                if (currentPosition < previousPosition) {
                    improved++;
                } else if (currentPosition > previousPosition) {
                    declined++;
                }
            });

            const removed = this.compareHistory.levels.filter(
                name => !currentNames.has(this.normalizeLevelName(name))
            ).length;

            return {
                improved,
                declined,
                new: newLevels,
                removed,
            };
        },

        comparisonRemoved() {
            if (!this.selectedHistory || !this.compareHistory) {
                return [];
            }

            const currentNames = new Set(
                this.selectedHistory.levels.map(name =>
                    this.normalizeLevelName(name)
                )
            );

            return this.compareHistory.levels
                .map((name, index) => ({
                    name,
                    position: index + 1,
                }))
                .filter(item =>
                    !currentNames.has(this.normalizeLevelName(item.name))
                );
        },
    },

    async mounted() {
        if (this.viewMode === "cards") {
            this.selected = -1;
        }

        try {
            this.list = await fetchList();
            this.editors = await fetchEditors();
            this.impossibleList = await fetchImpossibleList();
            this.unverifiedList = await fetchUnverifiedList();

            const historyData = await fetchHistory();

            this.history = Array.isArray(historyData?.snapshots)
                ? historyData.snapshots.filter(snapshot =>
                    snapshot &&
                    typeof snapshot.date === "string" &&
                    Array.isArray(snapshot.levels)
                )
                : [];

            if (!this.list) {
                this.errors = [
                    "Failed to load list. Retry in a few minutes or notify list staff.",
                ];
            } else {
                this.errors.push(
                    ...this.list
                        .filter(([_, err]) => err)
                        .map(([_, err]) => {
                            return "Failed to load level. (" + err + ".json)";
                        })
                );

                if (!this.editors) {
                    this.errors.push("Failed to load list editors.");
                }
            }

            if (!this.impossibleList) {
                this.impossibleList = [];
                this.errors.push("Failed to load Impossible Levels.");
            } else {
                this.errors.push(
                    ...this.impossibleList
                        .filter(([_, err]) => err)
                        .map(([_, err]) => {
                            return "Failed to load Impossible Level. (" + err + ".json)";
                        })
                );
            }

            if (!this.unverifiedList) {
                this.unverifiedList = [];
                this.errors.push("Failed to load Unverified Levels.");
            } else {
                this.errors.push(
                    ...this.unverifiedList
                        .filter(([_, err]) => err)
                        .map(([_, err]) => {
                            return "Failed to load Unverified Level. (" + err + ".json)";
                        })
                );
            }

            if (!historyData) {
                this.errors.push("Failed to load Time Machine history.");
            }
        } catch (error) {
            console.error(error);
            this.errors.push(
                "Failed to load list. Retry in a few minutes or notify list staff."
            );
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,

        normalizeLevelName(name) {
            return String(name || "").trim().toLowerCase();
        },

        formatHistoryDate(date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }

            const [year, month, day] = date.split("-");
            return `${day}/${month}/${year}`;
        },

        getLevelChange(levelName) {
            if (!this.compareHistory || !this.selectedHistory) {
                return {
                    text: "",
                    class: "",
                };
            }

            const oldPosition = this.compareHistory.levels.findIndex(
                name =>
                    this.normalizeLevelName(name) ===
                    this.normalizeLevelName(levelName)
            );

            if (oldPosition === -1) {
                return {
                    text: "NEW",
                    class: "time-machine-new",
                };
            }

            const currentPosition = this.selectedHistory.levels.findIndex(
                name =>
                    this.normalizeLevelName(name) ===
                    this.normalizeLevelName(levelName)
            );

            const difference = oldPosition - currentPosition;

            if (difference > 0) {
                return {
                    text: `▲ ${difference}`,
                    class: "time-machine-improved",
                };
            }

            if (difference < 0) {
                return {
                    text: `▼ ${Math.abs(difference)}`,
                    class: "time-machine-declined",
                };
            }

            return {
                text: "—",
                class: "time-machine-same",
            };
        },

        matchesSearch(level, query) {
            if (!level) {
                return false;
            }

            const searchText = [
                level.name,
                level.author,
                level.verifier,
                ...(Array.isArray(level.creators)
                    ? level.creators.map(creator => {
                        return typeof creator === "string"
                            ? creator
                            : creator?.name || "";
                    })
                    : []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchText.includes(query.toLowerCase());
        },

        toggleImpossible(event) {
            this.showImpossible = event.target.checked;

            localStorage.setItem(
                "thegdlist-show-impossible",
                this.showImpossible
            );
        },

        toggleUnverified(event) {
            this.showUnverified = event.target.checked;

            localStorage.setItem(
                "thegdlist-show-unverified",
                this.showUnverified
            );
        },

        toggleLegacy(event) {
            this.showLegacy = event.target.checked;

            localStorage.setItem(
                "thegdlist-show-legacy",
                this.showLegacy
            );
        },

        setView(view) {
            this.viewMode = view;
            localStorage.setItem("thegdlist-list-view", view);

            if (view === "cards") {
                this.selected = -1;
            } else if (view === "classic" && this.selected < 0) {
                this.selected = 0;
            }
        },

        selectLevel(index) {
            if (this.viewMode === "cards") {
                this.selected = this.selected === index ? -1 : index;
            } else {
                this.selected = index;
            }
        },

        youtubeThumbnail(level) {
            const url = level?.verification;

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
