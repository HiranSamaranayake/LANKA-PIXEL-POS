// Professional PDF Generation Engine for Lanka Pixel Creations (Pvt) Ltd
// Pure client-side Vector PDF 1.4 generator with selectable text and multi-page support.

import type { IncomeRecord, ExpenseRecord, DailyPostCount, UserRole } from '../types';
import { formatLKR, formatDate, formatMonth } from './formatters';

export type ReportType = 'monthly' | 'income' | 'expense' | 'designer';

// Standard Helvetica Font Widths (1000 units per em)
const HELVETICA_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
  '@': 1015, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778,
  'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778,
  'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944,
  'X': 667, 'Y': 667, 'Z': 611, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556,
  '`': 333, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556,
  'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556,
  'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722,
  'x': 500, 'y': 500, 'z': 500, '{': 334, '|': 260, '}': 334, '~': 584,
};

function getTextWidth(text: string, fontSize: number, isBold: boolean = false): number {
  const multiplier = isBold ? 1.05 : 1.0;
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const w = HELVETICA_WIDTHS[char] || 556;
    total += (w / 1000) * fontSize * multiplier;
  }
  return total;
}

function truncateText(text: string, maxWidth: number, fontSize: number, isBold: boolean = false): string {
  if (getTextWidth(text, fontSize, isBold) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && getTextWidth(truncated + '...', fontSize, isBold) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.length > 0 ? truncated + '...' : text;
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, (c) => {
      // Replace common unicode characters with safe ASCII equivalents
      if (c === '—' || c === '–') return '-';
      if (c === '•') return '*';
      if (c === '’' || c === '‘') return "'";
      if (c === '“' || c === '”') return '"';
      if (c === 'Rs' || c === 'රු') return 'Rs.';
      return '';
    });
}

export interface PdfTableColumn {
  header: string;
  width: number; // width in points
  align?: 'left' | 'center' | 'right';
}

export interface PdfSummaryCard {
  title: string;
  value: string;
  subtext?: string;
  accentColor: [number, number, number]; // RGB 0-255
}

class VectorPdfDocument {
  private pages: string[][] = [[]];
  private currentPageIndex: number = 0;

  // A4 Dimensions in points: 210mm x 297mm
  public readonly pageWidth = 595.28;
  public readonly pageHeight = 841.89;
  public readonly marginLeft = 40;
  public readonly marginRight = 40;
  public readonly contentWidth = 515.28; // 595.28 - 80

  public get pageCount(): number {
    return this.pages.length;
  }

  public get currentPage(): number {
    return this.currentPageIndex + 1;
  }

  public addNewPage(): void {
    this.pages.push([]);
    this.currentPageIndex = this.pages.length - 1;
  }

  public setPage(index: number): void {
    if (index >= 0 && index < this.pages.length) {
      this.currentPageIndex = index;
    }
  }

  private addOp(op: string): void {
    this.pages[this.currentPageIndex].push(op);
  }

  // Convert top-down Y coordinate to PDF bottom-up Y coordinate
  public toPdfY(topY: number): number {
    return this.pageHeight - topY;
  }

  public setFillColor(r: number, g: number, b: number): void {
    this.addOp(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`);
  }

  public setStrokeColor(r: number, g: number, b: number): void {
    this.addOp(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`);
  }

  public drawRect(
    x: number,
    topY: number,
    width: number,
    height: number,
    fill?: [number, number, number],
    stroke?: [number, number, number],
    lineWidth: number = 1
  ): void {
    const pdfY = this.toPdfY(topY + height);
    this.addOp('q');
    if (fill) {
      this.setFillColor(fill[0], fill[1], fill[2]);
    }
    if (stroke) {
      this.setStrokeColor(stroke[0], stroke[1], stroke[2]);
      this.addOp(`${lineWidth} w`);
    }

    this.addOp(`${x.toFixed(2)} ${pdfY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`);

    if (fill && stroke) {
      this.addOp('B'); // fill and stroke
    } else if (fill) {
      this.addOp('f'); // fill only
    } else if (stroke) {
      this.addOp('s'); // stroke only
    }
    this.addOp('Q');
  }

