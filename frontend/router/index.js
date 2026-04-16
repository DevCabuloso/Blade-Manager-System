import { createRouter, createWebHistory } from 'vue-router';

import Login from '../pages/Login.vue';
import Cadastro from '../pages/Register.vue';

import Dashboard from '../pages/professional/Dashboard.vue';
import Agenda from '../pages/professional/Agenda.vue';
import Services from '../pages/professional/Services.vue';
import Profile from '../pages/professional/Profile.vue';
import Horarios from '../pages/professional/Horarios.vue';

import UserServices from '../pages/users/UserServices.vue';

import Admin from '../pages/adm/Admin.vue';
import Barbearias from '../pages/adm/Barbearias.vue';
import ApresentacaoBladeManager from '../pages/ApresentacaoBladeManager.vue';

const routes = [
  { path: '/', name: 'Apresentacao', component: ApresentacaoBladeManager },

  { path: '/login', component: Login },
  { path: '/register', component: Cadastro },

  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, role: 'barbeiro' } },
  { path: '/agenda', component: Agenda, meta: { requiresAuth: true, role: 'barbeiro' } },
  { path: '/services', component: Services, meta: { requiresAuth: true, role: 'barbeiro' } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true, role: 'barbeiro' } },
  { path: '/horarios', component: Horarios, meta: { requiresAuth: true, role: 'barbeiro' } },

  { path: '/agendar/:profissionalId', name: 'UserServices', component: UserServices },

  {
    path: '/adm',
    component: Admin,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'barbearias', name: 'admin-barbearias', component: Barbearias, meta: { requiresAuth: true, role: 'admin' } },
    ],
  },

  { path: '/:catchAll(.*)', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware atualizado
// router/index.js  (substitua todo o beforeEach por este)

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const tipoUsuario = sessionStorage.getItem('tipo_usuario');

  // 1. SE TEM profissionalId na URL → VAI DIRETO PRO LOGIN (mesmo na home)
  if (to.query.profissionalId && to.path === '/') {
    sessionStorage.setItem('pendingProfissionalId', to.query.profissionalId);
    return next(`/login?profissionalId=${to.query.profissionalId}`);
  }

  // 2. Salva ID se vier em qualquer outra rota
  if (to.query.profissionalId) {
    sessionStorage.setItem('pendingProfissionalId', to.query.profissionalId);
  }

  // 3. Rotas protegidas
  if (to.meta.requiresAuth && !token) {
    sessionStorage.setItem('redirectAfterAuth', to.fullPath);
    const loginPath = to.query.profissionalId 
      ? `/login?profissionalId=${to.query.profissionalId}` 
      : '/login';
    return next(loginPath);
  }

  // 4. Controle de role
  if (to.meta.role && tipoUsuario !== to.meta.role) {
    return next(
      tipoUsuario === 'admin' ? '/adm' :
      tipoUsuario === 'barbeiro' ? '/dashboard' : '/'
    );
  }

  next();
});

export default router;