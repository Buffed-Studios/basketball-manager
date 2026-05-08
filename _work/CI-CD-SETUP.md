# CI/CD Pipeline Setup

This document explains how to set up the `ci.yml` workflow for a new repository. The pipeline builds a Docker image, pushes it to Docker Hub, and deploys it to a Proxmox LXC container via SSH.

---

## Overview

The pipeline has two jobs:

- **build** — Runs on every push and pull request to `main`. Installs dependencies, lints, builds, and pushes the Docker image to Docker Hub.
- **deploy** — Runs only on pushes to `main`, after `build` succeeds. SSHes into the LXC and restarts the container with the new image.

---

## Prerequisites

### 1. Self-Hosted GitHub Actions Runner

The workflow uses `runs-on: self-hosted`. A GitHub Actions runner must be installed and running on a machine that has network access to your Proxmox LXC.

To register a runner: **GitHub repo → Settings → Actions → Runners → New self-hosted runner**

### 2. Docker Hub Account

You need a Docker Hub account and an access token (not your password).

Create a token at: **Docker Hub → Account Settings → Personal Access Tokens**

### 3. Proxmox LXC with Docker

The target LXC must have:
- Docker installed and running
- SSH enabled with `PubkeyAuthentication yes` and `PermitRootLogin prohibit-password` (or `yes`) in `/etc/ssh/sshd_config`

### 4. SSH Key

An SSH key pair must be set up so the runner can authenticate to the LXC.

**Generate the key on the runner machine (as root):**
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f /root/.ssh/deploy_key -N ""
```

**Copy the key to the runner user:**
```bash
cp /root/.ssh/deploy_key /home/runner/.ssh/deploy_key
chown runner:runner /home/runner/.ssh/deploy_key
chmod 600 /home/runner/.ssh/deploy_key
```

**Add the public key to the LXC:**
```bash
# Get the public key from the runner
ssh-keygen -y -f /home/runner/.ssh/deploy_key

# On the LXC, paste the output into authorized_keys
echo "ssh-ed25519 AAAA..." > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

**Test the connection from the runner:**
```bash
su - runner -c "ssh -i /home/runner/.ssh/deploy_key -o StrictHostKeyChecking=no root@<lxc-ip> echo success"
```

---

## GitHub Secrets

Add the following secrets to your repository under **Settings → Secrets and variables → Actions**:

| Secret | Description | Example |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `myusername` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_...` |
| `DEPLOY_HOST` | IP address of the Proxmox LXC | `192.168.1.209` |
| `DEPLOY_USER` | SSH user on the LXC | `root` |
| `DEPLOY_PORT` | SSH port on the LXC | `22` |

---

## Adding the Workflow to a New Repository

1. Copy `.github/workflows/ci.yml` into the new repository.

2. Update the **build steps** to match the project's tech stack:

   **Node.js / React (default):**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: '22'
       cache: 'npm'
   - run: npm ci
   - run: npm run lint
   - run: npm run build
   ```

   **Java / Spring Boot:**
   ```yaml
   - uses: actions/setup-java@v4
     with:
       java-version: '21'
       distribution: 'temurin'
   - run: mvn clean package -DskipTests
   ```

   **No build step needed (e.g., plain Docker image):**
   Remove the setup and build steps entirely. Keep the Docker build/push steps.

3. Update the container port mapping in the deploy step if the app runs on a port other than 80:
   ```yaml
   -p 8080:8080 \
   ```

4. Ensure a `Dockerfile` exists at the root of the repository.

5. Add the required GitHub secrets listed above.

---

## How the Docker Image is Named

The image is automatically named after the GitHub repository using `${{ github.event.repository.name }}`. No hardcoded names are needed.

For example, a repo named `my-api` will produce:
```
myusername/my-api:latest
myusername/my-api:<commit-sha>
```

And the container on the LXC will be named `my-api`.

---

## Deploying Multiple Projects

Each project deploys its own named container on the LXC. As long as each project uses a unique port mapping, multiple containers can run on the same LXC simultaneously.

| Project | Container Name | Port |
|---|---|---|
| basketball-manager | basketball-manager | 80 |
| my-api | my-api | 8080 |
| another-app | another-app | 3000 |

---

## Troubleshooting

**SSH auth fails in CI but works manually:**
- Confirm the runner user (`runner`) can read `/home/runner/.ssh/deploy_key`
- Run: `su - runner -c "ssh -i /home/runner/.ssh/deploy_key root@<lxc-ip> echo success"`

**`Invalid user` error in LXC logs:**
- Check `DEPLOY_USER` secret — it must match an existing user on the LXC (e.g., `root`)

**`Permission denied (publickey)` error:**
- Verify the fingerprint of `/home/runner/.ssh/deploy_key` matches `/root/.ssh/authorized_keys` on the LXC:
  ```bash
  ssh-keygen -l -f /home/runner/.ssh/deploy_key
  ssh-keygen -l -f /root/.ssh/authorized_keys  # on the LXC
  ```

**Docker image not found on LXC:**
- Confirm `DOCKERHUB_USERNAME` secret is correct
- Confirm the image was pushed successfully in the `build` job logs
