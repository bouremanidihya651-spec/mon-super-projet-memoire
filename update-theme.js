const fs = require('fs');
const path = require('path');

const files = [
  'client/src/components/UserDashboard/components/ReservationsContent.jsx',
  'client/src/components/UserDashboard/components/FavoritesContent.jsx',
  'client/src/components/UserDashboard/components/SettingsContent.jsx',
  'client/src/components/UserDashboard/components/MesFactures.jsx',
  'client/src/components/UserDashboard/components/InvoiceModal.jsx',
  'client/src/components/UserDashboard/components/RecommendationsContent.jsx',
  'client/src/components/UserDashboard/components/DestinationDetailPage.jsx',
  'client/src/components/UserDashboard/components/HotelDetailPage.jsx',
  'client/src/components/UserDashboard/components/ActivityDetailPage.jsx',
  'client/src/components/UserDashboard/components/HotelReservationModal.jsx',
  'client/src/components/UserDashboard/components/FlightReservationModal.jsx',
  'client/src/components/UserDashboard/components/ActivityReservationModal.jsx',
  'client/src/components/UserDashboard/components/CarRentalReservationModal.jsx',
  'client/src/components/UserDashboard/components/GroundTransportReservationModal.jsx'
];

const baseDir = 'C:\\Users\\hp\\Desktop\\projects\\memoire';

const replacements = [
  // Remaining #D4AF37 references
  { from: /border-\[#D4AF37\]/g, to: 'border-emerald-500' },
  { from: /focus:border-\[#D4AF37\]/g, to: 'focus:border-emerald-500' },
  { from: /accent-\[#D4AF37\]/g, to: 'accent-emerald-500' },
  { from: /ring-\[#D4AF37\]\/20/g, to: 'ring-emerald-500/20' },
  { from: /shadow-\[#D4AF37\]\/20/g, to: 'shadow-emerald-500/20' },
  { from: /hover:border-\[#D4AF37\]/g, to: 'hover:border-emerald-500' },
  { from: /border-\[#D4AF37\] bg-emerald-500\/10/g, to: 'border-emerald-500 bg-emerald-50' },
  { from: /hover:to-yellow-400/g, to: 'hover:to-emerald-600' },
];

files.forEach((filePath) => {
  const fullPath = path.join(baseDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
});

console.log('\nDone!');
