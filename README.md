# Deploying FootwearMart React App with Docker
## Prerequisites
- Ubuntu server with Docker installed
- DockerHub account (vaishnavimpatil)
- Domain name with Route 53 access

### Install Docker and Docker Compose.
```
sudo apt install docker.io -y
sudo apt install docker-compose-v2 -y
sudo usermod -aG docker $USER && newgrp docker
```

### Build Docker image of your project
```
docker build -t react-app .
```
```
docker images
```

### Create container of that image.
```
docker run -d -p 8080:80 --name react-app-cont react-app:latest
```
```
docker ps
```

### Change name of the image and push image on Dockerhub.
```
docker tag react-app:latest vaishnavimpatil/footwearmart-react-app:latest
```
```
docker push vaishnavimpatil/footwearmart-react-app:latest 
```

### Run docker compose file
```
docker compose up -d
```


### Use custom domain for application 
1. Create one hosted zone for your domain and edit nameserver names in your domain provider's dns configuration. (It will take some time to change nameservers)
2. Now map your server IP with domain by using route 53 records.
![hosted zone records](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/Screenshot%202025-12-04%20003106.png)

### Install nginx to forward traffic to your react app
```
sudo apt update
```
```
sudo apt install nginx -y
```
### Create site file
```
sudo vim /etc/nginx/sites-available/free-domain.shop
```
```bash
server {

server_name www.free-domain.shop free-domain.shop;

location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
}
}
```
### Create soft link of the site file.
```
 sudo ln -s /etc/nginx/sites-available/free-domain.shop /etc/nginx/sites-enabled/
```
### Test nginx and reload nginx deamon
```
 sudo nginx -t
```
```
sudo systemctl reload nginx
```

### Install certbot and create ssl certificate for the domain.
```
sudo apt install certbot python3-certbot-nginx -y
```
- **`Note`**: SSL certificate issuance will fail if your domain is not properly mapped to the server. So please ensure your application is accessible by your domain.
```
sudo certbot --nginx -d free-domain.shop -d www.free-domain.shop --email vaishnavipatil6002@gmail.com
```
![App](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/app.png)


## Monitoring Setup
---
### Prometheus
#### Add prom-client
**What is Prom-client?**  
- Prom-client is the Prometheus client library for Node.js or react app.  
- React servers don't expose `/metrics` by default So Prom-client instruments your app to expose `metrics` in Prometheus format.
- Creates `HTTP endpoint` (/metrics) that Prometheus scrapes.

##### Setup of Prom-client 
1. Install prom-client
```
npm install prom-client
```
2. Add to your React app (server.js)
```
const promClient = require('prom-client');

// Default metrics (always available)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom counter
const requests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(requests);

// Create /metrics route and throw all metrics on it
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await register.metrics());
});
```
3. Create Prometheus Configuration file.
4. Add prometheus service in docker compose.

![targets](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/image.png)

### Grafana
- Grafana: `http://localhost:3001` (user:`admin`/ password: `admin`)
- Connections → Add data source → Prometheus
- URL: `http://prometheus:9090`
- Save & test
- Import nodejs deshboard -> Search on google "Grafana nodejs dashboard" -> copy dashboard ID -> import dashboard -> paste id(11159) and load dashboard -> click load -> add visualization in current nodejs dashboard -> select etrics "http_requests_total" -> select label "route" -> values "/metrics" -> RUN queries -> change title of panel and save the dashboard


![Dashboard](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/metrics1.png)
![Dashboard](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/metrics2.png)
![Dashboard](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/metrics3.png)

---

## Jenkins CI/CD Pipeline for React application 
- Configure Jenkins server.
- Install Plugins on Jenkins: Git, Pipeline, Pipeline:Groovy libraries, Docker Pipeline, Ansible, SSH build agents
- add node in jenkins UI settings -> nodes -> name(Footmart) -> Remote root directory (/home/ubuntu) -> Labels (FootMart-server) -> Launch method (ssh) -> host (Ip_address-of footmart server) -> Credentials (ubuntu) -> Host Key Verification Strategy (non verifying) -> save
- Create a New Pipeline Job in Jenkins UI.
- on Jenkins server add private key in `/var/lib/jenkins/.ssh/` and change user, group owner and permissions of the key.
```
sudo cp /home/ubuntu/id_rsa /var/lib/jenkins/.ssh/id_rsa
sudo chown jenkins:jenkins /var/lib/jenkins/.ssh/id_rsa
sudo chmod 600 /var/lib/jenkins/.ssh/id_rsa
```
- Use this Pipeline Script example:
```
pipeline {
    agent none

    stages {
        stage('Install Packages using ansible') {
            agent { label 'built-in' }
            steps {
                ansiblePlaybook(
                    playbook: 'Install_pkgs_on_host.yml',
                    inventory: 'hosts.ini'
                )
            }
        }
        
        stage('Clone Repository') {
            agent { label 'FootMart-server' }
            steps {
                git branch: 'main', url: 'https://github.com/Vaishnavi-M-Patil/FootwearMart.git'
            }
        }
        
        stage('Deploy Using Docker Compose') {
            agent { label 'FootMart-server' }
            steps {
                sh '''
                    docker-compose down || true
                    docker-compose up -d
                    sleep 10
                    docker-compose ps
                    echo "✅ FootwearMart deployed! Check http://54.242.228.167:8080"
                '''
            }
        }
    }
}
```

- Save the pipeline and click Build.
