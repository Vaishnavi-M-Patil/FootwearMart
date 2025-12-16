# Deployment of FootwearMart React app on ubuntu instance
### To run application directly on server
```
sudo apt install nodejs npm -y
```
```
sudo npm install pm2@latest -g
```
```
sudo -u ubuntu pm2 save
```
```
sudo -u ubuntu pm2 startup
```
```
pm2 start npm --name FootwearMart -- start
```

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
        proxy_pass http://localhost:8080;
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

## Grafana Setup
- Grafana: `http://localhost:3001` (user:`admin`/ password: `admin`)
- Connections → Add data source → Prometheus
- URL: `http://prometheus:9090`
- Save & test
- Create dashboard → Query: rate(http_requests_total[5m])
