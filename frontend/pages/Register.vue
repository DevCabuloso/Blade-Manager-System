<template>
  <v-container fluid class="auth-screen auth-screen--register fill-height pa-4 pa-sm-6">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card class="auth-card register-card" rounded="xl" border color="rgba(3, 7, 18, 0.94)">
          <v-card-item class="pb-0">
            <div class="auth-header text-center">
              <p class="auth-eyebrow">Cadastro</p>
              <v-card-title class="auth-title px-0">Criar Conta</v-card-title>
              <v-card-subtitle class="auth-subtitle px-0 opacity-100">
                Configure seu acesso mantendo o fluxo atual de cadastro e redirecionamento.
              </v-card-subtitle>
            </div>
          </v-card-item>

          <v-card-text class="pt-6">
            <v-form ref="registerForm" @submit.prevent="registerUser">
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
                    v-model="name"
                    label="Nome"
                    required
                    :disabled="isSubmitting"
                    :rules="nameRules"
                  />
                </v-col>

                <v-col cols="12">
                  <AppField
                    v-model="email"
                    label="Email"
                    type="email"
                    required
                    :disabled="isSubmitting"
                    :rules="emailRules"
                  />
                </v-col>

                <v-col cols="12">
                  <AppField
                    v-model="password"
                    label="Senha"
                    type="password"
                    required
                    :disabled="isSubmitting"
                    :rules="passwordRules"
                    hint="Use uma senha que você consiga lembrar com segurança."
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12">
                  <AppField
                    v-model="userType"
                    label="Tipo de usuário"
                    field-type="select"
                    :items="userTypeOptions"
                    item-title="label"
                    item-value="value"
                    required
                    :disabled="isSubmitting"
                    :rules="userTypeRules"
                  />
                </v-col>

                <v-col v-if="userType === 'barbeiro'" cols="12">
                  <AppField
                    v-model="telefone"
                    label="Telefone (WhatsApp)"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    required
                    :disabled="isSubmitting"
                    :rules="telefoneRules"
                    @update:model-value="formatarTelefone"
                  />
                </v-col>

                <v-col v-if="userType === 'barbeiro'" cols="12">
                  <v-sheet rounded="xl" border color="rgba(15, 23, 42, 0.55)" class="register-schedule-panel pa-4 pa-sm-5">
                    <div class="d-flex flex-column flex-sm-row align-sm-start justify-space-between ga-3 mb-4">
                      <div>
                        <h3 class="register-section-title">Horário de Funcionamento</h3>
                        <p class="register-section-subtitle">
                          A estrutura enviada para a API permanece a mesma. Aqui estamos apenas reorganizando a interface no padrão Vuetify.
                        </p>
                      </div>
                      <v-chip color="primary" variant="tonal" size="small">Profissional</v-chip>
                    </div>

                    <v-row dense>
                      <v-col v-for="(dia, i) in horarios" :key="i" cols="12">
                        <v-card rounded="xl" border color="rgba(2, 6, 23, 0.42)" class="register-day-card">
                          <v-card-item class="pb-1">
                            <v-card-title class="register-day-title text-capitalize px-0">
                              {{ dia.dia_semana }}
                            </v-card-title>
                          </v-card-item>
                          <v-card-text>
                            <v-row dense>
                              <v-col cols="12" sm="6">
                                <AppField
                                  v-model="dia.hora_abertura"
                                  type="time"
                                  label="Abertura"
                                  required
                                  :disabled="isSubmitting"
                                />
                              </v-col>
                              <v-col cols="12" sm="6">
                                <AppField
                                  v-model="dia.hora_fechamento"
                                  type="time"
                                  label="Fechamento"
                                  required
                                  :disabled="isSubmitting"
                                />
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-sheet>
                </v-col>

                <v-col cols="12" class="pt-4">
                  <AppButton type="submit" block :loading="isSubmitting">
                    Registrar
                  </AppButton>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider class="mx-6 opacity-25" />

          <v-card-actions class="auth-actions justify-center px-6 py-5">
            <span class="auth-helper-text">Já tem uma conta?</span>
            <AppButton variant="text" @click="router.push('/login')">
              Fazer login
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

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import AppButton from '@/components/ui/AppButton.vue';
import AppField from '@/components/ui/AppField.vue';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

