pipeline {
    agent any
    tools {nodejs "nodejs18.15.0"}

    stages {
        stage('Build') {
            steps {
                echo 'Move Environment Files to Correct Locations'
                sh 'cp ../../env/.env.production frontend'
                sh 'cp ../../env/.env backend'
                sh 'cd frontend; npm install; npm run build'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'                
            }
        }
    }

}