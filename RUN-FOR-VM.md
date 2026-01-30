# Run JS-CMS on a VM (zero config)

**For the person setting up the VM:** no configuration needed. Use the project as-is.

## One-time setup

1. **Copy the whole project** to the VM (git clone, zip, or rsync).

2. **From the project root (folder that contains `docker-compose.yml`), run either:**

   ```bash
   ./deploy-vm.sh
   ```
   or:
   ```bash
   docker compose up -d
   ```
   (If your system has `docker-compose` instead of `docker compose`, use `docker-compose up -d` or run `./deploy-vm.sh`; it detects both.)

3. **Open the app:** http://localhost:3000 (or http://&lt;VM-IP&gt;:3000 from another machine).

That’s it. The app and PostgreSQL start with built-in defaults. No `.env` file is required.

---

## Optional: customise later

- **Stronger DB password / JWT:** create a `.env` file and set `DB_PASSWORD` and `JWT_SECRET`. Restart with `docker compose up -d`.
- **Google sign-in:** set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env`. See `DOCKER_DEPLOYMENT.md` for OAuth setup.
- **Logs:** `docker compose logs -f`

## If something fails

- Ensure Docker and Docker Compose are installed: `docker --version`, `docker compose version`
- Ensure ports 3000 and 5432 are free
- Check logs: `docker compose logs app`
