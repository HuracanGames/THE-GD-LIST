export default {
    template: `
        <main class="home-page">

            <div class="home-grid">

                <section class="home-section">

                    <h2>Leaderboard</h2>

                    <p>
                        The Leaderboard shows players ordered by their
                        total amount of points.
                    </p>

                    <p>
                        A player's total includes points from verified,
                        completed and progressed levels, as well as
                        completed Packs.
                    </p>

                    <p>
                        Pack bonuses are added on top of normal level points.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Packs</h2>

                    <p>
                        Packs are groups of levels selected from
                        The GD List.
                    </p>

                    <p>
                        A player must complete every level in a Pack
                        to receive its bonus.
                    </p>

                    <div class="home-info-box">

                        <h3>Pack Bonus</h3>

                        <p>
                            Every completely completed Pack gives:
                        </p>

                        <p class="home-big-number">
                            +10 points
                        </p>

                        <p>
                            Each Pack gives its own bonus.
                        </p>

                    </div>

                </section>


                <section class="home-section">

                    <h2>Player Profiles</h2>

                    <p>
                        Players can have additional information displayed
                        on their Leaderboard profile.
                    </p>

                    <ul>
                        <li><strong>Username</strong></li>
                        <li><strong>Country and flag</strong></li>
                        <li><strong>Personal hardest</strong></li>
                        <li><strong>Hardest position</strong></li>
                        <li><strong>Packs completed</strong></li>
                    </ul>

                </section>


                <section class="home-section">

                    <h2>The List</h2>

                    <p>
                        The List contains all of the ranked levels in
                        The GD List.
                    </p>

                    <p>
                        Levels have a numerical position and can be
                        divided into different sections.
                    </p>

                    <p>
                        Each level can contain records, its verifier,
                        verification link and position history.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Records</h2>

                    <p>
                        Players can have records on levels showing
                        how much progress they have achieved.
                    </p>

                    <p>
                        Records are sorted by percentage, with higher
                        percentages appearing first.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Verification</h2>

                    <p>
                        Each level has a verifier.
                    </p>

                    <p>
                        The verifier is the player who verified the level.
                        Verification also counts as completing the level
                        for Pack completion.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Position History</h2>

                    <p>
                        Levels can have a Position History showing
                        changes to their position on The GD List.
                    </p>

                    <p>
                        This keeps a record of how a level's placement
                        has changed over time.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Roulette</h2>

                    <p>
                        The Roulette randomly selects a level from
                        The GD List.
                    </p>

                    <p>
                        It can be used when you want a random level
                        to play.
                    </p>

                </section>


                <section class="home-section">

                    <h2>Changelog</h2>

                    <p>
                        The Changelog records changes made to
                        The GD List.
                    </p>

                    <p>
                        It can contain updates to levels, features,
                        Packs and other parts of the website.
                    </p>

                </section>

            </div>


            <section class="home-navigation">

                <h2>Explore The GD List</h2>

                <p>
                    Use the navigation below to explore the website.
                </p>

                <div class="home-buttons">

                    <router-link
                        to="/list"
                        class="home-button"
                    >
                        View List
                    </router-link>

                    <router-link
                        to="/leaderboard"
                        class="home-button"
                    >
                        Leaderboard
                    </router-link>

                    <router-link
                        to="/packs"
                        class="home-button"
                    >
                        Packs
                    </router-link>

                    <router-link
                        to="/roulette"
                        class="home-button"
                    >
                        Roulette
                    </router-link>

                    <router-link
                        to="/changelog"
                        class="home-button"
                    >
                        Changelog
                    </router-link>

                </div>

            </section>

        </main>
    `
};