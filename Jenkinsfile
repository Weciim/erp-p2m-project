pipeline {
    agent any
    
    environment {
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        GIT_BRANCH = 'main'  // Change to your default branch if needed
        
        NPM_CMD = 'npm --no-fund --no-audit'
        
        MAIN_BACKEND_IMAGE = "erp-main-backend:${env.BUILD_NUMBER}"
        ERP_BACKEND_IMAGE = "erp-backend:${env.BUILD_NUMBER}"
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
                stage('Main Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh '[ -f package.json ] || (echo "Main backend package.json not found" && exit 1)'
                            sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                        }
                    }
                }
                
                stage('ERP Backend Dependencies') {
                    steps {
                        dir('erp/backend') {
                            sh '[ -f package.json ] || (echo "ERP backend package.json not found" && exit 1)'
                            sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Main Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh "${env.NPM_CMD} test"
                                } catch (Exception e) {
                                    unstable("Main backend tests failed: ${e.message}")
                                }
                            }
                        }
                    }
                }
                
                stage('ERP Backend Tests') {
                    steps {
                        dir('erp/backend') {
                            script {
                                try {
                                    sh "${env.NPM_CMD} test"
                                } catch (Exception e) {
                                    unstable("ERP backend tests failed: ${e.message}")
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Main Backend') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh "${env.NPM_CMD} run build"
                                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                                } catch (Exception e) {
                                    error("Main backend build failed: ${e.message}")
                                }
                            }
                        }
                    }
                }
                
                stage('Build ERP Backend') {
                    steps {
                        dir('erp/backend') {
                            script {
                                try {
                                    sh "${env.NPM_CMD} run build"
                                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                                } catch (Exception e) {
                                    error("ERP backend build failed: ${e.message}")
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
                        // Build Main Backend Docker Image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.MAIN_BACKEND_IMAGE} \
                                -f backend/Dockerfile \
                                backend/
                        """
                        
                        // Build ERP Backend Docker Image
                        sh """
                            docker build \
                                --build-arg NODE_ENV=production \
                                -t ${env.ERP_BACKEND_IMAGE} \
                                -f erp/backend/Dockerfile \
                                erp/backend/
                        """
                        
                        // Tag as latest
                        sh """
                            docker tag ${env.MAIN_BACKEND_IMAGE} erp-main-backend:latest
                            docker tag ${env.ERP_BACKEND_IMAGE} erp-backend:latest
                        """
                        
                        sh "docker images | grep erp"
                    } catch (Exception e) {
                        error("Docker build failed: ${e.message}")
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo "Deploying to staging environment..."
                // Add deployment steps for staging
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying to production environment..."
                // Add deployment steps for production
            }
        }
    }
    
    post {
        always {
            cleanWs()
            
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