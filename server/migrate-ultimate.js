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

      // Récupérer les types PostgreSQL
      const [pgColumns] = await postgres.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
      `);
      
      const pgTypes = {};
      pgColumns.forEach(col => {
        pgTypes[col.column_name] = col.data_type;
      });

      const columns = Object.keys(rows[0]);
      const columnNames = columns.map(col => `"${col}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let successCount = 0;
      for (const row of rows) {
        try {
          const values = columns.map(col => {
            const val = row[col];
            const pgType = pgTypes[col];
            
            // Si PostgreSQL attend un integer/boolean et SQLite envoie une chaîne "true"/"false"
            if (typeof val === 'string' && (val === 'true' || val === 'false')) {
              if (pgType === 'boolean') return val === 'true';
              if (pgType === 'integer' || pgType === 'numeric' || pgType === 'real') {
                // Garder comme 0/1 pour integer
                return val === 'true' ? 1 : 0;
              }
            }
            
            // Si c'est déjà un nombre 0/1
            if (val === 0 || val === 1) {
              if (pgType === 'boolean') return val === 1;
              return val; // Garder 0/1 pour integer
            }
            
            // Valeurs vides → null
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
