pipeline {
  agent any

  /*
    Requirements in Jenkins:
    - Create Credentials of type "Username with password" with id: dockerhub-credentials
      (your Docker Hub username/password)
    - Set an environment variable `DOCKERHUB_NAMESPACE` (your Docker Hub username or org)
    - Ensure the build agent has Docker installed and can run `docker` (or use a docker-enabled agent)
  */

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Build Backend') {
      steps {
        dir('backend') {
          sh 'npm install --package-lock-only && npm ci'
        }
      }
    }

    stage('Install & Build Frontend') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          // Use Kaniko (no host docker socket required). Create a docker config for Kaniko from credentials.
          withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DH_USER', passwordVariable: 'DH_PWD')]) {
            def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            def tag = "${env.BUILD_NUMBER ?: 'local'}-${commit}"
            def namespace = env.DOCKERHUB_NAMESPACE ?: env.DH_USER
            // DOCKERHUB_REPO_NAME must be set by the job; fail fast if missing
            def repoName = env.DOCKERHUB_REPO_NAME
            if (!repoName) {
              error('DOCKERHUB_REPO_NAME environment variable is not set. Aborting pipeline.')
            }

            // create docker config for docker client and place it in the jenkins user's docker config
            sh '''
              mkdir -p "$WORKSPACE/docker-config"
              auth=$(printf '%s:%s' "$DH_USER" "$DH_PWD" | base64)
              cat > "$WORKSPACE/docker-config/config.json" <<EOF
{"auths":{"https://index.docker.io/v1/":{"auth":"$auth"}}}
EOF
              mkdir -p /home/jenkins/.docker
              cp "$WORKSPACE/docker-config/config.json" /home/jenkins/.docker/config.json
              chown -R jenkins:jenkins /home/jenkins/.docker
            '''

            // Build and push using host Docker (docker.sock mounted into agent)
            sh """
              # Repo contains the frontend at repo root; use root Dockerfile and workspace as context
              sudo docker build -f ${env.WORKSPACE}/Dockerfile -t ${namespace}/${repoName}:${tag} ${env.WORKSPACE} && sudo docker push ${namespace}/${repoName}:${tag}
            """
            echo "Pushed image: ${namespace}/${repoName}:${tag}"
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DH_USER', passwordVariable: 'DH_PWD')]) {
            def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            def tag = "${env.BUILD_NUMBER ?: 'local'}-${commit}"
            def namespace = env.DOCKERHUB_NAMESPACE ?: env.DH_USER
            def webRepo = env.DOCKERHUB_REPO_NAME ?: env.DOCKERHUB_REPO_NAME_WEB ?: 'efrei-pipeline-web'

            // pull and replace web container only
            sh """
              sudo docker pull ${namespace}/${webRepo}:${tag} || true
              sudo docker stop pipeline-web || true
              sudo docker rm pipeline-web || true
              sudo docker run -d --name pipeline-web -p 3000:80 ${namespace}/${webRepo}:${tag}
            """

            echo "Deployed ${namespace}/${webRepo}:${tag}"
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline finished successfully.'
    }
    failure {
      echo 'Pipeline failed.'
    }
  }
}
