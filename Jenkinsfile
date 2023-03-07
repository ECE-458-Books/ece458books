pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Move Environment Files to Correct Locations'
                sh 'cp ../../env/.env.production frontend'
                sh 'cp ../../env/.env backend'
                sh 'cd backend'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'                
            }
        }
    }

}