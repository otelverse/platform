# Security Policy

## Supported Versions

Currently, only the latest release of OTelVerse is officially supported for security updates. 

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of OTelVerse seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them by sending an email to `security@otelverse.dev`.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:
* The type of vulnerability (e.g., XSS, SQL injection).
* The steps to reproduce the vulnerability.
* The potential impact of the vulnerability.
* Any other relevant information or proof-of-concept code.

## Security Practices

We employ several practices to maintain the security of the project:
* **Automated Scanning**: We run `gosec`, `cargo audit`, and `npm audit` on every push and pull request.
* **Least Privilege**: Our Helm charts and Docker containers are configured to run with dropped capabilities and non-root users where possible.
* **Dependencies**: We regularly update dependencies to their latest secure versions.
