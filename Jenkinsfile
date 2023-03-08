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
                sh 'tar -czvf backend-production-build.tar.gz ./backend docker-compose.yml Makefile'
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['books-test']){
                    sh 'ssh -o StrictHostKeyChecking=no root@books-test.colab.duke.edu uptime'
                    sh 'ssh -v root@books-test.colab.duke.edu "rm -rf /var/lib/hypothetical_books; mkdir -p /var/lib/hypothetical_books; rm -rf /var/www/html/*"'
                    sh 'scp frontend-production-build.tar.gz root@books-test.colab.duke.edu:/var/lib/hypothetical_books'
                    sh 'scp backend-production-build.tar.gz root@books-test.colab.duke.edu:/var/lib/hypothetical_books'
                    sh 'scp deploy.sh root@books-test.colab.duke.edu:/var/lib/hypothetical_books'
                    sh 'ssh root@books-test.colab.duke.edu "chmod a+x /var/lib/hypothetical_books/deploy.sh; /usr/bin/bash /var/lib/hypothetical_books/deploy.sh"'
                }
            }
        }
    }

}