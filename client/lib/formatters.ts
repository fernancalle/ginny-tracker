export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `RD$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RD$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return formatDate(d);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    food: 'Comida',
    transport: 'Transporte',
    utilities: 'Servicios',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    health: 'Salud',
    education: 'Educación',
    salary: 'Salario',
    transfer: 'Transferencia',
    other: 'Otros',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: 'coffee',
    transport: 'navigation',
    utilities: 'zap',
    entertainment: 'film',
    shopping: 'shopping-bag',
    health: 'heart',
    education: 'book',
    salary: 'briefcase',
    transfer: 'repeat',
    other: 'more-horizontal',
  };
  return icons[category] || 'circle';
}

export function getCategoryColor(category: string, isDark: boolean): string {
  const colors: Record<string, { light: string; dark: string }> = {
    food: { light: '#F59E0B', dark: '#FBBF24' },
    transport: { light: '#3B82F6', dark: '#60A5FA' },
    utilities: { light: '#8B5CF6', dark: '#A78BFA' },
    entertainment: { light: '#EC4899', dark: '#F472B6' },
    shopping: { light: '#10B981', dark: '#34D399' },
    health: { light: '#EF4444', dark: '#F87171' },
    education: { light: '#6366F1', dark: '#818CF8' },
    salary: { light: '#14B8A6', dark: '#2DD4BF' },
    transfer: { light: '#6B7280', dark: '#9CA3AF' },
    other: { light: '#9CA3AF', dark: '#D1D5DB' },
  };
  const color = colors[category] || colors.other;
  return isDark ? color.dark : color.light;
}

export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
}
