pipeline {
    agent none
    
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

    stages {
        stage('Checkout Code') {
            agent any
            steps {
                cleanWs()
                script {
                    try {
                        // Configure Git to avoid credential cache issues
                        sh '''
                            git config --global --unset credential.helper || true
                            git config --system --unset credential.helper || true
                            git config --global user.name "Jenkins"
                            git config --global user.email "jenkins@ci"
                        '''
                        
                        // Manual checkout with retries
                        retry(3) {
                            checkout([
                                $class: 'GitSCM',
                                branches: [[name: "*/${env.GIT_BRANCH}"]],
                                extensions: [
                                    [$class: 'CleanBeforeCheckout'],
                                    [$class: 'CloneOption', 
                                     shallow: true, 
                                     depth: 1, 
                                     noTags: false,
                                     timeout: 30,
                                     noSubmodules: true],
                                    [$class: 'LocalBranch']
                                ],
                                userRemoteConfigs: [[
                                    credentialsId: 'github-token',
                                    url: "${env.GIT_URL}",
                                    timeout: 30
                                ]],
                                doGenerateSubmoduleConfigurations: false,
                                submoduleCfg: []
                            ])
                        }
                        
                        // Verify checkout
                        sh '''
                            git branch -vv
                            git remote -v
                            git log -1 --oneline
                            ls -la
                        '''
                    } catch (Exception e) {
                        error("Checkout failed: ${e.message}\nTry verifying:\n1. GitHub token permissions\n2. Repository accessibility\n3. Network connectivity")
                    }
                }
            }
        }

        // Rest of your pipeline remains exactly the same...
        stage('Build and Deploy') {
            agent {
                docker {
                    image 'node:20.10-alpine' 
                    args '--platform linux/amd64 -u root -v $WORKSPACE:$WORKSPACE -w $WORKSPACE -v /var/run/docker.sock:/var/run/docker.sock'
                    reuseNode true
                }
            }
            // ... keep all existing stages ...
        }
    }

    post {
        always {
            script {
                node {
                    try {
                        // Clean up port forwarding
                        sh 'pkill -f "kubectl port-forward" || true'
                        
                        // Get commit info safely
                        def commit = sh(script: 'git rev-parse --short HEAD || echo "unknown"', returnStdout: true).trim()
                        def duration = currentBuild.durationString.replace(' and counting', '')
                        
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
                        echo "Failed to send notification: ${e.message}"
                    }
                }
            }
        }
        
        cleanup {
            node {
                cleanWs()
            }
        }
    }
}