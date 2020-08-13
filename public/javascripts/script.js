function init_addons () {
    $(".check-password").passwordStrength();
}

function init_forms () {

    /**
     * Init validator
     */

    var constraints = {
        username: {
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
            presence: true,
            exclusion: {
                within: ["root", 'toor'],
                message: "'%{value}' is not allowed"
            },
            length: {
                minimum: 4
            }
        },
        name: {
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
            presence: false,
            length: {
                minimum: 2
            }
        },
        password: {
            presence: true,
            length: {
                minimum: 6
            }
        }
    };

    /**
     * Find register form
     */

    if ($('form#signup').length) {

        $("form#signup").submit(function(e) {

            e.preventDefault(); // avoid to execute the actual submit of the form

            if (typeof (validate($.parseParams('?' + $("form#signup").serialize()), constraints)) == typeof {}) {
                for (const [key, value] of Object.entries(Object.freeze(validate($.parseParams('?' + $("form#signup").serialize()), constraints)))) {
                    if ($(`#hint-${key}`).length) {
                        $(`#hint-${key}`).html(value.join("<br>"));

                        setTimeout(function () {
                            $(`#hint-${key}`).text("");
                        }, 4000);
                    }
                }
            } else {

                axios({
                    method: 'post',
                    url: `/api/v1/forms/auth/signup?${$("form#signup").serialize()}`
                })
                    .then(function (response) {
                        notyf.success('You have successfully registered in the system');

                        setTimeout(function () {
                            window.location.href = '/';
                        }, 2000);

                    })
                    .catch(function (error) {
                        notyf.error('The registration didn\'t work. A user like this already exists.');
                    });
            }

        });
    }


    /**
     * Find login form
     */

    if ($('form#login').length) {

        $("form#login").submit(function(e) {

            e.preventDefault(); // avoid to execute the actual submit of the form

            if (typeof (validate($.parseParams('?' + $("form#login").serialize()), constraints)) == typeof {}) {
                for (const [key, value] of Object.entries(Object.freeze(validate($.parseParams('?' + $("form#login").serialize()), constraints)))) {
                    if ($(`#hint-${key}`).length) {
                        $(`#hint-${key}`).html(value.join("<br>"));

                        setTimeout(function () {
                            $(`#hint-${key}`).text("");
                        }, 4000);
                    }
                }

            } else {


                const config = {
                    method: 'post',
                    url: `/api/v1/forms/auth/login?${$("form#login").serialize()}`
                };

                axios(config)
                    .then(function (response) {
                        window.location.href = '/';
                    })
                    .catch(function (error) {
                        notyf.error('No user found. Check your username or password');
                    });

            }

        });
    }

}

$(document).ready(function () {

    init_addons ();
    init_forms ();

});


