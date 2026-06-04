# Guía de Deployment — Frontend (vertiche-dashboard)

El frontend es una SPA de React + Vite que se containeriza con Docker y se sirve con Nginx en una instancia EC2. El CI/CD corre en GitHub Actions: cada push a `main` que toque `vertiche-dashboard/` construye la imagen, la sube a Docker Hub y la despliega automáticamente al servidor.

---

## Requisitos previos

- Cuenta de AWS
- Cuenta de GitHub con acceso al repo
- Cuenta de Docker Hub (gratis en hub.docker.com)
- Cuenta de Cloudflare (opcional, para dominio propio con HTTPS gratis)

---

## 1. Crear la instancia EC2

1. Entra a [console.aws.amazon.com](https://console.aws.amazon.com) → **EC2** → **Launch Instance**
2. **Nombre:** `vertiche-frontend`
3. **AMI:** Ubuntu Server 24.04 LTS (HVM), SSD Volume Type — debe decir *Free tier eligible*
4. **Instance type:** `t2.micro`
5. **Key pair:** Create new key pair
   - Nombre: `vertiche-key`
   - Type: RSA / Format: `.pem`
   - Descarga el archivo y guárdalo — no se puede volver a descargar
6. **Network settings → Edit** — crea un Security Group llamado `vertiche-sg` con estas reglas:

   | Type | Protocol | Port | Source |
   |------|----------|------|--------|
   | SSH  | TCP | 22 | 0.0.0.0/0 |
   | HTTP | TCP | 80 | 0.0.0.0/0 |

7. Storage: dejar el default (8 GB)
8. **Launch Instance**

---

## 2. Asignar Elastic IP

Sin esto la IP cambia cada vez que reinicias el servidor.

1. EC2 → menú izquierdo → **Elastic IPs** → **Allocate Elastic IP address** → Allocate
2. Selecciona la IP creada → **Actions** → **Associate Elastic IP address**
3. Selecciona la instancia `vertiche-frontend` → Associate
4. Anota esa IP — la usarás en los pasos siguientes

---

## 3. Instalar Docker en el servidor

Conéctate por SSH y ejecuta:

```bash
# Desde tu máquina
chmod 400 ~/Downloads/vertiche-key.pem
ssh -i ~/Downloads/vertiche-key.pem ubuntu@<elastic-ip>

# Dentro del servidor
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# Cierra sesión y vuelve a conectarte para que aplique el grupo
exit
ssh -i ~/Downloads/vertiche-key.pem ubuntu@<elastic-ip>

# Verifica que Docker funciona
docker run hello-world
```

---

## 4. Crear token de Docker Hub

1. Entra a hub.docker.com → avatar → **Account Settings**
2. **Personal access tokens** → **Generate new token**
   - Description: `github-actions-vertiche`
   - Permissions: Read & Write
3. Copia el token — no lo puedes volver a ver

---

## 5. Configurar GitHub Secrets

En el repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Agrega estos secrets uno por uno:

| Secret | Valor |
|--------|-------|
| `EC2_HOST` | Elastic IP del paso 2 |
| `EC2_SSH_KEY` | Contenido completo del archivo `.pem` (incluyendo las líneas `-----BEGIN/END RSA PRIVATE KEY-----`). Para copiarlo fácil: `cat ~/Downloads/vertiche-key.pem \| pbcopy` |
| `DOCKER_HUB_USER` | Tu usuario de Docker Hub |
| `DOCKER_HUB_TOKEN` | Token del paso 4 |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `VITE_AUTH_API_URL` | `http://<ip-backend>:3003` |
| `VITE_MONITOREO_API_URL` | `http://<ip-backend>:3002` |
| `VITE_RFID_API_URL` | `http://<ip-backend>:3001` |
| `VITE_VENTAS_API_URL` | `http://<ip-backend>:8080` |
| `VITE_CHATBOT_API_URL` | `http://<ip-backend>:8090` |
| `VITE_API_KEY` | API key del servicio RFID |

> Las URLs de los backends deben apuntar al servidor donde corran esos servicios, no a localhost.

---

## 6. Primer deploy

Haz cualquier push a `main` que toque archivos dentro de `vertiche-dashboard/`. Si no tienes cambios pendientes:

```bash
git commit --allow-empty -m "chore: trigger frontend deploy"
git push
```

Luego ve a la pestaña **Actions** del repo en GitHub y verás el workflow `Deploy Frontend` corriendo. Tarda ~2-3 minutos.

Cuando termine, abre `http://<elastic-ip>` en el navegador — el dashboard debe cargar.

---

## 7. Conectar dominio propio con Cloudflare (opcional)

Con Cloudflare obtienes dominio propio + HTTPS gratis sin tocar el servidor.

1. Crea cuenta en [cloudflare.com](https://cloudflare.com) y agrega tu dominio
2. Cloudflare te da dos nameservers — ponlos en tu registrador (Namecheap, GoDaddy, etc.)
3. En el DNS de Cloudflare crea un registro:
   - **Tipo:** A
   - **Nombre:** `dashboard` (o `@` para el dominio raíz)
   - **IPv4:** tu Elastic IP
   - **Proxy:** ON (nube naranja)
4. SSL/TLS → modo **Flexible**
5. Espera 2-5 minutos → entra a `https://dashboard.tudominio.com`

---

## Deployments posteriores

Cualquier push a `main` con cambios en `vertiche-dashboard/` dispara el pipeline automáticamente. No hace falta hacer nada manual.

El flujo es:
1. GitHub Actions construye la imagen Docker con las variables de entorno de los secrets
2. Sube la imagen a Docker Hub
3. SSH al EC2 → descarga la nueva imagen → reinicia el contenedor

---

## Variables de entorno

Todas las variables `VITE_*` se inyectan en el bundle JavaScript en tiempo de build, no en runtime. Si necesitas cambiar una URL de backend:

1. Actualiza el secret en GitHub
2. Haz un push a `main` para rearmar la imagen con el nuevo valor

El archivo `vertiche-dashboard/.env.example` documenta todas las variables requeridas.
