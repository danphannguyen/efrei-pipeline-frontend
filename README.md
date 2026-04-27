# Configuration Jenkins pour build/push Docker

1) Créer le jobs 
- Name: Deploy-Pipeline-Frontend
- Type: Pipeline script from SCM
- Repository URL: https://github.com/danphannguyen/efrei-pipeline-frontend.git
- Branch specifier: */main
- Script path: Jenkinsfile

2) Variables d'environnement requises pour le job
Ouvrez votre job → Configure.
Cochez "This project is parameterized".
Add Parameter → "String Parameter".

- `DOCKERHUB_NAMESPACE`: votre nom d'utilisateur ou organisation Docker Hub (ex: `dvnpn`)
- `DOCKERHUB_REPO_NAME`: nom du repository Docker Hub pour l'image web (ex: `efrei-pipeline-web`). **Obligatoire** — le pipeline échouera si non défini.