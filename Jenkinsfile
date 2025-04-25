pipeline {
    agent any
    
    environment {
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        GIT_BRANCH = 'finance-module'
        
        NPM_CMD = 'npm --no-fund --no-audit'
        
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
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('erp') {
                            sh '[ -f package.json ] || (echo "Frontend package.json not found" && exit 1)'
                            
                            sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                        }
                    }
                }
                
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh '[ -f package.json ] || (echo "Backend package.json not found" && exit 1)'
                            
                            sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                        }
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
                                    sh '[ -f package.json ] && (grep -q "lint" package.json && ${env.NPM_CMD} run lint || echo "No lint script found")'
                                    
                                    sh "${env.NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit || (echo 'Tests failed but continuing' && exit 0)"
                                    
                                    sh "npx audit-ci --config .auditci.json || echo 'Audit warnings found'"
                                } catch (Exception e) {
                                    echo "Frontend test stage had issues: ${e.message}"
                                    currentBuild.result = 'UNSTABLE'
                                }
                                
                                junit allowEmptyResults: true, testResults: '**/junit.xml'
                            }
                        }
                    }
                }
                
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh '[ -f package.json ] && (grep -q "lint" package.json && ${env.NPM_CMD} run lint || echo "No lint script found")'
                                    
                                    sh "${env.NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit || (echo 'Tests failed but continuing' && exit 0)"
                                } catch (Exception e) {
                                    echo "Backend test stage had issues: ${e.message}"
                                    currentBuild.result = 'UNSTABLE'
                                }
                                
                                junit allowEmptyResults: true, testResults: '**/junit.xml'
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
                                    // Build frontend application
                                    sh "${env.NPM_CMD} run build"
                                    
                                    // Archive build artifacts
                                    archiveArtifacts artifacts: 'build/**/*', allowEmptyArchive: true
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
                                    // Build backend application
                                    sh "${env.NPM_CMD} run build"
                                    
                                    // Archive build artifacts
                                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
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
                        // Build frontend Docker image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.FRONTEND_IMAGE_NAME} \
                                -f erp/Dockerfile.prod \
                                erp/
                        """
                        
                        // Build backend Docker image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.BACKEND_IMAGE_NAME} \
                                -f backend/Dockerfile.prod \
                                backend/
                        """
                        
                        // Tag with the latest tag
                        sh """
                            docker tag ${env.FRONTEND_IMAGE_NAME} erp-frontend:latest
                            docker tag ${env.BACKEND_IMAGE_NAME} erp-backend:latest
                        """
                        
                        // List all images
                        sh "docker images | grep erp"
                    } catch (Exception e) {
                        error("Docker build failed: ${e.message}")
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
            
            // Send notifications
            script {
                def commit = env.GIT_COMMIT_HASH ?: 'unknown'
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                try {
                    slackSend(
                        channel: '#erp-ci',
                        color: currentBuild.currentResult == 'SUCCESS' ? 'good' : 'danger',
                        message: """
                        *${env.JOB_NAME}* #${env.BUILD_NUMBER}
                        Result: ${currentBuild.currentResult}
                        Branch: ${env.GIT_BRANCH}
                        Commit: ${commit}
                        Duration: ${duration}
                        ${env.BUILD_URL}
                        """
                    )
                } catch (Exception e) {
                    echo "Failed to send Slack notification: ${e.message}"
                }
            }
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