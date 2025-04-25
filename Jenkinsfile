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
        stage('Checkout & Verify') {
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
                    
                    // Debug: Show full directory structure
                    sh 'ls -R'
                    
                    // Verify files exist at correct paths
                    if (!fileExists('erp/package.json')) {
                        error("ERROR: Frontend package.json not found at ${WORKSPACE}/erp/package.json")
                    }
                    
                    if (!fileExists('backend/package.json')) {
                        error("ERROR: Backend package.json not found at ${WORKSPACE}/backend/package.json")
                    }
                    
                    // Verify Docker can access the files
                    sh """
                        docker run --rm -v ${WORKSPACE}/erp:/test -w /test ${NODE_IMAGE} ls -la /test/package.json || \
                        (echo "Docker cannot access frontend package.json"; exit 1)
                    """
                    
                    sh """
                        docker run --rm -v ${WORKSPACE}/backend:/test -w /test ${NODE_IMAGE} ls -la /test/package.json || \
                        (echo "Docker cannot access backend package.json"; exit 1)
                    """
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        sh """
                            echo "Installing frontend dependencies in ${WORKSPACE}/erp"
                            docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                            sh -c '${NPM_CMD} install && ${NPM_CMD} ls'
                        """
                    }
                }

                stage('Backend Dependencies') {
                    steps {
                        sh """
                            echo "Installing backend dependencies in ${WORKSPACE}/backend"
                            docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                            sh -c '${NPM_CMD} install && ${NPM_CMD} ls'
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
                                    docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                                    sh -c '${NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit'
                                """
                                junit 'erp/junit.xml'
                            } catch (Exception e) {
                                echo "Frontend tests failed: ${e.message}"
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
                                    docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                                    sh -c '${NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit'
                                """
                                junit 'backend/junit.xml'
                            } catch (Exception e) {
                                echo "Backend tests failed: ${e.message}"
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
                                    docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                                    sh -c '${NPM_CMD} run build'
                                """
                                archiveArtifacts artifacts: 'erp/build/**/*'
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
                                    docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                                    sh -c '${NPM_CMD} run build'
                                """
                                archiveArtifacts artifacts: 'backend/dist/**/*'
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
                        // Verify Dockerfiles exist
                        if (!fileExists('erp/Dockerfile.prod')) {
                            error("Frontend Dockerfile.prod not found")
                        }
                        if (!fileExists('backend/Dockerfile.prod')) {
                            error("Backend Dockerfile.prod not found")
                        }

                        // Build frontend image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.FRONTEND_IMAGE_NAME} \
                                -f erp/Dockerfile.prod \
                                erp/
                        """

                        // Build backend image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.BACKEND_IMAGE_NAME} \
                                -f backend/Dockerfile.prod \
                                backend/
                        """

                        // Tag as latest
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
                
                echo """
                    ===== BUILD SUMMARY =====
                    Result: ${currentBuild.currentResult}
                    Branch: ${env.GIT_BRANCH}
                    Commit: ${commit}
                    Duration: ${duration}
                    Build URL: ${env.BUILD_URL}
                    =========================
                """
                
                // Clean up workspace
                cleanWs()
            }
        }
    }
}