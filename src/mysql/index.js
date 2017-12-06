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
        console.log(' start query ', queryString);
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

    update(tableId, values) {
        const [table, id] = tableId.split(':');

        let queryString = `update \`${table}\` set `;
        for (let i in values) {
            if (values.hasOwnProperty(i)) {
                queryString += `\`${i}\`=${values[i]} ,`
            }
        }


        queryString = queryString.substring(0,queryString.length-1);

        queryString += ` where id=${id}`;

        return this.query(queryString);
    }

    insert(table, data) {
        let keys = [];
        let values = [];
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                keys.push(`\`${i}\``);
                values.push(data[i]);
            }
        }
        let queryString = `insert into \`${table}\` (${keys.join(",")}) values(${values.join(",")})`;
        return this.query(queryString);
    }
};