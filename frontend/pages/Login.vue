<template>
  <v-container fluid class="auth-screen auth-screen--login fill-height pa-4 pa-sm-6">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card class="auth-card" rounded="xl" border color="rgba(3, 7, 18, 0.94)">
          <v-card-item class="pb-0">
            <div class="auth-header text-center">
              <p class="auth-eyebrow">Acesso</p>
              <v-card-title class="auth-title px-0">Fazer Login</v-card-title>
              <v-card-subtitle class="auth-subtitle px-0 opacity-100">
                Entre com suas credenciais para continuar no Blade Manager System.
              </v-card-subtitle>
            </div>
          </v-card-item>

          <v-card-text class="pt-6">
            <v-form ref="loginForm" @submit.prevent="loginUser">
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                density="comfortable"
                class="mb-5"
              >
                {{ errorMessage }}
              </v-alert>

              <v-row dense>
                <v-col cols="12">
                  <AppField
                    v-model="email"
                    label="Email"
                    type="email"
                    autocomplete="username"
                    required
                    :disabled="isSubmitting"
                    :rules="emailRules"
                  />
                </v-col>

                <v-col cols="12">
                  <AppField
                    v-model="senha"
                    label="Senha"
                    type="password"
                    autocomplete="current-password"
                    required
                    :disabled="isSubmitting"
                    :rules="senhaRules"
                  />
                </v-col>

                <v-col cols="12">
                  <v-sheet rounded="xl" border color="rgba(15, 23, 42, 0.45)" class="pa-1 pa-sm-2">
                    <v-checkbox
                      v-model="lembrarEmail"
                      label="Lembrar meu e-mail neste dispositivo"
                      color="primary"
                      density="comfortable"
                      hide-details
                      :disabled="isSubmitting"
                      class="auth-checkbox"
                    />
                  </v-sheet>
                </v-col>

                <v-col cols="12" class="pt-3">
                  <AppButton type="submit" block :loading="isSubmitting">
                    Entrar
                  </AppButton>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider class="mx-6 opacity-25" />

          <v-card-actions class="auth-actions justify-center px-6 py-5">
            <span class="auth-helper-text">Nao tem uma conta?</span>
            <AppButton variant="text" @click="goToRegister">
              Criar conta
            </AppButton>
          </v-card-actions>

          <v-divider class="mx-6 opacity-10" />

          <v-card-text class="auth-footer text-center text-medium-emphasis">
            <p>© {{ new Date().getFullYear() }} Blade Manager System. Todos os direitos reservados.</p>
            <p class="mt-1">Desenvolvido com cuidado por Karlos Eduardo</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/ui/AppButton.vue';
import AppField from '@/components/ui/AppField.vue';
import { persistLoginSession, resolveLoginRedirect } from '@/services/authService.js';
import {
  clearLegacyPersistentAuth,
  clearRememberedLoginPrefill,
  getRememberedLoginPrefill,
  getRedirectAfterAuth,
  setRedirectAfterRegister,
  setRememberedLoginPrefill,
} from '@/utils/authStorage.js';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

export default {
  components: {
    AppButton,
    AppField,
  },
  data() {
    return {
      email: '',
      senha: '',
      lembrarEmail: true,
      isSubmitting: false,
      errorMessage: '',
      emailRules: [
        (value) => Boolean(String(value || '').trim()) || 'Informe seu e-mail.',
        (value) => /.+@.+\..+/.test(String(value || '').trim()) || 'Informe um e-mail valido.',
      ],
      senhaRules: [
        (value) => Boolean(String(value || '').trim()) || 'Informe sua senha.',
      ],
    };
  },
  mounted() {
    const savedPrefill = getRememberedLoginPrefill();
    if (savedPrefill?.email) {
      this.email = savedPrefill.email;
      this.lembrarEmail = true;
    }

    clearLegacyPersistentAuth();
  },
  methods: {
    async loginUser() {
      this.errorMessage = '';

      const validation = await this.$refs.loginForm?.validate();
      if (validation && !validation.valid) {
        return;
      }

      this.isSubmitting = true;

      try {
        const payload = { email: this.email, senha: this.senha };
        const response = await axios.post('/api/usuarios/login', payload);

        persistLoginSession({
          token: response.data.token,
          user: {
            id: response.data.user.id,
            nome_usuario: response.data.user.nome_usuario,
          },
        });

        if (this.lembrarEmail) {
          setRememberedLoginPrefill(this.email);
        } else {
          clearRememberedLoginPrefill();
        }

        notifySuccess('Login realizado com sucesso!');
        const redirectPath = resolveLoginRedirect({
          userType: response.data.user.tipo_usuario,
          routeProfissionalId: this.$route.query.profissionalId,
        });
        this.$router.push(redirectPath);
      } catch (error) {
        const message = error.response?.data?.message || 'Erro ao fazer login.';
        this.errorMessage = message;
        notifyError(message);
      } finally {
        this.isSubmitting = false;
      }
    },
    goToRegister() {
      const redirect = getRedirectAfterAuth();
      if (redirect) {
        setRedirectAfterRegister(redirect);
      } else {
        const profissionalId = this.$route.query.profissionalId;
        if (profissionalId) {
          setRedirectAfterRegister(`/agendar/${profissionalId}`);
        }
      }
      this.$router.push('/register');
    },
  },
};
</script>

<style scoped>
.auth-screen {
  background:
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.16), transparent 28%),
    linear-gradient(to bottom, #111827, #1f2937, #111827);
}

.auth-card {
  border-color: rgba(148, 163, 184, 0.14) !important;
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.42);
}

.auth-header {
  padding-top: 0.25rem;
}

.auth-eyebrow {
  margin: 0 0 0.5rem;
  color: #c084fc;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-title {
  color: #f8fafc;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
}

.auth-subtitle {
  margin-top: 0.75rem;
  color: #94a3b8;
  line-height: 1.6;
}

.auth-actions {
  gap: 0.25rem;
}

.auth-helper-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.auth-footer {
  color: #64748b;
  font-size: 0.76rem;
}

.auth-footer p {
  margin: 0;
}

.auth-checkbox :deep(.v-label) {
  color: #d1d5db;
  opacity: 1;
}
</style>
