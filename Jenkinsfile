pipeline {
    agent any
    tools {nodejs "nodejs18.15.0"}

    stages {
        stage('Build') {
            steps {
                echo 'Move Environment Files to Correct Locations'
                sh 'cp ../../env/.env.production frontend'
                sh 'cp ../../env/.env backend'

                echo 'Build Frontend'
                sh 'cd frontend; npm install; npm run build'
                sh 'tar -czvf frontend-production-build.tar.gz ./frontend/build'
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['books-test']){
                    sh 'ssh -o StrictHostKeyChecking=no root@$books-test.colab.duke.edu uptime'
                    sh 'netstat -tulpn'
                }
            }
        }
    }

}