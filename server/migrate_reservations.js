const sequelize = require('./config/db');

async function migrateReservationsTable() {
  try {
    console.log('Starting Reservations table migration...');
    
    // Backup existing data
    await sequelize.query(`DROP TABLE IF EXISTS Reservations_backup`);
    await sequelize.query(`CREATE TABLE Reservations_backup AS SELECT * FROM Reservations`);
    
    // Drop old table
    await sequelize.query(`DROP TABLE Reservations`);
    
    // Create new table with hotel_id and activity_id
    await sequelize.query(`
      CREATE TABLE Reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        transport_id INTEGER,
        hotel_id INTEGER,
        activity_id INTEGER,
        trip_type TEXT,
        departure_date TEXT NOT NULL,
        return_date TEXT,
        pickup_time TEXT,
        return_time TEXT,
        adults INTEGER DEFAULT 1,
        children INTEGER DEFAULT 0,
        infants INTEGER DEFAULT 0,
        travelers_details TEXT NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        card_last_four TEXT,
        status TEXT DEFAULT 'pending',
        confirmation_number TEXT UNIQUE,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Copy existing data (only the columns that exist in both tables)
    await sequelize.query(`
      INSERT INTO Reservations (
        id, user_id, transport_id, trip_type, departure_date, return_date,
        adults, children, infants,
        travelers_details, unit_price, total_price, payment_method,
        payment_status, card_last_four, status, confirmation_number, notes,
        created_at, updated_at
      )
      SELECT 
        id, user_id, transport_id, trip_type, departure_date, return_date,
        adults, children, infants,
        travelers_details, unit_price, total_price, payment_method,
        payment_status, card_last_four, status, confirmation_number, notes,
        created_at, updated_at
      FROM Reservations_backup
    `);
    
    // Drop backup table
    await sequelize.query(`DROP TABLE Reservations_backup`);
    
    console.log('✅ Reservations table migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateReservationsTable();
