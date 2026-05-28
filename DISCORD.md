# OTelVerse Discord Server Setup

This document provides instructions for setting up and managing the official OTelVerse Discord server.

## Server Structure

Create the following channels to keep the community organized:

### Category: Information
- **#welcome**: Read-only channel where a welcome bot greets new members.
- **#announcements**: Read-only channel for release notes, community updates, and project news.

### Category: General
- **#general**: For general observability and OTelVerse discussion.
- **#showcase**: Where users can show off their pipelines, custom dashboards, and chaos experiments.

### Category: Support
- **#getting-started**: Help for new users trying to run the integration kit.
- **#help-support**: General troubleshooting and Q&A.

### Category: Development
- **#contributing**: Discussion for people who want to contribute code to the OTelVerse monorepo.
- **#maintainers**: Private channel for core maintainers.

## Roles
Set up the following roles in Server Settings -> Roles:
- `@maintainer` (Admin permissions, colored RED)
- `@contributor` (For anyone who has merged a PR, colored BLUE)
- `@community` (Default role for all joined members)

## Welcome Bot Setup
1. Invite a bot like MEE6 or Dyno to the server.
2. Configure it to send a welcome message in `#welcome`.
   *Example message*: "Welcome to the OTelVerse community! Check out `#getting-started` if you need help, and feel free to introduce yourself in `#general`."
3. (Optional) Set the bot to automatically assign the `@community` role to new users.

## Generating the Permanent Invite Link
1. Click the invite button next to the `#general` channel.
2. Click "Edit invite link".
3. Set "Expire After" to **Never** and "Max number of uses" to **No limit**.
4. Generate a new link. 
5. Set this link as the `DISCORD_INVITE` variable in your community materials and update the badge in the `README.md`.
