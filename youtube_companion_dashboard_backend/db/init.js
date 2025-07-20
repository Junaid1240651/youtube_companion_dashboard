import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConnection } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDatabase = async () => {
  const con = dbConnection();
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        await new Promise((resolve, reject) => {
          con.query(statement, (err, results) => {
            if (err) {
              console.error('Error executing statement:', err);
              reject(err);
            } else {
              console.log('Statement executed successfully');
              resolve(results);
            }
          });
        });
      }
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    con.end();
  }
};

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export default initDatabase; 