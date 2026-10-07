export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * Format number to Thai Baht currency
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${amount < 0 ? '-' : ''}฿${formatted}`;
}

/**
 * Format YYYY-MM to readable Thai month
 */
export function formatMonthYearThai(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const thaiMonth = THAI_MONTHS[monthIdx] || '';
  const thaiYear = year + 543; // Buddhist Era
  return `${thaiMonth} ${thaiYear} (${year})`;
}

/**
 * Format YYYY-MM-DD to readable Thai date
 */
export function formatDateThai(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[0], 10);
  const thaiMonth = THAI_MONTHS_SHORT[monthIdx] || '';
  return `${day} ${thaiMonth} ${year + 543}`;
}

/**
 * Get current year-month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get today in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get previous or next month
 */
export function shiftMonth(currentMonthStr: string, delta: number): string {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Export data to CSV file download
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'ชื่อรายการ', 'จำนวนเงิน(บาท)', 'ช่องทางชำระ', 'บันทึกเพิ่มเติม'];
  const rows = data.map(item => [
    `"${item.date}"`,
    `"${item.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
    `"${item.category}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    item.amount,
    `"${item.paymentMethod || ''}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
