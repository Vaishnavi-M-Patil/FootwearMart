# Deployment of FootwearMart React app on ubuntu instance
## Install Docker and Docker Compose.
```
sudo apt install docker.io -y
sudo apt install docker-compose-v2 -y
sudo usermod -aG docker $USER && newgrp docker
```
## Build Dockerfile
```
docker build -t react-app .
```
```
docker images
```
docker run -d -p 8080:80 --name react-app-cont react-app:latest

docker ps

docker tag react-app:latest vaishnavimpatil/footwearmart-react-app:latest

docker push vaishnavimpatil/footwearmart-react-app:latest 

1. Create one hosted zone for your domain and edit nameserver names in your domain provider's dns configuration. (It will take some time to change nameservers)
2. Now map your server with domain by using route 53 records.
![hosted zone records](https://github.com/Vaishnavi-M-Patil/FootwearMart/blob/main/assets/Screenshot%202025-12-04%20003106.png)
sudo apt update

sudo apt install nginx -y
 
sudo vim /etc/nginx/sites-available/free-domain.shop
server {

server_name www.free-domain.shop free-domain.shop;

location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
}
}

 sudo ln -s /etc/nginx/sites-available/free-domain.shop /etc/nginx/sites-enabled/

 sudo nginx -t
sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d free-domain.shop -d www.free-domain.shop --email vaishnavipatil6002@gmail.com
