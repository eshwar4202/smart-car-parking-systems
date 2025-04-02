pipeline {
    agent {label "linux"}
    environment {
        EAS_ACCESS_TOKEN = credentials('EAS_ACCESS_TOKEN')  // Use the saved token
    }
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
