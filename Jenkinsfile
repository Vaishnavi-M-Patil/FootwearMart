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
