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
                    env.GIT_COMMIT_HASH = sh(
                        script: 'git rev-parse --short HEAD', 
                        returnStdout: true
                    ).trim()
                    
                    // Verify files exist at correct paths
                    def frontendExists = fileExists('erp/package.json')
                    def backendExists = fileExists('backend/package.json')
                    
                    if (!frontendExists || !backendExists) {
                        error("""
                            Missing package.json files!
                            Frontend exists: ${frontendExists} at ${WORKSPACE}/erp/package.json
                            Backend exists: ${backendExists} at ${WORKSPACE}/backend/package.json
                        """)
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Run installations sequentially for better error visibility
                    try {
                        dir('erp') {
                            sh """
                                docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                                sh -c '${NPM_CMD} install'
                            """
                        }
                    } catch (Exception e) {
                        error("Frontend dependency installation failed: ${e.message}")
                    }
                    
                    try {
                        dir('backend') {
                            sh """
                                docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                                sh -c '${NPM_CMD} install'
                            """
                        }
                    } catch (Exception e) {
                        error("Backend dependency installation failed: ${e.message}")
                    }
                }
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('erp') {
                            script {
                                try {
                                    sh """
                                        docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                                        sh -c '${NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit'
                                    """
                                    junit 'junit.xml'
                                } catch (Exception e) {
                                    echo "Frontend tests failed: ${e.message}"
                                    currentBuild.result = 'UNSTABLE'
                                }
                            }
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh """
                                        docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                                        sh -c '${NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit'
                                    """
                                    junit 'junit.xml'
                                } catch (Exception e) {
                                    echo "Backend tests failed: ${e.message}"
                                    currentBuild.result = 'UNSTABLE'
                                }
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
                        dir('erp') {
                            script {
                                try {
                                    sh """
                                        docker run --rm -v "${WORKSPACE}/erp:/app" -w /app ${NODE_IMAGE} \
                                        sh -c '${NPM_CMD} run build'
                                    """
                                    archiveArtifacts artifacts: 'build/**/*'
                                } catch (Exception e) {
                                    error("Frontend build failed: ${e.message}")
                                }
                            }
                        }
                    }
                }

                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh """
                                        docker run --rm -v "${WORKSPACE}/backend:/app" -w /app ${NODE_IMAGE} \
                                        sh -c '${NPM_CMD} run build'
                                    """
                                    archiveArtifacts artifacts: 'dist/**/*'
                                } catch (Exception e) {
                                    error("Backend build failed: ${e.message}")
                                }
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
                        dir('erp') {
                            sh """
                                docker build \
                                    --build-arg NODE_ENV=production \
                                    -t ${env.FRONTEND_IMAGE_NAME} \
                                    -f Dockerfile.prod \
                                    .
                            """
                        }

                        // Build backend image
                        dir('backend') {
                            sh """
                                docker build \
                                    --build-arg NODE_ENV=production \
                                    -t ${env.BACKEND_IMAGE_NAME} \
                                    -f Dockerfile.prod \
                                    .
                            """
                        }

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
                echo """
                    ===== BUILD SUMMARY =====
                    Result: ${currentBuild.currentResult}
                    Branch: ${env.GIT_BRANCH}
                    Commit: ${env.GIT_COMMIT_HASH}
                    Duration: ${currentBuild.durationString.replace(' and counting', '')}
                    Build URL: ${env.BUILD_URL}
                    =========================
                """
                cleanWs()
            }
        }
    }
}