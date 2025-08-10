import { createRouter, createWebHashHistory } from 'vue-router'
import { Home, Karaoke, KaraokeRoom, KaraokeDay, BoardGame, Setting } from '@/pages'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    alias: '/home',
    meta: { showHeader: false }
  },
  {
    path: '/karaoke',
    name: 'Karaoke',
    component: Karaoke,
    meta: { showHeader: true }
  },
  {
    path: '/karaoke/:day',
    name: 'KaraokeRoom',
    component: KaraokeRoom,
    meta: { showHeader: true }
  },
  {
    path: '/karaoke/:room/:day',
    name: 'KaraokeDay',
    component: KaraokeDay,
    meta: { showHeader: true }
  },
  {
    path: '/boardgame',
    name: 'BoardGame',
    component: BoardGame,
    meta: { showHeader: true }
  },
  {
    path: '/settings',
    name: 'Setting',
    component: Setting,
    meta: { showHeader: true }
  },
  {
    path: '/print/slip/:id',
    name: 'PrintableSlip',
    component: () => import('@/components/printable/BookingSlip.vue'),
    meta: { showHeader: false } // No layout for the slip
  },
  {
    path: '/print/member-slip/:id',
    name: 'PrintableMemberSlip',
    component: () => import('@/components/printable/MemberSlip.vue'),
    meta: { showHeader: false } // No layout for the slip
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
