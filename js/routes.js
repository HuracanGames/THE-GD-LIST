import Home from './pages/Home.js';
import List from './pages/List.js';
import PlatformerList from './pages/Plist.js';
import Leaderboard from './pages/Leaderboard.js';
import Packs from './pages/Packs.js';
import Roulette from './pages/Roulette.js';
import Changelog from './pages/Changelog.js';

export default [
    { path: '/', component: Home },
    { path: '/list', component: List },
    { path: '/platformer-list', component: PlatformerList },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/packs', component: Packs },
    { path: '/roulette', component: Roulette },
    { path: '/changelog', component: Changelog },
];