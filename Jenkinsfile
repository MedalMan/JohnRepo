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
				sh 'docker medalman/mydemorepo:latest .'
			}
		}
		stage('Push Docker Image'){
			steps{
			    sh 'docker push medalman/mydemorepo:latest'
			}

		}
	}
}

