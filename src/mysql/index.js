const mysql = require("mysql");
const mysqlConfig = require("../config/mysql");
module.exports = class Mysql {

    connection() {
        return new Promise((resolve, reject) => {
            if (Mysql._connect === undefined) {
                const connection = mysql.createConnection(mysqlConfig);
                connection.connect((err) => {
                    if (err) {
                        reject(err.stack)
                    }
                    resolve(connection);
                });
                Mysql._connect = connection;
            } else {
                return resolve(Mysql._connect)
            }
        });
    }

    query(queryString) {
        return new Promise((resolve, reject) => {
            this.connection().then(c => {
                c.query(queryString, (error, results, fields) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(results);
                });
            })
        })
    }
};