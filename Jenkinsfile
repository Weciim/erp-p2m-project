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
        
        // Git config
        GIT_BRANCH = 'finance-module'
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        
        // Tools config
        NPM_CMD = 'npm'
    }

    stages {
        // Stage 1: Checkout code on Jenkins host (not in Docker)
        stage('Checkout Code') {
            agent any
            steps {
                cleanWs()
                
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.GIT_BRANCH}"]],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CloneOption', shallow: true, depth: 1, noTags: false]
                    ],
                    userRemoteConfigs: [[
                        credentialsId: 'github-token',
                        url: "${env.GIT_URL}"
                    ]]
                ])
                
                // Set workspace as safe directory
                bat 'git config --global --add safe.directory %WORKSPACE%'
                sh 'git config --global --add safe.directory $WORKSPACE'
            }
        }

        // Stage 2: Build and Deploy in Docker container
        stage('Build and Deploy') {
            agent {
                docker {
                    image 'node:20.10-alpine' 
                    args '--platform linux/amd64 -u root -v $WORKSPACE:$WORKSPACE -w $WORKSPACE -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            stages {
                // Install required tools
                stage('Setup Environment') {
                    steps {
                        // Install Git and other dependencies in container
                        sh 'apk add --no-cache git docker-cli'
                        sh 'git --version'
                        sh 'docker --version'
                    }
                }

                // Install dependencies
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
                stage('Build Frontend') {
                    steps {
                        dir('erp') {
                            sh "${env.NPM_CMD} run test:ci"
                            sh "${env.NPM_CMD} run build"
                            sh "npx audit-ci --config .auditci.json"
                        }
                    }
                }

                // Backend build
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh "${env.NPM_CMD} run build"
                            sh "${env.NPM_CMD} run test:ci -- --detectOpenHandles"
                        }
                    }
                }

                // Containerization
                stage('Build Docker Images') {
                    steps {
                        sh """
                        docker build -t ${env.FRONTEND_IMAGE} -f erp/Dockerfile.prod erp/
                        docker build -t ${env.BACKEND_IMAGE} -f backend/Dockerfile.prod backend/
                        docker images
                        """
                    }
                }

                // Deployment
                stage('Deploy to Kubernetes') {
                    steps {
                        script {
                            // Create namespace if not exists
                            sh """
                            kubectl create namespace ${env.KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                            """
                            
                            // Load images into Minikube
                            sh """
                            minikube image load ${env.FRONTEND_IMAGE}
                            minikube image load ${env.BACKEND_IMAGE}
                            """
                            
                            // Helm deployments
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
                            
                            // Port forwarding (background process)
                            sh """
                            nohup kubectl port-forward svc/erp-frontend 9090:80 -n ${env.KUBE_NAMESPACE} > /dev/null 2>&1 &
                            """
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