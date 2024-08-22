const mysql = require("mysql2");
const jobs = require("../init/data");


// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     database: "major-project-1",
//     password: "mysql@123",
// });

// Connect to the database
// connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to the database:', err);
//       return;
//     }
//     console.log('Connected to the MySQL database');
  
//     // Insert job data into the table
//     jobs.forEach(job => {
//       const query = 'INSERT INTO listings (id, title, company, location, type, salary, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
//       connection.query(query, [job.id, job.title, job.company, job.location, job.type, job.salary, job.description], (err, results) => {
//         if (err) {
//           console.error('Error inserting data:', err);
//         } else {
//           console.log('Data inserted successfully:', results);
//         }
//       });
//     });
  
//     // Close the connection
//     connection.end();
//   });

  


