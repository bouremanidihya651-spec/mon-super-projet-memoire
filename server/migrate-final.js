const { sqlite, postgres } = require('./config/database');

async function migrate() {
  try {
    console.log('Connexion aux bases...');
    await sqlite.authenticate();
    await postgres.authenticate();
    console.log('Connexions OK');

    const [tables] = await sqlite.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);

    console.log(tables.length + ' tables trouvees :');
    console.log(tables.map(t => t.name).join(', '));

    for (const { name: tableName } of tables) {
      console.log('Migration de : ' + tableName);
      
      const [rows] = await sqlite.query(`SELECT * FROM "${tableName}"`);
      console.log('  -> ' + rows.length + ' lignes');

      if (rows.length === 0) {
        console.log('  -> Table vide');
        continue;
      }

      const columns = Object.keys(rows[0]);
      const columnNames = columns.map(col => `"${col}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let successCount = 0;
      for (const row of rows) {
        try {
          const values = columns.map(col => {
            const val = row[col];
            
            // Gérer les booléens SQLite (0/1, "true", "false") → PostgreSQL
            if (val === 0 || val === 1) {
              return val === 1;
            }
            
            if (typeof val === 'string') {
              if (val.toLowerCase() === 'true') return true;
              if (val.toLowerCase() === 'false') return false;
              if (val === '' && /^(price|amount|total|rating|score|deposit)/i.test(col)) {
                return null;
              }
            }
            
            if (val === null || val === undefined || val === '') {
              return null;
            }
            
            return val;
          });

          await postgres.query(insertQuery, { bind: values });
          successCount++;
        } catch (err) {
          console.error('  Erreur : ' + err.message);
        }
      }

      console.log('  -> ' + successCount + '/' + rows.length + ' migrees');
    }

    console.log('Migration terminee !');

  } catch (error) {
    console.error('Erreur critique :', error);
  } finally {
    await sqlite.close();
    await postgres.close();
  }
}

migrate();
