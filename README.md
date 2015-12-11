# hapi_recaptcha
Google's reCaptcha for hapi

## Usage

First load and register the plugin:

```javascript
server.register(
  [
    {
      register    : require('hapi-recaptcha'),
      options     : {}
    }
  ]
)
```

In the view
```html
<!DOCTYPE html>
<html>
<head>
  <title>reCaptcha</title>

  {{{ captcha_script }}}
</head>
<body>
  <form>
    {{{ captcha_form }}}
  </form>
</body>
</html>
```


## Plugin Options

The following options are available when registering the plugin

- host - Google's recaptcha host. Default: https://www.google.com
- script - Default: '/recaptcha/api.js'
- verify - Default: '/recaptcha/api/siteverify'
- element - Default: 'g-recaptcha-response'
- data
- - theme - Default: 'light'
- - type - Default: 'image'
- - size - Default: 'normal'
- - tabindex - Default: 0