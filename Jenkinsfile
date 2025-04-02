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
                sh "EAS_SECRET_TOKEN=EhHxE27ddIAWc04Y6IARTPipytjK6M8AUfUARkU9 eas build --platform android --non-interactive"
              }
          }
        stage('Hello') {
            steps {
                echo "hello from Jenkinsfile"
              }
          }
      }
  }
