import { computed, ref } from 'vue';
import {
  buildAppointmentDateTime,
  formatDisplayDate,
  generateTimes,
  getDaysInMonth,
  getMonthLeadingBlanks,
  getWeekDayKey,
  isPastDate,
  monthNames,
  toMinutes,
  weekDaysShort,
} from '@/utils/dateUtils.js';
import {
  createAppointment,
  fetchOccupiedAppointments,
  fetchProfessionalById,
  fetchServicesByProfessional,
  fetchWorkingHoursByProfessional,
} from '@/services/bookingService.js';
import { getAuthToken } from '@/utils/authStorage.js';

export const useBookingFlow = ({ profissionalId, router }) => {
  const services = ref([]);
  const isLoading = ref(true);
  const isSubmitting = ref(false);

  const showModal = ref(false);
  const selectedService = ref(null);
  const selectedDate = ref(null);
  const selectedTime = ref(null);
  const customerName = ref('');
  const availableTimes = ref([]);
  const workingHours = ref([]);

  const today = new Date();
  const currentMonth = ref(today.getMonth());
  const currentYear = ref(today.getFullYear());

  const daysInMonth = computed(() => getDaysInMonth(currentYear.value, currentMonth.value));
  const blanks = computed(() => getMonthLeadingBlanks(currentYear.value, currentMonth.value));
  const selectedDisplayDate = computed(() =>
    formatDisplayDate(selectedDate.value, currentMonth.value, currentYear.value),
  );
  const selectedStageLabel = computed(() => {
    if (selectedDate.value && selectedTime.value) return 'Pronto para confirmar';
    if (selectedDate.value) return 'Escolha um horario';
    return 'Escolha um dia';
  });
  const monthLabel = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);
  const canConfirmBooking = computed(() =>
    Boolean(
      selectedService.value &&
      selectedDate.value &&
      selectedTime.value &&
      String(customerName.value || '').trim(),
    ),
  );

  const isPastDateInCurrentView = (day) => isPastDate(day, currentMonth.value, currentYear.value);

  const resetSelection = () => {
    selectedDate.value = null;
    selectedTime.value = null;
    availableTimes.value = [];
  };

  const fetchServices = async () => {
    isLoading.value = true;

    try {
      services.value = await fetchServicesByProfessional(profissionalId);
    } catch (error) {
      console.error('Erro ao buscar servicos:', error.response?.data || error.message);
      services.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchWorkingHours = async () => {
    try {
      workingHours.value = await fetchWorkingHoursByProfessional(profissionalId);
    } catch (error) {
      console.error('Erro ao buscar horários de funcionamento:', error);
      workingHours.value = [];
    }
  };

  const fetchInitialData = async () => {
    await Promise.all([fetchServices(), fetchWorkingHours()]);
  };

  const openCalendar = (service) => {
    selectedService.value = service;
    customerName.value = '';
    showModal.value = true;
    resetSelection();
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const selectTime = (time) => {
    selectedTime.value = time;
  };

  const loadAvailableTimes = async (day) => {
    const selectedDuration = Number(selectedService.value?.duracao_minutos) || 0;

    if (!selectedDuration) {
      availableTimes.value = [];
      return;
    }

    const diaSemana = getWeekDayKey(currentYear.value, currentMonth.value, day);
    const workingDay = workingHours.value.find((item) => item.dia_semana === diaSemana);

    if (!workingDay || !workingDay.hora_abertura || !workingDay.hora_fechamento) {
      availableTimes.value = [];
      return;
    }

    const openingMinutes = toMinutes(workingDay.hora_abertura);
    const closingMinutes = toMinutes(workingDay.hora_fechamento);

    const baseTimes = generateTimes(workingDay.hora_abertura, workingDay.hora_fechamento).filter((time) => {
      const start = toMinutes(time);
      return start >= openingMinutes && start + selectedDuration <= closingMinutes;
    });

    const formattedDate = buildAppointmentDateTime(day, currentMonth.value, currentYear.value, '00:00').slice(0, 10);

    try {
      const occupiedAppointments = await fetchOccupiedAppointments(profissionalId, formattedDate);
      const occupiedIntervals = occupiedAppointments.map((item) => {
        const start = toMinutes(String(item?.horario || '').slice(0, 5));
        const duration = Number(item?.duracao_minutos) || 15;

        return {
          start,
          end: start + duration,
        };
      });

      availableTimes.value = baseTimes.filter((time) => {
        const start = toMinutes(time);
        const end = start + selectedDuration;

        return !occupiedIntervals.some((interval) => start < interval.end && end > interval.start);
      });
    } catch (error) {
      console.error('Erro ao buscar horários ocupados:', error);
      availableTimes.value = baseTimes;
    }
  };

  const selectDate = async (day) => {
    if (isPastDateInCurrentView(day)) return;

    selectedDate.value = day;
    selectedTime.value = null;
    await loadAvailableTimes(day);
  };

  const prevMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11;
      currentYear.value -= 1;
      return;
    }

    currentMonth.value -= 1;
  };

  const nextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0;
      currentYear.value += 1;
      return;
    }

    currentMonth.value += 1;
  };

  const confirmBooking = async () => {
    if (!canConfirmBooking.value || isSubmitting.value) return;

    try {
      isSubmitting.value = true;
      const token = getAuthToken();

      const userData = await fetchProfessionalById(profissionalId, token);
      const numero = userData.telefone?.replace(/\D/g, '');

      if (!numero) {
        alert('Numero do profissional nao disponivel.');
        return;
      }

      const appointmentDateTime = buildAppointmentDateTime(
        selectedDate.value,
        currentMonth.value,
        currentYear.value,
        selectedTime.value,
      );

      await createAppointment(
        {
          servico_id: selectedService.value.id,
          data_hora: appointmentDateTime,
          barbeiro_id: profissionalId,
          nome_cliente: String(customerName.value || '').trim(),
        },
        token,
      );

      const mensagem = `Novo agendamento!\n\nCliente: ${String(customerName.value || '').trim()}\nServico: ${selectedService.value.nome}\nData: ${selectedDate.value}/${currentMonth.value + 1}/${currentYear.value}\nHorario: ${selectedTime.value}\n\nPor favor, confirme o agendamento.`;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');

      closeModal();
      alert('Agendamento confirmado com sucesso!');
    } catch (error) {
      if (
        error.response?.status === 400 &&
        String(error.response?.data?.message || '').toLowerCase().includes('ocupado')
      ) {
        alert('Este horario ja esta ocupado. Escolha outro.');
      } else {
        alert(`Erro ao agendar: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    availableTimes,
    blanks,
    canConfirmBooking,
    closeModal,
    confirmBooking,
    currentMonth,
    currentYear,
    customerName,
    daysInMonth,
    fetchInitialData,
    isLoading,
    isPastDateInCurrentView,
    isSubmitting,
    monthLabel,
    monthNames,
    nextMonth,
    openCalendar,
    prevMonth,
    selectDate,
    selectedDate,
    selectedDisplayDate,
    selectedService,
    selectedStageLabel,
    selectedTime,
    selectTime,
    services,
    showModal,
    weekDaysShort,
  };
};
