pipeline {
    agent any

    environment {
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        GIT_BRANCH = 'finance-module'

        NPM_CMD = 'npm --no-fund --no-audit'
        NODE_IMAGE = 'node:20.10-alpine'

        FRONTEND_IMAGE_NAME = "erp-frontend:${env.BUILD_NUMBER}"
        BACKEND_IMAGE_NAME = "erp-backend:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
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
                sh 'ls -la'
            }
        }

        stage('Verify Structure') {
            steps {
                script {
                    // Verify frontend files exist
                    if (!fileExists('erp/package.json')) {
                        error("Frontend package.json not found at erp/package.json")
                    }
                    
                    // Verify backend files exist
                    if (!fileExists('backend/package.json')) {
                        error("Backend package.json not found at backend/package.json")
                    }
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        sh """
                            docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} sh -c '
                            ${NPM_CMD} ci || ${NPM_CMD} install
                            '
                        """
                    }
                }

                stage('Backend Dependencies') {
                    steps {
                        sh """
                            docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} sh -c '
                            ${NPM_CMD} ci || ${NPM_CMD} install
                            '
                        """
                    }
                }
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        script {
                            try {
                                sh """
                                    docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} sh -c '
                                    if grep -q "lint" package.json; then
                                        ${NPM_CMD} run lint || echo "Linting had issues but continuing"
                                    else
                                        echo "No lint script found"
                                    fi
                                    ${NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit || echo "Tests failed but continuing"
                                    if [ -f .auditci.json ]; then
                                        npx audit-ci --config .auditci.json || echo "Audit warnings found"
                                    fi
                                    '
                                """
                                junit allowEmptyResults: true, testResults: 'erp/junit.xml'
                            } catch (Exception e) {
                                echo "Frontend test stage had issues: ${e.message}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        script {
                            try {
                                sh """
                                    docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} sh -c '
                                    if grep -q "lint" package.json; then
                                        ${NPM_CMD} run lint || echo "Linting had issues but continuing"
                                    else
                                        echo "No lint script found"
                                    fi
                                    ${NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit || echo "Tests failed but continuing"
                                    '
                                """
                                junit allowEmptyResults: true, testResults: 'backend/junit.xml'
                            } catch (Exception e) {
                                echo "Backend test stage had issues: ${e.message}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            try {
                                sh """
                                    docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} sh -c '
                                    ${NPM_CMD} run build
                                    '
                                """
                                archiveArtifacts artifacts: 'erp/build/**/*', allowEmptyArchive: true
                            } catch (Exception e) {
                                error("Frontend build failed: ${e.message}")
                            }
                        }
                    }
                }

                stage('Build Backend') {
                    steps {
                        script {
                            try {
                                sh """
                                    docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} sh -c '
                                    ${NPM_CMD} run build
                                    '
                                """
                                archiveArtifacts artifacts: 'backend/dist/**/*,backend/build/**/*', allowEmptyArchive: true
                            } catch (Exception e) {
                                error("Backend build failed: ${e.message}")
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    try {
                        sh "docker --version || (echo 'Docker not found' && exit 1)"
                        
                        dir('erp') {
                            if (!fileExists('Dockerfile.prod')) {
                                error("Frontend Dockerfile.prod not found")
                            }
                        }
                        
                        dir('backend') {
                            if (!fileExists('Dockerfile.prod')) {
                                error("Backend Dockerfile.prod not found")
                            }
                        }

                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.FRONTEND_IMAGE_NAME} \
                                -f erp/Dockerfile.prod \
                                erp/
                        """

                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.BACKEND_IMAGE_NAME} \
                                -f backend/Dockerfile.prod \
                                backend/
                        """

                        sh """
                            docker tag ${env.FRONTEND_IMAGE_NAME} erp-frontend:latest
                            docker tag ${env.BACKEND_IMAGE_NAME} erp-backend:latest
                        """
                    } catch (Exception e) {
                        error("Docker build failed: ${e.message}")
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def commit = env.GIT_COMMIT_HASH ?: 'unknown'
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                // Basic console notification since Slack isn't configured
                echo """
                    Build Result: ${currentBuild.currentResult}
                    Branch: ${env.GIT_BRANCH}
                    Commit: ${commit}
                    Duration: ${duration}
                    Build URL: ${env.BUILD_URL}
                """
            }
            cleanWs()
        }

        success {
            echo "CI pipeline completed successfully!"
        }

        failure {
            echo "CI pipeline failed!"
        }

        unstable {
            echo "CI pipeline is unstable! Check test results."
        }
    }
}