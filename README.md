# DogeOps : select environment

GitHub action to select an environment to use.

Calculates the necessary values from project metadata.

Takes no inputs.

Outputs:
- environment: string
  - one of: production, staging, develop, feature
- key: string
  - computed from the ref type and name
    - tag: key is the tag name
    - branch:
      - main or master: key is `main`
      - develop: key is `develop`
      - feature/*: key is `dev_###` where `###` is the feature number, using standard felix naming conventions
