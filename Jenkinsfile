pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Vaishnavi-M-Patil/FootwearMart.git' 
            }
        }
        stage('Deploy Using Docker Compose') {
            steps {
                   sh 'docker compose down || true'
                   sh 'docker compose up -d'
                   sh 'sleep 10'  // Wait for startup
                   sh 'docker compose ps'  // Verify running
            }
        }
    }
}
