# 🦸🏼🦸🏾‍♂️ index.html 🦸🏾‍♀️🦸🏻

file for experimenting to publish a web page.

# 🦸🏼🦸🏾‍♂️ Community dApps for Polymer 🦸🏾‍♀️🦸🏻

Welcome to the official repository for [Polymer](https://polymerlabs.org) community demo applications! This repository serves as a centralized hub for the demo dApps created by the Polymer community!

We highly encourage our community to build new demos showcasing the capabilities and use cases of Polymer x [IBC](https://ibcprotocol.dev) interoperability.

To help the visibility of these projects, developers can choose to add their project to his repo in several ways.

## 🤝 Contributing to the community demo dApp repo

We welcome and encourage contributions from our community! Here’s how you can contribute.

### Option 1: Direct Contribution

You can add the code of your project directly to the repo. We recommend however to use Option 2 using git submodules to keep the repo lightweight.

1. **Fork the Repository:** Start by forking this repository.
2. **Add Your Demo App:** Place your demo app in the `/community` directory (separate directory for your project).
3. **Create a Pull Request:** Once you've added your demo, create a pull request to the main repository with a detailed description of your app.

### Option 2: Adding as a Git Submodule

To add your repository as a git submodule:

1. **Clone the Main Repository:** If you haven't already, clone this repository:
   ```
   git clone [Main Repository URL]
   ```
2. **Add Your Repository as a Submodule:**
   ```
   git submodule add [Your Repository URL] community/[Your Project Name]
   ```
3. **Commit and Push the Changes:**
   ```
   git commit -m "Added [Your Project Name] as a submodule"
   git push
   ```
4. **Create a Pull Request:** Submit a pull request with your changes.

### Option 3: External Repository Reference

If you prefer to maintain your demo in your own repository, you can add a reference to it in the **`explore-apps.md`** file you'll find in the root of the repo. This contains curated list of community projects. It includes references to projects maintained in the `/community` directory and links to external repositories.

## 📚 Documentation

Be sure to add clear documentation and scripts when adding a project to maximize its usefulness to the rest of the community!

## 🏅 Acknowledgments

Contributors are the heartbeat of this project! We will add a contributors list soon to acknowledge the hard work and dedication of everyone who contributes.
