const { Hotel, HotelBackup } = require('./models');
const sequelize = require('./config/db');

async function syncHotels() {
  try {
    await sequelize.authenticate();
    
    const backups = await HotelBackup.findAll();
    console.log(`Found ${backups.length} hotels in backup.`);
    
    for (const backup of backups) {
      const [hotel, created] = await Hotel.findOrCreate({
        where: { id: backup.id },
        defaults: backup.toJSON()
      });
      
      if (created) {
        console.log(`Created hotel: ${backup.name} (ID: ${backup.id})`);
      } else {
        console.log(`Hotel already exists: ${backup.name} (ID: ${backup.id})`);
        // Update it just in case
        await hotel.update(backup.toJSON());
      }
    }
    
    console.log('Sync completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

syncHotels();
