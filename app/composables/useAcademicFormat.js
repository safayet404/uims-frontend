// Shared formatting for the student/faculty portals
export const useAcademicFormat = () => {
  const money = value => `৳${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`

  // Most universities require 75% attendance to sit the final exam
  const attendanceTone = (percent) => {
    if (percent === null || percent === undefined) return { text: 'text-gray-400', bar: 'bg-gray-200', label: 'No classes yet' }
    if (percent >= 85) return { text: 'text-emerald-600', bar: 'bg-emerald-500', label: 'Good standing' }
    if (percent >= 75) return { text: 'text-amber-600', bar: 'bg-amber-500', label: 'Close to the limit' }
    return { text: 'text-red-600', bar: 'bg-red-500', label: 'Below 75% requirement' }
  }

  const gradeTone = (letter) => {
    if (!letter) return 'bg-gray-100 text-gray-500'
    if (letter.startsWith('A')) return 'bg-emerald-50 text-emerald-700'
    if (letter.startsWith('B')) return 'bg-sky-50 text-sky-700'
    if (letter.startsWith('C')) return 'bg-amber-50 text-amber-700'
    return 'bg-red-50 text-red-700'
  }

  const invoiceTone = status => ({
    paid: 'bg-emerald-50 text-emerald-700',
    partial: 'bg-amber-50 text-amber-700',
    overdue: 'bg-red-50 text-red-700',
    unpaid: 'bg-gray-100 text-gray-700',
    waived: 'bg-sky-50 text-sky-700',
  }[status] || 'bg-gray-100 text-gray-700')

  return { money, attendanceTone, gradeTone, invoiceTone }
}
