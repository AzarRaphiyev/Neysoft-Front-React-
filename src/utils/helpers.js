export function formatMebleg(mebleg) {
  return `${parseFloat(mebleg || 0).toFixed(2)} \u20BC`;
}

export function formatTarix(tarix, fullTime = false) {
  if (!tarix) return '-';
  const date = new Date(tarix);
  if (fullTime) {
    return date.toLocaleString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function bugunISO() {
  return new Date().toISOString().split('T')[0];
}

export function buAyISO() {
  return new Date().toISOString().slice(0, 7);
}

export const formatWord = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
