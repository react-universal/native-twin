# Autocomplete

If you want to use className autocomplete, you need to follow the steps below.

## Config by code editors

### VS Code

1. Install [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension.
2. In your _vscode/workspaces.code-workspace_ file add the following code:

```json
{
  "settings": {
    "tailwindCSS.classAttributes": ["className", "tw", "variants"],
    "tailwindCSS.experimental.configFile": {
      "../apps/web/tailwind.config.js": ["../apps/**/*", "../packages/**/*"] // TODO: Update this line
    }
  }
}
```

**`tailwindCSS.experimental.configFile` structure**

```
Key: tailwind_config_relative_path
Value: array_of_workspaces_relative_paths
```

3. You got it! 🥳
