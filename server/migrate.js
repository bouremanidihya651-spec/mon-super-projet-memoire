/**
 * Script de migration simple pour SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Vérifier et ajouter les colonnes manquantes à Users
  db.all("PRAGMA table_info(Users)", (err, rows) => {
    if (err) {
      console.error('Erreur:', err);
      db.close();
      return;
    }

    const columnNames = rows.map(row => row.name);
    
    // Ajouter travelerType si manquant
    if (!columnNames.includes('travelerType')) {
      console.log('➕ Ajout de la colonne travelerType à Users...');
      db.run("ALTER TABLE Users ADD COLUMN travelerType TEXT", (err) => {
        if (err) {
          console.error('Erreur ajout travelerType:', err);
        } else {
          console.log('✅ Colonne travelerType ajoutée');
        }
        checkProfilePhoto();
      });
    } else {
      console.log('ℹ️  Colonne travelerType déjà existante');
      checkProfilePhoto();
    }

    function checkProfilePhoto() {
      // Ajouter profilePhoto si manquant
      if (!columnNames.includes('profilePhoto')) {
        console.log('➕ Ajout de la colonne profilePhoto à Users...');
        db.run("ALTER TABLE Users ADD COLUMN profilePhoto TEXT", (err) => {
          if (err) {
            console.error('Erreur ajout profilePhoto:', err);
          } else {
            console.log('✅ Colonne profilePhoto ajoutée');
          }
          checkUserPreferences();
        });
      } else {
        console.log('ℹ️  Colonne profilePhoto déjà existante');
        checkUserPreferences();
      }
    }

    function checkUserPreferences() {
      // Vérifier si UserPreferences existe
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='UserPreferences'", (err, row) => {
        if (err) {
          console.error('Erreur:', err);
          db.close();
          return;
        }

        if (!row) {
          console.log('➕ Création de la table UserPreferences...');
          db.run(`
            CREATE TABLE UserPreferences (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER NOT NULL UNIQUE,
              travelerType TEXT,
              luxury_score REAL DEFAULT 0.5,
              nature_score REAL DEFAULT 0.5,
              adventure_score REAL DEFAULT 0.5,
              culture_score REAL DEFAULT 0.5,
              beach_score REAL DEFAULT 0.5,
              food_score REAL DEFAULT 0.5,
              minBudget REAL DEFAULT 0,
              maxBudget REAL DEFAULT 10000,
              preferredTags TEXT DEFAULT '[]',
              clusterId INTEGER,
              lastClusterUpdate DATETIME,
              createdAt DATETIME NOT NULL,
              updatedAt DATETIME NOT NULL,
              FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
          `, (err) => {
            if (err) {
              console.error('Erreur création UserPreferences:', err);
            } else {
              console.log('✅ Table UserPreferences créée');
            }

            checkHotels();
          });
        } else {
          console.log('ℹ️  Table UserPreferences déjà existante');
          checkHotels();
        }
      });
    }

    function checkHotels() {
      // Vérifier si Hotels table existe
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Hotels'", (err, row) => {
        if (err) {
          console.error('Erreur:', err);
          db.close();
          return;
        }

        if (!row) {
          console.log('➕ Création de la table Hotels...');
          db.run(`
            CREATE TABLE Hotels (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              location TEXT,
              country TEXT,
              city TEXT,
              destination_id INTEGER,
              price REAL,
              rating REAL,
              stars INTEGER,
              luxury_score REAL DEFAULT 0,
              comfort_score REAL DEFAULT 0,
              service_score REAL DEFAULT 0,
              location_score REAL DEFAULT 0,
              amenities_score REAL DEFAULT 0,
              image_url TEXT,
              tags TEXT DEFAULT '[]',
              createdAt DATETIME NOT NULL,
              updatedAt DATETIME NOT NULL,
              FOREIGN KEY (destination_id) REFERENCES Destinations(id) ON DELETE SET NULL
            )
          `, (err) => {
            if (err) {
              console.error('Erreur création Hotels:', err);
            } else {
              console.log('✅ Table Hotels créée');
              // Add destination_id column if not exists (for tables created without it)
              db.all("PRAGMA table_info(Hotels)", (err, columns) => {
                if (err) {
                  console.log('\n✅ Migration terminée avec succès!');
                  db.close();
                  return;
                }
                const columnNames = columns.map(col => col.name);
                if (!columnNames.includes('destination_id')) {
                  db.run("ALTER TABLE Hotels ADD COLUMN destination_id INTEGER", (err) => {
                    if (err) {
                      console.error('Erreur ajout destination_id:', err);
                    } else {
                      console.log('✅ Colonne destination_id ajoutée à Hotels');
                    }
                    console.log('\n✅ Migration terminée avec succès!');
                    db.close();
                  });
                } else {
                  console.log('\n✅ Migration terminée avec succès!');
                  db.close();
                }
              });
            }
          });
        } else {
          console.log('ℹ️  Table Hotels déjà existante');
          // Verify destination_id column exists
          db.all("PRAGMA table_info(Hotels)", (err, columns) => {
            if (err) {
              console.log('\n✅ Migration terminée avec succès!');
              db.close();
              return;
            }
            const columnNames = columns.map(col => col.name);
            if (!columnNames.includes('destination_id')) {
              console.log('➕ Ajout de la colonne destination_id à Hotels...');
              db.run("ALTER TABLE Hotels ADD COLUMN destination_id INTEGER", (err) => {
                if (err) {
                  console.error('Erreur ajout destination_id:', err);
                } else {
                  console.log('✅ Colonne destination_id ajoutée à Hotels');
                }
                console.log('\n✅ Migration terminée avec succès!');
                db.close();
              });
            } else {
              console.log('\n✅ Migration terminée avec succès!');
              db.close();
            }
          });
        }
      });
    }
  });
});
