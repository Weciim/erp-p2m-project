pipeline {
    agent {
    docker {
        image 'node:20.10-alpine'
        args '''
            -u root 
            -v "$WORKSPACE:$WORKSPACE" 
            -w "$WORKSPACE" 
            -v /var/run/docker.sock:/var/run/docker.sock
            --mount type=bind,source="$WORKSPACE",target="$WORKSPACE",consistency=cached
        '''
        reuseNode true
        }
    }
    
    environment {
        // Registry config
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE_PREFIX = 'Weciim'
        FRONTEND_IMAGE = "erp-frontend:${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "erp-backend:${env.BUILD_NUMBER}"
        
        // K8s config
        KUBE_NAMESPACE = 'erp-prod'
        KUBE_CONTEXT = 'minikube'
        
        // Git config
        GIT_BRANCH = 'finance-module'
        GIT_URL = 'https://github.com/Weciim/erp-p2m-project.git'
        
        // Tools config
        NPM_CMD = 'npm --no-fund --no-audit'
    }

    options {
        skipDefaultCheckout true  // Skip the default checkout
    }

    stages {
        stage('Checkout Code') {
            agent any
                steps {
                    cleanWs()
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: env.GIT_BRANCH]],
                        extensions: [[
                            $class: 'RelativeTargetDirectory',
                            relativeTargetDir: '.'
                        ]],
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

        // Stage 2: Build and Deploy in Docker container
        stage('Build and Deploy') {
            agent {
                docker {
                    image 'node:20.10-alpine' 
                    args '--platform linux/amd64 -u root -v $WORKSPACE:$WORKSPACE -w $WORKSPACE -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            environment {
                // Add container-specific environment variables
                DOCKER_BUILDKIT = '1'
                NODE_ENV = 'production'
            }
            stages {
                // Setup environment with proper error handling
                stage('Setup Environment') {
                    steps {
                        script {
                            try {
                                sh '''
                                    apk add --no-cache git docker-cli openssh-client
                                    git --version
                                    docker --version
                                '''
                            } catch (Exception e) {
                                error("Environment setup failed: ${e.message}")
                            }
                        }
                    }
                }

                // Check workspace structure and permissions
                stage('Debug Workspace') {
                    steps {
                        sh 'pwd && ls -la'
                        sh 'ls -la erp || echo "erp directory not found"'
                        sh 'ls -la backend || echo "backend directory not found"'
                    }
                }

                // Install dependencies with caching
                stage('Install Dependencies') {
                    steps {
                        script {
                            sh 'mkdir -p erp/.npm_cache backend/.npm_cache'
                            
                            dir('erp') {
                                 sh "ls -la"
                                // Check if package.json exists
                                sh "[ -f package.json ] && echo 'Package.json exists' || echo 'Package.json not found'"
                                // Run npm with more detailed logs
                                sh "${env.NPM_CMD} ci --prefer-offline --cache .npm_cache --loglevel verbose || ${env.NPM_CMD} install"
                            }
                            
                            dir('backend') {
                                sh "ls -la"
                                // Check if package.json exists
                                sh "[ -f package.json ] && echo 'Package.json exists' || echo 'Package.json not found'"
                                // Run npm with more detailed logs
                                sh "${env.NPM_CMD} ci --prefer-offline --omit=dev --cache .npm_cache --loglevel verbose || ${env.NPM_CMD} install"
                            }
                        }
                    }
                }

                // Frontend build with proper test reporting
                stage('Build Frontend') {
                    steps {
                        dir('erp') {
                            script {
                                try {
                                    sh """
                                        ${env.NPM_CMD} run test:ci -- --ci --reporters=default --reporters=jest-junit || echo "Tests failed but continuing"
                                        ${env.NPM_CMD} run build
                                        npx audit-ci --config .auditci.json || true
                                    """
                                    junit allowEmptyResults: true, testResults: '**/junit.xml'
                                } catch (Exception e) {
                                    archiveArtifacts artifacts: '**/screenshots/*.png', allowEmptyArchive: true
                                    error("Frontend build failed: ${e.message}")
                                }
                            }
                        }
                    }
                }

                // Backend build with proper test reporting
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            script {
                                try {
                                    sh """
                                        ${env.NPM_CMD} run test:ci -- --ci --detectOpenHandles --reporters=default --reporters=jest-junit || echo "Tests failed but continuing"
                                        ${env.NPM_CMD} run build
                                    """
                                    junit allowEmptyResults: true, testResults: '**/junit.xml'
                                } catch (Exception e) {
                                    error("Backend build failed: ${e.message}")
                                }
                            }
                        }
                    }
                }

                // Containerization with build caching
                stage('Build Docker Images') {
                    steps {
                        script {
                            try {
                                sh """
                                    docker build \
                                        --build-arg NODE_ENV=production \
                                        -t ${env.FRONTEND_IMAGE} \
                                        -f erp/Dockerfile.prod \
                                        --cache-from ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE_PREFIX}/erp-frontend:latest \
                                        erp/
                                    
                                    docker build \
                                        --build-arg NODE_ENV=production \
                                        -t ${env.BACKEND_IMAGE} \
                                        -f backend/Dockerfile.prod \
                                        --cache-from ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE_PREFIX}/erp-backend:latest \
                                        backend/
                                    
                                    docker images
                                """
                            } catch (Exception e) {
                                error("Docker build failed: ${e.message}")
                            }
                        }
                    }
                }

                // Deployment with proper rollback handling
                stage('Deploy to Kubernetes') {
                    steps {
                        script {
                            try {
                                // Check if kubectl and minikube are available
                                sh "which kubectl || (echo 'kubectl not found' && exit 1)"
                                sh "which minikube || (echo 'minikube not found' && exit 1)"
                                
                                // Create namespace if not exists
                                sh """
                                    kubectl create namespace ${env.KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f - || true
                                """
                                
                                // Load images into Minikube
                                sh """
                                    minikube image load ${env.FRONTEND_IMAGE} || true
                                    minikube image load ${env.BACKEND_IMAGE} || true
                                """
                                
                                // Check if helm is available
                                sh "which helm || (echo 'helm not found' && exit 1)"
                                
                                // Helm deployments with atomic rollback
                                sh """
                                    helm upgrade --install erp-frontend ./charts/frontend \
                                        --namespace ${env.KUBE_NAMESPACE} \
                                        --set image.repository=erp-frontend \
                                        --set image.tag=${env.BUILD_NUMBER} \
                                        --set image.pullPolicy=IfNotPresent \
                                        --wait --atomic --timeout 5m
                                """
                                
                                sh """
                                    helm upgrade --install erp-backend ./charts/backend \
                                        --namespace ${env.KUBE_NAMESPACE} \
                                        --set image.repository=erp-backend \
                                        --set image.tag=${env.BUILD_NUMBER} \
                                        --set image.pullPolicy=IfNotPresent \
                                        --wait --atomic --timeout 5m
                                """
                                
                                // Health checks
                                sh """
                                    kubectl rollout status deployment/erp-frontend -n ${env.KUBE_NAMESPACE} --timeout=300s
                                    kubectl rollout status deployment/erp-backend -n ${env.KUBE_NAMESPACE} --timeout=300s
                                """
                                
                                // Port forwarding with proper process management
                                sh """
                                    pkill -f "kubectl port-forward" || true
                                    nohup kubectl port-forward svc/erp-frontend 9090:80 -n ${env.KUBE_NAMESPACE} > /dev/null 2>&1 &
                                """
                            } catch (Exception e) {
                                // Automatic rollback on failure
                                sh """
                                    helm rollback -n ${env.KUBE_NAMESPACE} erp-frontend 0 || true
                                    helm rollback -n ${env.KUBE_NAMESPACE} erp-backend 0 || true
                                """
                                error("Deployment failed: ${e.message}")
                            }
                        }
                    }
                }
            }
            
            // Move post actions inside an agent context
            post {
                always {
                    script {
                        // Clean up port forwarding
                        sh 'pkill -f "kubectl port-forward" || true'
                        
                        // Use the stored commit hash, don't try to run git command
                        def commit = env.GIT_COMMIT_HASH ?: 'unknown'
                        def duration = currentBuild.durationString.replace(' and counting', '')
                        
                        try {
                            slackSend(
                                channel: '#erp-deployments',
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
                        
                        // Archive important artifacts
                        archiveArtifacts artifacts: '**/build/reports/**/*', allowEmptyArchive: true
                        junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
                    }
                    
                    cleanWs()
                }
            }
        }
    }
}