pipeline {
    agent none
    
    environment {
        // Registry config
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE_PREFIX = 'Weciim'
        FRONTEND_IMAGE = "erp-frontend:local"
        BACKEND_IMAGE = "erp-backend:local"
        
        // K8s config
        KUBE_NAMESPACE = 'erp-prod'
        KUBE_CONTEXT = 'minikube'
        
        // Tools config
        DOCKER_CMD = 'docker'
        NPM_CMD = 'npm'
        GIT_BRANCH = 'finance-module'
    }

    stages {
        // Stage 1: Checkout code (run directly on Jenkins agent)
        stage('Checkout') {
            agent any
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.GIT_BRANCH}"]],
                    extensions: [[
                        $class: 'CleanBeforeCheckout'
                    ]],
                    userRemoteConfigs: [[
                        credentialsId: 'github-token',
                        url: 'https://github.com/Weciim/erp-p2m-project.git'
                    ]]
                ])
                
                // Set safe directory for Git
                bat 'git config --global --add safe.directory %WORKSPACE%'
            }
        }

        // Stage 2: Build and Deploy (run in Docker container)
        stage('Build and Deploy') {
            agent {
                docker {
                    image 'node:20.10-alpine' 
                    args '-u root --platform linux/amd64 -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            stages {
                // Setup dependencies
                stage('Install Dependencies') {
                    steps {
                        dir('erp') {
                            sh "${env.NPM_CMD} ci --prefer-offline"
                        }
                        dir('backend') {
                            sh "${env.NPM_CMD} ci --prefer-offline --omit=dev"
                        }
                    }
                }

                // Frontend build
                stage('Frontend Build') {
                    steps {
                        dir('erp') {
                            sh "${env.NPM_CMD} run test:ci"
                            sh "${env.NPM_CMD} run build"
                            sh "npx audit-ci --config .auditci.json"
                        }
                    }
                }

                // Backend build
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh "${env.NPM_CMD} run build"
                            sh "${env.NPM_CMD} run test:ci -- --detectOpenHandles"
                        }
                    }
                }

                // Containerization
                stage('Containerize') {
                    steps {
                        script {
                            // Build frontend
                            sh """
                            ${env.DOCKER_CMD} build -t ${env.FRONTEND_IMAGE} -f erp/Dockerfile.prod erp/
                            """
                            
                            // Build backend
                            sh """
                            ${env.DOCKER_CMD} build -t ${env.BACKEND_IMAGE} -f backend/Dockerfile.prod backend/
                            """
                            
                            // Verify images
                            sh "${env.DOCKER_CMD} images"
                        }
                    }
                }

                // Kubernetes Deployment
                stage('Deploy') {
                    steps {
                        script {
                            // Create namespace
                            sh "kubectl create namespace ${env.KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
                            
                            // Load images into Minikube
                            sh "minikube image load ${env.FRONTEND_IMAGE}"
                            sh "minikube image load ${env.BACKEND_IMAGE}"
                            
                            // Helm deployment
                            sh """
                            helm upgrade --install erp-frontend ./charts/frontend \
                                --namespace ${env.KUBE_NAMESPACE} \
                                --set image.repository=erp-frontend \
                                --set image.tag=local \
                                --set image.pullPolicy=Never \
                                --wait --atomic --timeout 5m
                            """
                            
                            sh """
                            helm upgrade --install erp-backend ./charts/backend \
                                --namespace ${env.KUBE_NAMESPACE} \
                                --set image.repository=erp-backend \
                                --set image.tag=local \
                                --set image.pullPolicy=Never \
                                --wait --atomic --timeout 5m
                            """
                            
                            // Port forwarding
                            sh "nohup kubectl port-forward svc/erp-frontend 9090:80 -n ${env.KUBE_NAMESPACE} &"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            script {
                def duration = currentBuild.durationString.replace(' and counting', '')
                slackSend(
                    channel: '#erp-deployments',
                    color: currentBuild.currentResult == 'SUCCESS' ? 'good' : 'danger',
                    message: """
                    *${env.JOB_NAME}* #${env.BUILD_NUMBER}
                    Result: ${currentBuild.currentResult}
                    Branch: ${env.GIT_BRANCH}
                    Commit: ${env.GIT_COMMIT.take(7)}
                    Duration: ${duration}
                    ${env.BUILD_URL}
                    """
                )
            }
        }
        failure {
            script {
                sh """
                helm rollback -n ${env.KUBE_NAMESPACE} erp-frontend 0 || echo "No rollback available"
                helm rollback -n ${env.KUBE_NAMESPACE} erp-backend 0 || echo "No rollback available"
                """
            }
        }
    }
}