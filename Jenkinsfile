pipeline {
    agent {
        docker {
            image 'node:20'  // Use official Node.js 20 image with npm preinstalled
            args '-v /var/run/docker.sock:/var/run/docker.sock' // If you need to build Docker images later
        }
    }

    environment {
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        GIT_BRANCH = 'finance-module'
        NPM_CMD = 'npm --no-fund --no-audit'
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
                stage('Backend Install') {
                    steps {
                        dir('backend') {
                            sh "${env.NPM_CMD} install"
                        }
                    }
                }
                stage('Frontend Install') {
                    steps {
                        dir('erp') {
                            sh "${env.NPM_CMD} install"
                        }
                    }
                }
            }
        }

        stage('Build Projects') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh "${env.NPM_CMD} run build"
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('erp') {
                            sh "${env.NPM_CMD} run build"
                        }
                    }
                }
            }
        }
        
        stage('Archive Build Artifacts') {
            steps {
                script {
                    archiveArtifacts artifacts: 'backend/dist/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'erp/build/**', allowEmptyArchive: true
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
            echo "Build completed successfully!"
        }
        failure {
            echo "Build failed!"
        }
    }
}
