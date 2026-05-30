import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Génère une facture PDF pour une réservation - AFALOU TOURS
 * Couleurs correspondant à l'application :
 *   Vert principal  : #2A6049
 *   Beige/crème     : #F5F0E8
 *   Texte sombre    : #1C1C1C
 *   Vert clair acc. : #4A8B6F
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN_DARK  = [42,  96,  73];   // #2A6049
const GREEN_MID   = [74, 139, 111];   // #4A8B6F
const CREAM       = [245, 240, 232];  // #F5F0E8
const DARK_TEXT   = [28,  28,  28];   // #1C1C1C
const WHITE       = [255, 255, 255];
const LIGHT_GRAY  = [230, 225, 218];

// ─── Helper : ligne horizontale ───────────────────────────────────────────────
const hLine = (doc, y, x1 = 15, x2 = 195, color = LIGHT_GRAY) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
};

// ─── Helper : badge statut ────────────────────────────────────────────────────
const statusConfig = {
  paid:      { label: 'PAYÉ',         color: [46, 125, 50]  },
  pending:   { label: 'EN ATTENTE',   color: [230, 119, 0]  },
  failed:    { label: 'ÉCHOUÉ',       color: [198, 40, 40]  },
  refunded:  { label: 'REMBOURSÉ',    color: [74, 139, 111] },
};

