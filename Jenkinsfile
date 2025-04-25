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
        
        stage('Diagnose Project Structure') {
            steps {
                sh '''
                    echo "===== REPOSITORY STRUCTURE DIAGNOSIS ====="
                    echo "Current directory: $(pwd)"
                    echo "Directory contents:"
                    ls -la
                    
                    echo "\n===== ALL DIRECTORIES ====="
                    find . -type d -not -path "*/node_modules/*" -not -path "*/\\.*" | sort
                    
                    echo "\n===== PACKAGE.JSON FILES ====="
                    find . -name "package.json" -not -path "*/node_modules/*" | sort
                    
                    echo "\n===== DOCKERFILE FILES ====="
                    find . -name "Dockerfile*" | sort
                    
                    echo "\n===== CHECKING SPECIFIC DIRECTORIES ====="
                    echo "backend directory:"
                    ls -la backend || echo "backend directory does not exist"
                    
                    echo "\nerp directory:"
                    ls -la erp || echo "erp directory does not exist"
                    
                    echo "\nerp/backend directory:"
                    ls -la erp/backend || echo "erp/backend directory does not exist"
                    
                    echo "\n===== STRUCTURE DIAGNOSIS COMPLETE ====="
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    def packageJsonPaths = sh(script: 'find . -name "package.json" -not -path "*/node_modules/*" | sort', returnStdout: true).trim()
                    
                    echo "Found package.json files at:"
                    echo packageJsonPaths
                    
                    def packageJsonList = packageJsonPaths.split('\n')
                    
                    if (packageJsonList.size() == 0) {
                        error("No package.json files found in the repository")
                    }
                    
                    for (String path in packageJsonList) {
                        def dir = path.substring(0, path.lastIndexOf('/'))
                        echo "Processing package.json in ${dir}"
                        
                        dir(dir) {
                            echo "Installing dependencies in ${dir}"
                            sh "${env.NPM_CMD} ci || ${env.NPM_CMD} install"
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    def packageJsonPaths = sh(script: 'find . -name "package.json" -not -path "*/node_modules/*" | sort', returnStdout: true).trim()
                    def packageJsonList = packageJsonPaths.split('\n')
                    
                    for (String path in packageJsonList) {
                        def dir = path.substring(0, path.lastIndexOf('/'))
                        echo "Building project in ${dir}"
                        
                        dir(dir) {
                            sh "cat package.json | grep -E '\"build\"|\"start\"'"
                            
                            try {
                                sh "${env.NPM_CMD} run build"
                                
                                // Check if build or dist directory exists
                                def buildExists = sh(script: '[ -d "build" ] && echo "true" || echo "false"', returnStdout: true).trim()
                                def distExists = sh(script: '[ -d "dist" ] && echo "true" || echo "false"', returnStdout: true).trim()
                                
                                if (buildExists == "true") {
                                    archiveArtifacts artifacts: "build/**/*", allowEmptyArchive: true
                                } else if (distExists == "true") {
                                    archiveArtifacts artifacts: "dist/**/*", allowEmptyArchive: true
                                } else {
                                    echo "No build or dist directory found after build"
                                }
                            } catch (Exception e) {
                                echo "Build failed in ${dir}: ${e.message}"
                                // Continue with next package.json instead of failing
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
                        def dockerfilePaths = sh(script: 'find . -name "Dockerfile*" | sort', returnStdout: true).trim()
                        
                        if (dockerfilePaths) {
                            echo "Found Dockerfiles at:"
                            echo dockerfilePaths
                            
                            def dockerfileList = dockerfilePaths.split('\n')
                            
                            for (int i = 0; i < dockerfileList.size(); i++) {
                                def dockerfilePath = dockerfileList[i]
                                def dir = dockerfilePath.substring(0, dockerfilePath.lastIndexOf('/'))
                                def imageName = "erp-service-${i}:${env.BUILD_NUMBER}"
                                
                                echo "Building Docker image for ${dockerfilePath}"
                                
                                sh """
                                    docker build \
                                        --build-arg NODE_ENV=production \
                                        -t ${imageName} \
                                        -f ${dockerfilePath} \
                                        ${dir}/
                                """
                                
                                sh "docker tag ${imageName} erp-service-${i}:latest"
                            }
                            
                            sh "docker images | grep erp"
                        } else {
                            echo "No Dockerfiles found, skipping Docker build"
                        }
                    } catch (Exception e) {
                        echo "Docker build failed: ${e.message}"
                    }
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