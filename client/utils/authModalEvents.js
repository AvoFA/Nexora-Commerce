export const OPEN_AUTH_MODAL_EVENT = 'nexora:open-auth-modal';
export const NEXORA_NAVIGATE_EVENT = 'nexora:navigate';

export const openAuthModal = () => {
  window.dispatchEvent(new CustomEvent(OPEN_AUTH_MODAL_EVENT));
};

export const navigateTo = (to) => {
  window.dispatchEvent(new CustomEvent(NEXORA_NAVIGATE_EVENT, { detail: to }));
};
