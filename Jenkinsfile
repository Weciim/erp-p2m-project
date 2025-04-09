pipeline {
    agent {
        docker {
            image 'node:20.10-alpine' 
            args '-u root --platform linux/amd64' 
            reuseNode true
        }
    }

    environment {
        // Registry config (use GitHub Container Registry)
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE_PREFIX = 'Weciim'
        FRONTEND_IMAGE = "erp-frontend:local"  // Changed for local testing
        BACKEND_IMAGE = "erp-backend:local"    // Changed for local testing
        
        // K8s config
        KUBE_NAMESPACE = 'erp-prod'
        KUBE_CONTEXT = 'minikube'
    }

    stages {
        // Stage 1: Checkout and dependency caching
        stage('Setup') {
            steps {
                checkout scm
                sh 'git config --global safe.directory /workspace'
                
                dir('erp') {
                    cache(path: './node_modules', includes: '**/node_modules/**', key: "erp-${env.GIT_COMMIT_SHORT_SHA}") {
                        sh 'npm ci --prefer-offline'
                    }
                }
                dir('backend') {
                    cache(path: './node_modules', includes: '**/node_modules/**', key: "backend-${env.GIT_COMMIT_SHORT_SHA}") {
                        sh 'npm ci --prefer-offline --omit=dev'
                    }
                }
            }
        }

        // Stage 2: Frontend build
        stage('Frontend Build') {
            steps {
                dir('erp') {
                    sh 'npm run test:ci'
                    sh 'npm run build'
                    sh 'npx audit-ci --config .auditci.json'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'erp/dist/**/*', fingerprint: true  // Fixed path
                }
            }
        }

        // Stage 3: Backend build
        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                    sh 'npm run test:ci -- --detectOpenHandles'
                    sh 'docker scout quickview .'
                }
            }
        }

        // Stage 4: Containerization
        stage('Containerize') {
            agent {
                docker {
                    image 'docker:24.0-dind'
                    args '--privileged --platform linux/amd64'
                }
            }
            environment {
                DOCKER_BUILDKIT = '1'
            }
            steps {
                script {
                    // Build without pushing for local testing
                    sh """
                    docker build -t ${FRONTEND_IMAGE} -f erp/Dockerfile.prod erp/
                    docker build -t ${BACKEND_IMAGE} -f backend/Dockerfile.prod backend/
                    """
                }
            }
        }

        // Stage 5: Kubernetes Deployment
        stage('Deploy') {
            agent any
            environment {
                KUBECONFIG = credentials('minikube-kubeconfig')
            }
            steps {
                script {
                    // Create namespace if not exists
                    sh "kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
                    
                    // Load Docker images into Minikube
                    sh "minikube image load ${FRONTEND_IMAGE}"
                    sh "minikube image load ${BACKEND_IMAGE}"
                    
                    // Helm deployment with local images
                    sh """
                    helm upgrade --install erp-frontend ./charts/frontend \
                        --namespace ${KUBE_NAMESPACE} \
                        --set image.repository=erp-frontend \
                        --set image.tag=local \
                        --set image.pullPolicy=Never \
                        --wait --atomic --timeout 5m
                    
                    helm upgrade --install erp-backend ./charts/backend \
                        --namespace ${KUBE_NAMESPACE} \
                        --set image.repository=erp-backend \
                        --set image.tag=local \
                        --set image.pullPolicy=Never \
                        --wait --atomic --timeout 5m
                    """
                    
                    // Port forwarding for local access
                    sh "kubectl port-forward svc/erp-frontend 9090:80 -n ${KUBE_NAMESPACE} &"
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
            sh """
            helm rollback -n ${KUBE_NAMESPACE} erp-frontend 0 || true
            helm rollback -n ${KUBE_NAMESPACE} erp-backend 0 || true
            """
        }
    }
}