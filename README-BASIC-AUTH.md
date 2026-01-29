# Protect the app with Basic Auth (Apache)

This repo includes `htaccess.sample` and `htpasswd.sample`. On your server:

1. Create a password file

- Pick a safe absolute path (outside web root if possible), e.g. `/var/www/.htpasswd_ezapp`.
- Option A (recommended): Use `htpasswd`.

```bash
# First user (-c creates the file). Omit -c for additional users.
sudo htpasswd -c /var/www/.htpasswd_ezapp USERNAME
```

\

- Option B: Use OpenSSL to generate an APR1 hash and append manually.

```bash
HASH=$(openssl passwd -apr1)
printf "USERNAME:%s\n" "$HASH" | sudo tee -a /var/www/.htpasswd_ezapp > /dev/null
```

1. Point .htaccess to that path

- Copy `htaccess.sample` to `.htaccess` in the `ezbaths-portal` directory on the server.
- Edit the line `AuthUserFile "/absolute/path/to/.htpasswd_ezapp"` to the real absolute path (e.g. `/var/www/.htpasswd_ezapp`).

1. Ensure Apache allows it

- The vhost or directory block must include `AllowOverride AuthConfig` (or `All`).
- Required modules: `mod_auth_basic`, `mod_authn_file`. `mod_headers` is optional.

1. Test on iPhone

- Visit `https://www.xrkr80hd.studio/ezapp` in Safari; enter the username and password.
- Then Add to Home Screen (Share button > Add to Home Screen).
- Tip: Provide a 180x180 PNG at `assets/app_icons/icon-180.png` and link it with `<link rel="apple-touch-icon" href="assets/app_icons/icon-180.png">` for the best icon.

Troubleshooting

- If you don't get a password prompt, `.htaccess` may be ignored. Check `AllowOverride`.
- To log out a device, change the password or clear website data for your domain on that device.
- Nginx: Use `auth_basic` and `auth_basic_user_file` in your server/location block instead of `.htaccess`.
