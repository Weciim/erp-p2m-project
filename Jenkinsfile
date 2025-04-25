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
                    env.GIT_COMMIT_HASH = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Verify Files') {
            steps {
                script {
                    // Verify frontend and backend package.json files exist
                    if (!fileExists('erp/package.json')) {
                        error("ERROR: Frontend package.json not found at erp/package.json")
                    }
                    if (!fileExists('backend/package.json')) {
                        error("ERROR: Backend package.json not found at backend/package.json")
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install frontend dependencies
                    sh """
                        docker run --rm \
                        -v ${WORKSPACE}/erp:/app \
                        -w /app \
                        ${NODE_IMAGE} \
                        ${NPM_CMD} install
                    """

                    // Install backend dependencies
                    sh """
                        docker run --rm \
                        -v ${WORKSPACE}/backend:/app \
                        -w /app \
                        ${NODE_IMAGE} \
                        ${NPM_CMD} install
                    """
                }
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        script {
                            sh """
                                docker run --rm \
                                -v ${WORKSPACE}/erp:/app \
                                -w /app \
                                ${NODE_IMAGE} \
                                ${NPM_CMD} run test:ci
                            """
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        script {
                            sh """
                                docker run --rm \
                                -v ${WORKSPACE}/backend:/app \
                                -w /app \
                                ${NODE_IMAGE} \
                                ${NPM_CMD} run test:ci
                            """
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
                            sh """
                                docker run --rm \
                                -v ${WORKSPACE}/erp:/app \
                                -w /app \
                                ${NODE_IMAGE} \
                                ${NPM_CMD} run build
                            """
                        }
                    }
                }

                stage('Build Backend') {
                    steps {
                        script {
                            sh """
                                docker run --rm \
                                -v ${WORKSPACE}/backend:/app \
                                -w /app \
                                ${NODE_IMAGE} \
                                ${NPM_CMD} run build
                            """
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Verify Dockerfiles exist
                    if (!fileExists('erp/Dockerfile.prod')) {
                        error("Frontend Dockerfile.prod not found")
                    }
                    if (!fileExists('backend/Dockerfile.prod')) {
                        error("Backend Dockerfile.prod not found")
                    }

                    // Build frontend Docker image
                    sh """
                        docker build \
                        -t ${FRONTEND_IMAGE_NAME} \
                        -f erp/Dockerfile.prod \
                        erp
                    """

                    // Build backend Docker image
                    sh """
                        docker build \
                        -t ${BACKEND_IMAGE_NAME} \
                        -f backend/Dockerfile.prod \
                        backend
                    """

                    // Tag images as latest
                    sh """
                        docker tag ${FRONTEND_IMAGE_NAME} erp-frontend:latest
                        docker tag ${BACKEND_IMAGE_NAME} erp-backend:latest
                    """
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
                    Build URL: ${env.BUILD_URL}
                    =========================
                """
                cleanWs()
            }
        }
    }
}