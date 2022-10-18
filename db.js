//---------------------
// Initilizing mySQL db
//---------------------

const mysql = require('mysql');

// connection configuration
const connection = mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || '',
    // database: process.env.DATABASE || 'Yammie',
    dateStrings: ['DATE', 'DATETIME']
});


// create connection and setting the db
connection.connect(async err => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        throw err;
    }
    await connection.query("CREATE DATABASE IF NOT EXISTS Yammie;",
        async err => {
            await connection.query("use Yammie;", async err => {
                await connection.query(`CREATE TABLE IF NOT EXISTS Orders(
                order_id int auto_increment,
                customer_name varchar(255) not null,
                customer_phone varchar(255) not null,
                customer_address varchar(255) not null,
                order_time datetime default now(),
                dishes JSON not null,
                comments varchar(255),
                PRIMARY KEY (order_id)
            );`, async err => {
                    // filling up innitial values in the db
                    await connection.query(`INSERT INTO Orders
                (customer_name, customer_phone, customer_address,
                    dishes, order_time)
                VALUES ('avi', '050-1234567', 'tel aviv',
                '{ "pasta": 3 }', '2000-01-01 00:00:00');`);
                    if (err) throw err;
                });
            });
        });
});


// making the query to work with promis
const myQuery = (qry) => {
    return new Promise((resolve, reject) => {
        connection.query(qry, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
};

module.exports = { myQuery };

