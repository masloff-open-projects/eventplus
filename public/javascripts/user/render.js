'use strict';

const barn = new Barn(localStorage);
const notyf = new Notyf();
const converter = new showdown.Converter();

$(document).ready(function(event=null) {

    const sessions = new Vue({
        delimiters: ['${', '}'],
        el: '#sessions',
        data: {
            sessions: false
        },
        mounted: event => {

            axios({
                method: 'get',
                url: `/api/v1/account/sessions`
            }).then(response => {
                if (response.status == 200) {
                    sessions.sessions = (response.data.data).reverse().splice(0, 24)
                }
            });

        },
        filters: {
            time: function (e) {
                if (!e) return '';

                return jQuery.timeago((new Date(parseInt(e) * 1000)).toISOString())
            },
            substr: function (e) {
                if (!e) return '';

                return e.substr(0, 16) + '..';
            }
        }
    });

    const thoughts = new Vue({
        delimiters: ['${', '}'],
        el: '#thoughts',
        data: {
            thoughts: false
        },
        mounted: event => {
            axios({
                method: 'get',
                url: `/api/v1/account/thought`
            }).then(response => {
                if (response.status == 200) {
                    thoughts.thoughts = (response.data.data).reverse().splice(0, 64);
                }
            });
        },
        filters: {
            time: function (e) {
                if (!e) return '';

                return jQuery.timeago((new Date(parseInt(e) * 1000)).toISOString())
            },
            markdown: function (e) {
                if (!e) return '';
                return converter.makeHtml(e);
            },
            xss: function (e) {
                if (!e) return '';
                return filterXSS(e);
            }
        },
        methods: {
            markdown: function (e) {
                if (!e) return '';
                return filterXSS(converter.makeHtml(e));
            },
            createPost: (_public=true) => {

                const bodyFormData = new FormData();

                bodyFormData.append("thought", $(`[name='postText']`).val());
                bodyFormData.append("title",  $(`[name='postText']`).val().substr(0, 24));
                bodyFormData.append("public",  _public ? 'public' : 'private');

                axios({

                    method: 'post',
                    url: `/api/v1/account/thought`,
                    data: bodyFormData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }

                }).then(response => {
                    if (response.status == 200) {
                        axios({
                            method: 'get',
                            url: `/api/v1/account/thought`
                        }).then(response => {
                            if (response.status == 200) {
                                thoughts.thoughts = (response.data.data).reverse().splice(0, 64)
                            }
                        });
                    }
                });

            }
        }
    });

});