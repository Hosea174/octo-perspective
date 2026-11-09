export function activateVirtualClick(x: number, y: number) {
  const target = document.elementFromPoint(x, y);
  const dialog = document.querySelector<HTMLDialogElement>('.visit-modal[open]');
  if (dialog && !target?.closest('#camera-preview')) {
    const rect = dialog.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      dialog.close();
      return;
    }
  }
  const element = target?.closest('a,button,input,select,textarea,[role="button"]');
  if (element instanceof HTMLElement && !element.matches(':disabled,[aria-disabled="true"]')) {
    if (element.matches('input,select,textarea')) element.focus();
    element.click();
  }
}
