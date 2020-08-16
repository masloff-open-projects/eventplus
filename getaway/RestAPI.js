#!/usr/bin/env node

/**
 * The key abstraction of information in REST is a resource.
 * Any information that can be named can be a resource: a document or image, a temporal service, a collection of other resources,
 * a non-virtual object (e.g. a person), and so on. REST uses a resource identifier to identify the
 * particular resource involved in an interaction between components.
 *
 * The state of the resource at any particular timestamp is known as resource representation.
 * A representation consists of data, metadata describing the data and hypermedia links which can help the clients in transition to the next desired state.
 * The data format of a representation is known as a media type. The media type identifies a specification that defines how a representation is to be processed.
 * A truly RESTful API looks like hypertext. Every addressable unit of information carries an address, either explicitly (e.g., link and id attributes) or
 * implicitly (e.g., derived from the media type definition and representation structure).
 *
 * @type {essence}
 */

var prototype = require('../models/essence');

module.exports = class extends prototype {

    constructor() {

        super();

        this.meta = {
            id: 'grbe-101',
            name: "Getaway RestAPI by Event+",
            version: 1
        };

    }

    express (method='GET', url="/", callback) {

        let express = this.go ('router').express;
        let authenticationMiddleware = this.go ('router').authenticationMiddleware;

        if (method.toLowerCase() in express) {
            express[method.toLowerCase()](url, authenticationMiddleware(), callback);
        } else {
            throw `Express have not method '${method.toLowerCase()}'`;
        }
    }

    init () {
        this.call('init', true);
    }

}