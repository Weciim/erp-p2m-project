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
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/erp-frontend:${env.GIT_COMMIT_SHORT_SHA}"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_PREFIX}/erp-backend:${env.GIT_COMMIT_SHORT_SHA}"
        
        // K8s config
        KUBE_NAMESPACE = 'erp-prod'
        KUBE_CONTEXT = 'minikube' // Change for production clusters
    }

    stages {
        // Stage 1: Checkout and dependency caching
        stage('Setup') {
            steps {
                checkout scm
                sh 'git config --global safe.directory /workspace' // Fix git security warnings
                
                // Cache node_modules between builds (massive speed boost)
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

        // Stage 2: Frontend build with modern tools
        stage('Frontend Build') {
            steps {
                dir('erp') {
                    // Modern build tools (adjust if using Vite/Next.js)
                    // sh 'npm run lint:ci' 
                    sh 'npm run test:ci' // Example: "vitest run --coverage"
                    sh 'npm run build'
                    
                    // Bundle analyzer (optional)
                    // sh 'npm run build:analyze' 
                    
                    // Security (critical for production)
                    sh 'npx audit-ci --config .auditci.json' // Custom thresholds
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/dist/**/*', fingerprint: true
                }
            }
        }

        // Stage 3: Backend build with Node 20 features
        stage('Backend Build') {
            steps {
                dir('backend') {
                    // Node 20 specific optimizations
                    sh 'npm run build' // Uses ES modules if package.json has "type": "module"
                    sh 'npm run test:ci -- --detectOpenHandles' // Jest with Node 20 flags
                    
                    // Container vulnerability scan
                    sh 'docker scout quickview .'
                }
            }
        }

        // Stage 4: Containerization (multi-platform aware)
        stage('Containerize') {
            agent {
                docker {
                    image 'docker:24.0-dind'
                    args '--privileged --platform linux/amd64'
                }
            }
            environment {
                DOCKER_BUILDKIT = '1' // Enable BuildKit for faster builds
            }
            steps {
                script {
                    // docker.withRegistry("https://${DOCKER_REGISTRY}", 'github-container-registry-creds') {
                    //     docker.build(FRONTEND_IMAGE, """
                    //         --platform linux/amd64 
                    //         --file frontend/Dockerfile.prod 
                    //         --build-arg NODE_ENV=production 
                    //         frontend/
                    //     """).push()
                        sh """
                            docker build -t ${FRONTEND_IMAGE} --file erp/Dockerfile.prod erp/
                            docker build -t ${BACKEND_IMAGE} --file backend/Dockerfile.prod backend/
                           """
                        // Backend with Node 20 base
                        // docker.build(BACKEND_IMAGE, """
                        //     --platform linux/amd64 
                        //     --file backend/Dockerfile.prod 
                        //     --build-arg NODE_VERSION=20.10 
                        //     backend/
                        // """).push()
                    }
                }
            }
        }

        // Stage 5: Kubernetes Deployment (modern approach)
        stage('Deploy') {
            agent any
            environment {
                KUBECONFIG = credentials('minikube-kubeconfig') // Securely stored in Jenkins
            }
            steps {
                // Helm deployment (modern alternative to raw manifests)
                sh """
                helm upgrade --install erp-frontend ./charts/frontend \
                    --namespace ${KUBE_NAMESPACE} \
                    --set image.tag=${env.GIT_COMMIT_SHORT_SHA} \
                    --wait --atomic --timeout 5m
                
                helm upgrade --install erp-backend ./charts/backend \
                    --namespace ${KUBE_NAMESPACE} \
                    --set image.tag=${env.GIT_COMMIT_SHORT_SHA} \
                    --wait --atomic --timeout 5m
                """
                
                // Post-deployment verification
                sh """
                kubectl rollout status -n ${KUBE_NAMESPACE} deployment/erp-frontend
                kubectl rollout status -n ${KUBE_NAMESPACE} deployment/erp-backend
                kubectl get pods -n ${KUBE_NAMESPACE} -o wide
                """
            }
        }
    }

    post {
        always {
            // Cleanup and notifications
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
            // Automatic rollback
            sh """
            helm rollback -n ${KUBE_NAMESPACE} erp-frontend 0
            helm rollback -n ${KUBE_NAMESPACE} erp-backend 0
            """
        }
    }
}