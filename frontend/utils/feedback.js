import { useToast } from 'vue-toastification';

const getToast = () => useToast();
const toText = (message, fallback) => String(message || fallback);

export const notifySuccess = (message) => {
  getToast().success(toText(message, 'Operacao realizada com sucesso.'));
};

export const notifyError = (message) => {
  getToast().error(toText(message, 'Ocorreu um erro.'));
};

export const notifyInfo = (message) => {
  getToast().info(toText(message, 'Aviso.'));
};

export const notifyWarning = (message) => {
  getToast().warning(toText(message, 'Atencao.'));
};
