pipeline{
	agent any;
	stages{
		stage('SCM Checkout'){
			steps{
				git branch: 'main', credentialsId: 'medal-cred', url: 'https://github.com/MedalMan/JohnRepo.git'
			}

		}
		stage('Build Docker Image'){
			steps{
				sh 'docker build -t medalman/mydemorepo:latest .'
			}
		}
		
		stage('Login') {
            
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_USR --password-stin'
            }
        }
		
		stage('Push Docker Image'){
			steps{
			    sh 'docker push medalman/mydemorepo:latest'
			}

		}
	}
}

