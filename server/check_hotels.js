const { Hotel, HotelBackup } = require('./models');
const sequelize = require('./config/db');

async function checkData() {
  try {
    await sequelize.authenticate();
    const hotelCount = await Hotel.count();
    const backupCount = await HotelBackup.count();
    console.log(`Hotel count: ${hotelCount}`);
    console.log(`HotelBackup count: ${backupCount}`);
    
    if (hotelCount > 0) {
        const h = await Hotel.findOne();
        console.log('Sample Hotel ID:', h.id);
    }
    if (backupCount > 0) {
        const b = await HotelBackup.findOne();
        console.log('Sample Backup ID:', b.id);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
