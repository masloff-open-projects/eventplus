#!/usr/bin/env node

var prototype = require('../models/builder');

module.exports = class extends prototype {

    constructor(props) {

        super(props);

        this.use('_sqlGetSessions', require('fs').readFileSync(__dirname + '/../sql/getSessions.sql', 'utf8'));

        this.engine( (essences, data) => {

            if ('mysql' in essences) {

                const connection = essences.mysql;

                const sqlGetSessions = essences._sqlGetSessions.replaceObject({
                    id: data.id
                });

                return new Promise((resolve, reject) => {
                    connection.query(sqlGetSessions, (error, results, fields) => {

                        if (error) {

                            reject({
                                message: "SQL error",
                                error: true,
                                status: 'error',
                                sql: error
                            });

                        } else {

                            resolve({
                                message: "",
                                error: false,
                                status: 'ok',
                                data: results
                            });

                        }

                    });
                });


            } else {
                throw 'Need MySQL connection';
            }

        });

    }

}