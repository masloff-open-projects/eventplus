'use strict';

const barn = new Barn(localStorage);
const notyf = new Notyf();

$(document).ready(function(event=null) {

    const form = new Vue({
        delimiters: ['${', '}'],
        el: '#signupForm',
        data: {
            username: '',
            fullname: '',
            password: '',
            _username: true,
            _fullname: true,
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
            fullname: (e, x) => {

                let input = validate({fullname: e}, {
                    fullname: {
                        format: {
                            pattern: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
                        },
                        presence: true,
                        length: {
                            minimum: 4
                        }
                    }
                });

                if (input) {

                    $(`#hint-fullname`).text(input.fullname.join(', '));
                    $(`#hint-fullname`).show();

                    this._fullname = true;

                } else {

                    $(`#hint-fullname`).hide();
                    $(`#hint-fullname`).text("");

                    this._fullname = false;

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
            $(`#hint-fullname`).hide();
        },
        methods: {
            sumbit: event => {

                if (this._username === false && this._fullname === false && this._password === false) {

                    anime({

                        targets: event.target,
                        opacity: 0,
                        easing: 'easeInOutCirc',
                        complete: animation => {

                            const bodyFormData = new FormData();

                            bodyFormData.append("username", form.username);
                            bodyFormData.append("password", form.password);
                            bodyFormData.append("name", form.fullname);

                            axios({

                                method: 'post',
                                url: `/api/v1/forms/auth/signup`,
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