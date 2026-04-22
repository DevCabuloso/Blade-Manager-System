<template>
  <AppPanel
    title="Relatorios por Profissional"
    subtitle="Busque um profissional para visualizar servicos mais/menos usados e dias com maior/menor volume e lucro."
  >
    <v-alert
      v-if="feedbackMessage"
      :type="feedbackType"
      variant="tonal"
      density="comfortable"
      class="mb-5"
    >
      {{ feedbackMessage }}
    </v-alert>

    <v-form @submit.prevent="buscarStats">
      <v-row dense class="mb-2">
        <v-col cols="12" lg="8">
          <AppField
            v-model="filtroProfissional"
            label="Profissional"
            placeholder="Digite nome ou e-mail do profissional"
            :disabled="isLoading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppField
            v-model="filtroPeriodo"
            label="Periodo"
            field-type="select"
            :items="periodOptions"
            item-title="label"
            item-value="value"
            :disabled="isLoading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppButton type="submit" block :loading="isLoading">
            Buscar
          </AppButton>
        </v-col>

        <v-col v-if="filtroPeriodo === 'custom'" cols="12" sm="6" lg="3">
          <AppField
            v-model="filtroDataInicial"
            label="Data Inicial"
            type="date"
            :disabled="isLoading"
          />
        </v-col>
        <v-col v-if="filtroPeriodo === 'custom'" cols="12" sm="6" lg="3">
          <AppField
            v-model="filtroDataFinal"
            label="Data Final"
            type="date"
            :disabled="isLoading"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-row v-if="profissionalEncontrado" dense class="mt-2">
      <v-col
        v-for="card in totalCards"
        :key="card.key"
        cols="12"
        sm="6"
        xl="3"
      >
        <v-card rounded="xl" color="rgba(15, 23, 42, 0.72)" border class="h-100">
          <v-card-text class="text-center">
            <div class="reports-card-label">{{ card.label }}</div>
            <div class="mt-3 text-3xl font-bold text-white">{{ card.value }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="profissionalEncontrado" dense class="mt-2">
      <v-col cols="12" md="6">
        <v-card rounded="xl" color="rgba(15, 23, 42, 0.72)" border>
          <v-card-title class="reports-section-title">Servicos</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <div class="reports-highlight">
              <div class="reports-highlight__label">Mais usado</div>
              <div class="reports-highlight__value">{{ report.ranking.mostUsedService.name }}</div>
              <div class="reports-highlight__meta">{{ report.ranking.mostUsedService.count }} atendimentos</div>
            </div>

            <div class="reports-highlight">
              <div class="reports-highlight__label">Menos usado</div>
              <div class="reports-highlight__value">{{ report.ranking.leastUsedService.name }}</div>
              <div class="reports-highlight__meta">{{ report.ranking.leastUsedService.count }} atendimentos</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" color="rgba(15, 23, 42, 0.72)" border>
          <v-card-title class="reports-section-title">Dias com Mais e Menos Servicos</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <div class="reports-highlight">
              <div class="reports-highlight__label">Dia com mais servicos</div>
              <div class="reports-highlight__value">{{ formatDate(report.ranking.dayMostServices.date) }}</div>
              <div class="reports-highlight__meta">{{ report.ranking.dayMostServices.count }} atendimentos</div>
            </div>

            <div class="reports-highlight">
              <div class="reports-highlight__label">Dia com menos servicos</div>
              <div class="reports-highlight__value">{{ formatDate(report.ranking.dayLeastServices.date) }}</div>
              <div class="reports-highlight__meta">{{ report.ranking.dayLeastServices.count }} atendimentos</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card rounded="xl" color="rgba(15, 23, 42, 0.72)" border>
          <v-card-title class="reports-section-title">Dias com Mais e Menos Lucro</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="reports-highlight">
                  <div class="reports-highlight__label">Dia com mais lucro</div>
                  <div class="reports-highlight__value">{{ formatDate(report.ranking.dayMostRevenue.date) }}</div>
                  <div class="reports-highlight__meta">{{ formatCurrency(report.ranking.dayMostRevenue.revenue) }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="reports-highlight">
                  <div class="reports-highlight__label">Dia com menos lucro</div>
                  <div class="reports-highlight__value">{{ formatDate(report.ranking.dayLeastRevenue.date) }}</div>
                  <div class="reports-highlight__meta">{{ formatCurrency(report.ranking.dayLeastRevenue.revenue) }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet
      v-else
      rounded="xl"
      border
      color="rgba(15, 23, 42, 0.45)"
      class="mt-4 reports-empty-state"
    >
      Digite um profissional e clique em "Buscar" para ver os relatórios.
    </v-sheet>

    <div
      v-if="profissionalEncontrado"
      class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between ga-3 mt-5"
    >
      <v-chip color="primary" variant="tonal" size="small">
        Periodo atual: {{ report.period.label }} ({{ formatDate(report.period.startDate) }} ate {{ formatDate(report.period.endDate) }})
      </v-chip>

      <v-chip color="secondary" variant="tonal" size="small">
        Profissional: {{ report.professional.nome_usuario }}
      </v-chip>

      <AppButton color="success" variant="primary" @click="exportarPDF">
        Exportar PDF
      </AppButton>
    </div>
  </AppPanel>
</template>

<script setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import AppButton from '@/components/ui/AppButton.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError, notifyInfo } from '@/utils/feedback.js';

const filtroProfissional = ref('');
const filtroPeriodo = ref('mes');
const filtroDataInicial = ref('');
const filtroDataFinal = ref('');
const report = ref({
  professional: {
    id: null,
    nome_usuario: '',
    email: '',
  },
  period: {
    value: 'mes',
    label: 'Mes',
    startDate: '',
    endDate: '',
  },
  totals: {
    appointments: 0,
    revenue: 0,
    activeDays: 0,
    trackedServices: 0,
  },
  ranking: {
    mostUsedService: { name: '-', count: 0 },
    leastUsedService: { name: '-', count: 0 },
    dayMostServices: { date: '-', count: 0 },
    dayLeastServices: { date: '-', count: 0 },
    dayMostRevenue: { date: '-', revenue: 0 },
    dayLeastRevenue: { date: '-', revenue: 0 },
  },
});
const profissionalEncontrado = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref('info');
const isLoading = ref(false);

const periodOptions = [
  { label: 'Dia', value: 'dia' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
  { label: 'Personalizado', value: 'custom' },
];

const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value || value === '-') return '-';

  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const totalCards = computed(() => [
  { key: 'appointments', label: 'Atendimentos no periodo', value: report.value.totals.appointments },
  { key: 'revenue', label: 'Lucro no periodo', value: formatCurrency(report.value.totals.revenue) },
  { key: 'activeDays', label: 'Dias com atendimento', value: report.value.totals.activeDays },
  { key: 'trackedServices', label: 'Servicos utilizados', value: report.value.totals.trackedServices },
]);

const setFeedback = (message = '', type = 'info') => {
  feedbackMessage.value = message;
  feedbackType.value = type;
};

const buscarStats = async () => {
  if (!filtroProfissional.value.trim()) {
    const message = 'Digite o nome ou e-mail do profissional!';
    setFeedback(message, 'warning');
    notifyInfo(message);
    profissionalEncontrado.value = false;
    return;
  }

  isLoading.value = true;
  setFeedback();

  try {
    const token = sessionStorage.getItem('token');
    const { data } = await axios.get(
      '/api/relatorios',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          profissional: filtroProfissional.value,
          periodo: filtroPeriodo.value,
          startDate: filtroDataInicial.value || undefined,
          endDate: filtroDataFinal.value || undefined,
        },
      }
    );

    report.value = data;
    profissionalEncontrado.value = true;
  } catch (err) {
    console.error(err);
    const message = err.response?.data?.message || 'Profissional nao encontrado ou erro ao buscar relatorios.';
    setFeedback(message, 'error');
    notifyError(message);
    profissionalEncontrado.value = false;
  } finally {
    isLoading.value = false;
  }
};

const exportarPDF = () => {
  if (!profissionalEncontrado.value) {
    const message = 'Busque um profissional primeiro!';
    setFeedback(message, 'warning');
    notifyInfo(message);
    return;
  }

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const colors = {
    headerBg: [15, 23, 42],
    title: [248, 250, 252],
    subtitle: [203, 213, 225],
    text: [51, 65, 85],
    muted: [100, 116, 139],
    sectionBg: [241, 245, 249],
    border: [226, 232, 240],
    accent: [124, 58, 237],
  };

  let y = margin;

  const drawHeader = () => {
    doc.setFillColor(...colors.headerBg);
    doc.rect(0, 0, pageWidth, 34, 'F');

    doc.setTextColor(...colors.title);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BladeManager - Relatorio Administrativo', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...colors.subtitle);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, margin, 20);
    doc.text(
      `Profissional: ${report.value.professional?.nome_usuario || '-'}`,
      margin,
      26,
    );

    doc.setTextColor(...colors.text);
    y = 42;
  };

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight <= pageHeight - 18) return;
    doc.addPage();
    drawHeader();
  };

  const drawSectionTitle = (title) => {
    ensureSpace(12);

    doc.setFillColor(...colors.sectionBg);
    doc.setDrawColor(...colors.border);
    doc.rect(margin, y, contentWidth, 9, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.text(title, margin + 3, y + 6);
    doc.setTextColor(...colors.text);

    y += 13;
  };

  const drawInfoRow = (label, value) => {
    const valueText = String(value || '-');
    const wrapped = doc.splitTextToSize(valueText, contentWidth - 54);
    const rowHeight = Math.max(9, 4 + wrapped.length * 4);

    ensureSpace(rowHeight + 2);

    doc.setDrawColor(...colors.border);
    doc.rect(margin, y, contentWidth, rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.muted);
    doc.text(String(label || '-'), margin + 3, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    doc.text(wrapped, margin + 50, y + 5.8);

    y += rowHeight + 2;
  };

  const drawMetricCard = (x, startY, width, height, title, value) => {
    doc.setDrawColor(...colors.border);
    doc.setFillColor(255, 255, 255);
    doc.rect(x, startY, width, height, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text(title, x + 3, startY + 5.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.text);
    const valueLines = doc.splitTextToSize(String(value || '-'), width - 6);
    doc.text(valueLines, x + 3, startY + 11.8);
  };

  drawHeader();

  drawSectionTitle('Periodo analisado');
  drawInfoRow('Periodo', `${report.value.period?.label || '-'} (${formatDate(report.value.period?.startDate)} ate ${formatDate(report.value.period?.endDate)})`);
  drawInfoRow('Email', report.value.professional?.email || '-');

  drawSectionTitle('Resumo do periodo');
  ensureSpace(44);
  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap) / 2;
  const cardHeight = 19;
  const row1 = y;

  drawMetricCard(margin, row1, cardWidth, cardHeight, 'Atendimentos', report.value.totals?.appointments || 0);
  drawMetricCard(margin + cardWidth + cardGap, row1, cardWidth, cardHeight, 'Lucro', formatCurrency(report.value.totals?.revenue));

  const row2 = row1 + cardHeight + cardGap;
  drawMetricCard(margin, row2, cardWidth, cardHeight, 'Dias com atendimento', report.value.totals?.activeDays || 0);
  drawMetricCard(margin + cardWidth + cardGap, row2, cardWidth, cardHeight, 'Servicos utilizados', report.value.totals?.trackedServices || 0);
  y = row2 + cardHeight + 4;

  drawSectionTitle('Indicadores principais');
  drawInfoRow(
    'Servico mais usado',
    `${report.value.ranking?.mostUsedService?.name || '-'} (${report.value.ranking?.mostUsedService?.count || 0} atendimentos)`,
  );
  drawInfoRow(
    'Servico menos usado',
    `${report.value.ranking?.leastUsedService?.name || '-'} (${report.value.ranking?.leastUsedService?.count || 0} atendimentos)`,
  );
  drawInfoRow(
    'Dia com mais servicos',
    `${formatDate(report.value.ranking?.dayMostServices?.date)} (${report.value.ranking?.dayMostServices?.count || 0} atendimentos)`,
  );
  drawInfoRow(
    'Dia com menos servicos',
    `${formatDate(report.value.ranking?.dayLeastServices?.date)} (${report.value.ranking?.dayLeastServices?.count || 0} atendimentos)`,
  );
  drawInfoRow(
    'Dia com mais lucro',
    `${formatDate(report.value.ranking?.dayMostRevenue?.date)} (${formatCurrency(report.value.ranking?.dayMostRevenue?.revenue)})`,
  );
  drawInfoRow(
    'Dia com menos lucro',
    `${formatDate(report.value.ranking?.dayLeastRevenue?.date)} (${formatCurrency(report.value.ranking?.dayLeastRevenue?.revenue)})`,
  );

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...colors.border);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text('BladeManager', margin, pageHeight - 7.5);
    doc.text(`Pagina ${page} de ${pages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  }

  const professionalName = String(report.value.professional?.nome_usuario || 'profissional')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  const period = String(report.value.period?.value || 'periodo').toLowerCase();
  const filename = `relatorio-${professionalName || 'profissional'}-${period}.pdf`;
  doc.save(filename);

  const message = 'PDF exportado com sucesso!';
  setFeedback(message, 'success');
};
</script>

<style scoped>
.reports-empty-state {
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 1.25rem 1rem;
}

.reports-card-label {
  color: #94a3b8;
  font-size: 0.92rem;
}

.reports-section-title {
  color: #f8fafc;
  font-weight: 700;
}

.reports-highlight {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.9rem;
  padding: 0.9rem;
  background: rgba(15, 23, 42, 0.32);
}

.reports-highlight__label {
  color: #94a3b8;
  font-size: 0.82rem;
}

.reports-highlight__value {
  margin-top: 0.35rem;
  color: #f8fafc;
  font-size: 1.12rem;
  font-weight: 800;
}

.reports-highlight__meta {
  margin-top: 0.25rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}
</style>
