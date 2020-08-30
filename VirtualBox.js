"use strict";

import vm from 'vm';
import fs from 'mz/fs';
import path from "path";

// Read file with source code
fs.readFile(
    './firmware.jss',
    'utf8'
).then(contents => {

    // Create virtual box
    new Promise((Resolve, Reject) => {

        var context = {};
        var environment = vm;

        environment.createContext(context);
        environment.runInContext(contents, context);

        console.log(context)

    }).then(Event => {

    }).catch(Event => {
        console.log(Event)
    });

}).catch(Event => {
    console.error(Event)
});
