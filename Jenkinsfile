pipeline {
    agent {
      docker {
        image 'node:20.10-alpine' 
        args '-u root --platform linux/amd64 -v /var/run/docker.sock:/var/run/docker.sock'
        reuseNode true
             }
         }
    environment {
        // Registry config
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE_PREFIX = 'Weciim'
        FRONTEND_IMAGE = "erp-frontend:local"
        BACKEND_IMAGE = "erp-backend:local"
        
        // K8s config
        KUBE_NAMESPACE = 'erp-prod'
        KUBE_CONTEXT = 'minikube'
        
        // Windows-specific paths
        DOCKER_CMD = 'docker'  // Directly use host Docker
        NPM_CMD = 'npm'
    }

    stages {
        // Stage 1: Checkout and setup
        stage('Setup') {
            steps {
                checkout([
                $class: 'GitSCM',
                branches: [[name: '*/finance-module']], 
                extensions: [],
                userRemoteConfigs: [[
                    credentialsId: 'github-token',
                    url: 'https://github.com/Weciim/erp-p2m-project.git'
                ]]
                ])
                checkout scm
                bat 'git config --global safe.directory %WORKSPACE%'
                
                dir('erp') {
                    bat "${NPM_CMD} ci --prefer-offline"
                }
                dir('backend') {
                    bat "${NPM_CMD} ci --prefer-offline --omit=dev"
                }
            }
        }

        // Stage 2: Frontend build
        stage('Frontend Build') {
            steps {
                dir('erp') {
                    bat "${NPM_CMD} run test:ci"
                    bat "${NPM_CMD} run build"
                    bat "npx audit-ci --config .auditci.json"
                }
            }
        }

        // Stage 3: Backend build
        stage('Backend Build') {
            steps {
                dir('backend') {
                    bat "${NPM_CMD} run build"
                    bat "${NPM_CMD} run test:ci -- --detectOpenHandles"
                }
            }
        }

        // Stage 4: Containerization using host Docker
        stage('Containerize') {
            steps {
                script {
                    def dockerCmd = "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"

                    // Build frontend
                    bat """
                    ${DOCKER_CMD} build -t ${FRONTEND_IMAGE} -f erp/Dockerfile.prod erp/
                    """
                    
                    // Build backend
                    bat """
                    ${DOCKER_CMD} build -t ${BACKEND_IMAGE} -f backend/Dockerfile.prod backend/
                    """
                    
                    // Verify images
                    bat "${DOCKER_CMD} images"
                }
            }
        }

        // Stage 5: Kubernetes Deployment
        stage('Deploy') {
            steps {
                script {
                    // Create namespace
                    bat "kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
                    
                    // Load images into Minikube
                    bat "minikube image load ${FRONTEND_IMAGE}"
                    bat "minikube image load ${BACKEND_IMAGE}"
                    
                    // Helm deployment
                    bat """
                    helm upgrade --install erp-frontend ./charts/frontend \
                        --namespace ${KUBE_NAMESPACE} \
                        --set image.repository=erp-frontend \
                        --set image.tag=local \
                        --set image.pullPolicy=Never \
                        --wait --atomic --timeout 5m
                    """
                    
                    bat """
                    helm upgrade --install erp-backend ./charts/backend \
                        --namespace ${KUBE_NAMESPACE} \
                        --set image.repository=erp-backend \
                        --set image.tag=local \
                        --set image.pullPolicy=Never \
                        --wait --atomic --timeout 5m
                    """
                    
                    // Port forwarding
                    bat "start /B kubectl port-forward svc/erp-frontend 9090:80 -n ${KUBE_NAMESPACE}"
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
                    Commit: ${env.GIT_COMMIT_SHORT_SHA}
                    Duration: ${duration}
                    ${env.BUILD_URL}
                    """
                )
            }
        }
        failure {
            bat """
            helm rollback -n ${KUBE_NAMESPACE} erp-frontend 0 || echo "No rollback available"
            helm rollback -n ${KUBE_NAMESPACE} erp-backend 0 || echo "No rollback available"
            """
        }
    }
}