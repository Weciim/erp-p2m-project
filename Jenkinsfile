pipeline {
    agent any

    environment {
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        GIT_BRANCH = 'finance-module'
        
        NPM_CMD = 'npm --no-fund --no-audit'
        
        FRONTEND_DIR = 'erp' // adjust if needed
        BACKEND_DIR = 'backend' // adjust if needed
        
        FRONTEND_IMAGE_NAME = "erp-frontend:${env.BUILD_NUMBER}"
        BACKEND_IMAGE_NAME = "erp-backend:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: env.GIT_BRANCH]],
                    userRemoteConfigs: [[
                        credentialsId: 'github-token',
                        url: env.GIT_URL
                    ]]
                ])
                script {
                    env.GIT_COMMIT_HASH = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    dir(env.FRONTEND_DIR) {
                        echo "Installing frontend dependencies..."
                        sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                    }
                    dir(env.BACKEND_DIR) {
                        echo "Installing backend dependencies..."
                        sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                    }
                }
            }
        }

        stage('Build Projects') {
            steps {
                script {
                    dir(env.FRONTEND_DIR) {
                        echo "Building frontend..."
                        sh "${env.NPM_CMD} run build"
                    }
                    dir(env.BACKEND_DIR) {
                        echo "Building backend..."
                        sh "${env.NPM_CMD} run build"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building frontend Docker image..."
                    sh """
                        docker build -t ${env.FRONTEND_IMAGE_NAME} -f ${env.FRONTEND_DIR}/Dockerfile ${env.FRONTEND_DIR}
                        docker tag ${env.FRONTEND_IMAGE_NAME} erp-frontend:latest
                    """

                    echo "Building backend Docker image..."
                    sh """
                        docker build -t ${env.BACKEND_IMAGE_NAME} -f ${env.BACKEND_DIR}/Dockerfile ${env.BACKEND_DIR}
                        docker tag ${env.BACKEND_IMAGE_NAME} erp-backend:latest
                    """
                    
                    sh "docker images | grep erp"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            script {
                def commit = env.GIT_COMMIT_HASH ?: 'unknown'
                def duration = currentBuild.durationString.replace(' and counting', '')

                echo """
                    *${env.JOB_NAME}* #${env.BUILD_NUMBER}
                    Result: ${currentBuild.currentResult}
                    Branch: ${env.GIT_BRANCH}
                    Commit: ${commit}
                    Duration: ${duration}
                    ${env.BUILD_URL}
                """
            }
        }

        success {
            echo "✅ CI pipeline completed successfully!"
        }

        failure {
            echo "❌ CI pipeline failed!"
        }
    }
}