const router = useRouter();
const route = useRoute();

const name = ref('');
const email = ref('');
const password = ref('');
const userType = ref('');
const telefone = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const registerForm = ref(null);

const userTypeOptions = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Profissional', value: 'barbeiro' },
];

const nameRules = [
  (value) => Boolean(String(value || '').trim()) || 'Informe seu nome.',
];

const emailRules = [
  (value) => Boolean(String(value || '').trim()) || 'Informe seu e-mail.',
  (value) => /.+@.+\..+/.test(String(value || '').trim()) || 'Informe um e-mail válido.',
];

const passwordRules = [
  (value) => Boolean(String(value || '').trim()) || 'Informe sua senha.',
];

const userTypeRules = [
  (value) => Boolean(String(value || '').trim()) || 'Selecione o tipo de usuário.',
];

const telefoneRules = [
  (value) => {
    if (userType.value !== 'barbeiro') {
      return true;
    }

    return Boolean(String(value || '').trim()) || 'Telefone é obrigatório para barbeiro.';
  },
];

const horarios = ref([
  { dia_semana: 'segunda', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'terca', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'quarta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'quinta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'sexta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'sabado', hora_abertura: '09:00', hora_fechamento: '14:00' },
  { dia_semana: 'domingo', hora_abertura: '09:00', hora_fechamento: '14:00' },
]);

const formatarTelefone = (value) => {
  let valor = String(value || '').replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);

  telefone.value =
    valor.length <= 10
      ? valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      : valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

const handleRegisterSuccess = async () => {
  const redirectPath = sessionStorage.getItem('redirectAfterRegister');
  if (redirectPath) {
    sessionStorage.removeItem('redirectAfterRegister');
    router.push(redirectPath);
  } else if (userType.value === 'cliente') {
    const profissionalId = route.query.profissionalId;
    router.push(profissionalId ? `/agendar/${profissionalId}` : '/login');
  } else {
    router.push('/login');
  }
};

const registerUser = async () => {
  errorMessage.value = '';

  const validation = await registerForm.value?.validate();
  if (validation && !validation.valid) {
    return;
  }

  if (userType.value === 'barbeiro' && !telefone.value) {
    errorMessage.value = 'Telefone é obrigatório para barbeiro.';
    notifyError(errorMessage.value);
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      nome_usuario: name.value,
      email: email.value,
      senha: password.value,
      tipo_usuario: userType.value,
      telefone: userType.value === 'barbeiro' ? telefone.value : null,
      horarios: userType.value === 'barbeiro'
        ? horarios.value.map((dia) => ({
            dia_semana: dia.dia_semana,
            hora_abertura: dia.hora_abertura,
            hora_fechamento: dia.hora_fechamento,
          }))
        : [],
    };

    const response = await axios.post('/api/usuarios', payload);
    const apiMessage = response?.data?.message || 'Usuário registrado com sucesso!';
    notifySuccess(apiMessage);
    await handleRegisterSuccess(response.data.userId);
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao registrar usuário.';
    errorMessage.value = message;
    notifyError(message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.auth-screen {
  background:
    radial-gradient(circle at top left, rgba(168, 85, 247, 0.16), transparent 30%),
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
  font-size: clamp(1.9rem, 3vw, 2.6rem);
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

.register-card {
  overflow: hidden;
}

.register-schedule-panel {
  border-color: rgba(31, 41, 55, 0.9) !important;
}

.register-section-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 800;
}

.register-section-subtitle {
  margin: 0.55rem 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.55;
}

.register-day-card {
  border-color: rgba(255, 255, 255, 0.06) !important;
}

.register-day-title {
  color: #cbd5e1;
  font-size: 0.98rem;
  font-weight: 700;
}
</style>
