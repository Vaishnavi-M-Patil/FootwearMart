pipeline {
    agent none

    stages {
        stage('Install Packages using ansible') {
            agent { label 'built-in' }  // Jenkins master/controller
            steps {
                ansiblePlaybook(
                    playbook: 'Install_pkgs_on_host.yml',
                    inventory: 'hosts.ini'
                )
            }
        }
        stage('Clone Repository') {
            agent { label 'FootMart-server' }  // Runs ENTIRE pipeline on footmart node
            steps {
                git branch: 'main', url: 'https://github.com/Vaishnavi-M-Patil/FootwearMart.git' 
            }
        }
        stage('Deploy Using Docker Compose') {
            agent { label 'FootMart-server' }  // Runs ENTIRE pipeline on footmart node
            steps {
                   sh 'docker compose down || true'
                   sh 'docker compose up -d'
                   sh 'sleep 10'  // Wait for startup
                   sh 'docker compose ps'  // Verify running
            }
        }
    }
}
