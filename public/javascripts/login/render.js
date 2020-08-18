'use strict';

const barn = new Barn(localStorage);
const notyf = new Notyf();

$(document).ready(function(event=null) {

    const form = new Vue({
        delimiters: ['${', '}'],
        el: '#loginForm',
        data: {
            username: '',
            password: '',
            _username: true,
            _password: true
        },
        watch: {
            username: (e, x) => {

                let input = validate({username: e}, {
                    username: {
                        format: {
                            pattern: /^(?!.*__.*)(?!.*\.\..*)[a-z0-9_.]+$/,
                        },
                        presence: true,
                        exclusion: {
                            within: ["root", 'toor'],
                            message: "'%{value}' is not allowed"
                        },
                        length: {
                            minimum: 4
                        }
                    }
                });

                if (input) {

                    $(`#hint-username`).text(input.username.join(', '));
                    $(`#hint-username`).show();

                    this._username = true;

                } else {

                    $(`#hint-username`).hide();
                    $(`#hint-username`).text("");

                    this._username = false;

                }

            },
            password: (e, x) => {

                let input = validate({password: e}, {
                    password: {
                        format: {
                            pattern: /^(?=.*[a-z]){3,}(?=.*[A-Z]){2,}(?=.*[0-9]){2,}(?=.*[!@#$%^&*()--__+.]){1,}.{8,}$/,
                        },
                        presence: true,
                        length: {
                            minimum: 8
                        }
                    }
                });

                if (input) {

                    $(`#hint-password`).text(input.password.join(', '));
                    $(`#hint-password`).show();

                    this._password = true;

                } else {

                    $(`#hint-password`).hide();
                    $(`#hint-password`).text("");

                    this._password = false;

                }

            }
        },
        mounted: event => {
            $(`#hint-password`).hide();
            $(`#hint-username`).hide();
        },
        methods: {
            sumbit: event => {

                if (this._username === false && this._password === false) {

                    anime({

                        targets: event.target,
                        opacity: 0,
                        easing: 'easeInOutCirc',
                        complete: animation => {

                            const bodyFormData = new FormData();

                            bodyFormData.append("username", form.username);
                            bodyFormData.append("password", form.password);

                            axios({

                                method: 'post',
                                url: `/api/v1/forms/auth/login`,
                                data: bodyFormData,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }

                            }).then(response => {

                                if (response.data.error === true) {

                                    notyf.error(response.data.message)

                                    anime({
                                        targets: event.target,
                                        opacity: 1
                                    });

                                } else {

                                    anime({
                                        targets: event.target,
                                        height: 0,
                                        easing: 'easeInOutCirc',
                                        complete: animation => {

                                            anime({
                                                targets: '[data-type="logo"]',
                                                scale: 1.6,
                                                easing: 'easeInOutCirc',
                                                complete: animation => {
                                                    window.location.href = '/';
                                                }
                                            });
                                        }
                                    });

                                }

                            }).catch(error => {

                                anime({
                                    targets: event.target,
                                    opacity: 1
                                });

                            });

                        }
                    });

                }

                event.preventDefault();
            }
        }
    });

});