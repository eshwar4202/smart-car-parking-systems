pipeline {
    agent {label "linux"}
    stages {
        stage('Dependecies') {
            steps {
                echo "npm install"
                sh "npm install"
              }
          }
        stage('Build') {
            steps {
                echo "eas build -p android --profile preview"
                sh "eas build -p android --profile preview"
              }
          }
        stage('Hello') {
            steps {
                echo "hello from Jenkinsfile"
              }
          }
      }
  }
