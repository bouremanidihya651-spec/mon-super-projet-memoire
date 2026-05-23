const { sqlite, postgres } = require('./config/database');

async function createTables() {
  try {
    await postgres.authenticate();
    console.log('Connecté à PostgreSQL');

    // Récupérer les tables de SQLite
    const [tables] = await sqlite.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);

    for (const { name: tableName } of tables) {
      // Récupérer la structure de la table SQLite
      const [columns] = await sqlite.query(`PRAGMA table_info("${tableName}")`);
      
      // Construire la requête CREATE TABLE pour PostgreSQL
      const columnDefs = columns.map(col => {
        let type = 'TEXT';
        if (col.type.includes('INT')) type = 'INTEGER';
        else if (col.type.includes('REAL') || col.type.includes('FLOA') || col.type.includes('DOUB')) type = 'REAL';
        else if (col.type.includes('NUMERIC') || col.type.includes('DECIMAL')) type = 'NUMERIC';
        else if (col.type.includes('BLOB')) type = 'BYTEA';
        else if (col.type.includes('DATE') || col.type.includes('TIME')) type = 'TIMESTAMP';
        
        let def = `"${col.name}"`;
        
        if (col.pk && type === 'INTEGER') {
          def += ' SERIAL PRIMARY KEY';
        } else {
          def += ` ${type}`;
          if (col.pk) def += ' PRIMARY KEY';
          if (col.notnull) def += ' NOT NULL';
          if (col.dflt_value) def += ` DEFAULT ${col.dflt_value}`;
        }
        
        return def;
      });

      const createQuery = `CREATE TABLE "${tableName}" (${columnDefs.join(', ')})`;
      
      try {
        await postgres.query(createQuery);
        console.log(`✅ Table ${tableName} créée`);
      } catch (err) {
        console.error(`❌ Erreur ${tableName}:`, err.message);
      }
    }

    console.log('Tables créées !');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await sqlite.close();
    await postgres.close();
  }
}

createTables();
