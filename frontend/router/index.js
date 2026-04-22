import { createRouter, createWebHistory } from 'vue-router';
import { applyAuthGuard } from './authGuard.js';

const Login = () => import('../pages/Login.vue');
const Cadastro = () => import('../pages/Register.vue');
const Dashboard = () => import('../pages/professional/Dashboard.vue');
const Agenda = () => import('../pages/professional/Agenda.vue');
const Services = () => import('../pages/professional/Services.vue');
const Profile = () => import('../pages/professional/Profile.vue');
const Horarios = () => import('../pages/professional/Horarios.vue');
const UserServices = () => import('../pages/users/UserServices.vue');
const Contact = () => import('../pages/Contact.vue');
const Admin = () => import('../pages/adm/Admin.vue');
const Barbearias = () => import('../pages/adm/Barbearias.vue');
const Relatorios = () => import('../pages/adm/Relatorios.vue');
const ApresentacaoBladeManager = () => import('../pages/ApresentacaoBladeManager.vue');

const routes = [
  { path: '/', name: 'Apresentacao', component: ApresentacaoBladeManager },
  { path: '/login', component: Login },
  { path: '/contato', component: Contact },
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
      { path: '', redirect: '/adm/barbearias' },
      { path: 'barbearias', name: 'admin-barbearias', component: Barbearias, meta: { requiresAuth: true, role: 'admin' } },
      { path: 'relatorios', name: 'admin-relatorios', component: Relatorios, meta: { requiresAuth: true, role: 'admin' } },
    ],
  },
  { path: '/:catchAll(.*)', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

applyAuthGuard(router);

export default router;
