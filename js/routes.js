
import Home from './pages/Home.js';
import List from './pages/List.js';
import DemonList from './pages/Demonlist.js';
import PlatformerList from './pages/Plist.js';
import HallOfFame from './pages/HallOfFame.js';
import Leaderboard from './pages/Leaderboard.js';
import Packs from './pages/Packs.js';
import Roulette from './pages/Roulette.js';
import Changelog from './pages/Changelog.js';
import ChallengeList from './pages/ChallengeList.js';
import Comparator from './pages/Comparator.js';

export default [
    { path: '/', component: Home },
    { path: '/list', component: List },
    { path: '/demon-list', component: DemonList },
    { path: '/platformer-list', component: PlatformerList },
    { path: '/hall-of-fame', component: HallOfFame },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/packs', component: Packs },
    { path: '/roulette', component: Roulette },
    { path: '/changelog', component: Changelog },
    { path: '/challenge-list', component: ChallengeList },
    { path: '/comparator', component: Comparator },
];
