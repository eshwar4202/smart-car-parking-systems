pipeline {
    agent {label "linux"}
    stages {
        stage('Dependecies') {
            steps {
                echo "npm install"
                sh "npm install"
              }
          }
        stage('Hello') {
            steps {
                echo "hello from Jenkinsfile"
              }
          }
      }
  }