  public drawLine(
    x1: number,
    topY1: number,
    x2: number,
    topY2: number,
    stroke: [number, number, number],
    lineWidth: number = 1
  ): void {
    const pdfY1 = this.toPdfY(topY1);
    const pdfY2 = this.toPdfY(topY2);
    this.addOp('q');
    this.setStrokeColor(stroke[0], stroke[1], stroke[2]);
    this.addOp(`${lineWidth} w`);
    this.addOp(`${x1.toFixed(2)} ${pdfY1.toFixed(2)} m`);
    this.addOp(`${x2.toFixed(2)} ${pdfY2.toFixed(2)} l`);
    this.addOp('s');
    this.addOp('Q');
  }

  public drawText(
    text: string,
    x: number,
    topY: number,
    options: {
      font?: 'F1' | 'F2' | 'F3'; // F1: Regular, F2: Bold, F3: Oblique
      size?: number;
      color?: [number, number, number];
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}
  ): void {
    const font = options.font || 'F1';
    const size = options.size || 10;
    const color = options.color || [17, 24, 39];
    const align = options.align || 'left';
    const isBold = font === 'F2';

    let printText = text;
    if (options.maxWidth) {
      printText = truncateText(printText, options.maxWidth, size, isBold);
    }

    const textWidth = getTextWidth(printText, size, isBold);
    let targetX = x;
    if (align === 'center') {
      targetX = x - textWidth / 2;
    } else if (align === 'right') {
      targetX = x - textWidth;
    }

    // PDF baseline adjustment: standard text is anchored to baseline
    const baselineY = this.toPdfY(topY + size * 0.82);

    this.addOp('BT');
    this.addOp(`/${font} ${size} Tf`);
    this.setFillColor(color[0], color[1], color[2]);
    this.addOp(`1 0 0 1 ${targetX.toFixed(2)} ${baselineY.toFixed(2)} Tm`);
    this.addOp(`(${escapePdfText(printText)}) Tj`);
    this.addOp('ET');
  }

  // Draw corporate logo emblem (Royal Blue rounded pill badge with LP monogram)
  public drawLogoEmblem(x: number, topY: number, size: number = 32): void {
    this.addOp('q');
    // Outer rounded badge with corporate blue fill
    this.drawRect(x, topY, size, size, [37, 99, 235], [29, 78, 216], 1);
    // Subtle accent line inside emblem
    this.drawLine(x + 4, topY + size - 5, x + size - 4, topY + size - 5, [147, 197, 253], 1.5);
    // Monogram text 'LP' in white bold
    this.drawText('LP', x + size / 2, topY + 7, {
      font: 'F2',
      size: size * 0.44,
      color: [255, 255, 255],
      align: 'center',
    });
    this.addOp('Q');
  }

