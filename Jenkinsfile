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
                    
                    // Debug: Show workspace structure
                    sh 'ls -la'
                    
                    // Verify files exist at correct paths with absolute paths
                    def frontendPath = "${WORKSPACE}/erp/package.json"
                    def backendPath = "${WORKSPACE}/backend/package.json"
                    
                    if (!fileExists(frontendPath)) {
                        error("ERROR: Frontend package.json not found at ${frontendPath}")
                    }
                    
                    if (!fileExists(backendPath)) {
                        error("ERROR: Backend package.json not found at ${backendPath}")
                    }
                    
                    // Verify Docker can see the files
                    sh """
                        docker run --rm -v ${WORKSPACE}:/workspace -w /workspace ${NODE_IMAGE} \
                        sh -c '[ -f /workspace/erp/package.json ] && echo "Frontend package.json exists" || echo "Frontend package.json missing"'
                    """
                    
                    sh """
                        docker run --rm -v ${WORKSPACE}:/workspace -w /workspace ${NODE_IMAGE} \
                        sh -c '[ -f /workspace/backend/package.json ] && echo "Backend package.json exists" || echo "Backend package.json missing"'
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Frontend installation with absolute paths
                    try {
                        sh """
                            docker run --rm \
                            -v ${WORKSPACE}/erp:/frontend \
                            -w /frontend \
                            ${NODE_IMAGE} \
                            ${NPM_CMD} install
                        """
                    } catch (Exception e) {
                        error("Frontend dependency installation failed: ${e.message}")
                    }
                    
                    // Backend installation with absolute paths
                    try {
                        sh """
                            docker run --rm \
                            -v ${WORKSPACE}/backend:/backend \
                            -w /backend \
                            ${NODE_IMAGE} \
                            ${NPM_CMD} install
                        """
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
                        script {
                            try {
                                sh """
                                    docker run --rm \
                                    -v ${WORKSPACE}/erp:/frontend \
                                    -w /frontend \
                                    ${NODE_IMAGE} \
                                    ${NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit
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
                                    docker run --rm \
                                    -v ${WORKSPACE}/backend:/backend \
                                    -w /backend \
                                    ${NODE_IMAGE} \
                                    ${NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit
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
                                    docker run --rm \
                                    -v ${WORKSPACE}/erp:/frontend \
                                    -w /frontend \
                                    ${NODE_IMAGE} \
                                    ${NPM_CMD} run build
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
                                    docker run --rm \
                                    -v ${WORKSPACE}/backend:/backend \
                                    -w /backend \
                                    ${NODE_IMAGE} \
                                    ${NPM_CMD} run build
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