// ─────────────────────────────────────────────────────────────────────────────
export const generateInvoicePDF = (reservation, invoice) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.width;   // 210
  const H   = doc.internal.pageSize.height;  // 297

  /* ══════════════════════════════════════════════════════
     1. EN-TÊTE  (bande verte + nom agence + n° facture)
  ══════════════════════════════════════════════════════ */
  // Bande principale
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, W, 38, 'F');

  // Accent fin en vert clair sous la bande
  doc.setFillColor(...GREEN_MID);
  doc.rect(0, 38, W, 1.5, 'F');

  // Nom de l'agence — style italic bold (simulé en helvetica bold)
  doc.setTextColor(...WHITE);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('Afalou', 15, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AGENCE DE VOYAGES & TOURISME', 15, 27);

  // Bloc facture (droite)
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', W - 15, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`N°  ${invoice.invoice_number}`, W - 15, 20, { align: 'right' });

  const formattedDate = new Date(invoice.invoice_date)
    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Date : ${formattedDate}`, W - 15, 26, { align: 'right' });

  /* ══════════════════════════════════════════════════════
     2. COORDONNÉES AGENCE  (fond crème)
  ══════════════════════════════════════════════════════ */
  doc.setFillColor(...CREAM);
  doc.rect(0, 39.5, W, 20, 'F');

  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const agencyInfo = [
    'Cité Boumedaoui (EDIMCO), Béjaïa, Algérie',
    'Tél : +213 (0) 34 12 04 84  |  +213 (0) 555 66 53 02  |  +213 (0) 552 68 16 11',
    'Email : Afaloutours@gmail.com',
  ];
  agencyInfo.forEach((line, i) => doc.text(line, 15, 46 + i * 5));

  /* ══════════════════════════════════════════════════════
     3. BLOC CLIENT
  ══════════════════════════════════════════════════════ */
  let curY = 68;

  // Titre section
  doc.setFillColor(...GREEN_DARK);
  doc.rect(15, curY, 3, 6, 'F');
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS CLIENT', 21, curY + 4.5);
  curY += 10;

  // Fond client
  doc.setFillColor(...CREAM);
  doc.roundedRect(15, curY, W - 30, 24, 2, 2, 'F');

  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nom :', 20, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_name || 'N/A', 45, curY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Email :', 20, curY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_email || 'N/A', 45, curY + 13);

  if (invoice.customer_phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Tél :', 20, curY + 19);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer_phone, 45, curY + 19);
  }

  curY += 30;

  /* ══════════════════════════════════════════════════════
     4. DÉTAILS RÉSERVATION  (tableau)
  ══════════════════════════════════════════════════════ */
  doc.setFillColor(...GREEN_DARK);
  doc.rect(15, curY, 3, 6, 'F');
  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DE LA RÉSERVATION', 21, curY + 4.5);
  curY += 8;

  const d = invoice.invoice_details;
  const voyageurs = (d.adults || 0) + (d.children || 0) + (d.infants || 0);
  const tripLabel  = d.tripType === 'round_trip' ? 'Aller-retour' : 'Aller simple';
  const paxDetail  = `${voyageurs} (${d.adults} adultes, ${d.children} enfants, ${d.infants} bébés)`;

  const rows = [
    ['Destination',         d.destination    || 'N/A'],
    ['Article / Service',   d.itemName       || d.transportName || 'N/A'],
    ['Trajet / Lieu',       d.route          || d.location      || 'N/A'],
    ['Date',                d.departureDate  || d.travelDate    || d.checkInDate || d.activityDate || 'N/A'],
    ['Type de voyage',      tripLabel],
    ['Voyageurs',           paxDetail],
    ['Prix unitaire',       `${d.unitPrice} DA`],
  ];

  autoTable(doc, {
    startY: curY,
    head: [['Champ', 'Valeur']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: GREEN_DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: DARK_TEXT,
    },
    alternateRowStyles: {
      fillColor: CREAM,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [235, 230, 222] },
      1: { cellWidth: 125 },
    },
    tableLineColor: LIGHT_GRAY,
    tableLineWidth: 0.2,
    margin: { left: 15, right: 15 },
  });

  /* ══════════════════════════════════════════════════════
     5. TOTAUX + STATUT
  ══════════════════════════════════════════════════════ */
  curY = doc.lastAutoTable.finalY + 8;
  hLine(doc, curY);
  curY += 6;

  // Montant total
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(W - 80, curY, 65, 16, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', W - 75, curY + 7);
  doc.setFontSize(13);
  doc.text(`${invoice.amount} DA`, W - 17, curY + 11, { align: 'right' });

  // Badge statut
  const st = statusConfig[invoice.payment_status] || statusConfig.pending;
  doc.setFillColor(...st.color);
  doc.roundedRect(15, curY + 2, 38, 10, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(st.label, 34, curY + 8.5, { align: 'center' });

  curY += 26;

  /* ══════════════════════════════════════════════════════
     6. N° CONFIRMATION
  ══════════════════════════════════════════════════════ */
  if (reservation.confirmation_number) {
    doc.setFillColor(...CREAM);
    doc.roundedRect(15, curY, W - 30, 10, 2, 2, 'F');
    doc.setTextColor(...GREEN_DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Confirmation : ${reservation.confirmation_number}`, W / 2, curY + 6.5, { align: 'center' });
    curY += 14;
  }

  /* ══════════════════════════════════════════════════════
     7. PIED DE PAGE
  ══════════════════════════════════════════════════════ */
  // Bande verte en bas
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, H - 18, W, 18, 'F');

  doc.setFillColor(...GREEN_MID);
  doc.rect(0, H - 19, W, 1, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('Afalou Tours', W / 2, H - 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Merci pour votre confiance !  ·  Afaloutours@gmail.com  ·  +213 (0) 34 12 04 84', W / 2, H - 6, { align: 'center' });

  return doc;
};

// ─── Téléchargement ───────────────────────────────────────────────────────────
export const downloadInvoicePDF = (doc, invoiceNumber) => {
  doc.save(`facture-${invoiceNumber}.pdf`);
};

export const generateAndDownloadInvoice = (reservation, invoice) => {
  const pdf = generateInvoicePDF(reservation, invoice);
  downloadInvoicePDF(pdf, invoice.invoice_number);
  return pdf;
};

export default { generateInvoicePDF, downloadInvoicePDF, generateAndDownloadInvoice };