  public buildBlob(): Blob {
    // Generate PDF Objects
    // 1: Catalog
    // 2: Pages
    // 3: Font F1 (Helvetica)
    // 4: Font F2 (Helvetica-Bold)
    // 5: Font F3 (Helvetica-Oblique)
    // Page objects and streams follow

    const font1 = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    const font2 = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
    const font3 = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`;

    const pageCount = this.pages.length;
    // Object numbering:
    // 1: Catalog
    // 2: Pages
    // 3: F1
    // 4: F2
    // 5: F3
    // For each page i (0 to pageCount-1):
    // Page obj = 6 + i*2
    // Content stream obj = 7 + i*2

    const pageObjIds: number[] = [];
    for (let i = 0; i < pageCount; i++) {
      pageObjIds.push(6 + i * 2);
    }

    const pagesObj = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>`;
    const catalogObj = `<< /Type /Catalog /Pages 2 0 R >>`;

    const objects: { id: number; content: string }[] = [
      { id: 1, content: catalogObj },
      { id: 2, content: pagesObj },
      { id: 3, content: font1 },
      { id: 4, content: font2 },
      { id: 5, content: font3 },
    ];

    for (let i = 0; i < pageCount; i++) {
      const pageId = 6 + i * 2;
      const streamId = 7 + i * 2;
      const streamBody = this.pages[i].join('\n');
      const streamBytesLen = new TextEncoder().encode(streamBody).length;

      const streamObj = `<< /Length ${streamBytesLen} >>\nstream\n${streamBody}\nendstream`;
      const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.pageWidth.toFixed(2)} ${this.pageHeight.toFixed(2)}] /Contents ${streamId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /ProcSet [/PDF /Text] >> >>`;

      objects.push({ id: pageId, content: pageObj });
      objects.push({ id: streamId, content: streamObj });
    }

    // Sort objects by id
    objects.sort((a, b) => a.id - b.id);

    let body = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    const offsets: number[] = [];

    objects.forEach((obj) => {
      offsets.push(new TextEncoder().encode(body).length);
      body += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
    });

    const startXref = new TextEncoder().encode(body).length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((off) => {
      xref += String(off).padStart(10, '0') + ` 00000 n \n`;
    });

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    const finalPdf = body + xref + trailer;
    return new Blob([new TextEncoder().encode(finalPdf)], { type: 'application/pdf' });
  }
}

/**
 * Download a PDF blob with specified filename directly to the user's browser
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main PDF Report Generator for Lanka Pixel Creations (Pvt) Ltd
 */
export function generateProfessionalReportPdf(params: {
  reportType: ReportType;
  selectedMonth: string;
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  postCounts: DailyPostCount[];
  currentRole: UserRole;
}): string {
  const { reportType, selectedMonth, incomes, expenses, postCounts, currentRole } = params;

  // Enforce security & role-based restrictions
  if (currentRole === 'Designer' && reportType !== 'designer') {
    throw new Error('Unauthorized: Designer accounts are not authorized to export financial reports.');
  }

  const doc = new VectorPdfDocument();

  // Filter records by selected period
  const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthPosts = postCounts.filter((p) => p.date.startsWith(selectedMonth));

  // Calculations
  const totalIncome = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const operationalNet = totalIncome - totalExpenses;
  const totalPosts = monthPosts.reduce((acc, curr) => acc + curr.completed_posts, 0);

  // Determine Titles and Filename
  let reportTitle = 'Monthly Financial Performance Statement';
  let reportSubtitle = 'Consolidated Operational Intelligence & Inward Settlements';
  let filename = `LankaPixel_Monthly_Financial_Report_${selectedMonth}.pdf`;

  if (reportType === 'income') {
    reportTitle = 'Income & Inward Settlements Statement';
    reportSubtitle = 'Verified Client Billings, Design Packages & Retainers';
    filename = `LankaPixel_Income_Report_${selectedMonth}.pdf`;
  } else if (reportType === 'expense') {
    reportTitle = 'Operational Expenses & Disbursements Report';
    reportSubtitle = 'Corporate Operating Costs, Overheads & Disbursements';
    filename = `LankaPixel_Expense_Report_${selectedMonth}.pdf`;
  } else if (reportType === 'designer') {
    reportTitle = 'Creative Studio Designer Productivity Report';
    reportSubtitle = 'Daily Graphic Post Deliverables & Output Intelligence';
    filename = `LankaPixel_Designer_Productivity_Report_${selectedMonth}.pdf`;
  }

  const generatedDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const generatedTimeStr = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // --- DRAW REPORT HEADER ---
  let currentY = 40;

  const drawHeaderOnPage = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // Corporate Logo & Title Block
      doc.drawLogoEmblem(doc.marginLeft, currentY, 36);

      // Company Name
      doc.drawText('LANKA PIXEL CREATIONS (PVT) LTD', doc.marginLeft + 44, currentY + 2, {
        font: 'F2',
        size: 15,
        color: [15, 23, 42], // Dark Navy
      });

      // Subtitle
      doc.drawText(
        'Creative Design Agency & Social Media Production Management Portal',
        doc.marginLeft + 44,
        currentY + 18,
        {
          font: 'F1',
          size: 8.5,
          color: [100, 116, 139],
        }
      );

      // Top Right Meta Badges
      const rightX = doc.marginLeft + doc.contentWidth;
      doc.drawText(`PERIOD: ${formatMonth(selectedMonth).toUpperCase()}`, rightX, currentY + 4, {
        font: 'F2',
        size: 9.5,
        color: [37, 99, 235], // Blue
        align: 'right',
      });
      doc.drawText(`Generated: ${generatedDateStr} at ${generatedTimeStr}`, rightX, currentY + 18, {
        font: 'F1',
        size: 8,
        color: [100, 116, 139],
        align: 'right',
      });

      // Royal Blue Accent Bar
      currentY += 42;
      doc.drawRect(doc.marginLeft, currentY, doc.contentWidth, 3, [37, 99, 235]);

      // Report Title Block
      currentY += 14;
      doc.drawText(reportTitle, doc.marginLeft, currentY, {
        font: 'F2',
        size: 13,
        color: [15, 23, 42],
      });

      doc.drawText(
        `${reportSubtitle} • Currency: Sri Lankan Rupee (LKR)`,
        doc.marginLeft,
        currentY + 16,
        {
          font: 'F1',
          size: 8.5,
          color: [71, 85, 105],
        }
      );
      currentY += 34;
    } else {
      // Continuation Header on Subsequent Pages
      doc.drawText('LANKA PIXEL CREATIONS (PVT) LTD', doc.marginLeft, 36, {
        font: 'F2',
        size: 9,
        color: [71, 85, 105],
      });
      doc.drawText(
        `${reportTitle} • ${formatMonth(selectedMonth)} (Continued)`,
        doc.marginLeft + doc.contentWidth,
        36,
        {
          font: 'F1',
          size: 8.5,
          color: [100, 116, 139],
          align: 'right',
        }
      );
      doc.drawLine(doc.marginLeft, 48, doc.marginLeft + doc.contentWidth, 48, [226, 232, 240], 1);
    }
  };

  // Draw Page 1 Header
  drawHeaderOnPage(true);

  // --- DRAW SUMMARY CARDS ---
  let summaryCards: PdfSummaryCard[] = [];

  if (reportType === 'monthly') {
    summaryCards = [
      {
        title: 'TOTAL INWARD REVENUE',
        value: formatLKR(totalIncome),
        subtext: `${monthIncomes.length} settlements recorded`,
        accentColor: [16, 185, 129], // Emerald
      },
      {
        title: 'TOTAL OPERATING EXPENSES',
        value: formatLKR(totalExpenses),
        subtext: `${monthExpenses.length} disbursements`,
        accentColor: [239, 68, 68], // Red
      },
      {
        title: 'OPERATIONAL NET',
        value: formatLKR(operationalNet),
        subtext: operationalNet >= 0 ? '(+) Operating Surplus' : '(-) Operating Deficit',
        accentColor: operationalNet >= 0 ? [37, 99, 235] : [239, 68, 68],
      },
      {
        title: 'COMPLETED GRAPHICS',
        value: `${totalPosts} Posts`,
        subtext: 'Studio deliverables',
        accentColor: [59, 130, 246], // Blue
      },
    ];
  } else if (reportType === 'income') {
    const avgIncome = monthIncomes.length > 0 ? totalIncome / monthIncomes.length : 0;
    summaryCards = [
      {
        title: 'TOTAL INWARD SETTLEMENTS',
        value: formatLKR(totalIncome),
        subtext: `${monthIncomes.length} total entries`,
        accentColor: [16, 185, 129],
      },
      {
        title: 'TRANSACTION COUNT',
        value: `${monthIncomes.length} Invoices`,
        subtext: 'Active billing records',
        accentColor: [37, 99, 235],
      },
      {
        title: 'AVERAGE VALUE / TRANSACTION',
        value: formatLKR(avgIncome),
        subtext: 'Mean settlement size',
        accentColor: [59, 130, 246],
      },
    ];
  } else if (reportType === 'expense') {
    const avgExpense = monthExpenses.length > 0 ? totalExpenses / monthExpenses.length : 0;
    summaryCards = [
      {
        title: 'TOTAL DISBURSEMENTS',
        value: formatLKR(totalExpenses),
        subtext: `${monthExpenses.length} expense vouchers`,
        accentColor: [239, 68, 68],
      },
      {
        title: 'VOUCHER COUNT',
        value: `${monthExpenses.length} Records`,
        subtext: 'Approved expenditures',
        accentColor: [100, 116, 139],
      },
      {
        title: 'AVERAGE COST / RECORD',
        value: formatLKR(avgExpense),
        subtext: 'Mean disbursement',
        accentColor: [249, 115, 22],
      },
    ];
  } else if (reportType === 'designer') {
    const uniqueDesigners = new Set(monthPosts.map((p) => p.designer_name)).size;
    const avgPostsPerDesigner = uniqueDesigners > 0 ? (totalPosts / uniqueDesigners).toFixed(1) : '0';
    summaryCards = [
      {
        title: 'TOTAL COMPLETED POSTS',
        value: `${totalPosts} Posts`,
        subtext: 'Creative graphic deliverables',
        accentColor: [37, 99, 235],
      },
      {
        title: 'ACTIVE DESIGNERS',
        value: `${uniqueDesigners} Creators`,
        subtext: 'Publishing team members',
        accentColor: [16, 185, 129],
      },
      {
        title: 'AVERAGE OUTPUT / CREATOR',
        value: `${avgPostsPerDesigner} Posts`,
        subtext: 'Deliverables per creator',
        accentColor: [59, 130, 246],
      },
    ];
  }

  // Draw Summary Cards Grid
  const cardGap = 8;
  const numCards = summaryCards.length;
  const cardWidth = (doc.contentWidth - cardGap * (numCards - 1)) / numCards;
  const cardHeight = 52;

  summaryCards.forEach((card, idx) => {
    const cardX = doc.marginLeft + idx * (cardWidth + cardGap);
    // Background and border
    doc.drawRect(cardX, currentY, cardWidth, cardHeight, [248, 250, 252], [226, 232, 240], 1);
    // Top colored indicator line
    doc.drawRect(cardX, currentY, cardWidth, 2.5, card.accentColor);

    // Title
    doc.drawText(card.title, cardX + 8, currentY + 7, {
      font: 'F2',
      size: 7,
      color: [100, 116, 139],
      maxWidth: cardWidth - 16,
    });

    // Metric Value
    doc.drawText(card.value, cardX + 8, currentY + 19, {
      font: 'F2',
      size: 11.5,
      color: [15, 23, 42],
      maxWidth: cardWidth - 16,
    });

    // Subtext
    if (card.subtext) {
      doc.drawText(card.subtext, cardX + 8, currentY + 36, {
        font: 'F1',
        size: 7,
        color: [148, 163, 184],
        maxWidth: cardWidth - 16,
      });
    }
  });

  currentY += cardHeight + 12;

  // Accounting Notice Box for Financial Reports
  if (reportType === 'monthly' || reportType === 'income' || reportType === 'expense') {
    doc.drawRect(doc.marginLeft, currentY, doc.contentWidth, 22, [248, 250, 252], [226, 232, 240], 0.8);
    doc.drawText(
      'Notice: Figures represent verified records registered on Lanka Pixel Management. Operational Net is strictly Total Income - Total Expenses.',
      doc.marginLeft + 8,
      currentY + 6,
      {
        font: 'F3',
        size: 7.5,
        color: [71, 85, 105],
      }
    );
    currentY += 30;
  }

  // --- DRAW DETAILED TABLE ---
  let columns: PdfTableColumn[] = [];
  let tableRows: (string | number)[][] = [];
  let totalRow: (string | number)[] | null = null;

  if (reportType === 'monthly') {
    columns = [
      { header: 'Date', width: 70, align: 'left' },
      { header: 'Day of Week', width: 75, align: 'left' },
      { header: 'Daily Income (Rs.)', width: 105, align: 'right' },
      { header: 'Daily Expenses (Rs.)', width: 105, align: 'right' },
      { header: 'Operational Net (Rs.)', width: 105, align: 'right' },
      { header: 'Posts', width: 55.28, align: 'center' },
    ];

    // Collect dates
    const dateSet = new Set<string>();
    monthIncomes.forEach((i) => dateSet.add(i.date));
    monthExpenses.forEach((e) => dateSet.add(e.date));
    monthPosts.forEach((p) => dateSet.add(p.date));
    const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

    tableRows = sortedDates.map((dateStr) => {
      const dayInc = monthIncomes
        .filter((i) => i.date === dateStr)
        .reduce((acc, curr) => acc + curr.amount, 0);
      const dayExp = monthExpenses
        .filter((e) => e.date === dateStr)
        .reduce((acc, curr) => acc + curr.amount, 0);
      const dayNet = dayInc - dayExp;
      const dayPosts = monthPosts
        .filter((p) => p.date === dateStr)
        .reduce((acc, curr) => acc + curr.completed_posts, 0);

      const d = new Date(dateStr);
      const dayName = isNaN(d.getTime())
        ? ''
        : d.toLocaleDateString('en-GB', { weekday: 'short' });

      return [
        formatDate(dateStr),
        dayName,
        dayInc > 0 ? formatLKR(dayInc) : 'Rs. 0',
        dayExp > 0 ? formatLKR(dayExp) : 'Rs. 0',
        formatLKR(dayNet),
        dayPosts > 0 ? `${dayPosts}` : '-',
      ];
    });

    totalRow = [
      'TOTAL PERIOD',
      `${sortedDates.length} Days`,
      formatLKR(totalIncome),
      formatLKR(totalExpenses),
      formatLKR(operationalNet),
      `${totalPosts}`,
    ];
  } else if (reportType === 'income') {
    columns = [
      { header: 'Date', width: 65, align: 'left' },
      { header: 'Income Source / Package', width: 155, align: 'left' },
      { header: 'Client / Project', width: 120, align: 'left' },
      { header: 'Recorded By', width: 85, align: 'left' },
      { header: 'Amount (Rs.)', width: 90.28, align: 'right' },
    ];

    tableRows = monthIncomes.map((item) => [
      formatDate(item.date),
      item.source,
      item.client_project || 'General Service',
      item.recorded_by,
      formatLKR(item.amount),
    ]);

    totalRow = [
      'TOTAL INWARD SETTLEMENTS',
      `${monthIncomes.length} Transactions`,
      '',
      '',
      formatLKR(totalIncome),
    ];
  } else if (reportType === 'expense') {
    columns = [
      { header: 'Date', width: 65, align: 'left' },
      { header: 'Expense Category', width: 120, align: 'left' },
      { header: 'Description / Purpose', width: 155, align: 'left' },
      { header: 'Recorded By', width: 85, align: 'left' },
      { header: 'Amount (Rs.)', width: 90.28, align: 'right' },
    ];

    tableRows = monthExpenses.map((item) => [
      formatDate(item.date),
      item.category,
      item.description,
      item.recorded_by,
      formatLKR(item.amount),
    ]);

    totalRow = [
      'TOTAL DISBURSEMENTS',
      `${monthExpenses.length} Vouchers`,
      '',
      '',
      formatLKR(totalExpenses),
    ];
  } else if (reportType === 'designer') {
    columns = [
      { header: 'Date', width: 80, align: 'left' },
      { header: 'Designer Name', width: 160, align: 'left' },
      { header: 'Completed Graphic Posts', width: 115, align: 'center' },
      { header: 'Notes / Assignment Details', width: 160.28, align: 'left' },
    ];

    tableRows = monthPosts.map((item) => [
      formatDate(item.date),
      item.designer_name,
      `${item.completed_posts} posts`,
      item.notes || 'Routine daily schedule',
    ]);

    totalRow = [
      'STUDIO OUTPUT TOTAL',
      `${monthPosts.length} Logs`,
      `${totalPosts} posts`,
      '',
    ];
  }

  // Table Dimensions
  const rowHeight = 18;
  const headerHeight = 22;
  const maxContentBottomY = doc.pageHeight - 55; // Leave 55pt for footer

  const drawTableHeader = (y: number) => {
    // Header background: Corporate Dark Navy
    doc.drawRect(doc.marginLeft, y, doc.contentWidth, headerHeight, [30, 58, 138]);

    let colX = doc.marginLeft;
    columns.forEach((col) => {
      let textX = colX + 6;
      if (col.align === 'center') textX = colX + col.width / 2;
      else if (col.align === 'right') textX = colX + col.width - 6;

      doc.drawText(col.header, textX, y + 6, {
        font: 'F2',
        size: 8,
        color: [255, 255, 255],
        align: col.align || 'left',
        maxWidth: col.width - 12,
      });
      colX += col.width;
    });
  };

  // Check if no data
  if (tableRows.length === 0) {
    // Empty state container
    doc.drawRect(doc.marginLeft, currentY, doc.contentWidth, 70, [248, 250, 252], [226, 232, 240], 1);
    doc.drawText(
      `No ${reportTitle.toLowerCase()} data found for ${formatMonth(selectedMonth)}.`,
      doc.marginLeft + doc.contentWidth / 2,
      currentY + 24,
      {
        font: 'F2',
        size: 10,
        color: [71, 85, 105],
        align: 'center',
      }
    );
    doc.drawText(
      'Please select another reporting month or verify that entries have been logged in the management system.',
      doc.marginLeft + doc.contentWidth / 2,
      currentY + 40,
      {
        font: 'F1',
        size: 8,
        color: [148, 163, 184],
        align: 'center',
      }
    );
  } else {
    // Draw initial table header
    drawTableHeader(currentY);
    currentY += headerHeight;

    // Render table rows
    tableRows.forEach((row, rowIndex) => {
      // Check if new page is needed
      if (currentY + rowHeight > maxContentBottomY) {
        doc.addNewPage();
        drawHeaderOnPage(false);
        currentY = 60; // Start below continuation header
        drawTableHeader(currentY);
        currentY += headerHeight;
      }

      // Alternating row background
      const isEven = rowIndex % 2 === 0;
      const rowBg: [number, number, number] = isEven ? [255, 255, 255] : [248, 250, 252];
      doc.drawRect(doc.marginLeft, currentY, doc.contentWidth, rowHeight, rowBg, [226, 232, 240], 0.5);

      let colX = doc.marginLeft;
      row.forEach((cellVal, colIdx) => {
        const col = columns[colIdx];
        if (!col) return;

        let textX = colX + 6;
        if (col.align === 'center') textX = colX + col.width / 2;
        else if (col.align === 'right') textX = colX + col.width - 6;

        const cellStr = String(cellVal);
        doc.drawText(cellStr, textX, currentY + 5, {
          font: 'F1',
          size: 7.5,
          color: [30, 41, 59],
          align: col.align || 'left',
          maxWidth: col.width - 12,
        });

        colX += col.width;
      });

      currentY += rowHeight;
    });

    // Draw Totals Row
    if (totalRow) {
      if (currentY + rowHeight + 4 > maxContentBottomY) {
        doc.addNewPage();
        drawHeaderOnPage(false);
        currentY = 60;
        drawTableHeader(currentY);
        currentY += headerHeight;
      }

      // Highlighted total row with soft blue fill
      doc.drawRect(
        doc.marginLeft,
        currentY,
        doc.contentWidth,
        rowHeight + 2,
        [239, 246, 255],
        [191, 219, 254],
        1
      );

      let colX = doc.marginLeft;
      totalRow.forEach((cellVal, colIdx) => {
        const col = columns[colIdx];
        if (!col) return;

        let textX = colX + 6;
        if (col.align === 'center') textX = colX + col.width / 2;
        else if (col.align === 'right') textX = colX + col.width - 6;

        const cellStr = String(cellVal);
        doc.drawText(cellStr, textX, currentY + 5, {
          font: 'F2',
          size: 8,
          color: [15, 23, 42],
          align: col.align || 'left',
          maxWidth: col.width - 12,
        });

        colX += col.width;
      });
      currentY += rowHeight + 12;
    }
  }

  // --- DRAW FOOTER ON ALL PAGES ---
  const totalPages = doc.pageCount;
  for (let p = 0; p < totalPages; p++) {
    doc.setPage(p);
    const footerY = doc.pageHeight - 38;

    // Divider Line
    doc.drawLine(doc.marginLeft, footerY, doc.marginLeft + doc.contentWidth, footerY, [226, 232, 240], 0.8);

    // Left legal notice
    doc.drawText(
      'LANKA PIXEL CREATIONS (PVT) LTD  •  Confidential Corporate Intelligence Report',
      doc.marginLeft,
      footerY + 8,
      {
        font: 'F3',
        size: 7.5,
        color: [148, 163, 184],
      }
    );

    // Right Page numbering: Page X of Y
    doc.drawText(
      `Page ${p + 1} of ${totalPages}`,
      doc.marginLeft + doc.contentWidth,
      footerY + 8,
      {
        font: 'F2',
        size: 8,
        color: [100, 116, 139],
        align: 'right',
      }
    );
  }

  // Build PDF blob and trigger browser download
  const blob = doc.buildBlob();
  downloadPdfBlob(blob, filename);

  return filename;
}
