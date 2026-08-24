# Auth Testing Playbook — Centro Lombardia Unihockey

## Admin
- email: admin@centrolombardia.it
- password: Floorball2026!

## API test
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@centrolombardia.it","password":"Floorball2026!"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
curl -b cookies.txt http://localhost:8001/api/admin/teams
```
Login returns the user object and sets an httpOnly `access_token` cookie (12h).
`/api/auth/me` returns the same user via the cookie. Admin routes 401 without cookie.
