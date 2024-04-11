# 🦸🏼🦸🏾‍♂️ Community dApps for Polymer 🦸🏾‍♀️🦸🏻

Welcome to the official repository for [Polymer](https://polymerlabs.org) community demo applications! This repository serves as a centralized hub for the demo dApps created by the Polymer community!

We highly encourage our community to build new demos showcasing the capabilities and use cases of Polymer x [IBC](https://ibcprotocol.dev) interoperability.

To help the visibility of these projects, developers can choose to add their project to his repo in several ways.

## 🤝 Contributing to the community demo dApp repo

We welcome and encourage contributions from our community! Here’s how you can contribute.

## Step 1: Create a Reference to the dApp Repo in explore-apps.md

Add a reference to the dApp in the **`explore-apps.md`** file located in the root of the repo. This contains curated list of community projects. It includes references to projects maintained in the `/community` directory and links to external repositories. The reference should be in the following format:

Title

```markdown
- Name:
- GitHub url: 
- Documentation:
- Website:
- Socials: 
- Attribution: [@GH_handle(s)]
```

## Step 2: Add your project to the repository

Add your repository as a git submodule:

1. **Fork the Main Repository:** If you haven't already, Fork the repository and then clone your forked repository repository:

   ```bash
   gh repo fork [Main Repository URL]
   ```

2. **Add Your Repository as a Submodule:**

   ```bash
   git submodule add [Your Repository URL] community/[Your Project Name]
   ```

3. **Commit and Push the Changes:**

   ```bash
   git commit -m "Added [Your Project Name] as a submodule"
   git push
   ```

## Step 3: Create a Pull Request 

Once you have added both a reference and project to the repository **Submit a pull request** with a detailed description of your app.

## 📚 Documentation

Be sure to add clear documentation and scripts when adding a project to maximize its usefulness to the rest of the community!

## 🏅 Acknowledgments

Contributors are the heartbeat of this project! We will add a contributors list soon to acknowledge the hard work and dedication of everyone who contributes.
