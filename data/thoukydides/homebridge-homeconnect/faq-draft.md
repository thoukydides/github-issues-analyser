# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Home Connect](#home-connect)**
  - **[Home Connect or SingleKey ID Authorisation Issues](#home-connect-or-singlekey-id-authorisation-issues)**
    - [Why is the plugin not starting or failing to show an authorisation URL?](#why-is-the-plugin-not-starting-or-failing-to-show-an-authorisation-url)
    - [Why does authorisation fail with `invalid_request` or `request rejected by client authorization authority`?](#why-does-authorisation-fail-with-invalid_request-or-request-rejected-by-client-authorization-authority)
    - [Why does authorisation fail with `invalid_client`, `grant_type is invalid`, `unauthorized_client`, or `client has limited user list - user not assigned to client`?](#why-does-authorisation-fail-with-invalid_client-grant_type-is-invalid-unauthorized_client-or-client-has-limited-user-list---user-not-assigned-to-client)
    - [Why does the authorisation link expire or fail with an `expired_token` error?](#why-does-the-authorisation-link-expire-or-fail-with-an-expired_token-error)
    - [Why does authorisation fail with `access_denied`, `device authorization session has expired`, or `login session expired`?](#why-does-authorisation-fail-with-access_denied-device-authorization-session-has-expired-or-login-session-expired)
    - [Why does authorisation fail with a `403 Forbidden` error?](#why-does-authorisation-fail-with-a-403-forbidden-error)
    - [How do I configure the plugin for a Home Connect account in Mainland China?](#how-do-i-configure-the-plugin-for-a-home-connect-account-in-mainland-china)
  - **[Home Connect API Errors](#home-connect-api-errors)**
    - [Why does the log show `429 Too Many Requests`, `1000 calls in 1 day reached`, or a message like `Waiting ... before issuing Home Connect API request`?](#why-does-the-log-show-429-too-many-requests-1000-calls-in-1-day-reached-or-a-message-like-waiting--before-issuing-home-connect-api-request)
    - [Why does my appliance show a `409 Conflict` error?](#why-does-my-appliance-show-a-409-conflict-error)
    - [Why does my appliance show as `Not Responding` in the Home app when turned off?](#why-does-my-appliance-show-as-not-responding-in-the-home-app-when-turned-off)
    - [Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?](#why-does-the-power-button-not-work-or-return-a-bshcommonerrorwriterequestbusy-error)
    - [What do `Gateway Timeout`, `Proxy Error`, or `Timeout on Home Connect subsystem` messages mean?](#what-do-gateway-timeout-proxy-error-or-timeout-on-home-connect-subsystem-messages-mean)
    - [Why does the log show `Home Connect subsystem not available` or a `503` error?](#why-does-the-log-show-home-connect-subsystem-not-available-or-a-503-error)
    - [Why am I seeing network errors like `EAI_AGAIN`, `ENOTFOUND`, `ETIMEDOUT`, or `ENETUNREACH`?](#why-am-i-seeing-network-errors-like-eai_again-enotfound-etimedout-or-enetunreach)
    - [Why is the log flooded with errors during a Home Connect outage?](#why-is-the-log-flooded-with-errors-during-a-home-connect-outage)
    - [Why does my multi-cavity oven show a `BSH.Common.Error.InvalidUIDValue` error?](#why-does-my-multi-cavity-oven-show-a-bshcommonerrorinvaliduidvalue-error)
    - [Why does starting the Silence program on my dishwasher fail?](#why-does-starting-the-silence-program-on-my-dishwasher-fail)
  - **[Local/Remote Control](#localremote-control)**
    - [Why does my appliance show `No Response` when I try to start a program?](#why-does-my-appliance-show-no-response-when-i-try-to-start-a-program)
    - [What does `LockedByLocalControl` or "Local Intervention" mean?](#what-does-lockedbylocalcontrol-or-local-intervention-mean)
    - [Why does my appliance report `Control scope has not been authorised` or `insufficient_scope`?](#why-does-my-appliance-report-control-scope-has-not-been-authorised-or-insufficient_scope)
    - [Why is there a delay when controlling appliances via HomeKit?](#why-is-there-a-delay-when-controlling-appliances-via-homekit)
    - [Why does my appliance fail to start when using the switch in the Home app?](#why-does-my-appliance-fail-to-start-when-using-the-switch-in-the-home-app)
    - [Why does my appliance frequently show `Disconnected (setting On error status)`?](#why-does-my-appliance-frequently-show-disconnected-setting-on-error-status)
  - **[Programs and Options](#programs-and-options)**
    - [Why does the log show `Unexpected fields`, `(unrecognised)` values, or code blocks?](#why-does-the-log-show-unexpected-fields-unrecognised-values-or-code-blocks)
    - [Why are some appliance features, programs, or options missing or unavailable?](#why-are-some-appliance-features-programs-or-options-missing-or-unavailable)
    - [Why are fan controls missing for my integrated venting hob?](#why-are-fan-controls-missing-for-my-integrated-venting-hob)
    - [Why does the log say a selected program is not supported by the Home Connect API?](#why-does-the-log-say-a-selected-program-is-not-supported-by-the-home-connect-api)
    - [Why is my appliance stuck during initialisation, showing as `Not Responding`, or missing all options?](#why-is-my-appliance-stuck-during-initialisation-showing-as-not-responding-or-missing-all-options)
    - [Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?](#why-do-i-see-an-invalidstepsize-or-sdkerrorinvalidoptionvalue-error)
    - [Why are Pause and Resume features missing or inconsistent?](#why-are-pause-and-resume-features-missing-or-inconsistent)
    - [Why doesn't the plugin automatically turn on my coffee machine when I start a beverage program?](#why-doesnt-the-plugin-automatically-turn-on-my-coffee-machine-when-i-start-a-beverage-program)
    - [Why is the `Active Program` switch failing or unavailable in HomeKit?](#why-is-the-active-program-switch-failing-or-unavailable-in-homekit)
    - [How can I trigger the Identify function in the Eve app?](#how-can-i-trigger-the-identify-function-in-the-eve-app)
    - [How can I enable dishwasher options like Half Load, Extra Dry, or Efficient Dry in HomeKit?](#how-can-i-enable-dishwasher-options-like-half-load-extra-dry-or-efficient-dry-in-homekit)
    - [Why does my appliance turn on automatically or Homebridge startup stall?](#why-does-my-appliance-turn-on-automatically-or-homebridge-startup-stall)
    - [Which settings are used for programs started without specific options?](#which-settings-are-used-for-programs-started-without-specific-options)
    - [Why do my oven programs only run for one minute?](#why-do-my-oven-programs-only-run-for-one-minute)
    - [Why is the scheduled start time for my appliance program not being honoured?](#why-is-the-scheduled-start-time-for-my-appliance-program-not-being-honoured)
    - [How can I reduce the number of switches created for appliance programs?](#how-can-i-reduce-the-number-of-switches-created-for-appliance-programs)
    - [What does the log message `Using expired cache result` mean?](#what-does-the-log-message-using-expired-cache-result-mean)
    - [Why does setting my hood fan to `Auto` in the Home app not immediately turn it on?](#why-does-setting-my-hood-fan-to-auto-in-the-home-app-not-immediately-turn-it-on)
    - [Why does the plugin log unrecognised `PowerState` values like `Undefined` or `MainsOff`?](#why-does-the-plugin-log-unrecognised-powerstate-values-like-undefined-or-mainsoff)
  - **[Appliance Status](#appliance-status)**
    - [Why does my appliance status appear stuck or show as offline in HomeKit?](#why-does-my-appliance-status-appear-stuck-or-show-as-offline-in-homekit)
    - [Why is my appliance unresponsive in Homebridge but working in the Home Connect app?](#why-is-my-appliance-unresponsive-in-homebridge-but-working-in-the-home-connect-app)
    - [Why do my appliances remain visible in the Home app when they are turned off or offline?](#why-do-my-appliances-remain-visible-in-the-home-app-when-they-are-turned-off-or-offline)
    - [Why does the log show a program running or time remaining when my appliance is off?](#why-does-the-log-show-a-program-running-or-time-remaining-when-my-appliance-is-off)
    - [Why does my dishwasher trigger a Program Finished event when it reconnects?](#why-does-my-dishwasher-trigger-a-program-finished-event-when-it-reconnects)
    - [Why is my Homebridge log filling up with oven `Event STATUS` temperature messages?](#why-is-my-homebridge-log-filling-up-with-oven-event-status-temperature-messages)
    - [Why does the log periodically show `Found X appliances (0 added, 0 removed)`?](#why-does-the-log-periodically-show-found-x-appliances-0-added-0-removed)
    - [Why is the dishwasher door control read-only in HomeKit?](#why-is-the-dishwasher-door-control-read-only-in-homekit)
    - [Can I use data from the Home Connect status page for automations or scripts?](#can-i-use-data-from-the-home-connect-status-page-for-automations-or-scripts)
- **[Apple HomeKit](#apple-homekit)**
  - **[HomeKit Accessories, Services, and Characteristics](#homekit-accessories-services-and-characteristics)**
    - [Why does the Apple Home app not show the remaining time or detailed status for my appliance?](#why-does-the-apple-home-app-not-show-the-remaining-time-or-detailed-status-for-my-appliance)
    - [Why are the power and program switches for my appliance in a random order in HomeKit?](#why-are-the-power-and-program-switches-for-my-appliance-in-a-random-order-in-homekit)
    - [Why can I not hide certain switches, or why do they remain visible or unresponsive after being disabled?](#why-can-i-not-hide-certain-switches-or-why-do-they-remain-visible-or-unresponsive-after-being-disabled)
    - [Why is temperature control not supported for fridges, freezers, or ovens?](#why-is-temperature-control-not-supported-for-fridges-freezers-or-ovens)
    - [Why is my appliance door appearing as a `Door` service or security device instead of a `Contact Sensor`?](#why-is-my-appliance-door-appearing-as-a-door-service-or-security-device-instead-of-a-contact-sensor)
    - [Why can I not set the alarm timer or `AlarmClock` setting on my appliance?](#why-can-i-not-set-the-alarm-timer-or-alarmclock-setting-on-my-appliance)
    - [Why do multiple program switches appear with identical names in the Home app?](#why-do-multiple-program-switches-appear-with-identical-names-in-the-home-app)
    - [Why can I not see or control the child lock for my appliance in the Apple Home app?](#why-can-i-not-see-or-control-the-child-lock-for-my-appliance-in-the-apple-home-app)
    - [Why is the hood boost mode a separate switch instead of part of the fan speed control?](#why-is-the-hood-boost-mode-a-separate-switch-instead-of-part-of-the-fan-speed-control)
    - [Can the hood control buttons on a Home Connect hob be used to trigger HomeKit automations?](#can-the-hood-control-buttons-on-a-home-connect-hob-be-used-to-trigger-homekit-automations)
    - [Why can I only control power and fan speed for my Home Connect air conditioner?](#why-can-i-only-control-power-and-fan-speed-for-my-home-connect-air-conditioner)
    - [Why are appliance lights mapped as lightbulbs instead of switches?](#why-are-appliance-lights-mapped-as-lightbulbs-instead-of-switches)
    - [Why is the colour temperature on my hood inverted?](#why-is-the-colour-temperature-on-my-hood-inverted)
  - **[Notifications & Events](#notifications--events)**
    - [Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?](#why-does-my-appliance-appear-as-stateless-programmable-switch-buttons-with-numeric-labels)
    - [Why does the Home app show two (or more) tiles for one appliance?](#why-does-the-home-app-show-two-or-more-tiles-for-one-appliance)
    - [How do I get appliance notifications?](#how-do-i-get-appliance-notifications)
    - [How can I disable HomeKit notifications for door events?](#how-can-i-disable-homekit-notifications-for-door-events)
  - **[Siri](#siri)**
    - [How do I control my hood fan speed using Siri?](#how-do-i-control-my-hood-fan-speed-using-siri)
- **[Compatibility and Integration](#compatibility-and-integration)**
  - **[Third-party Platforms](#third-party-platforms)**
    - [Is this plugin compatible with HOOBS?](#is-this-plugin-compatible-with-hoobs)
    - [Will there be a Home Assistant version of this plugin?](#will-there-be-a-home-assistant-version-of-this-plugin)
    - [Why are features available in IFTTT or the official app missing from this plugin?](#why-are-features-available-in-ifttt-or-the-official-app-missing-from-this-plugin)
  - **[Plugin Installation and Configuration](#plugin-installation-and-configuration)**
    - [Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?](#why-do-i-get-an-npm-err-enotempty-error-when-installing-or-updating-the-plugin)
<!-- TOC-END -->

## Home Connect

### Home Connect or SingleKey ID Authorisation Issues

#### Why is the plugin not starting or failing to show an authorisation URL?

<!-- INCLUDES: issue-28-b9b5 issue-60-6eaf -->
If the plugin does not provide an authorisation URL or appear to load, it is usually due to a configuration error in `config.json` preventing Homebridge from identifying the platform.

First, check the Homebridge logs for `[HomeConnect] Initialising HomeConnect platform...`. If this line is missing, verify your configuration:
- **Incorrect Nesting**: Ensure the `HomeConnect` platform block is a top-level item within the `platforms` array and not accidentally nested inside another plugin's configuration.
- **Missing Client ID**: The plugin requires the `clientid` property to be set. If missing, it will log an error and stop initialisation.

#### Why does authorisation fail with `invalid_request` or `request rejected by client authorization authority`?

<!-- INCLUDES: issue-82-05c8 issue-86-3b75 issue-117-1a0f -->
These errors are returned when the provided `Client ID` is not recognised or is improperly formatted. Check the following:

- **Incorrect Format**: The `Client ID` must be exactly 64 hexadecimal characters. Ensure no extra spaces, quotes, or hidden characters were included when copying the ID from the developer portal.
- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Production Credentials**: The default "API Web Client" credentials provided in the portal are for the appliance simulator only. If you are connecting physical appliances, you must create a new application in the developer portal to obtain a production `Client ID`.

#### Why does authorisation fail with `invalid_client`, `grant_type is invalid`, `unauthorized_client`, or `client has limited user list - user not assigned to client`?

<!-- INCLUDES: issue-51-db9a issue-60-3cca issue-115-c713 issue-117-1a0f issue-162-1a03 -->
These errors are returned by the Home Connect API and indicate a configuration mismatch in the [Home Connect Developer Portal](https://developer.home-connect.com/):

Ensure the `Client ID` in your Homebridge configuration exactly matches the one in the portal, and that the application is configured as follows:
- **Home Connect user account for testing**: This must exactly match the email address used for your Home Connect mobile app.
- **OAuth Flow**: Device Flow.
- **Success Redirect**: Leave blank (or set to a valid URL).
- **One Time Token Mode**: Disabled.
- **Proof Key for Code Exchange**: Disabled.
- **Sync to China**: Disabled, unless you are using the Home Connect servers in China.

If the configuration is correct but errors persist, try deleting and recreating the application in the developer portal to reset its state.

#### Why does the authorisation link expire or fail with an `expired_token` error?

<!-- INCLUDES: issue-97-1958 issue-125-9208 issue-151-9c3a -->
Authorisation links and their associated device codes are only valid for a limited time. If this window is exceeded, or if a link is used more than once, the Home Connect API will return `expired_token` or `the code entered is invalid or has expired`.

If the authorisation fails:
- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Check for Stale Links**: Ensure you are using the most recent URL from the Homebridge logs or the plugin configuration UI. 
- **Wait for Auto-Retry**: The plugin handles these errors by waiting 60 seconds before automatically generating a new authorisation attempt. 
- **Single Use**: The `device_code` is invalidated as soon as it is successfully used. Do not attempt to reuse old authorisation URLs.

#### Why does authorisation fail with `access_denied`, `device authorization session has expired`, or `login session expired`?

<!-- INCLUDES: issue-82-2ddc issue-121-ccc6 issue-295-521b issue-299-15d1 -->
These errors typically occur during the login process and can be caused by account verification issues or a known bug in the Home Connect authorisation servers:

- **Account Verification**: Ensure your SingleKey ID account is fully configured. It is often necessary to log out of the official Home Connect mobile app and log back in to accept updated terms of use or verify the account, ensuring that you accept all necessary agreements.
- **Internationalisation Bug**: A bug in the Home Connect and SingleKey ID servers can cause authorisation to fail if your browser's preferred language is set to a locale other than English. This often results in a `login session expired` error or prevents the password prompt from appearing after the username is entered. To resolve this set your web browser's preferred language to English (`en`). Refresh the page and attempt the authorisation again. You can revert these settings once the plugin has successfully obtained its tokens.

To complete the process once initialised:

1. Find the URL in the logs (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=XXXX-XXXX`).
2. Open the full URL in a browser and sign in with the SingleKey ID account used in the official Home Connect mobile app.
3. Approve the request. The plugin will automatically detect completion and save the tokens.

#### Why does authorisation fail with a `403 Forbidden` error?

<!-- INCLUDES: issue-275-c0e7 -->
This error typically indicates that the Home Connect API is geo-blocked in your region (for example, in Russia). This results in a `403 Forbidden` response when the plugin attempts to connect to authorisation endpoints such as `POST /security/oauth/device_authorization`. This is a restriction imposed by the service provider or regional network infrastructure and cannot be bypassed by the plugin. Users in affected regions may experience similar connectivity issues with the official Home Connect app unless a VPN is used.

#### How do I configure the plugin for a Home Connect account in Mainland China?

<!-- INCLUDES: issue-311-bcea -->
Home Connect appliances registered in Mainland China use a dedicated regional API endpoint (`api.home-connect.cn`) and require specific configuration both in the Developer Portal and the plugin:

1. Log in to the [Home Connect Developer Portal](https://developer.home-connect.com/) and ensure your application has the **Sync to China** option enabled.
2. In the Homebridge UI, locate the plugin settings and set the **Server Location** to **China**.
3. If you are configuring the plugin manually via `config.json`, add `"china": true` to the plugin configuration object.

Note that the China Mainland server may use different login credentials, such as a mobile number, which is supported once the plugin is directed to the correct regional endpoint.

### Home Connect API Errors

#### Why does the log show `429 Too Many Requests`, `1000 calls in 1 day reached`, or a message like `Waiting ... before issuing Home Connect API request`?

<!-- INCLUDES: issue-39-aa6b issue-268-601f issue-269-720a issue-378-832c -->
The Home Connect API enforces very strict [rate limits](https://api-docs.home-connect.com/general/?#rate-limiting). Exceeding any of these limits triggers a `429 Too Many Requests` error and a lockout for up to 24 hours. The plugin handles this by pausing all API requests until the `retry-after` time returned by the API, displaying a countdown in the logs (e.g. `Waiting 5 hours 23 minutes before issuing Home Connect API request`).

Most of the limits reset after either 1 or 10 minutes, but there is also a daily quota of 1,000 requests. While the plugin manages requests efficiently, certain conditions can cause these limits to be reached rapidly:

1. **Frequent Homebridge Restarts**: Each time the plugin starts, it must issue multiple API requests to discover the features, programs, and current state of every connected appliance. Frequent restarts during configuration or due to system instability will quickly consume the daily allowance. Check your Homebridge log for frequent restarts. If this is the issue then ensure Homebridge is stable, avoid unnecessary reboots, and (if possible) run this plugin in its own **child bridge**.
2. **Unstable Appliance Connectivity**: When an appliance disconnects and reconnects to your Wi-Fi, the plugin must issue several API requests to re-synchronise its state. A single appliance with an unreliable network connection can trigger enough `CONNECTED` events to exhaust the quota. Check your logs for repeated `DISCONNECTED` or `CONNECTED` messages. If found, improve the Wi-Fi coverage for that specific appliance. Note that appliance Wi-Fi hardware is often lower quality than that found in smartphones or laptops.

#### Why does my appliance show a `409 Conflict` error?

<!-- INCLUDES: issue-1-2d19 issue-22-3aca issue-40-f8f5 issue-61-1c74 issue-83-53f1 issue-99-fe79 issue-113-d74c issue-155-6e9f issue-186-6cfd issue-208-c4fd issue-325-3294 issue-374-e780 issue-378-832c -->
The Home Connect API uses `409 Conflict` errors for a wide variety of failures that result in a request being rejected. The error message usually provides more details of the specific reason. Some of the more common cases are:

- `SDK.Error.HomeAppliance.Connection.Initialization.Failed`: This indicates that the appliance is not connected to the Home Connect cloud servers. Note that the official Home Connect app may still function by communicating directly via your local Wi-Fi network, whereas this plugin is restricted to using the official cloud API. To troubleshoot:
  1. In the official app, navigate to the appliance's **Settings** > **Network** and ensure all three connection stages (appliance-app, appliance-cloud, and app-cloud) are green.
  2. Test the official app while your phone's Wi-Fi is disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
  3. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.
  4. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

- `SDK.Error.InvalidSettingState`: This occurs when a setting is currently read-only or unavailable. It is often caused by inconsistencies in the API regarding power state capabilities (common with fridges, freezers, and hobs). It can also indicate that **Remote Start** or **Remote Control** has been disabled in the appliance's physical settings menu. While the API usually returns specific errors like `BSH.Common.Error.RemoteControlNotActive`, some appliances (particularly coffee makers) return `SDK.Error.InvalidSettingState` instead. On other appliances, it frequently indicates a maintenance message is displayed on the physical screen (e.g. "Change water filter" or "Descaling required") that requires manual confirmation before remote control can resume.

- `SDK.Error.WrongOperationState`: This indicates that the appliance is in an incorrect state for the requested operation, such as attempting to start a program while another is already running or if the appliance is currently performing a self-cleaning cycle.

- `SDK.Error.ProgramNotAvailable`: This is returned when you attempt to start a program that the API considers unavailable for remote execution. This may be due to appliance settings, safety features (e.g. local control active), or firmware bugs.

- `BSH.Common.Error.400.BadRequest`: This often indicates an attempt to stop a program that is already stopped. This typically occurs when multiple program switches are grouped into a single tile in the Home app, resulting in them all being toggle together.

For details of other `409` errors refer to the [Home Connect API Errors](https://api-docs.home-connect.com/general/#api-errors) documentation.

#### Why does my appliance show as `Not Responding` in the Home app when turned off?

<!-- INCLUDES: issue-251-b8f0 -->
The physical power button on some Home Connect appliances (mostly commonly washing machines and tumble dryers) also disconnects power from their internal Wi-Fi module. When this occurs, the Home Connect API cannot distinguish between the appliance being switched off, disconnected from the mains, or losing its internet connection.

The API does not provide any indication of whether an appliance supports a soft power off state that maintains a network connection. Hence, it is not possible for the plugin to identify whether an appliance that the API reports as `DISCONNECTED` has been intentionally switched off or has lost contact with the Home Connect servers for other reasons. The plugin prioritises technical accuracy, so reports this as  `SERVICE_COMMUNICATION_FAILURE` to HomeKit, which the Apple Home app displays as `Not Responding`.

Faking a "Power Off" state when the appliance is unreachable would misrepresent the appliance's true status. If the appliance does actually have connectivity problems then it may be powered on. Most Home Connect appliances do maintain Wi-Fi connectivity when switched off, so reporting `SERVICE_COMMUNICATION_FAILURE` correctly distinguishes between power off and failure to connect to the Home Connect servers.

#### Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?

<!-- INCLUDES: issue-112-6c3a issue-116-1125 -->
The `Busy` error is returned by the Home Connect cloud when an appliance cannot process a command, often because it requires physical interaction (e.g. filling a water tank or closing a door). If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required. This issue may also be caused by a transient issue with the Home Connect cloud service itself; check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

Failure to power certain ovens on or off is a known bug in the Home Connect API affecting specific models. If the appliance is physically ready but the power command is rejected, this is an external platform limitation. You should report such issues to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's E-Nr (part number).

#### What do `Gateway Timeout`, `Proxy Error`, or `Timeout on Home Connect subsystem` messages mean?

<!-- INCLUDES: issue-11-73ec issue-13-549a issue-19-6154 -->
Errors such as `SDK.Error.504.GatewayTimeout` (often logged as `Timeout on Home Connect subsystem`) or `Proxy Error` indicate that the Home Connect cloud servers are experiencing internal issues, high latency, or have unexpectedly terminated the event stream. 

Because the Home Connect infrastructure acts as a bridge between the plugin and the physical appliance, the plugin is dependent on their cloud services being responsive. These are server-side problems within the Home Connect infrastructure and cannot be resolved by the plugin. You may observe the appliance appearing connected in the official Home Connect app but failing when controlled via HomeKit, as the official app can sometimes communicate directly over your local network while the API is restricted to cloud communication. The device may also briefly switch to `Not Available` immediately after a command is sent during these periods.

**What you can do**:
- Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for known outages
- Wait for automatic recovery (typically 5-30 minutes)
- If the issue persists for hours, restart Homebridge to force a fresh connection

#### Why does the log show `Home Connect subsystem not available` or a `503` error?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available [503]` indicates a server-side maintenance issue or infrastructure outage. This is not a fault with the plugin or your local configuration. When this happens, the official Home Connect mobile application may also fail to connect. The issue is typically transient and is usually resolved by the Home Connect team within a few hours. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### Why am I seeing network errors like `EAI_AGAIN`, `ENOTFOUND`, `ETIMEDOUT`, or `ENETUNREACH`?

<!-- INCLUDES: issue-50-0475 issue-137-6081 issue-276-cc5b issue-351-80b2 -->
These are all standard networking errors indicating a DNS name resolution failure. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers (`api.home-connect.com`). This is usually caused by a transient loss of internet connectivity, a local router performing a reboot, or network misconfiguration.

To resolve this issue, ensure your Homebridge server has a stable internet connection and check the following:

1. **Diagnostic Commands**: Test DNS resolution from a shell on the same system using `dig api.home-connect.com` or `nslookup api.home-connect.com`.
2. **DNS Provider**: If your system is configured to use your router as its DNS server via DHCP, try manually setting a public DNS provider (such as Google's `8.8.8.8` or Cloudflare's `1.1.1.1`) in your operating system's network configuration.
3. **Network Filtering**: Verify if any local firewall or DNS filtering (like Pi-hole or AdGuard Home) is blocking requests to `api.home-connect.com` or its underlying Amazon Web Services (AWS) endpoints.

If you are using a Docker container then perform these diagnostics within the container environment, and additionally try:

1. **Address DNS/IPv6**: Problems frequently arise when IPv6 is enabled but not correctly routed. Try the following:
    - Disable IPv6 for the container using `--sysctl net.ipv6.conf.all.disable_ipv6=1`.
    - Force the container to use a specific DNS provider by adding `--dns 1.1.1.1` to your `docker run` command.
    - Ensure any host firewall rules are not blocking outbound traffic from the container network.
2. **Network Mode**: Consider switching the container to `host` network mode to bypass Docker's internal bridge networking if issues persist.

The plugin will automatically attempt to reconnect once the network connection is restored.

#### Why is the log flooded with errors during a Home Connect outage?

<!-- INCLUDES: issue-34-01de -->
When the Home Connect API experiences a service outage, the plugin may rapidly log attempts to restart the event stream.

**This is expected behaviour.** The plugin is designed to recover automatically as soon as the service resumes.

Technical rationale:

1. **State Consistency**: The plugin relies on the event stream for real-time updates. Frequent reconnection attempts ensure the plugin synchronises with your appliances as soon as the service resumes, minimising stale data in HomeKit.
2. **Diagnostic Integrity**: Detailed logs of every connection attempt and the specific error returned (e.g. `Service Temporarily Unavailable`) are vital for diagnosing complex or intermittent API failures.
3. **API Rate Limits**: The plugin is optimised to stay within rate limits. Introducing manual delays or 'wait' logic adds complexity that could interfere with the normal recovery process.

While this results in a high volume of logs during an outage, it ensures the plugin recovers as reliably as possible without manual intervention.

#### Why does my multi-cavity oven show a `BSH.Common.Error.InvalidUIDValue` error?

<!-- INCLUDES: issue-2-c470 -->
This error typically occurs with multi-cavity appliances where only the main oven supports Home Connect functionality. If the Home Connect API continues to advertise the secondary oven despite it lacking remote capabilities, queries for its programs will fail with `BSH.Common.Error.InvalidUIDValue`. 

The plugin handles this gracefully by ignoring the error and disabling program control for the unsupported cavity. This is an issue with the Home Connect API's device enumeration, which is occasionally addressed by manufacturer server-side updates.

#### Why does starting the Silence program on my dishwasher fail?

<!-- INCLUDES: issue-374-e780 -->
Some dishwasher appliances offer two ways to reduce noise: a dedicated **Silence** program (e.g. `Dishcare.Dishwasher.Program.NightWash`) and a **Silence on Demand** option (`Dishcare.Dishwasher.Option.SilenceOnDemand`) that modifies the operation of other programs.

The Home Connect API restricts appliances to one active program at a time. If you attempt to start the `NightWash` program while another program is already running, the API returns a `409 Conflict` error with `SDK.Error.WrongOperationState`.

This plugin supports configuration of program options to be used when starting a new program, including the `SilenceOnDemand` option for programs that support it. However, it does not implement mapping of program options to dedicated HomeKit services to enable changing them for a program that is already running. This is a deliberate design choice because the API does not clearly signal which options are valid to modify dynamically, and there is no appropriate way to map these temporary, time-limited behaviours to the standard HomeKit service model.

### Local/Remote Control

#### Why does my appliance show `No Response` when I try to start a program?

<!-- INCLUDES: issue-79-56b4 -->
To protect your safety and prevent your appliance from starting unexpectedly:

- **Remote Start must be physically enabled** on the appliance itself before remote control is allowed
- This cannot be set via the API
- Some appliances automatically expire Remote Start after a period of time or when you open the appliance door

If you attempt to start a program via HomeKit when Remote Start is disabled, the plugin intentionally reports an error to HomeKit, which the Apple Home app displays as `No Response`. Reporting "Success" instead would be misleading, as the appliance would not actually start.

This plugin exposes the appliance's Remote Start status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### What does `LockedByLocalControl` or "Local Intervention" mean?

<!-- INCLUDES: issue-2-206a issue-16-bbca -->
If you see an error like `Request cannot be performed temporarily! due to local actuated user intervention [BSH.Common.Error.LockedByLocalControl]`, it means the appliance is currently being operated via its physical buttons or knobs. This is a restriction built into the appliance firmware and the Home Connect API; it cannot be bypassed by the plugin.

To prevent conflicting commands and ensure safety, the Home Connect API blocks all remote control while a user is physically interacting with the appliance. This lockout usually clears a few seconds after you stop touching the controls, although some appliances may maintain the lockout for a longer period during certain maintenance cycles or until a specific manual interaction is completed.

This plugin exposes the appliance's Local Control status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### Why does my appliance report `Control scope has not been authorised` or `insufficient_scope`?

<!-- INCLUDES: issue-30-450a -->
This error occurs because the Home Connect API requires specific authorisation scopes to control **Oven** or **Hob** programs. While these were previously restricted, they were made available to independent developers in March 2021. If you authorised the plugin's connection to Home Connect prior to this then force a re-authorisation:

1. Stop Homebridge.
2. Delete the cached token file in the plugin's persistent storage directory (usually `~/.homebridge/homebridge-homeconnect/persist/94a08da1fecbb6e8b46990538c7b50b2`).
3. Restart Homebridge.
4. Follow the authorisation link provided in the logs or Homebridge UI to sign in again.

Note that `FridgeFreezer-Images` scope remains restricted and hence is not supported by this plugin. The Home Connect API documentation describes it as requiring an "Additional Partner Agreement".

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Furthermore, Home Connect imposes strict rate limits, such as a maximum of 5 program starts per minute. To ensure reliability and avoid being blocked, the plugin serialises multiple characteristic changes (e.g. simultaneously turning on a light and adjusting brightness) into sequential API calls. Additional delays are inserted if the API indicates that a rate limit has been exceeded. This results in a noticeable but necessary lag between the HomeKit command and the appliance's physical response.

#### Why does my appliance fail to start when using the switch in the Home app?

<!-- INCLUDES: issue-149-a6ae -->
For most appliances this plugin exposes multiple `Switch` services to HomeKit, including:

- **Power**: Controls the standby state of the machine.
- **Active Program**: Starts or stops the currently selected program.
- **Individual Programs**: Start (or select) a specific named program.
- **Modes**: Any settings that the appliance supports, such as `SabbathMode` or `SuperModeFreezer`.

By default, the Apple Home app may group these separate services into a single tile. Toggling this combined tile attempts to activate all switches simultaneously, which results in conflicting requests. The plugin attempts to detect and ignore such invalid actions.

**For example**: If your dishwasher has a Power switch, an Active Program switch, and three individual program switches (Eco, Intensive, Quick), toggling the combined tile tries to turn on power **and** start all three programs at once; an impossible operation.

To resolve this, you should configure the Home app to display these services individually using the Home app's **Show as Separate Tiles** option.

#### Why does my appliance frequently show `Disconnected (setting On error status)`?

<!-- INCLUDES: issue-306-b5fb -->
Frequent transitions between `Connected` and `Disconnected` states usually indicate transient communication interruptions between the plugin and the Home Connect cloud. This plugin relies entirely on the manufacturer's cloud-based API; if the connection between the appliance and the cloud, or the cloud and the plugin, is interrupted, the device must be reported as disconnected.

- **API Instability**: The Home Connect servers occasionally experience maintenance or instability. You can check the current status on the [Home Connect Server Status](https://homeconnect.thouky.co.uk/) page.
- **Local Network**: Weak Wi-Fi signals or intermittent internet drops can cause the appliance to lose its cloud heartbeat.

When these disconnections occur, the plugin logs the event and updates the HomeKit status to reflect that the device is unreachable. This is a reporting of the appliance's actual cloud state and cannot be resolved via plugin code changes.

#### 🚧 Why can I not enable remote start from HomeKit? 🚧

<!-- INCLUDES: issue-3-e7f1 -->
The `RemoteStart` and `RemoteControl` states are read-only via the Home Connect API for safety and security reasons. To use remote control features, you must physically interact with the appliance to enable remote start (usually via a button on the machine). This activation typically remains valid for a 24-hour window or until the door is opened. Because this is a security-related hardware restriction, it cannot be overridden or activated by third-party plugins.

#### 🚧 Why do I see an `insufficient_scope` error when trying to control my oven, hob, or fridge-freezer? 🚧

<!-- INCLUDES: issue-5-3245 -->
The Home Connect API restricts specific functionalities, notably the `Hob-Control`, `Oven-Control`, and `FridgeFreezer-Images` scopes, to approved business partners under separate agreements. These permissions are generally not granted to individual developer accounts or consumers.

Because of these API constraints, this plugin's support for these device categories is limited to:
* Power on/off control, where supported by both the appliance hardware and the Home Connect API.
* Read-only status monitoring.
* Receiving notification events.

Attempting to start or stop programs on these appliances via HomeKit will result in a `Home Connect API error: Insufficient scope for this resource [insufficient_scope]`. This is an external platform limitation rather than a defect in the plugin.

### Programs and Options

#### Why does the log show `Unexpected fields`, `(unrecognised)` values, or code blocks?

<!-- INCLUDES: issue-175-e941 issue-189-35bc issue-198-658c issue-199-2e94 issue-200-9f7a issue-202-9963 issue-203-2ddc issue-204-2f61 issue-205-1db7 issue-206-cf42 issue-207-4f2c issue-209-d7db issue-210-cc8e issue-212-38c3 issue-213-c06c issue-216-fa69 issue-217-41c5 issue-220-c9a6 issue-221-f53a issue-222-611c issue-223-87a6 issue-228-c1b3 issue-231-e5d9 issue-233-f1a2 issue-235-b061 issue-236-11a6 issue-237-74bf issue-238-902b issue-243-afde issue-244-beeb issue-246-85c6 issue-247-ab8a issue-248-683b issue-254-ab2e issue-255-2835 issue-257-721b issue-258-d2a3 issue-262-4486 issue-265-872d issue-266-7e59 issue-277-728a issue-278-e4b6 issue-279-b94c issue-281-83fc issue-282-dfda issue-283-981b issue-284-a2a6 issue-285-d7de issue-286-9e5b issue-287-a63b issue-291-e546 issue-297-f476 issue-301-9995 issue-305-c3b1 issue-307-94f6 issue-309-bfa9 issue-312-1263 issue-313-5c17 issue-314-f707 issue-317-9950 issue-320-c379 issue-324-386b issue-326-59db issue-330-44ae issue-331-ce23 issue-332-73b2 issue-337-3b2d issue-344-04d9 issue-345-48d8 issue-346-924f issue-347-c6a7 issue-349-8e1b issue-355-88d9 issue-356-30ea issue-357-c258 issue-365-e16b issue-369-fc94 issue-372-7a45 issue-373-0d05 issue-377-3b83 issue-379-2e76 issue-381-fa8e -->
The plugin includes a diagnostic mechanism to identify data from the Home Connect API that it does not yet recognise. This frequently occurs because the API implementation deviates from official documentation, or because new appliance models or firmware introduce undocumented features, programs, or options.

While unrecognised values usually do not prevent the plugin from functioning, the specific feature may be missing or unavailable in HomeKit until it is added to the plugin's internal schema. When this happens, the plugin generates a technical diagnostic block in the log file, delimited by lines of `=` characters and containing comments marked `// (unrecognised)`. This helps the maintainer update the plugin's definitions and map the missing information to HomeKit services.

If you observe these messages:

1. **Update the plugin**: Ensure you are running the latest version, as support for new values is added frequently.
2. **Report the values**: Wait approximately two minutes for the plugin to batch the data. Locate the URL provided in the log message immediately following the code block and click it to open a pre-populated GitHub issue.
3. **Provide the snippet**: Paste the entire technical diagnostic block from the log (including the `=` separators) into the **Log File** field of the issue template.

Once these identifiers are added to the plugin, the warning will disappear and the corresponding features will be correctly mapped to HomeKit.

#### Why are some appliance features, programs, or options missing or unavailable?

<!-- INCLUDES: issue-42-1683 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-94-e55f issue-122-9466 issue-157-61a1 issue-201-3565 issue-202-4160 issue-250-e41c issue-303-9e0f issue-316-e6c5 issue-368-b5fa issue-380-03ac -->
There are several reasons why features may be missing from the plugin or appear as `currently unavailable` or `advertised by appliance currently unavailable` in the logs:

- **Private API Limitations**: The official Home Connect app and certain partners (like IFTTT) use a private API with functionality not available to third-party developers. If a program or other feature is missing from the [official public API documentation](https://api-docs.home-connect.com), the plugin cannot access it.
- **Appliance Settings**: Some programs, such as `Sabbath` mode, often require being explicitly enabled in the physical appliance settings menu before they are exposed via the API.
- **Program Specifics**: Maintenance cycles (such as drum cleaning, rinsing, or descaling) and user-defined programs are frequently restricted or not advertised with full configuration options (like temperature or spin speed) via the public Home Connect API.
- **Operational Status**: A program may be reported as supported but currently unavailable if the appliance is busy, a cycle is already running, a door is open, or required consumables (water, detergent) are missing. This is a dynamic status provided by the Home Connect API based on the physical state of the machine.

If a program is unexpectedly missing, try powering the appliance on, manually selecting the affected program on the physical control panel, and leaving it idle for one minute. Then, trigger the plugin to re-read the details by using the HomeKit **Identify** method or restarting Homebridge. If the API continues to refuse access, you can request inclusion via [Home Connect Developer Support](https://developer.home-connect.com/support/contact).

#### Why are fan controls missing for my integrated venting hob?

<!-- INCLUDES: issue-363-2f13 -->
Extractor fans integrated into hobs (venting hobs) are not exposed by the Home Connect API as controllable features.

The Home Connect API is architected to support a single active program per appliance. Devices that support multiple simultaneous programs are exposed by the API as multiple appliances, e.g. the two cavities of dual ovens. The extractor fan in hood appliances operate as programs (e.g. `Cooking.Common.Program.Hood.Automatic`), so a hob with an integrated fan would need to expose a separate hood appliance for it to be controllable via the Home Connect API, which is not currently the case. Users affected by this should contact the [Home Connect developer team](https://developer.home-connect.com/support/contact) to request that the fan be exposed as a separate Hood appliance.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-fe74 issue-78-c9c7 issue-288-9266 issue-328-99fc -->
This warning typically occurs in two different contexts:

- **Monitor-Only Programs**: Some appliances support maintenance cycles (such as rinsing, drum cleaning, or descaling) and user-configured favourites that the API allows the plugin to monitor but not control remotely. The plugin logs these when they are detected but cannot be started via HomeKit.
- **Startup Timing**: You may see a transient warning during Homebridge startup or after clearing the cache. This happens if an appliance reports a program selection event before the plugin has finished loading the full list of supported programs from the API.

In these cases, the messages are often cosmetic or indicate a limitation of the Home Connect service rather than a fault with the plugin. The plugin will automatically fetch or refresh necessary details once initialisation is complete.

#### Why is my appliance stuck during initialisation, showing as `Not Responding`, or missing all options?

<!-- INCLUDES: issue-17-eee1 issue-26-a87b issue-29-d8b2 issue-42-9162 issue-54-f83f issue-76-eaa5 issue-186-ee7e issue-201-3565 issue-273-c05e issue-290-df65 issue-292-77b3 issue-315-9e82 issue-323-f483 issue-329-1549 issue-333-49b8 issue-335-7107 issue-342-27bc -->
The plugin discovers appliance capabilities during startup and caches them. This process can fail if the appliance is offline, busy, or has an open door. Technical issues such as API instability or missing consumables (e.g. low salt or a full drip tray) can also cause discovery to fail. When this occurs the log typically includes messages like `Waiting for ... features to finish initialising` or `Appliance initialisation is taking longer than expected`.

Note that the official Home Connect app uses a private API and may still appear to show the appliance as online while the public API used by this plugin reports it as offline. To resolve this, perform the following diagnostic steps:

1. **Check the Home Connect Server Status**: Visit the [unofficial status page](https://homeconnect.thouky.co.uk/) to rule out platform-wide outages.
2. **Perform the Mobile Data Test**: Disable Wi-Fi on your mobile device and attempt to control the appliance via the official Home Connect app using cellular data. If the official app shows the device as offline or cannot control it, the issue lies with the appliance's connection to the Home Connect cloud servers.
3. **Confirm Consumables and Maintenance**: Verify that all maintenance requirements (cleaning, descaling, refills) are met.
4. **Power Cycle**: Disconnect the appliance from the mains power for 30 seconds to force its internal firmware to re-register with the cloud servers.
5. **Delete Cache Files**: If the issue persists, stop Homebridge and delete the appliance's cache files in `~/.homebridge/homebridge-homeconnect/persist` (filenames are MD5 hashes; do not delete the authorisation file `94a08da1fecbb6e8b46990538c7b50b2`).
6. **Refresh Connection**: As a last resort, remove the appliance from the Home Connect app and re-add it to your home network.

#### Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that certain values follow strict increments. If a value is provided that is not an exact multiple of the required step size, the API will return a validation error.

The plugin attempts to mitigate this by providing dropdown menus or adding the required step size to the field description in the Homebridge UI. When manually entering values, ensure they align with the increments specified in the configuration interface. Using the up/down arrows in the Homebridge UI will typically snap the value to the correct step.

#### Why are Pause and Resume features missing or inconsistent?

<!-- INCLUDES: issue-8-226b issue-8-5b9e -->
Experimental support for pausing and resuming programs is implemented via the HomeKit `Active` characteristic, but there are several limitations:

- **App Support**: Apple's native Home app does not display the pause/resume controls for most appliance types. You must use a third-party app like *Eve* or *Home+* to access these functions.
- **API Inconsistency**: Support for these commands varies significantly between firmware versions. Many appliances do not support `PauseProgram` via the public API despite documentation suggesting otherwise. Others may support pausing but not resuming.

The plugin dynamically detects supported commands for each specific appliance. If the options do not appear in a compatible third-party app, it indicates your hardware or firmware does not support the feature via the public API.

#### Why doesn't the plugin automatically turn on my coffee machine when I start a beverage program?

<!-- INCLUDES: issue-242-dd71 -->
The plugin does not implement automated sequencing, such as powering on an appliance and waiting for it to be ready before starting a program, for several technical reasons:

- **HomeKit Response Timeouts**: HomeKit requires a rapid response when a characteristic is updated. Waiting for a power-on sequence or rinse cycle would exceed the allowed time, causing HomeKit to report a timeout error.
- **State Reporting Inconsistency**: Different models report their power state and readiness inconsistently. Some may not reliably indicate when they are ready to receive a program command.
- **User Feedback**: To avoid timeouts, the plugin would have to report success immediately. If the subsequent background sequence failed (e.g. the water tank is empty), the user would receive no feedback in HomeKit or via Siri.
- **Device Behaviour**: Many appliances automatically power on when a program command is received via the API, making additional sequencing unnecessary for those models.

If your model requires manual power-on before a beverage can be requested, you should use the Apple **Shortcuts** app or HomeKit automations to create a sequence (e.g. Turn On → Wait → Start Drink).

#### Why is the `Active Program` switch failing or unavailable in HomeKit?

<!-- INCLUDES: issue-224-e8e4 -->
The generic `Active Program` switch relies on the Home Connect API reporting which program is currently selected on the physical appliance via the `BSH.Common.Root.SelectedProgram` event. There are several limitations to this:

- **API Event Dependency**: Many appliances (especially washers and dryers) do not consistently generate events for program selection. If the plugin cannot determine which program is selected, toggling the switch will result in an `Error: No program selected` in the logs.
- **HomeKit UI Restrictions**: If the plugin cannot reliably set the state of a switch due to these API limitations, HomeKit apps may prevent the switch from being used in scenes or automations to avoid inconsistent states.

To ensure reliable automation, it is recommended to use the **specific named program switches** (e.g. `Cotton`, `Eco 50`) instead of the generic `Active Program` switch. These named switches explicitly define the program to be started and do not depend on the appliance's current selection state.

#### How can I trigger the Identify function in the Eve app?

<!-- INCLUDES: issue-37-b6a0 -->
To trigger the `Identify` mechanism within the Eve app:

1. Navigate to the **Rooms** tab and locate the appliance.
2. Tap the name of the appliance to open the detailed view (do not tap a toggle or slider).
3. Tap the appliance name or the small arrow at the top of the screen, just below the **Edit** button.
4. Tap the **ID** button that appears next to the settings cog.

This will trigger the identification sequence on the physical appliance and force the plugin to refresh its cached data.

#### How can I enable dishwasher options like Half Load, Extra Dry, or Efficient Dry in HomeKit?

<!-- INCLUDES: issue-138-eb88 issue-341-3673 -->
Home Connect distinguishes between global [settings](https://api-docs.home-connect.com/settings/) (like Child Lock) and program-specific [options](https://api-docs.home-connect.com/programs-and-options/) (like `HalfLoad`, `ExtraDry`, or `EfficientDry` / `EcoDry`). 

Because these are program options rather than independent settings, they must be configured as part of a specific program's execution and are not exposed as standalone HomeKit switches. By default, the plugin creates a HomeKit `Switch` for each program using its default settings. To use specific options, you must configure a **Custom list of programs and options** in the plugin settings and explicitly define the desired options for each switch.

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 issue-201-3565 -->
To learn an appliance's specific options, the plugin must select each program via the API. Many appliances only report valid option ranges when the power is on and that specific program is selected.

If the plugin does not have a valid cache, it will attempt to turn the appliance on, iterate through all available programs, and then restore the appliance to its original state. This should only happen **once**. If it occurs every time Homebridge restarts, discovery may be failing with a `409 Conflict` (e.g. `BSH.Common.Setting.PowerState currently not available or writable`) because the appliance is busy, in an incompatible state, or the door is open. If no cache exists and the appliance is offline, startup will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If a program is started without custom options, the Home Connect server uses the **appliance defaults**. These are usually the factory defaults or the settings used the last time that program was run manually.

To view these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API to the Homebridge log.

#### Why do my oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
When started remotely via the API, oven programs **must** have a defined duration. If no duration is provided by the plugin, the Home Connect API typically defaults to a value of 60 seconds.

To resolve this, use the **Custom list of programs and options** in the plugin settings to explicitly set a `Duration` (for example, `3600` seconds) for your oven switches. This ensures the oven remains on until the timer expires or you manually stop it.

#### Why is the scheduled start time for my appliance program not being honoured?

<!-- INCLUDES: issue-293-c49d -->
The plugin does not perform internal time zone processing or use the location settings from your Home Connect account. Instead, it relies entirely on the local time zone of the server running Node.js and Homebridge. If a scheduled program, such as one using `BSH.Common.Option.StartInRelative`, triggers at an unexpected time, it is likely that your server is configured to a different time zone (often UTC/GMT by default).

To resolve this:
1. Verify your server's current time zone configuration. On most Linux distributions, you can use the `timedatectl` command.
2. Ensure the operating system or container environment is set to your correct local time zone.
3. If you cannot change the system-wide settings, you can explicitly set the time zone for the Homebridge process by configuring the `TZ` environment variable (for example, `TZ=Europe/London`).

#### How can I reduce the number of switches created for appliance programs?

<!-- INCLUDES: issue-49-3c91 issue-368-4f23 -->
By default, the plugin creates individual `Switch` services for every supported program. To simplify the interface, change the **Program Switches** configuration for the appliance:

- **No individual program switches**: Hide all program switches.
- **A switch to start each appliance program** (default): Advertise all available programs to HomeKit using default options.
- **Custom list of programs and options**: Explicitly define which programs appear in HomeKit, and the options to use with each.

#### What does the log message `Using expired cache result` mean?

<!-- INCLUDES: issue-288-674a -->
The plugin caches technical details about appliance programs, such as valid temperature ranges or spin speeds, because the Home Connect API only allows this information to be retrieved reliably when a program is selected but not yet running. The plugin considers this cache expired if the program has not been selected on the appliance for more than 24 hours.

When the plugin requires these details but cannot refresh them from the API (because a different program is currently selected), it will use the last known data and log this message. This is expected behaviour and does not indicate a functional failure; it simply signifies that the plugin is relying on historical data for a program that has not been used recently.

#### Why does setting my hood fan to `Auto` in the Home app not immediately turn it on?

<!-- INCLUDES: issue-289-b4fa -->
The plugin prioritises the `Active` characteristic (the power state) over the `TargetFanState` (Manual/Auto). When the fan is off, selecting `Auto` in HomeKit saves the preference within the plugin, but it typically only takes effect once the fan is subsequently switched to `On` (for example, by adjusting the speed slider or toggling the power).

This design choice is driven by several factors:

- **API Limitations**: Many Home Connect hoods do not report current fan speed when operating in automatic mode. This makes it difficult for the plugin to provide accurate feedback to HomeKit.
- **Hardware Variations**: Different manufacturers implement automatic modes differently. Some require the fan to be explicitly `Active` before an automatic program can be engaged.
- **HomeKit Specification**: The Apple HomeKit Accessory Protocol (HAP) does not define whether setting a fan to `Auto` should implicitly power it on.

If your hood does not respond when you toggle `Auto`, ensure the fan is also switched to `On`. Note that because some hoods do not report speed in this mode, the Home app may display an incorrect speed percentage while the automatic program is running.

#### Why does the plugin log unrecognised `PowerState` values like `Undefined` or `MainsOff`?

<!-- INCLUDES: issue-310-e840 issue-353-8bec -->
Certain Home Connect appliances or firmware versions may report non-standard power states such as `BSH.Common.EnumType.PowerState.Undefined` or `BSH.Common.EnumType.PowerState.MainsOff`. These values are typically the result of bugs in the appliance firmware or the Home Connect cloud servers, as they do not conform to the standard API specification.

To ensure plugin stability and correct HomeKit operation, the plugin treats both of these values as equivalent to `Off`.

#### 🚧 Can I start Double dispensing coffee programs through Homebridge? 🚧

<!-- INCLUDES: issue-1-d662 -->
No, features like double dispensing (Doppelbezug) are not currently available via the public Home Connect API. 

While these options may be visible and functional within the official Home Connect mobile application, the official app often utilises private API endpoints that are not accessible to third-party developers. Until Home Connect updates their public API to include these specific program options, they cannot be supported by the plugin. You can check the official Home Connect developer changelog for updates on available program options.

#### 🚧 Why can I not turn my washing machine or dryer off via HomeKit? 🚧

<!-- INCLUDES: issue-3-9970 -->
The ability to turn an appliance off is determined by the Home Connect API and the specific hardware, rather than the plugin itself. According to the official Home Connect API documentation, laundry appliances (washers, dryers, and washer-dryers) typically only support an `On` power state. They do not support being switched to `Off` or `Standby` remotely.

You can verify the capabilities of your specific appliance by checking the Homebridge logs. The plugin queries each appliance for its supported power states and will log `Cannot be switched off` if the hardware only permits the `On` state via the API.

### Appliance Status

#### Why does my appliance status appear stuck or show as offline in HomeKit?

<!-- INCLUDES: issue-74-d6d6 issue-170-3230 -->
The plugin relies on a real-time Server Sent Events (SSE) stream from the Home Connect API to receive status updates. If this stream is interrupted or the backend stops sending events, the plugin cannot update HomeKit.

The API sends a `KEEP-ALIVE` event approximately every 55 seconds; if the plugin detects no activity for 120 seconds, it will automatically re-establish the stream. In some cases, the connection may remain technically active while the Home Connect backend stops distributing actual state change events, either due to events not being received from the appliance or internal errors within the cloud infrastructure.

To troubleshoot:

1. Enable the **Log Debug as Info** plugin option to see all raw events received from the API. If no events are logged when you interact with the appliance, the issue resides with the Home Connect platform or appliance.
2. Restart Homebridge to force the plugin to subscribe to a fresh event stream.
3. Ensure your network configuration does not prematurely terminate long-lived TCP connections.

#### Why is my appliance unresponsive in Homebridge but working in the Home Connect app?

<!-- INCLUDES: issue-71-a9f3 -->
The official Home Connect mobile app can communicate with appliances via the local Wi-Fi network when your phone is on the same network. In contrast, this plugin and all third-party integrations must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive in the app while on cellular data, the issue lies with the appliance's connection to the Home Connect servers rather than the plugin. You can often resolve this by power cycling the appliance. If problems persist check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

#### Why do my appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-2dc8 -->
The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as an appliance is associated with your account in the Home Connect API, it will persist in HomeKit. Being unreachable or powered off does not trigger the removal of the accessory from HomeKit, but the Home app will display it as **No Response**. Dynamically adding and removing appliances from HomeKit based on their connectivity would result in loss of user configuration, such as their name, location, scenes, and automations.

If you observe inconsistent behaviour, such as devices unexpectedly appearing or disappearing, this may be due to a synchronisation issue within HomeKit or the Homebridge cache. This can often be resolved by removing the bridge from the Home app, clearing the Homebridge cache files, and then re-adding the bridge.

#### Why does the log show a program running or time remaining when my appliance is off?

The plugin reflects the real-time status and events reported by the Home Connect API servers. If the logs indicate that a program is active or shows a countdown while the appliance is idle, it means the plugin is receiving these specific events from the Home Connect cloud service.

This behaviour is typically caused by:

1. A server-side state mismatch or backlog within the Home Connect infrastructure.
2. A delay in the event stream where old status updates are delivered late.
3. A bug in the appliance firmware or the cloud API representation of that specific model.

To resolve this, try starting and then stopping a manual program using the official Home Connect app or the physical appliance interface to reset the server state. This is a transient server-side or firmware issue that cannot be corrected by the plugin itself.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-f64f -->
Some Bosch dishwasher models appear to re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a connection to the Home Connect cloud after being offline. The plugin maps events from the API directly to HomeKit triggers; therefore, these re-broadcasts are passed through as button presses or notifications. This is a quirk of the appliance firmware or API event handling rather than a defect in the plugin itself.

#### Why is my Homebridge log filling up with oven `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-694f -->
These events are generated whenever the Home Connect servers report a change in the appliance's internal temperature. Most ovens remain in a standby state after use where they continue to monitor and report cooling progress.

The plugin logs all status information reported by the API. To prevent these messages from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge **Child Bridge**. This isolates the plugin's output and ensures that high-volume events do not obscure logs from other plugins.

#### Why does the log periodically show `Found X appliances (0 added, 0 removed)`?

<!-- INCLUDES: issue-272-e11d -->
This message appears because the plugin periodically polls the Home Connect API to discover any new or removed appliances. This ensures that changes to your Home Connect account are reflected in Homebridge without requiring a manual restart.

There are plans to replace this polling mechanism with a more efficient event-based approach using `PAIRED` and `DEPAIRED` events from the Home Connect event stream. Once this enhancement is implemented, these log messages will only be generated when an appliance is actually added or removed from the account.

#### Why is the dishwasher door control read-only in HomeKit?

<!-- INCLUDES: issue-327-6ad4 -->
The Home Connect API currently restricts door functionality for dishwasher appliances to monitoring-only. Remote control of the door is limited by the API to specific oven and fridge/freezer models, and even then, it is dependent on the specific appliance hardware. For dishwashers, the `Door` service in HomeKit is read-only; it will correctly indicate whether the door is open or closed, but it cannot be used to trigger the door to open. This is a limitation of the Home Connect API rather than the plugin itself.

#### Can I use data from the Home Connect status page for automations or scripts?

<!-- INCLUDES: issue-306-65ff -->
No. The [unofficial Home Connect Server Status](https://homeconnect.thouky.co.uk/) page is provided solely for manual diagnostic purposes to help users identify if connectivity issues are platform-wide. There are no plans to provide an API for third-party use or automated scripts. Automated scraping or frequent polling of the status page is unsupported and may result in the requesting IP being blocked.

#### 🚧 Why does the log show `The appliance is offline` and HomeKit show "No Response" when the device is connected to Wi-Fi? 🚧

<!-- INCLUDES: issue-15-1a1d -->
The plugin determines if an appliance is online based on the status of a real-time event stream from the Home Connect servers. This status is independent of the appliance's local network connectivity or its appearance in the official Home Connect app. If this stream is interrupted, the appliance is marked as offline in the logs and will appear as "No Response" in HomeKit.

This can happen if:
* The event stream is terminated (e.g. due to API server maintenance or transient network errors).
* The plugin takes longer than three seconds to re-establish the connection to the stream.
* An error occurs while the plugin is synchronising the appliance's state immediately after a reconnection.

This behaviour prevents the plugin from sending commands to a device when its current state is unknown. Typically, this is a transient condition that resolves itself once the connection to the Home Connect API is stabilised.

#### 🚧 Why does my washing machine door show as Open in HomeKit when the machine is running? 🚧

<!-- INCLUDES: issue-3-5aac -->
This behaviour typically occurs when the appliance is in a `Locked` state rather than just a `Closed` state. The Home Connect API reports three distinct door states: `Open`, `Closed`, and `Locked` (standard for washing machines during a cycle). 

If the plugin is not correctly interpreting the `Locked` state, it may default to showing the door as open. Current versions of the plugin map both `Closed` and `Locked` to the HomeKit `Closed` state to ensure accurate reporting during active programs. If you encounter this, ensure you are on the latest version of the plugin. Note that some discrepancy can also occur if the Home Connect event stream is briefly disconnected due to server-side timeouts (HTTP `502` errors), which prevents the plugin from receiving the state change event.

#### 🚧 Why does my appliance show as running in HomeKit when it is physically off? 🚧

<!-- INCLUDES: issue-5-af4b -->
The plugin displays the status and events exactly as they are reported by the Home Connect API servers. Occasionally, the cloud server's state can become desynchronised from the physical appliance, causing the API to continue broadcasting an `Active` status and program countdowns even after the appliance is powered down.

Because the plugin simply reflects the data provided by the API, you must force a state update on the Home Connect side to resolve the mismatch:
1. Start and then manually stop a real program using the official Home Connect app or the physical controls on the appliance.
2. Power cycle the appliance at the mains.
3. Use a third-party HomeKit app such as Eve to inspect the `Active` and `Remaining Time` characteristics, which can provide more technical detail than the standard Apple Home app.

If the Home Connect API consistently provides incorrect data, you may need to register a new Client ID in the Home Connect Developer Portal or contact their developer support.

## Apple HomeKit

### HomeKit Accessories, Services, and Characteristics

#### Why does the Apple Home app not show the remaining time or detailed status for my appliance?

<!-- INCLUDES: issue-2-d759 issue-48-237c issue-68-c945 issue-114-0f03 issue-124-9bb6 issue-225-731f issue-230-03a5 -->
The plugin exposes the `Remaining Duration` characteristic to HomeKit for all supported appliances, typically on the `Active Program` switch service. However, the Apple Home app only displays this information for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` services. These services are semantically inappropriate for most Home Connect appliances, and using them would create an inconsistent architectural model and break existing automations.

To view the remaining time or use it for automations, you must use a third-party HomeKit application (such as *Eve*, *Home+*, or *Controller for HomeKit*). Look for the **Remaining Duration** characteristic on the Active Program switch service. These applications support displaying a wider range of standard HomeKit characteristics that Apple's own app hides.

#### Why are the power and program switches for my appliance in a random order in HomeKit?

The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services, such as the power `Switch`, various program control `Switch` services, and event `Stateless Programmable Switch` services, individual HomeKit apps determine how to order them.

Although HAP includes a `Service Label Index` characteristic, it is specifically intended for ordering `Stateless Programmable Switch` services and is not officially supported or respected by apps for other service types. Technical attempts to influence the order—such as marking the power switch as a `Primary` service or using `Linked` services to group controls—have proven inconsistent across different applications. In some cases, these changes actually made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as *Eve*, *Home+*, and *Hesperus*, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

#### Why can I not hide certain switches, or why do they remain visible or unresponsive after being disabled?

<!-- INCLUDES: issue-25-8397 issue-124-2e72 issue-240-ed8f issue-364-a64b -->
The main `Switch` service for the appliance power is fundamental to the plugin's architecture and cannot be disabled. Most other services can be individually enabled or disabled for each appliance within the plugin configuration. This includes the `Active Program` switch, though disabling it removes other functionality that may not be obvious:

1. **Status Indicators**: The `On`, `Status Active`, and `Status Fault` characteristics which indicate the current operational state.
2. **Program Control**: The ability to start, stop, pause, and resume the active program.
3. **Time Remaining**: The `Remaining Duration` characteristic.

If services remain visible in HomeKit (often appearing as "unresponsive") after you have configured them to be hidden, it is likely due to HomeKit's internal caching and synchronisation mechanisms rather than the plugin itself. When a feature is disabled, the plugin removes the service from the accessory definition, but HomeKit may retain a stale cached version across multiple hubs or iCloud-synced devices. To resolve persistent stale entries, try these steps in order:

- **Check the logs**: Verify the plugin is removing the service. You may see a message such as `Removing obsolete service "Internal Light"` if the service was restored from the Homebridge cache but is now disabled.
- **Restart Homebridge**: This triggers a fresh configuration update to HomeKit.
- **Wait**: Allow several hours for iCloud synchronisation to reconcile the state across all your devices.
- **Reboot the Home Hub**: Restart your primary Apple TV or HomePod.
- **Reset iCloud**: Sign out of iCloud on the Home Hub and sign back in.
- **Remove the bridge**: As a last resort, remove the Homebridge bridge from HomeKit and re-add it.

#### Why is temperature control not supported for fridges, freezers, or ovens?

<!-- INCLUDES: issue-58-06c5 -->
The HomeKit Accessory Protocol (HAP) only defines standard temperature services (`Heater Cooler`, `Temperature Sensor`, and `Thermostat`) for environmental climate control. Using these for appliances introduces several issues with Siri voice control:

- **Siri confusion**: Siri may conflate the appliance's internal temperature with the ambient room temperature.
- **Incorrect voice responses**: Asking "what is the temperature in the kitchen?" might report the fridge's internal setting instead of the room temperature.
- **Unintended control**: Commands to adjust the room temperature might inadvertently change the appliance settings.

To maintain the integrity of voice control, this plugin exposes fridge and freezer modes (such as Super, Eco, Vacation, and Fresh modes) as individual `Switch` services instead of temperature controls.

#### Why is my appliance door appearing as a `Door` service or security device instead of a `Contact Sensor`?

<!-- INCLUDES: issue-303-3c06 issue-350-8ab5 issue-361-065e -->
The plugin uses the `Door` service to represent appliance doors by design, as this is the most semantically accurate HomeKit service for the hardware. While many appliances only provide a read-only door status, the Home Connect API supports `Open Door` and `Partly Open Door` commands for specific high-end models. Mapping these to a `Door` service allows the plugin to expose this control functionality where supported; on other models, it remains a read-only sensor.

Because Apple Home categorises all `Door` services as security-related accessories, you may see the appliance grouped with locks or sensors, and receive automatic notifications when the door state changes. This is standard HomeKit behaviour and cannot be changed by the plugin. If this behaviour is not desired, you have two options:

1. **Disable notifications**: Within the Apple Home app, navigate to **Home Settings** > **Doors** and toggle off notifications for the specific appliance door.
2. **Disable the service**: You can completely hide the `Door` service within the plugin configuration for that appliance.

#### Why can I not set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services or characteristics with the correct semantics for a general-purpose appliance alarm timer. Mapping this functionality to existing, unrelated HomeKit services would result in incorrect behaviour and cause issues when using Siri. To maintain HomeKit consistency and ensure reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

#### Why do multiple program switches appear with identical names in the Home app?

<!-- INCLUDES: issue-230-3383 -->
If multiple program switches appear with identical generic names (such as "Dryer"), this is typically caused by the Apple Home app's display logic rather than the plugin itself. To resolve this:

1. Force-quit and restart the Apple Home app to see if the names refresh.
2. If names remain identical, open the settings for an individual switch in the Home app and delete the prefix or appliance name from the name field. This action often reveals the unique program name (e.g. "Cotton Eco") that was previously hidden.
3. Manually rename the switch to your preference if necessary.

#### Why can I not see or control the child lock for my appliance in the Apple Home app?

<!-- INCLUDES: issue-334-5696 -->
The plugin supports the child lock setting (internally `BSH.Common.Setting.ChildLock`) by mapping it to the standard HomeKit `Lock Physical Controls` characteristic on the appliance's Power `Switch` service. 

However, the official Apple Home app does not currently display or provide controls for this specific characteristic on many appliance types. To view the status or toggle the child lock, you must use a third-party HomeKit app such as **Eve**, **Home+**, or **Controller for HomeKit**.

#### Why is the hood boost mode a separate switch instead of part of the fan speed control?

<!-- INCLUDES: issue-338-61ea -->
The plugin represents Home Connect hood functionality using a combination of a `Fan` service for speed control and a `Switch` service for the boost mode. This design reflects the different behaviours of these features in the appliance firmware:

1. **Standard Speeds and Intensive Mode**: These are mapped to the HomeKit fan speed percentage steps. The highest fan speeds correspond to **intensive mode**, which run for a fixed period (e.g. 6 minutes) before automatically reverting to a specific lower speed.
2. **Boost Mode**: On supported models the **Boost** option provides a higher fan speed for a very short duration (e.g. 20 seconds). Unlike intensive mode, when the boost period ends, the hood returns to the **previous** speed setting.

Because HomeKit fan speed controls represent a linear progression, incorporating a mode that reverts to an arbitrary previous state is not natively supported by the speed slider. Exposing `Boost` as a separate `Switch` better represents this hardware behaviour and allows it to be activated independently of the current speed. This `Switch` can be hidden in the plugin configuration if it is not required.

#### Can the hood control buttons on a Home Connect hob be used to trigger HomeKit automations?

<!-- INCLUDES: issue-348-2f9e -->
No, the physical buttons on a hob designed to control a hood are not exposed through the Home Connect API. The API does not provide any events or status updates when these buttons are pressed, which means the plugin cannot detect the interaction or expose it to HomeKit. This is a limitation of the Home Connect platform and appliance firmware rather than the plugin. Manufacturers typically design these buttons to communicate directly with compatible Home Connect hoods rather than broadcasting their state to the cloud API.

#### Why can I only control power and fan speed for my Home Connect air conditioner?

<!-- INCLUDES: issue-346-68d7 -->
The Home Connect API currently provides extremely limited support for air conditioning units. While basic operations like power and fan speed are available, the API lacks several critical capabilities required for a full HomeKit `Thermostat` or `HeaterCooler` service:
- **Ambient Temperature and Humidity**: There is currently no API endpoint to read the current room temperature or humidity.
- **Temperature Setpoints**: Although some internal keys exist, they are not officially supported for control via the public API.
- **Mode Selection**: Selection of cooling, heating, or auto programs is not fully exposed for external control.

Consequently, the plugin exposes air conditioners as a power **Switch** (to toggle between On and Standby) and a **Fan** (to control fan speed and toggle between manual and automatic modes). Adjusting the target temperature or switching between heat and cool modes must be done via the physical remote or the official Home Connect app.

#### Why are appliance lights mapped as lightbulbs instead of switches?

<!-- INCLUDES: issue-362-0e29 -->
The Home Connect API defines appliance lights (such as internal refrigerator lights or hood lighting) as settings that often include more than just simple on/off functionality. These can support `Brightness`, `ColorTemperature`, or `Color` depending on the specific model and appliance type.

The plugin uses the HomeKit `Lightbulb` service for these features because:

- A `Switch` service does not support the brightness or colour controls provided by the Home Connect API.
- It maintains a consistent mapping across all appliance types where lighting is a feature (e.g. extractor hoods and refrigerators).
- It allows for the full range of hardware capabilities, such as dimming, to be exposed to HomeKit.

A side effect of this mapping is that Siri will include these appliance lights when you issue commands to turn off the lights in a specific room. If you do not want an appliance light to be controlled or grouped with your room lighting, you should disable that specific service in your Homebridge configuration.

#### Why is the colour temperature on my hood inverted?

<!-- INCLUDES: issue-366-0e9c -->
Some hood models (such as the Siemens `LC91KLT60`) do not implement colour temperature control in compliance with the official Home Connect API documentation.

The `Cooking.Hood.Setting.ColorTemperaturePercent` setting is documented as `0%` = **warm light** and `100%` = **cold light**. The plugin follows this mapping to provide granular control in HomeKit. However, certain appliances (such as the Siemens `LC91KLT60`) interpret these values inversely. If your appliance is affected, you will need to reverse the settings in your HomeKit automations and scenes.

#### 🚧 Why does my coffee maker show as Inactive in the Eve app? 🚧

<!-- INCLUDES: issue-1-6c10 -->
When a Home Connect appliance is switched on but not currently running a program, it is reported as being in an idle state. The plugin maps this idle state to the HomeKit `Inactive` status.

While this is a standard mapping for idle devices, some third-party HomeKit applications like the Eve app highlight this state prominently, which may appear as a warning. This behaviour is a characteristic of how the specific HomeKit app displays the data and does not indicate a functional error with the appliance or the plugin.

#### 🚧 Why is the remaining program time displayed in seconds instead of minutes? 🚧

<!-- INCLUDES: issue-3-a6f3 -->
The plugin uses the standard Apple HomeKit `Remaining Duration` characteristic to report the time until a program completes. Apple's specification defines this characteristic as an integer value representing time in seconds. 

The way this value is displayed (e.g. converting seconds into minutes and seconds) is entirely dependent on the specific HomeKit app you are using:
* The **Eve** app and **Home+** typically format this value into a human-readable minutes and seconds format.
* Other apps, including some versions of **HomeDash** or the default Apple **Home** app, may display the raw seconds or may not show the characteristic at all.

Because defining a custom characteristic for minutes would make the data unreadable to most HomeKit apps, the plugin adheres to the official Apple standard of seconds.

#### 🚧 Why does the Eve app show a red warning triangle or an inactive status for my Home Connect appliance? 🚧

<!-- INCLUDES: issue-6-a773 -->
This behaviour occurs because some third-party HomeKit apps, such as Elgato Eve, interpret the `Status Active` characteristic as an indication of whether the accessory is functioning correctly. If this characteristic is set to `false`, Eve displays a red warning triangle and the message: "The accessory is inactive. Please refer to its user manual."

To prevent misleading error displays, the plugin maps the Home Connect `BSH.Common.Status.OperationState` to the HomeKit `Status Active` characteristic so that it remains `true` during normal operation, including when the appliance is idle or has finished its program. It only switches to `false` when the appliance requires user intervention or has encountered a fault:

*   **Active (Status Active = true)**: The appliance is in the `Inactive`, `Ready`, `DelayedStart`, `Run`, or `Finished` state. These are considered normal operating conditions where no immediate action is required to maintain functionality.
*   **Inactive (Status Active = false)**: The appliance is in the `Pause`, `ActionRequired`, `Error`, or `Aborting` state. These states typically require user intervention (such as closing a door or refilling a tank) or indicate a genuine hardware fault.

Note that the standard Apple Home app does not display the `Status Active` characteristic, so this visual quirk is only observed in more advanced HomeKit browsers or third-party apps.

#### 🚧 Why are the services for my Home Connect appliance displayed in a random or awkward order? 🚧

<!-- INCLUDES: issue-7-871f -->
The `homebridge-homeconnect` plugin creates multiple services for each appliance, such as a power `Switch` and various program `Switch` services. HomeKit does not provide a robust, universal mechanism for plugins to define the display order of these services within an accessory.

The plugin uses the `Service Label Index` to order `Stateless Programmable Switch` services (used for event triggers), but this characteristic is not officially supported or respected by most HomeKit apps for other service types like standard switches.

Internal testing of different HomeKit attributes yielded the following results:
- **Primary Service**: Marking the power switch as the primary service did not consistently place it first and, in some apps like Apple Home, occasionally made the ordering worse.
- **Linked Services**: Creating logical links between program switches did not improve grouping or ordering in popular HomeKit applications.

If the default order is unsatisfactory, consider using a third-party HomeKit app that supports manual reordering of services within an accessory, such as **Eve**, **Home+**, or **Hesperus**. The official Apple Home app does not currently allow users to manually reorder the individual services of a single accessory.

### Notifications & Events

#### Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?

<!-- INCLUDES: issue-31-241e issue-43-caee issue-45-fb59 issue-153-91f4 issue-323-9301 -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. The plugin maps these events to `Stateless Programmable Switch` services so that they can be used as automation triggers. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears.

The Apple Home app only displays numeric labels (Button 1, Button 2) for these services. To see what these represent for your specific appliance, check your **Homebridge logs** during startup or use a third-party app like *Eve* or *Home+* which displays descriptive labels. If you do not require these events for automations, you can disable them per-appliance in the plugin configuration to prevent them from appearing in the Home app.

#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organised, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles** in the accessory settings, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How do I get appliance notifications?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 issue-124-8aea -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

- **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
- **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

#### How can I disable HomeKit notifications for door events?

<!-- INCLUDES: issue-132-67f7 issue-132-791b -->
Door notifications for appliances like fridges or freezers are managed by the Apple Home app on a per-device basis. To disable them:

1. Open the Apple **Home** app.
2. Tap the **...** icon at the top of the screen and select **Home Settings**.
3. Navigate to the **Doors** section.
4. Locate the specific appliance accessory and toggle off **Activity Notifications**.

Note that this setting must be configured separately on each iPhone or iPad where you want to silence the notifications. Alternatively, you can use the per-appliance configuration options in the plugin to remove the `Door` service entirely if you do not require its state information in HomeKit.

#### 🚧 How can I trigger an automation when my coffee maker's drip tray is full? 🚧

<!-- INCLUDES: issue-1-c1c9 -->
The Home Connect API reports certain status updates, such as the `drip tray full` event, as transient events rather than persistent, queryable states. This means the plugin cannot determine the status of the tray when it first starts or if a connection is lost.

To accommodate this, the plugin maps these events to a `Stateless Programmable Switch` in HomeKit. You can use this switch as a trigger for HomeKit automations, though it will not show a continuous 'full' or 'empty' state in the Home app.

### Siri

#### How do I control my hood fan speed using Siri?

<!-- INCLUDES: issue-2-ee14 -->
Siri maps fan speeds to specific percentages:
- **Low** is 25%
- **Medium** is 50%
- **High** is 100%

The plugin maps these percentages to the closest available physical fan settings of your hood. You can use commands like `Hey Siri, set the hood fan to medium` or `Hey Siri, set the hood fan to 100%`. Note that numeric settings like `set fan to 1` are not supported by Siri for HomeKit fan services.

## Compatibility and Integration

### Third-party Platforms

#### Is this plugin compatible with HOOBS?

<!-- INCLUDES: issue-37-c1f5 issue-67-ea33 issue-76-b91b -->
Yes, but it is not officially supported.

This plugin is designed and tested for vanilla [Homebridge](https://github.com/homebridge/homebridge) with [Homebridge Config UI X](https://github.com/homebridge/homebridge-config-ui-x). If you choose to use HOOBS, you may encounter stability issues or broken features.

Support policy for HOOBS users:

1. **Contact HOOBS Support:** Your first point of contact should be [HOOBS Support](https://support.hoobs.org/ticket) for platform-specific issues.
2. **Verify on Vanilla Homebridge:** Before [opening an issue](https://github.com/thoukydides/homebridge-homeconnect/issues/new/choose), you must verify the problem persists on a standard Homebridge installation.
3. **No HOOBS-Specific Fixes:** Bug reports or feature requests specifically for HOOBS compatibility will **not** be accepted.

#### Will there be a Home Assistant version of this plugin?

<!-- INCLUDES: issue-14-2728 -->
No. This plugin is specifically designed for Homebridge to provide HomeKit integration for Home Connect appliances. The maintainer does not use Home Assistant and has no plans to develop or maintain a version for that platform.

For Home Assistant users, there are alternative community-maintained integrations available for Home Connect appliances.

#### Why are features available in IFTTT or the official app missing from this plugin?

<!-- INCLUDES: issue-23-d116 issue-188-cb08 -->
This plugin is restricted by the capabilities of the public Home Connect API. Certain features are available to official partners like IFTTT via private API integrations but are not exposed to third-party developers. If a specific program or option is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported by this plugin. If you require these features, you should contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) directly to request their addition to the public API.

Direct integration with IFTTT to bridge these gaps has been explicitly declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes several key technical and design constraints:

- **Complexity and Maintenance**: Implementing a hybrid control system where some actions use the Home Connect API and others use IFTTT would create significant code complexity and "feature creep".
- **User Configuration Burden**: Direct integration would rely on users manually creating appropriate IFTTT applets and then precisely configuring this plugin to match, which is prone to user error.
- **Interface Clutter**: Adding additional manual switches for IFTTT actions would further clutter the HomeKit interface, making the existing list of program switches more difficult to navigate.
- **Free Plan Limitations**: The IFTTT free tier supports a maximum of two applets, and some Home Connect features are only available via a "Pro+" plan, so most users would receive limited benefit.

For users who require IFTTT-specific functionality, such as triggering automations from Hood Favourite button presses, it is recommended to use a dedicated plugin such as `homebridge-ifttt` alongside this one. This approach keeps the logic for different services separate and more manageable.

### Plugin Installation and Configuration

<!-- PARTITION: New subcategory -->

#### Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?

<!-- INCLUDES: issue-53-9275 -->
This is an error produced by the `npm` package manager rather than a fault within the plugin code. It typically occurs when `npm` attempts to rename or remove a directory during an update but fails because the target directory is not empty or a file is being held open by another process.

To resolve this issue:

1. Stop the Homebridge service to ensure no processes are actively using the plugin files.
2. Locate the temporary directory identified in the error log (for example, `/usr/local/lib/node_modules/.homebridge-homeconnect-XXXXXXXX`).
3. Manually delete that temporary directory and the existing `homebridge-homeconnect` directory if necessary.
4. Attempt to install the plugin again.

This error is often transient and may also be resolved by simply restarting the host system or retrying the installation via the Homebridge Config UI interface.

#### 🚧 How do I find my appliance `haID` for configuration? 🚧

<!-- INCLUDES: issue-1-3b47 -->
The `haID` (Home Appliance ID) is required for certain configuration patterns and is comprised of the manufacturer name, model number (E-Nr), and a hexadecimal string (e.g., `BOSCH-CTL636ES6-12A34B4567C8`). You can find this value using several methods:
* **Identify Log**: In your HomeKit app, select the appliance and use the **Identify** function. This will trigger the plugin to write a complete JSON structure of the appliance's capabilities and its `haID` to the Homebridge log.
* **Serial Number**: In most HomeKit apps, the `haID` is displayed in the appliance's settings as the **Serial Number**.
* **Debug Logs**: If Homebridge is started with debug mode enabled (`-D`), the `haID` will appear as part of the Home Connect request URLs.

#### 🚧 Where can I find a summary of changes for each version of the plugin? 🚧

<!-- INCLUDES: issue-9-8790 -->
A `CHANGELOG.md` file is maintained in the root directory of the plugin repository. This provides a chronological record of features, bug fixes, and technical changes for each version.

* **Homebridge UI Integration**: For users of `homebridge-config-ui-x`, the contents of the changelog are automatically displayed within the dashboard when an update is available.
* **Development Progress**: More detailed or granular information about ongoing development and specific code changes can be found by reviewing the GitHub commit history.

<!-- PARTITION: Plugin Logging and Runtime Behaviour -->

#### 🚧 Why are there no log entries for the Home Connect plugin for several hours? 🚧

<!-- INCLUDES: issue-13-9879 -->
The plugin is designed to minimise log output during normal operation. After the initial start-up, log messages are only generated when an appliance is controlled through HomeKit, the event stream reports a change in an appliance's state, or an error occurs. 

If your appliances are idle and no communication errors are encountered, it is normal to see no activity in the logs for extended periods. This silence is expected behaviour and does not indicate that the plugin has frozen. If you enable debug logging, you will see entries approximately once per hour when the plugin polls the list of appliances, but otherwise, the plugin remains quiet when there is nothing to report.

#### 🚧 Why did my Homebridge instance stop with a `SIGTERM` signal? 🚧

<!-- INCLUDES: issue-13-3c36 -->
A `SIGTERM` signal is a request for a program to terminate, which is typically sent by the operating system or a process manager (such as `systemd` or `pm2`) when a service is being stopped or restarted. 

This plugin does not initiate `SIGTERM` signals. If you see this in your logs, it indicates that an external process or a manual command (like `systemctl stop`) instructed Homebridge to shut down. If this coincides with a lack of log activity from the plugin, it is important to note that the plugin is naturally silent when idle, which should not be confused with the process being frozen or crashed.

<!-- EXCLUDED: issue-4-579a issue-10-f54e issue-17-9299 issue-21-4a0f issue-24-3f2d issue-27-2626 issue-32-3eeb issue-33-f0df issue-35-2eee issue-36-116c issue-41-6e02 issue-43-3166 issue-47-127f issue-56-ce35 issue-57-6cdc issue-65-324a issue-67-1639 issue-72-52a3 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 issue-108-a5c4 issue-116-e2ec issue-118-9a71 issue-141-5245 issue-144-f92c issue-145-8923 issue-164-bbc4 issue-181-e108 issue-190-235a issue-194-f6ee issue-195-84f2 issue-196-8511 issue-239-ce99 issue-249-f952 issue-256-6e03 issue-259-62ac issue-294-4d50 issue-298-e829 issue-300-cd35 issue-303-3b35 issue-304-5f8b issue-340-77ce issue-340-9a52 issue-351-9e01 issue-360-c5e9 issue-365-e16b issue-375-b67d -->
