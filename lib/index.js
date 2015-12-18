var path = require('path');
var Joi  = require('joi');
var Hoek = require('hoek');
var Wreck = require('wreck');
var Boom = require('boom');
var Stream = require('stream');

var internals = {
    defaults: {
        host    :'https://www.google.com',
        script  :'/recaptcha/api.js',
        verify  :'/recaptcha/api/siteverify',
        element : 'g-recaptcha-response',
        data    : {
            theme     : 'light',
            type      : 'image',
            size      : 'normal',
            tabindex  : 0
        }
    }
};

exports.register = function (server, options, next) {
    var settings = Hoek.applyToDefaults(internals.defaults, options);

    server.ext('onPostAuth', function (request, reply) {
        if (request.method !== 'post') {
            return reply.continue();
        }

        var content = request.payload;
        if (!content || content instanceof Stream) {
            server.log(['plugin', 'hapi-recapcha'], { message: 'reCaptcha response 403: No content.' });
            return reply(Boom.forbidden());
        }

        if (content && typeof(content[settings.element]) !== 'undefined') {
            verify(settings, content[settings.element], function(err, status) {
                if (err || !status.success) {
                    server.log(['plugin', 'hapi-recapcha'], { message: 'reCaptcha response 403: recaptcha .', err:  err, status: status });
                    return reply(Boom.forbidden());
                } else {
                    server.log(['plugin', 'hapi-recapcha'], { message: 'reCaptcha response 200.' });
                    return reply.continue();
                }
            });
        } else {
            server.log(['plugin', 'hapi-recapcha'], { message: 'reCaptcha response 200.' });
            return reply.continue();
        }
    });

    server.ext('onPreResponse', function (request, reply) {
        var response = request.response;

        if (!response.isBoom && response.variety === 'view') {
            var options = '';
            for (var key in settings.data) {
                if (settings.data.hasOwnProperty(key)) {
                    options += 'data-' + key + '="' + settings.data[key] + '" ';
                }
            }

            response.source.context = response.source.context || {};
            response.source.context['captcha_script'] = '<script src="' + settings.host + settings.script + '"></script>';
            response.source.context['captcha_form'] = '<div class="g-recaptcha" data-sitekey="' + settings.sitekey + '" ' + options + '></div>';
        }

        return reply.continue();
    });

    return next();
};

exports.register.attributes = {
    pkg: require('../package')
};

function verify(settings, value, callback) {
    var url = settings.host + settings.verify + '?secret=' + settings.secret + '&response=' + value;

    Wreck.request('post', url, {}, function (err, response) {
        if (err) {
            return callback(err);
        }

        Wreck.read(response, { json: true }, callback);
    });
}
