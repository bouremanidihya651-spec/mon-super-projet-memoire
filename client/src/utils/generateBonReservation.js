import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Génère un bon de réservation PDF pour une réservation (paiement à l'arrivée)
 * @param {Object} reservation - Données de la réservation
 * @param {Object} invoice - Données de la facture/réservation
 * @returns {Blob} - Le fichier PDF généré
 */
export const generateBonReservationPDF = (reservation, invoice) => {
  const doc = new jsPDF();

  // Couleurs
  const primaryColor = [212, 175, 55]; // #D4AF37 - Doré Travellux
  const darkColor = [26, 26, 26]; // #1a1a1a - Fond sombre
  const lightGray = [240, 240, 240];

  // En-tête
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');

  // Logo / Nom de l'entreprise
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVELLUX', 15, 18);

  // Numéro de bon de réservation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`BON DE RÉSERVATION N° ${invoice.invoice_number}`, 140, 15);

  // Date
  const date = new Date(invoice.invoice_date);
  const formattedDate = date.toLocaleDateString('fr-FR');
  doc.text(`Date: ${formattedDate}`, 140, 22);

  // Informations de l'entreprise
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text('TRAVELLUX - Agence de Voyage', 15, 40);
  doc.text('contact@travellux.com', 15, 45);
  doc.text('www.travellux.com', 15, 50);

  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(...lightGray);
  doc.rect(15, 58, 180, 25, 'F');
  doc.setTextColor(...darkColor);
  doc.text('INFORMATIONS CLIENT', 20, 65);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom: ${invoice.customer_name}`, 20, 73);
  doc.text(`Email: ${invoice.customer_email}`, 20, 78);
  if (invoice.customer_phone) {
    doc.text(`Téléphone: ${invoice.customer_phone}`, 20, 83);
  }

  // Détails de la réservation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(...lightGray);
  doc.rect(15, 90, 180, 25, 'F');
  doc.setTextColor(...darkColor);
  doc.text('DÉTAILS DE LA RÉSERVATION', 20, 97);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const details = invoice.invoice_details;
  const rows = [
    ['Destination',         details.destination || 'N/A'],
    ['Article / Service',   details.itemName    || details.transportName || 'N/A'],
    ['Trajet / Lieu',       details.route       || details.location      || 'N/A'],
    ['Date',                details.departureDate || details.travelDate || details.checkInDate || details.activityDate || 'N/A'],
    ['Type de voyage',      details.tripType === 'round_trip' ? 'Aller-retour' : 'Aller simple'],
    ['Nombre de voyageurs', `${(details.adults || 0) + (details.children || 0) + (details.infants || 0)} (${details.adults || 0} adultes, ${details.children || 0} enfants, ${details.infants || 0} bébés)`],
    ['Prix unitaire',       `${details.unitPrice} DA`]
  ];

  autoTable(doc, {
    startY: 102,
    head: [['Champ', 'Valeur']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 135 }
    },
    margin: { left: 15, right: 15 }
  });

  // Total
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`TOTAL: ${invoice.amount} DA`, 140, finalY);

  // Statut de paiement - Always "À PAYER SUR PLACE" for bon de réservation
  const statusY = finalY + 10;
  doc.setFontSize(11);
  const statusColor = [255, 152, 0]; // Orange
  
  doc.setTextColor(...statusColor);
  doc.text(`Statut: À PAYER SUR PLACE`, 140, statusY);

  // Note explicative pour le bon de réservation
  const noteY = statusY + 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  
  const splitNote = doc.splitTextToSize(
    'Ce bon de réservation atteste que votre réservation est confirmée. Le paiement sera effectué directement sur place lors de votre arrivée. Veuillez présenter ce document au comptoir de l\'agence.',
    180
  );
  doc.text(splitNote, 105, noteY, { align: 'center' });

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Merci pour votre confiance !', 105, pageHeight - 25, { align: 'center' });
  doc.text('Pour toute question, contactez-nous à contact@travellux.com', 105, pageHeight - 20, { align: 'center' });

  // Numéro de confirmation
  doc.setFontSize(8);
  doc.text(`Confirmation: ${reservation.confirmation_number || 'N/A'}`, 105, pageHeight - 15, { align: 'center' });

  return doc;
};

/**
 * Télécharge le bon de réservation PDF
 * @param {jsPDF} doc - Document PDF
 * @param {string} invoiceNumber - Numéro de facture pour le nom de fichier
 */
export const downloadBonReservationPDF = (doc, invoiceNumber) => {
  doc.save(`bon-reservation-${invoiceNumber}.pdf`);
};

/**
 * Génère et télécharge automatiquement un bon de réservation
 * @param {Object} reservation - Données de la réservation
 * @param {Object} invoice - Données de la facture/réservation
 */
export const generateAndDownloadBonReservation = (reservation, invoice) => {
  const pdf = generateBonReservationPDF(reservation, invoice);
  downloadBonReservationPDF(pdf, invoice.invoice_number);
  return pdf;
};

export default {
  generateBonReservationPDF,
  downloadBonReservationPDF,
  generateAndDownloadBonReservation
};


