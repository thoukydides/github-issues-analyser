# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Home Connect](#home-connect)**
  - **[Home Connect or SingleKey ID Authorisation Issues](#home-connect-or-singlekey-id-authorisation-issues)**
    - [Why is the plugin not starting or failing to show an authorisation URL?](#why-is-the-plugin-not-starting-or-failing-to-show-an-authorisation-url)
    - [Why does authorisation fail with `invalid_request`, `invalid content type`, or `request rejected by client authorization authority`?](#why-does-authorisation-fail-with-invalid_request-invalid-content-type-or-request-rejected-by-client-authorization-authority)
    - [Why does authorisation fail with `invalid_client`, `grant_type is invalid`, `unauthorized_client`, or `client has limited user list`?](#why-does-authorisation-fail-with-invalid_client-grant_type-is-invalid-unauthorized_client-or-client-has-limited-user-list)
    - [Why does the authorisation link expire or fail with an `expired_token` or `invalid code` error?](#why-does-the-authorisation-link-expire-or-fail-with-an-expired_token-or-invalid-code-error)
    - [Why does authorisation fail with `access_denied`, `device authorization session has expired`, or `login session expired`?](#why-does-authorisation-fail-with-access_denied-device-authorization-session-has-expired-or-login-session-expired)
    - [Why does authorisation fail with the error `client not authorized for this oauth flow (grant_type)`?](#why-does-authorisation-fail-with-the-error-client-not-authorized-for-this-oauth-flow-grant_type)
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
    - [How can I refresh appliance capabilities or resolve stale program information?](#how-can-i-refresh-appliance-capabilities-or-resolve-stale-program-information)
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
    - [Why does my appliance turn on automatically, switch off immediately, or Homebridge startup stall?](#why-does-my-appliance-turn-on-automatically-switch-off-immediately-or-homebridge-startup-stall)
    - [Which settings are used for programs started without specific options?](#which-settings-are-used-for-programs-started-without-specific-options)
    - [How can I change the default duration or temperature for oven programs?](#how-can-i-change-the-default-duration-or-temperature-for-oven-programs)
    - [Why is the scheduled start time for my appliance program not being honoured?](#why-is-the-scheduled-start-time-for-my-appliance-program-not-being-honoured)
    - [How can I reduce the number of switches created for appliance programs?](#how-can-i-reduce-the-number-of-switches-created-for-appliance-programs)
    - [What does the log message `Using expired cache result` mean?](#what-does-the-log-message-using-expired-cache-result-mean)
    - [Why does setting my hood fan to `Auto` in the Home app not immediately turn it on?](#why-does-setting-my-hood-fan-to-auto-in-the-home-app-not-immediately-turn-it-on)
    - [Why does the plugin log unrecognised `PowerState` values like `Undefined` or `MainsOff`?](#why-does-the-plugin-log-unrecognised-powerstate-values-like-undefined-or-mainsoff)
    - [Why is the power off function unavailable for my washing machine or dryer?](#why-is-the-power-off-function-unavailable-for-my-washing-machine-or-dryer)
  - **[Appliance Status](#appliance-status)**
    - [Why does my appliance status appear stuck or show as offline in HomeKit?](#why-does-my-appliance-status-appear-stuck-or-show-as-offline-in-homekit)
    - [Why is my appliance unresponsive or reported as offline in Homebridge but working in the official app?](#why-is-my-appliance-unresponsive-or-reported-as-offline-in-homebridge-but-working-in-the-official-app)
    - [Why do my appliances remain visible in the Home app when they are turned off or offline?](#why-do-my-appliances-remain-visible-in-the-home-app-when-they-are-turned-off-or-offline)
    - [Why does the log show a program running or time remaining when my appliance is off?](#why-does-the-log-show-a-program-running-or-time-remaining-when-my-appliance-is-off)
    - [Why does my dishwasher trigger a Program Finished event when it reconnects?](#why-does-my-dishwasher-trigger-a-program-finished-event-when-it-reconnects)
    - [Why is the log filling up with oven `Event STATUS` temperature messages?](#why-is-the-log-filling-up-with-oven-event-status-temperature-messages)
    - [Why does the log periodically show `Found X appliances (0 added, 0 removed)`?](#why-does-the-log-periodically-show-found-x-appliances-0-added-0-removed)
    - [Why is the dishwasher door control read-only in HomeKit?](#why-is-the-dishwasher-door-control-read-only-in-homekit)
    - [Why does my refrigerator or freezer always show as Open in HomeKit even when it is closed?](#why-does-my-refrigerator-or-freezer-always-show-as-open-in-homekit-even-when-it-is-closed)
    - [Can I use data from the Home Connect status page for automations or scripts?](#can-i-use-data-from-the-home-connect-status-page-for-automations-or-scripts)
    - [Why do Home Connect appliances disappear or lose their Favourites status in the Home app?](#why-do-home-connect-appliances-disappear-or-lose-their-favourites-status-in-the-home-app)
- **[Apple HomeKit](#apple-homekit)**
  - **[HomeKit Accessories, Services, and Characteristics](#homekit-accessories-services-and-characteristics)**
    - [Why does the Apple Home app not show the remaining time or detailed status for my appliance?](#why-does-the-apple-home-app-not-show-the-remaining-time-or-detailed-status-for-my-appliance)
    - [Why are the power and program switches for my appliance in a random order in HomeKit?](#why-are-the-power-and-program-switches-for-my-appliance-in-a-random-order-in-homekit)
    - [Why can I not hide certain switches, or why do they remain visible or unresponsive after being disabled?](#why-can-i-not-hide-certain-switches-or-why-do-they-remain-visible-or-unresponsive-after-being-disabled)
    - [Why is temperature control not supported for fridges, freezers, or ovens?](#why-is-temperature-control-not-supported-for-fridges-freezers-or-ovens)
    - [Why is my appliance door appearing as a `Door` service or security device instead of a `Contact Sensor`?](#why-is-my-appliance-door-appearing-as-a-door-service-or-security-device-instead-of-a-contact-sensor)
    - [Why does my fridge-freezer only show a single door status for all compartments?](#why-does-my-fridge-freezer-only-show-a-single-door-status-for-all-compartments)
    - [Why can I not set the alarm timer or `AlarmClock` setting on my appliance?](#why-can-i-not-set-the-alarm-timer-or-alarmclock-setting-on-my-appliance)
    - [Why do multiple services or programs appear with identical names in the Apple Home app?](#why-do-multiple-services-or-programs-appear-with-identical-names-in-the-apple-home-app)
    - [Why can I not see or control the child lock for my appliance in the Apple Home app?](#why-can-i-not-see-or-control-the-child-lock-for-my-appliance-in-the-apple-home-app)
    - [Why is the hood boost mode a separate switch instead of part of the fan speed control?](#why-is-the-hood-boost-mode-a-separate-switch-instead-of-part-of-the-fan-speed-control)
    - [Why is hood fan speed controlled using percentages instead of discrete levels?](#why-is-hood-fan-speed-controlled-using-percentages-instead-of-discrete-levels)
    - [Can the hood control buttons on a Home Connect hob be used to trigger HomeKit automations?](#can-the-hood-control-buttons-on-a-home-connect-hob-be-used-to-trigger-homekit-automations)
    - [Why can I only control power and fan speed for my Home Connect air conditioner?](#why-can-i-only-control-power-and-fan-speed-for-my-home-connect-air-conditioner)
    - [Why are appliance lights mapped as lightbulbs instead of switches?](#why-are-appliance-lights-mapped-as-lightbulbs-instead-of-switches)
    - [Why is the colour temperature on my hood inverted?](#why-is-the-colour-temperature-on-my-hood-inverted)
  - **[Notifications & Events](#notifications--events)**
    - [Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?](#why-does-my-appliance-appear-as-stateless-programmable-switch-buttons-with-numeric-labels)
    - [Why does the Home app show two (or more) tiles for one appliance?](#why-does-the-home-app-show-two-or-more-tiles-for-one-appliance)
    - [How do I get notifications for events like a program finishing?](#how-do-i-get-notifications-for-events-like-a-program-finishing)
    - [How can I disable HomeKit notifications for door events?](#how-can-i-disable-homekit-notifications-for-door-events)
  - **[Siri](#siri)**
    - [How do I control my hood fan speed using Siri?](#how-do-i-control-my-hood-fan-speed-using-siri)
- **[Compatibility and Integration](#compatibility-and-integration)**
  - **[Third-party Platforms and API Limitations](#third-party-platforms-and-api-limitations)**
    - [Is this plugin compatible with HOOBS?](#is-this-plugin-compatible-with-hoobs)
    - [Will there be a Home Assistant version of this plugin?](#will-there-be-a-home-assistant-version-of-this-plugin)
    - [Why are features available in the official app or IFTTT missing from this plugin?](#why-are-features-available-in-the-official-app-or-ifttt-missing-from-this-plugin)
  - **[Plugin Installation and Configuration](#plugin-installation-and-configuration)**
    - [Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?](#why-do-i-get-an-npm-err-enotempty-error-when-installing-or-updating-the-plugin)
<!-- TOC-END -->

## Home Connect

### Home Connect or SingleKey ID Authorisation Issues

#### Why is the plugin not starting or failing to show an authorisation URL?

<!-- INCLUDES: issue-28-485b -->
If the plugin does not provide an authorisation URL or appear to load, it is usually due to a configuration error in `config.json` preventing Homebridge from identifying the platform.

First, check the Homebridge logs for `[HomeConnect] Initialising HomeConnect platform...`. If this line is missing, the plugin is not being loaded. Common causes include:

- **Incorrect Nesting**: Ensure the `HomeConnect` platform block is a separate top-level item within the `platforms` array and not accidentally nested inside another plugin's configuration.
- **Missing Client ID**: The plugin requires the `clientid` property to be set. If missing, it will log an error and stop initialisation.
- **Manual Editing Errors**: Structural JSON errors are common during manual editing. It is recommended to use the **Settings** button on the **Plugins** page of the Homebridge Config UI X to manage configuration.

#### Why does authorisation fail with `invalid_request`, `invalid content type`, or `request rejected by client authorization authority`?

<!-- INCLUDES: issue-82-6191 issue-86-1379 -->
These errors are returned when the provided `Client ID` is not recognised or is improperly formatted. Check the following:

- **Incorrect Format**: The `Client ID` must be exactly 64 hexadecimal characters. Ensure no extra spaces, quotes, or hidden characters were included when copying the ID from the developer portal.
- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Production vs Simulator Credentials**: The default "API Web Client" credentials provided in the portal are for the appliance simulator only. If you are using these for testing, you must set `"simulator": true` in your configuration. If you are connecting physical appliances, you must create a new application in the developer portal to obtain a production `Client ID`.

#### Why does authorisation fail with `invalid_client`, `grant_type is invalid`, `unauthorized_client`, or `client has limited user list`?

<!-- INCLUDES: issue-51-3a91 issue-51-4991 issue-51-60d6 issue-60-2ad5 issue-115-de4a issue-117-e569 issue-162-34c9 -->
These errors are returned by the Home Connect API and indicate a configuration mismatch or synchronisation delay in the [Home Connect Developer Portal](https://developer.home-connect.com/):

Ensure the `Client ID` in your Homebridge configuration exactly matches the one in the portal, and that the application is configured as follows:

- **Home Connect user account for testing**: This must exactly match the email address used for your Home Connect mobile app. Check this in both your global profile's **Default Home Connect User Account for Testing** and within the specific application's settings.
- **OAuth Flow**: Must be set to **Device Flow**. This setting is fixed at the time of application creation; if it was set incorrectly to `Authorization Code Grant Flow`, you must delete the existing application and create a new one, ensuring `Device Flow` is selected.
- **Success Redirect**: Leave blank or ensure it is a valid URL. Mismatches here can trigger `unauthorized_client` errors.
- **One Time Token Mode**: Disabled.
- **Proof Key for Code Exchange**: Disabled.
- **Sync to China**: Disabled, unless you are using the Home Connect servers in China.

If the configuration is correct but errors persist, try deleting and recreating the application in the developer portal to reset its state.

#### Why does the authorisation link expire or fail with an `expired_token` or `invalid code` error?

<!-- INCLUDES: issue-97-4efe issue-125-fcc5 issue-151-2b8d -->
Authorisation links and their associated device codes have a limited validity period. If this window is exceeded, the Home Connect API will return errors such as `expired_token`, `the code entered is invalid or has expired`, or `Device authorization session not found`.

If the authorisation fails:

- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Check for Stale Links**: Ensure you are using the most recent URL from the Homebridge logs or the plugin configuration UI.
- **Wait for Auto-Retry**: The plugin handles these errors by waiting 60 seconds before automatically generating a new authorisation attempt.
- **Single Use**: The `device_code` is invalidated as soon as it is successfully used. Do not attempt to reuse old authorisation URLs.

#### Why does authorisation fail with `access_denied`, `device authorization session has expired`, or `login session expired`?

<!-- INCLUDES: issue-60-aba8 issue-82-1bfb issue-118-0a9e issue-121-d035 issue-295-521b issue-299-15d1 -->
These errors typically occur during the login process and are caused by account verification requirements or bugs in the SingleKey ID authorisation flow:

- **Account State**: Ensure your SingleKey ID account is fully active. Open the official Home Connect mobile app and check for pending tasks, such as verifying your email address, migrating from an old Home Connect account to SingleKey ID, or accepting updated terms of use. The account must be fully functional in the official app before the plugin can authorise. It is sometimes necessary to log out of the app and log back in again to trigger account migration to complete.
- **Internationalisation Bug**: A server-side bug can cause authorisation to fail if your browser's preferred language is not English. This often prevents the password prompt from appearing. Set your web browser's preferred language to English (`en`), refresh, and attempt the authorisation again. You can revert this setting once the tokens are obtained.

To complete the process:

1. Obtain the URL from the logs (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=XXXX-XXXX`).
2. Open the URL in a browser and sign in with the account used in the official app.
3. Approve the request. The plugin will detect completion and save the tokens automatically.

#### Why does authorisation fail with the error `client not authorized for this oauth flow (grant_type)`?

<!-- INCLUDES: issue-51-4991 -->
This error indicates that the application registered in the Home Connect Developer Portal was not configured to use the `Device Flow` OAuth method.

The `OAuth Flow` setting is fixed at the time of application creation. If it was set incorrectly (for example, to `Authorization Code Grant Flow`), you must delete the existing application and create a new one, ensuring that `Device Flow` is selected during the creation process.

#### Why does authorisation fail with a `403 Forbidden` error?

<!-- INCLUDES: issue-275-9b14 -->
A `403 Forbidden` error during the `POST /security/oauth/device_authorization` request indicates that the Home Connect API servers are explicitly rejecting the connection from your network. This is typically caused by regional geo-blocking or service restrictions implemented by the provider (for example, in Russia).

This is a network-level restriction imposed by the service provider and cannot be bypassed by the plugin. Users in affected regions may experience similar connectivity issues with the official Home Connect app unless a VPN is used.

#### How do I configure the plugin for a Home Connect account in Mainland China?

<!-- INCLUDES: issue-311-bcea -->
Home Connect appliances registered in Mainland China use a dedicated regional API endpoint (`api.home-connect.cn`) and require specific configuration both in the Developer Portal and the plugin:

1. Log in to the [Home Connect Developer Portal](https://developer.home-connect.com/) and ensure your application has the **Sync to China** option enabled.
2. In the Homebridge UI, locate the plugin settings and set the **Server Location** to **China**.
3. If you are configuring the plugin manually via `config.json`, add `"china": true` to the plugin configuration object.

Note that the China Mainland server may use different login credentials, such as a mobile number, which is supported once the plugin is directed to the correct regional endpoint.

### Home Connect API Errors

#### Why does the log show `429 Too Many Requests`, `1000 calls in 1 day reached`, or a message like `Waiting ... before issuing Home Connect API request`?

<!-- INCLUDES: issue-39-d44c issue-74-f147 issue-268-28a5 issue-269-8032 issue-378-832c -->
The Home Connect API enforces very strict [rate limits](https://api-docs.home-connect.com/general/?#rate-limiting). Exceeding any of these triggers a `429 Too Many Requests` error and a lockout for up to 24 hours. The plugin handles this by pausing all API requests until the `retry-after` time returned by the API, displaying a countdown in the logs.

Most limits reset after 1 or 10 minutes, but there is also a daily quota of 1,000 requests. It is common to encounter these limits during the initial discovery phase after installation or an update as the plugin retrieves metadata for all appliances. Certain conditions can cause these limits to be reached rapidly:

1. **Frequent Homebridge Restarts or Initial Discovery**: The plugin must issue a significant number of API requests to discover features, supported programs, and configuration options for every appliance. Frequent restarts during setup or troubleshooting quickly consume the daily allowance. Ensure Homebridge is stable and consider running this plugin in its own **child bridge**.
2. **Unstable Appliance Connectivity**: When an appliance disconnects and reconnects to Wi-Fi, the plugin issues several API requests to re-synchronise state. Check your logs for repeated `DISCONNECTED` or `CONNECTED` messages and improve Wi-Fi coverage for that appliance. Note that appliance Wi-Fi hardware is often lower quality than that found in smartphones and can be susceptible to interference from internal components like compressors.
3. **Multiple API Clients**: Using the same Client ID across multiple Homebridge instances or other third-party integrations shares these limits. Create a separate application for each use.
4. **High HomeKit Activity**: Automations that trigger rapid state changes or frequent manual control through HomeKit contribute to hitting the limit.
5. **Large Number of Appliances**: Each additional appliance increases the baseline volume of status updates and initialisation requests. Users with many appliances are more susceptible to reaching the daily quota during periods of high activity or following restarts.

No manual intervention is required; the plugin will automatically resume communication once the Home Connect servers lift the block.

#### Why does my appliance show a `409 Conflict` error?

<!-- INCLUDES: issue-1-2d19 issue-22-defe issue-113-9491 issue-149-6678 issue-155-8156 issue-325-3294 issue-374-e780 issue-378-832c -->
The Home Connect API uses `409 Conflict` errors for a wide variety of failures that result in a request being rejected. The error message usually provides more details:

- `SDK.Error.HomeAppliance.Connection.Initialization.Failed`: This indicates that the appliance is not connected to the Home Connect cloud servers. Note that the official Home Connect app may still function by communicating directly via your local Wi-Fi network, whereas this plugin is restricted to using the official cloud API. To troubleshoot:
  1. In the official app, navigate to the appliance's **Settings** > **Network** and ensure all three connection stages (appliance-app, appliance-cloud, and app-cloud) are green.
  2. Test the official app while your phone's Wi-Fi is disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
  3. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.
  4. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

- `SDK.Error.InvalidSettingState`: This occurs when a setting is currently read-only or unavailable. It is often caused by inconsistencies in the API regarding power state capabilities (common with fridges, freezers, and hobs). It can also indicate that **Remote Start** or **Remote Control** has been disabled in the appliance's physical settings menu. While the API usually returns specific errors like `BSH.Common.Error.RemoteControlNotActive`, some appliances (particularly coffee makers) return `SDK.Error.InvalidSettingState` instead. On other appliances, it frequently indicates a maintenance message is displayed on the physical screen (e.g. "Change water filter" or "Descaling required") that requires manual confirmation before remote control can resume.

- `SDK.Error.WrongOperationState`: This indicates that the appliance is in an incorrect state for the requested operation, such as attempting to start a program while another is already running or if the appliance is currently performing a self-cleaning cycle.

- `SDK.Error.ProgramNotAvailable`: This is returned when you attempt to start a program that the API considers unavailable for remote execution. This may be due to appliance settings, safety features (e.g. local control active), or firmware bugs.

- `BSH.Common.Error.400.BadRequest`: This often indicates an attempt to stop a program that is already stopped. This typically occurs when multiple program switches are grouped into a single tile in the Home app, resulting in them all being toggled together.

For details of other `409` errors refer to the [Home Connect API Errors](https://api-docs.home-connect.com/general/#api-errors) documentation.

#### Why does my appliance show as `Not Responding` in the Home app when turned off?

The physical power button on some Home Connect appliances (most commonly washing machines and tumble dryers) also disconnects power from their internal Wi-Fi module. When this occurs, the Home Connect API cannot distinguish between the appliance being switched off, disconnected from the mains, or losing its internet connection.

The API does not provide any indication of whether an appliance supports a soft power off state that maintains a network connection. Hence, it is not possible for the plugin to identify whether an appliance that the API reports as `DISCONNECTED` has been intentionally switched off or has lost contact with the Home Connect servers for other reasons. The plugin prioritises technical accuracy, so reports this as `SERVICE_COMMUNICATION_FAILURE` to HomeKit, which the Apple Home app displays as `Not Responding`.

Faking a "Power Off" state when the appliance is unreachable would misrepresent the appliance's true status. If the appliance does actually have connectivity problems then it may be powered on. Most Home Connect appliances do maintain Wi-Fi connectivity when switched off, so reporting `SERVICE_COMMUNICATION_FAILURE` correctly distinguishes between power off and failure to connect to the Home Connect servers.

#### Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?

<!-- INCLUDES: issue-83-6a23 issue-99-2377 issue-112-a111 issue-116-c4a9 -->
The `Busy` error is returned by the Home Connect cloud when an appliance cannot process a command, often because it requires physical interaction (e.g. filling a water tank or closing a door). If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required. This issue may also be caused by a transient issue with the Home Connect cloud service itself; check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

Failure to power certain ovens on or off is a known bug in the Home Connect API affecting specific models. If the appliance is physically ready but the power command is rejected, this is an external platform limitation. You should report such issues to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's E-Nr (part number).

#### What do `Gateway Timeout`, `Proxy Error`, or `Timeout on Home Connect subsystem` messages mean?

<!-- INCLUDES: issue-11-73ec issue-13-549a issue-19-d410 -->
Errors such as `SDK.Error.504.GatewayTimeout` (often logged as `Timeout on Home Connect subsystem`) or `Proxy Error` indicate that the Home Connect cloud servers are experiencing internal issues, high latency, or have unexpectedly terminated the event stream.

These are server-side problems within the Home Connect infrastructure and cannot be resolved by the plugin. The official Home Connect mobile application may remain functional because it often uses different communication paths or internal API endpoints not exposed to third-party integrations.

**What you can do**:
- Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for known outages.
- Wait for automatic recovery (typically 5-30 minutes).
- If the issue persists for hours, restart Homebridge to force a fresh connection.

#### Why does the log show `Home Connect subsystem not available` or a `503` error?

<!-- INCLUDES: issue-73-b97c -->
The error `Home Connect API error: Home Connect subsystem not available [503]` indicates a server-side maintenance issue or infrastructure outage. This is not a fault with the plugin or your local configuration. The issue is typically transient and is usually resolved by the Home Connect team within a few hours. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

**What you can do**:
- Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.
- Verify if the official Home Connect mobile app is functional; while outages often affect both, the app may sometimes remain functional due to using a local network connection to the appliance or different cloud API endpoints.
- If the issue persists for an extended period, you may wish to contact [Home Connect support](https://developer.home-connect.com/support/contact) directly.

#### Why am I seeing network errors like `EAI_AGAIN`, `ENOTFOUND`, `ETIMEDOUT`, or `ENETUNREACH`?

<!-- INCLUDES: issue-50-4e01 issue-137-3fe8 issue-276-249a issue-351-80b2 -->
These are standard networking errors indicating a DNS name resolution failure or loss of internet connectivity. This means your Homebridge host is unable to resolve the IP address for `api.home-connect.com` (or `api.home-connect.cn` for users in China).

To resolve this, ensure your Homebridge server has a stable internet connection and check the following:
1. **Diagnostic Commands**: Test DNS resolution using `dig api.home-connect.com` or `nslookup api.home-connect.com` from the same system.
2. **DNS Provider**: Try manually setting a public DNS provider (such as Google's `8.8.8.8` or Cloudflare's `1.1.1.1`) in your operating system's network configuration.
3. **Network Filtering**: Verify that local firewall or DNS filtering (like Pi-hole) is not blocking requests to the Home Connect API or AWS endpoints.

If using Docker:

1. **Address DNS/IPv6**: Problems frequently arise when IPv6 is enabled but not correctly routed. Try disabling IPv6 for the container using `--sysctl net.ipv6.conf.all.disable_ipv6=1` or forcing a specific DNS provider using `--dns 1.1.1.1`.
2. **Network Mode**: Consider switching the container to `host` network mode to bypass Docker's internal bridge networking.

The plugin will automatically attempt to reconnect once the network connection is restored.

#### Why is the log flooded with errors during a Home Connect outage?

<!-- INCLUDES: issue-34-cf10 -->
When the Home Connect API experiences an outage, the plugin may rapidly log attempts to restart the event stream. This is expected behaviour designed to ensure the most reliable recovery possible.

1. **State Consistency**: The plugin relies on the event stream for real-time updates. Frequent reconnection attempts minimise the risk of missing appliance events and ensure synchronisation as soon as the service resumes.
2. **Diagnostic Integrity**: Detailed logs of every connection attempt and the specific error returned are vital for diagnosing intermittent platform failures and developing workarounds.
3. **API Rate Limits**: The plugin is optimised to stay within rate limits even during outages. Introducing artificial delays adds complexity that could interfere with the normal recovery process.

While this produces more log data during an outage, it ensures the plugin recovers without manual intervention.

#### Why does my multi-cavity oven show a `BSH.Common.Error.InvalidUIDValue` error?

This error typically occurs with multi-cavity appliances where only the main oven supports Home Connect functionality. If the Home Connect API continues to advertise the secondary oven despite it lacking remote capabilities, queries for its programs will fail with `BSH.Common.Error.InvalidUIDValue`. 

The plugin handles this gracefully by ignoring the error and disabling program control for the unsupported cavity. This is an issue with the Home Connect API's device enumeration, which is occasionally addressed by manufacturer server-side updates.

#### Why does starting the Silence program on my dishwasher fail?

<!-- INCLUDES: issue-374-e780 -->
Some dishwasher appliances offer both a dedicated **Silence** program (e.g. `NightWash`) and a **Silence on Demand** option that modifies other programs. The Home Connect API restricts appliances to one active program at a time.

If you attempt to start the `NightWash` program while another program is already running, the API returns a `409 Conflict` error with `SDK.Error.WrongOperationState`.

This plugin supports starting a new program with the `SilenceOnDemand` option if configured, but it does not map program options to dedicated HomeKit services for modification of an already running program. This is a deliberate design choice because the API does not clearly signal which options can be validly modified dynamically.

#### How can I refresh appliance capabilities or resolve stale program information?

<!-- INCLUDES: issue-26-db7c issue-202-8138 -->
If an appliance program stops responding, fails to start, or reflects outdated capabilities (possibly due to a firmware update or server glitch), or if you need to force the plugin to re-discover all possible values for a program or option (e.g. to debug unrecognised keys), you can force a data refresh:

1. **HomeKit Identify**: Activating the `Identify` method for the accessory forces the plugin to refresh supported programs and rebuild the configuration schema. This can be triggered via third-party HomeKit apps such as **Eve** (labelled as **ID**). This also triggers a comprehensive query and logging of available programs and options.
2. **Clear Plugin Cache**: If issues persist, you can delete the cached appliance data:
    - **Stop Homebridge**.
    - Navigate to the plugin's persistent cache directory (typically `~/.homebridge/homebridge-homeconnect/persist`).
    - **Do not delete** the file named `94a08da1fecbb6e8b46990538c7b50b2` which contains your authorisation token. Deleting this will require you to re-authorise.
    - **Delete all other files** in that directory. These contain cached capabilities and will be regenerated automatically.
    - **Start Homebridge** to fetch fresh data from the Home Connect API.

#### 🚧 Why do my Home Connect appliances show as `Not Responding` in the Home app when I turn them off? 🚧

<!-- INCLUDES: issue-251-fbe8 -->
When certain appliances (commonly washers and dryers) are turned off using their front panel power button, they may disconnect entirely from the Home Connect cloud servers. The Home Connect API does not provide a way to distinguish between an appliance being manually powered off, unplugged from the mains, or losing its Wi-Fi/internet connection; in all these cases, the appliance simply appears as disconnected.

To ensure accuracy and consistency with native HomeKit devices, the plugin reports this state as a `SERVICE_COMMUNICATION_FAILURE`. This causes the Home app to display the device as `Not Responding`. While some Home Connect appliances remain in a low-power standby mode that maintains a cloud connection, others perform a complete internal power-down. 

The plugin does not offer a configuration option to "fake" an off state when an appliance disconnects because:
1. It would inaccurately represent the device's actual connectivity status.
2. The plugin architecture relies on the Power service being active to report status reliably.
3. Reporting a communication failure is the correct HomeKit behaviour for an unreachable accessory.

### Local/Remote Control

#### Why does my appliance show `No Response` when I try to start a program?

<!-- INCLUDES: issue-3-e7f1 issue-79-4e74 -->
To protect your safety and prevent your appliance from starting unexpectedly, **Remote Start must be physically enabled** on the appliance itself before remote control is permitted. This is a security-related hardware restriction that cannot be activated or overridden via the Home Connect API or this plugin.

Most appliances require you to press a physical button to enable this mode. The activation typically remains valid for a limited period or until the appliance door is opened. If you attempt to start a program via HomeKit when Remote Start is disabled, the plugin intentionally reports an error to HomeKit, which the Apple Home app displays as `No Response`. This is a deliberate design choice; reporting "Success" instead would be misleading, as the appliance would not actually start, and Siri or the Home app would incorrectly indicate that the appliance is running.

This plugin exposes the appliance's Remote Start status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### What does `LockedByLocalControl` or "Local Intervention" mean?

<!-- INCLUDES: issue-2-c3f8 issue-16-c565 -->
If you see an error like `Request cannot be performed temporarily! due to local actuated user intervention [BSH.Common.Error.LockedByLocalControl]`, it means the appliance is currently being operated via its physical buttons or knobs. This is a restriction built into the appliance firmware and the Home Connect API; it cannot be bypassed by the plugin.

To prevent conflicting commands and ensure safety, the Home Connect API blocks all remote control while a user is physically interacting with the appliance. While this lockout usually clears a few seconds after you stop touching the controls, some appliances may maintain the lockout for a longer period during certain maintenance cycles or until a specific manual interaction is completed.

This plugin exposes the appliance's Local Control status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### Why does my appliance report `Control scope has not been authorised` or `insufficient_scope`?

<!-- INCLUDES: issue-5-3245 issue-30-449e -->
This error occurs because the Home Connect API requires specific authorisation scopes to control **Oven** or **Hob** programs. While these were previously restricted to business partners, they were made available to independent developers in March 2021. If you authorised the plugin's connection to Home Connect prior to this, your token will not include the necessary permissions.

To resolve this, you must force a re-authorisation:

1. Stop Homebridge.
2. Delete the cached token file in the plugin's persistent storage directory (usually `~/.homebridge/homebridge-homeconnect/persist/94a08da1fecbb6e8b46990538c7b50b2`).
3. Restart Homebridge.
4. Follow the authorisation link provided in the logs or Homebridge UI to sign in again.

Note that the `FridgeFreezer-Images` scope remains restricted to approved business partners and is not supported by this plugin. The Home Connect API documentation describes it as requiring an "Additional Partner Agreement".

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-6026 -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Furthermore, Home Connect imposes strict rate limits, such as a maximum of 5 program starts per minute. To ensure reliability and avoid being blocked, the plugin serialises multiple characteristic changes (e.g. simultaneously turning on a light and adjusting brightness) into sequential API calls. Additional delays are inserted if the API indicates that a rate limit has been exceeded. This results in a noticeable but necessary lag between the HomeKit command and the appliance's physical response.

#### Why does my appliance fail to start when using the switch in the Home app?

<!-- INCLUDES: issue-149-ae5e -->
For most appliances this plugin exposes multiple `Switch` services to HomeKit, including Power, Active Program, and individual programs. By default, the Apple Home app often groups these separate services into a single accessory tile. Toggling this combined tile attempts to activate all underlying switches simultaneously, which results in conflicting requests and a `No Response` error.

For example, if a dishwasher tile is toggled, HomeKit might try to turn on power and start multiple programs at once. This is particularly problematic for **coffee machines**, which require significant start-up time for heating and rinsing; sending a "Power On" and "Start Program" command at the same instant will usually result in an error from the appliance as it is not yet ready.

To resolve this, you should configure the Home app to display these services individually:

1. Open the accessory settings for the appliance in the Home app.
2. Select **Show as Separate Tiles**.
3. Control the Power switch first, wait for the machine to complete its start-up sequence (if applicable), and then activate the desired program switch.

#### Why does my appliance frequently show `Disconnected (setting On error status)`?

<!-- INCLUDES: issue-306-b5fb -->
Frequent transitions between `Connected` and `Disconnected` states usually indicate transient communication interruptions between the plugin and the Home Connect cloud. This plugin relies entirely on the manufacturer's cloud-based API; if the connection between the appliance and the cloud, or the cloud and the plugin, is interrupted, the device must be reported as disconnected.

- **API Instability**: The Home Connect servers occasionally experience maintenance or instability. You can check the current status on the [Home Connect Server Status](https://homeconnect.thouky.co.uk/) page.
- **Local Network**: Weak Wi-Fi signals or intermittent internet drops can cause the appliance to lose its cloud heartbeat.

When these disconnections occur, the plugin logs the event and updates the HomeKit status to reflect that the device is unreachable. This is a reporting of the appliance's actual cloud state and cannot be resolved via plugin code changes.

### Programs and Options

#### Why does the log show `Unexpected fields`, `(unrecognised)` values, or code blocks?

<!-- INCLUDES: issue-145-3b74 issue-175-3d7e issue-189-e829 issue-190-e84b issue-198-b26f issue-199-f859 issue-200-1745 issue-202-bb2c issue-203-4555 issue-204-7213 issue-205-007f issue-206-4a1d issue-207-fb07 issue-209-bb2e issue-210-b8f3 issue-211-f9e3 issue-212-c927 issue-213-6ee5 issue-214-298a issue-216-198c issue-217-68d0 issue-219-85c9 issue-220-b400 issue-221-75f7 issue-222-b055 issue-223-c141 issue-228-b228 issue-231-a6d9 issue-233-0457 issue-235-b315 issue-236-cd27 issue-237-4f1f issue-238-a815 issue-243-6ba9 issue-244-d65d issue-246-2c5f issue-247-8e1e issue-248-cee7 issue-249-0f27 issue-252-2404 issue-253-01f9 issue-254-5a30 issue-255-37c5 issue-257-6688 issue-258-e981 issue-261-f0a2 issue-262-e72f issue-265-c490 issue-266-1044 issue-274-9060 issue-277-7b13 issue-278-36c0 issue-279-4938 issue-291-e546 issue-297-f476 issue-301-9995 issue-305-c3b1 issue-307-94f6 issue-309-bfa9 issue-312-1263 issue-313-5c17 issue-314-f707 issue-317-9950 issue-320-c379 issue-324-386b issue-326-59db issue-330-44ae issue-331-ce23 issue-332-73b2 issue-337-3b2d issue-344-04d9 issue-345-48d8 issue-346-924f issue-347-c6a7 issue-349-8e1b issue-355-88d9 issue-356-30ea issue-357-c258 issue-365-e16b issue-369-fc94 issue-372-7a45 issue-373-0d05 issue-377-3b83 issue-379-2e76 issue-381-fa8e -->
The plugin performs strict validation on data from the Home Connect API to ensure reliability. Because the API often deviates from its official documentation, or because new appliance models and firmware introduce undocumented features, the plugin includes a diagnostic mechanism to identify identifiers it does not yet recognise.

When the plugin encounters these values, it generates a technical diagnostic block in the log, formatted as TypeScript code and delimited by rows of `=` characters. This helps the maintainer update the plugin's internal schema and map features to HomeKit services.

If you observe these messages:

1. **Update the plugin**: Ensure you are running the latest version, as support for new values is added frequently.
2. **Report the values**: Wait approximately two minutes for the plugin to batch the data. Locate the URL provided in the log message immediately following the code block and click it to open a pre-populated GitHub issue.
3. **Provide the snippet**: Paste the entire technical diagnostic block from the log (including the `=` separators) into the **Log File** field of the issue template.

Once added, the warning will disappear and the features will be correctly mapped.

#### Why are some appliance features, programs, or options missing or unavailable?

<!-- INCLUDES: issue-1-d662 issue-17-56af issue-24-8ee6 issue-29-ff17 issue-42-d406 issue-42-e5af issue-44-1e1b issue-54-196a issue-62-bd95 issue-75-349e issue-76-7959 issue-77-6bec issue-122-b195 issue-141-568b issue-157-6512 issue-186-686f issue-201-c103 issue-202-c38d issue-208-0821 issue-250-36bc issue-273-cef7 issue-303-9e0f issue-316-e6c5 issue-368-b5fa issue-380-03ac -->
The plugin dynamically discovers the capabilities of each appliance by querying the Home Connect API rather than using hardcoded lists. Several factors can cause features to be missing or appear as `currently unavailable`:

- **Private API Limitations**: The official Home Connect app and certain partners (like IFTTT) use a private API with functionality not available to third-party developers. If a program or feature is missing from the [official public API documentation](https://api-docs.home-connect.com), the plugin cannot access it.
- **Appliance Settings**: Some programs, such as `Sabbath` mode, often require being explicitly enabled in the physical appliance settings menu before they are exposed via the API.
- **Program Specifics**: Maintenance cycles (such as drum cleaning, rinsing, or descaling) and user-defined programs are frequently restricted or not advertised with full configuration options via the public Home Connect API.
- **Operational Status**: A program may be reported as supported but currently unavailable if the appliance is busy, a cycle is already running, a door is open, or required consumables (water, detergent, coffee beans) are missing.

If a program is unexpectedly missing, try powering the appliance on, manually selecting it on the physical panel, and leaving it idle for one minute. Then, trigger the plugin to re-read details using the HomeKit **Identify** method. If the API continues to refuse access, contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact).

#### Why are fan controls missing for my integrated venting hob?

<!-- INCLUDES: issue-363-2f13 -->
Extractor fans integrated into hobs (venting hobs) are not exposed by the Home Connect API as controllable features.

The Home Connect API is architected to support a single active program per appliance. Devices that support multiple simultaneous programs are exposed by the API as multiple appliances, e.g. the two cavities of dual ovens. The extractor fan in hood appliances operate as programs (e.g. `Cooking.Common.Program.Hood.Automatic`), so a hob with an integrated fan would need to expose a separate hood appliance for it to be controllable via the Home Connect API, which is not currently the case. Users affected by this should contact the [Home Connect developer team](https://developer.home-connect.com/support/contact) to request that the fan be exposed as a separate Hood appliance.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-7106 issue-78-6bc5 issue-288-9266 issue-328-99fc -->
This warning typically occurs in two different contexts:

- **Monitor-Only Programs**: Some appliances support maintenance cycles (such as rinsing, drum cleaning, or descaling) and user-configured favourites that the API allows the plugin to monitor but not control remotely. The plugin logs these when they are detected but cannot be started via HomeKit.
- **Startup Timing**: You may see a transient warning during Homebridge startup or after clearing the cache. This happens if an appliance reports a program selection event before the plugin has finished loading the full list of supported programs from the API.

This is often a known inconsistency in the Home Connect API's behaviour. When the plugin identifies this discrepancy, it deliberately avoids querying the API for further details to prevent invalid requests that would unnecessarily consume your daily API rate limit quota. In these cases, the messages are often cosmetic and the plugin will automatically refresh necessary details once initialisation is complete.

#### Why is my appliance stuck during initialisation, showing as `Not Responding`, or missing all options?

<!-- INCLUDES: issue-27-a038 issue-42-d406 issue-290-df65 issue-292-77b3 issue-315-9e82 issue-323-f483 issue-329-1549 issue-333-49b8 issue-335-7107 issue-342-27bc -->
The plugin discovers appliance capabilities during startup and caches them. This process can fail if the appliance is offline, busy, or has an open door. Technical issues such as API instability, missing consumables, or transient server errors can also cause discovery to fail. When this occurs the log typically includes messages like `Waiting for ... features to finish initialising` or `Appliance initialisation is taking longer than expected`.

Note that the official Home Connect app uses a private API and may still appear to show the appliance as online while the public API used by this plugin reports it as offline. To resolve this, perform the following diagnostic steps:

1. **Check the Home Connect Server Status**: Visit the [unofficial status page](https://homeconnect.thouky.co.uk/) to rule out platform-wide outages.
2. **Perform the Mobile Data Test**: Disable Wi-Fi on your mobile device and attempt to control the appliance via the official Home Connect app using cellular data. If the official app shows the device as offline or cannot control it, the issue lies with the appliance's connection to the Home Connect cloud servers.
3. **Confirm Consumables and Maintenance**: Verify that all maintenance requirements (cleaning, descaling, refills) are met and the door is closed.
4. **Power Cycle**: Disconnect the appliance from the mains power for 30 seconds to force its internal firmware to re-register with the cloud servers.
5. **Delete Cache Files**: If the issue persists, stop Homebridge and delete the appliance's cache files in `~/.homebridge/homebridge-homeconnect/persist`. Do not delete the authorisation file `94a08da1fecbb6e8b46990538c7b50b2`.
6. **Refresh Connection**: As a last resort, remove the appliance from the Home Connect app and re-add it to your home network.

#### Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?

<!-- INCLUDES: issue-18-14c6 -->
The Home Connect API requires that certain values follow strict increments. If a value is provided that is not an exact multiple of the required step size, the API will return a validation error even if the value falls within the permitted minimum and maximum range.

The plugin attempts to mitigate this by providing dropdown menus or adding the required step size to the field description in the Homebridge UI. When manually entering values, ensure they align with the increments specified in the configuration interface. Using the up/down arrows in the Homebridge UI will typically snap the value to the correct step.

#### Why are Pause and Resume features missing or inconsistent?

<!-- INCLUDES: issue-8-8852 -->
Experimental support for pausing and resuming programs is implemented via the HomeKit `Active` characteristic, but there are several limitations:

- **App Support**: Apple's native Home app does not display the pause/resume controls for most appliance types. You must use a third-party app like *Eve* or *Home+* to access these functions.
- **API Inconsistency**: Support for these commands varies significantly between firmware versions. Many appliances do not support `PauseProgram` via the public API despite documentation suggesting otherwise. Others may support pausing but not resuming.

The plugin dynamically detects supported commands for each specific appliance. If the options do not appear in a compatible third-party app, it indicates your hardware or firmware does not support the feature via the public API.

#### Why doesn't the plugin automatically turn on my coffee machine when I start a beverage program?

<!-- INCLUDES: issue-242-6a1e -->
The plugin does not implement automated sequencing, such as powering on an appliance and waiting for it to be ready before starting a program, for several reasons:

- **HomeKit Feedback and Timeouts**: The plugin is designed to wait for an API response before confirming success to HomeKit. This ensures that when using Siri, you receive immediate feedback if a command fails. A multi-step sequence (Power On -> Wait -> Start Program) would exceed HomeKit's response timeout or require reporting success prematurely, hiding subsequent failures from the user.
- **State Reporting Inconsistency**: Different coffee machine models report power and readiness inconsistently. Some allow starting a program from an `Off` state, while others require an explicit `On` command and a specific 'Ready' state.
- **Maintenance Cycles**: Many machines perform an automatic rinse when powered on. Automating drink selection immediately after power-on could result in coffee being dispensed into rinse water, or could fail because the user has not yet placed a cup.
- **Device Behaviour**: Many other appliances automatically power on when a program command is received via the API, making additional sequencing unnecessary for those models.

If your model requires manual power-on, you should use the Apple **Shortcuts** app to create a sequence (e.g. Turn On -> Wait -> Start Drink) tailored to your appliance's behaviour.

#### Why is the `Active Program` switch failing or unavailable in HomeKit?

<!-- INCLUDES: issue-224-64d5 -->
The generic `Active Program` switch relies on the Home Connect API reporting which program is currently selected on the physical appliance via `BSH.Common.Root.SelectedProgram` events. 

Several factors limit its reliability:
- **API Event Dependency**: Many appliances (especially washers and dryers) do not consistently generate selection events. If the plugin does not know which program is selected, it cannot send the required identifier to the API to start the machine.
- **Scenes and Automations**: If the plugin cannot determine the selected program, HomeKit may treat the switch as read-only or prevent it from triggering within scenes to avoid inconsistent states.

To ensure reliable automation, it is recommended to use **specific named program switches** (e.g. `Cotton`, `Eco 50`) instead of the generic `Active Program` switch. These explicitly define the program to be started and do not depend on the appliance's current physical selection state.

#### How can I trigger the Identify function in the Eve app?

<!-- INCLUDES: issue-37-73d3 -->
To trigger the `Identify` mechanism within the Eve app:

1. Navigate to the **Rooms** tab and locate the appliance.
2. Tap the name of the appliance to open the detailed view (do not tap a toggle or slider).
3. Tap the appliance name or the small arrow at the top of the screen, just below the **Edit** button.
4. Tap the **ID** button that appears next to the settings cog.

This will trigger the identification sequence on the physical appliance and force the plugin to refresh its cached data.

#### How can I enable dishwasher options like Half Load, Extra Dry, or Efficient Dry in HomeKit?

<!-- INCLUDES: issue-138-5e6c issue-341-3673 -->
Home Connect distinguishes between global [settings](https://api-docs.home-connect.com/settings/) (like Child Lock) and program-specific [options](https://api-docs.home-connect.com/programs-and-options/) (like `HalfLoad`, `ExtraDry`, or `EfficientDry` / `EcoDry`). 

Because these are program options rather than independent settings, they must be configured as part of a specific program's execution and are not exposed as standalone HomeKit switches. By default, the plugin creates a HomeKit `Switch` for each program using its default settings. To use specific options, you must configure a **Custom list of programs and options** in the plugin settings and explicitly define the desired options for each switch.

#### Why does my appliance turn on automatically, switch off immediately, or Homebridge startup stall?

<!-- INCLUDES: issue-19-c2a7 issue-20-397f issue-32-acbc issue-78-1a42 -->
To identify an appliance's specific programs and valid option ranges, the plugin must perform a discovery routine. Many appliances only report this data via the API when they are powered on and the specific program is selected.

This discovery phase typically occurs upon the first successful authorisation of the plugin, after manually deleting persistent cache files, or when the **Identify** mechanism is triggered. During this process:

1. **Power On**: The appliance switches on automatically. If it has an automatic rinsing cycle (common with coffee machines), the plugin will wait up to two minutes for it to finish.
2. **Iteration**: The plugin briefly selects each available program in sequence to fetch supported options.
3. **Restoration**: Once complete, the plugin restores the appliance to its original state (usually Off or Standby).

This typically happens only once during initial setup or after a cache deletion. Results are cached in the plugin's `persist` directory. If this happens every time Homebridge restarts, check the logs for errors like `409 Conflict` or `SDK.Error.WrongOperationState`, which suggest discovery failed because the appliance was busy or the door was open. If no cache exists and the appliance is offline, startup will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-d84f -->
When a program is started without explicit option configuration, the plugin does not specify any parameters in the Home Connect API request. In these cases, the Home Connect servers or the appliance itself determines the values, typically defaulting to the factory settings or the last values used on the physical interface. This behaviour is intended to mirror selecting a program manually on the appliance without making adjustments.

To view the default values for each program option, enable **Debug Logging**, use the HomeKit **Identify** function, and check the debug log. Specific options such as coffee strength or beverage volume can be customised in the plugin configuration, most easily through the Homebridge UI interface.

#### How can I change the default duration or temperature for oven programs?

<!-- INCLUDES: issue-55-16dd issue-70-9b78 -->
When started remotely via the API, oven programs **must** have a defined duration. If no duration is provided, the Home Connect API typically defaults to 60 seconds. The API does not currently support starting an oven program without a duration or with a value representing infinity.

To resolve this, use the **Custom list of programs and options** in the plugin settings to explicitly set a `Duration` (for example, `3600` seconds) for your oven switches. This ensures the oven remains on until the timer expires or you manually stop it.

#### Why is the scheduled start time for my appliance program not being honoured?

<!-- INCLUDES: issue-293-c49d -->
The plugin does not perform internal time zone processing or use the location settings from your Home Connect account. Instead, it relies entirely on the local time zone of the server running Node.js and Homebridge. If a scheduled program, such as one using `BSH.Common.Option.StartInRelative`, triggers at an unexpected time, it is likely that your server is configured to a different time zone (often UTC/GMT by default).

To resolve this:
1. Verify your server's current time zone configuration. On most Linux distributions, you can use the `timedatectl` command.
2. Ensure the operating system or container environment is set to your correct local time zone.
3. If you cannot change the system-wide settings, you can explicitly set the time zone for the Homebridge process by configuring the `TZ` environment variable (for example, `TZ=Europe/London`).

#### How can I reduce the number of switches created for appliance programs?

<!-- INCLUDES: issue-49-35dc issue-240-65b3 issue-368-4f23 -->
By default, the plugin creates individual `Switch` services for every supported program. For complex appliances, this can clutter the HomeKit interface. You can modify this behaviour in the plugin configuration via Homebridge UI:

- **No individual program switches**: Enable this option in the appliance settings to hide all program switches. This does not affect state monitoring or basic power controls.
- **Custom list of programs and options**: Use this to manually define which specific programs appear in HomeKit, and the options to use with each.
- **A switch to start each appliance program** (default): Advertise all available programs using default options.

#### What does the log message `Using expired cache result` mean?

<!-- INCLUDES: issue-288-674a -->
The plugin caches technical details about appliance programs because the Home Connect API only allows this information to be retrieved reliably when a program is selected but not yet running. The plugin considers this cache expired if the program has not been selected on the appliance for more than 24 hours.

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

#### Why is the power off function unavailable for my washing machine or dryer?

<!-- INCLUDES: issue-3-9970 -->
The ability to turn an appliance off is determined by the Home Connect API and the specific hardware. According to the official Home Connect API documentation, laundry appliances (washers, dryers, and washer-dryers) typically only support an `On` power state; they do not support being switched to `Off` or `Standby` remotely. This is likely to be due to these appliances using a physical power switch that also interrupts power to the Home Connect Wi-Fi module, instead of using a soft standby mode like other Home Connect devices.

You can verify the capabilities of your specific appliance by checking the Homebridge logs during startup. The plugin queries each appliance for its supported power states and will log `Cannot be switched off` if the hardware only permits the `On` state via the API.

#### 🚧 Why does the log show code blocks with `// (unrecognised)` entries? 🚧

<!-- INCLUDES: issue-282-79e6 -->
These log entries are generated when an appliance reports a value—such as a program, setting, or status—that is not yet defined in the plugin's internal database. This typically occurs with newer appliance models (for example, the Siemens `CM936GCB1/C5`) or when a firmware update introduces new functionality.

The log is formatted as a TypeScript snippet to assist with integrating the missing value into the plugin's code. If you see these blocks in your logs:

1. Ensure you are running the latest version of the plugin. Support for newly discovered API values is added frequently in regular updates.
2. If the log persists on the latest version, open a GitHub issue and provide the complete block of code starting from `export type...` to the end of the equals sign separator. This allows the maintainer to add formal support for the specific value in a future release.

#### 🚧 What should I do if the logs show unrecognised Home Connect API keys or values? 🚧

<!-- INCLUDES: issue-283-831d -->
The Home Connect API includes a wide variety of appliance-specific settings and options. While the plugin supports many common features, new or model-specific keys may occasionally be unrecognised. The plugin is designed to identify these and provide a way for users to report them for inclusion.

When the plugin detects unsupported data, it generates a formatted block of code in the logs with the instruction: `Just paste the following into the "Log File" field and submit the issue`.

To assist in adding support for these features:
1. Copy the code block from your logs, including the interface definition and any lines marked as `(unrecognised)`.
2. Create a new issue on the GitHub repository.
3. Paste the copied text into the **Log File** field of the issue template.

Submitting these snippets allows the maintainers to map the technical keys used by your specific appliance model to HomeKit characteristics in a future update.

#### 🚧 Why does the log show `(unrecognised)` next to some appliance programs or options? 🚧

<!-- INCLUDES: issue-284-483e -->
The plugin maintains an internal schema of known programs, options, and settings for various appliances. When the Home Connect API returns a value that is not yet in this list—often because a manufacturer has released a new feature that is not yet reflected in the official API documentation—the plugin logs it with an `(unrecognised)` comment.

To address this:
1. **Update the plugin**: Check if a newer version of `homebridge-homeconnect` is available, as support for new appliance features is added regularly.
2. **Report the value**: If the value persists on the latest version, please open a GitHub issue and include the log lines containing the `(unrecognised)` tag. This information allows for the value to be formally added to the plugin's definitions in a future release.

#### 🚧 Why does the log show `(unrecognised)` alongside `Union types` or `OptionValues`? 🚧

<!-- INCLUDES: issue-285-9573 -->
The plugin identifies programs, options, or status values sent by your appliance that are not currently defined in the plugin's internal database. This usually occurs with newer appliance models or firmware updates that introduce features not yet covered by the official Home Connect API documentation.

The plugin detects these unknown identifiers and prints the technical definitions required to support them in a formatted block. If you see a log entry delimited by `====================` containing lines marked as `(unrecognised)`, please follow these steps:

1. Copy the entire block from the log, including the header and footer lines.
2. Open a new issue on the GitHub repository.
3. Provide the model number of your appliance.
4. Describe the action you were taking (for example, selecting a specific program on the appliance's physical control panel) when the log entry appeared.

This information is used to update the plugin's schema, ensuring that new features are correctly recognised and exposed to HomeKit in future releases.

#### 🚧 What should I do if the log shows `Home Connect API returned keys/values that are unrecognised by this plugin`? 🚧

<!-- INCLUDES: issue-286-9052 -->
The plugin maintains internal definitions for Home Connect programs, options, and statuses to ensure reliable operation and type safety. When an appliance uses a feature not yet present in these definitions—often due to new firmware, undocumented API extensions, or recent appliance models—the plugin logs a warning.

To resolve this:
1. Ensure you are running the latest version of the plugin. Support for newly discovered appliance features is added regularly, and an update may already include the missing keys.
2. If the warning persists on the latest version, follow the link provided in your logs to create a new GitHub issue. The log generates a specific URL that helps pre-fill the necessary information.
3. Copy the formatted technical details from your log (the sections beginning with `export type ProgramKey` or `export interface EventNotifyValues`) and paste them into the issue description.

Providing these details allows the maintainer to update the plugin's internal mappings, ensuring that your appliance's full functionality is correctly exposed to Homebridge.

#### 🚧 Why does the log show `(unrecognised)` for some Home Connect program keys or settings? 🚧

<!-- INCLUDES: issue-287-d4de -->
The plugin maintains an internal registry of known Home Connect API keys, programs, and options. When an appliance reports a value that is not in this registry, it is logged with an `(unrecognised)` label. This typically occurs because the Home Connect API documentation is not always up-to-date with new appliance models or firmware releases.

To resolve these messages:
1. **Update the plugin**: Check if a newer version of `homebridge-homeconnect` is available, as support for new programs is added frequently.
2. **Report new values**: If the latest version still shows unrecognised values, please open a GitHub issue. Include the relevant section of your log file. The plugin is designed to output these unrecognised entries as TypeScript code snippets, which allows the maintainer to quickly integrate them into future releases.

### Appliance Status

#### Why does my appliance status appear stuck or show as offline in HomeKit?

<!-- INCLUDES: issue-15-1a1d issue-74-dd76 issue-170-750c -->
The plugin relies on a real-time Server-Sent Events (SSE) stream from the Home Connect API to receive status updates. Because the Home Connect API enforces extremely restrictive rate limits, the plugin does not perform regular polling; it only fetches the full status when it first starts or following a reconnection to the event stream.

The API sends a `KEEP-ALIVE` event approximately every 55 seconds. The plugin monitors this and will automatically re-establish the stream if no activity is detected for 120 seconds. If status changes (like a dishwasher finishing or a door opening) are not appearing in HomeKit, the stream may have stalled.

To troubleshoot:

1. Enable the **Log Debug as Info** plugin option to see all raw events received from the API. If no events are logged when you interact with the appliance, the issue resides with the Home Connect platform or appliance.
2. Ensure the appliance has successfully reconnected to Wi-Fi after being powered on; many devices have a delay before they re-establish a cloud connection.
3. Restart Homebridge to force the plugin to subscribe to a fresh event stream.
4. Ensure your network configuration does not prematurely terminate long-lived TCP connections.

#### Why is my appliance unresponsive or reported as offline in Homebridge but working in the official app?

<!-- INCLUDES: issue-40-61af issue-41-4190 issue-61-67ee issue-71-ad07 -->
The official Home Connect mobile app can communicate with appliances via two distinct paths: a local network connection (when your phone and appliance are on the same Wi-Fi) and a private interface to the Home Connect cloud servers. All third-party integrations, including this plugin, are restricted to using the public cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose and resolve this:

1. **Test Cellular Connection**: Disable Wi-Fi on your mobile device to force the official Home Connect app to use cellular data. If the appliance becomes unresponsive in the app, the issue is with its connection to the Home Connect servers.
2. **Verify Network Stages**: In the official app, navigate to the appliance settings and locate the **Network** section. Ensure that all three connection stages (**appliance-app**, **appliance-cloud**, and **app-cloud**) are active (typically shown by three green lines). If the line between the appliance and the cloud is red, the device is not communicating with the cloud servers.
3. **Power Cycle**: Power cycle the appliance at the mains to force a reconnection to the Home Connect servers.

Most connectivity issues are transient and will resolve themselves once the appliance reconnects to the servers or the cloud service stabilises. You can also check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for platform-wide outages.

#### Why do my appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-1e99 -->
The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as an appliance is associated with your account in the Home Connect API, it will persist in HomeKit. Being unreachable or powered off does not trigger the removal of the accessory from HomeKit, but the Home app will display it as **No Response**. Dynamically adding and removing appliances from HomeKit based on their connectivity would result in loss of user configuration, such as their name, location, scenes, and automations.

If you observe inconsistent behaviour, such as devices unexpectedly appearing or disappearing, this may be due to a synchronisation issue within HomeKit or the Homebridge cache. This can often be resolved by removing the bridge from the Home app, clearing the Homebridge cache files, and then re-adding the bridge.

#### Why does the log show a program running or time remaining when my appliance is off?

<!-- INCLUDES: issue-5-af4b -->
The plugin reflects the real-time status and events reported by the Home Connect API servers. If the logs indicate that a program is active or shows a countdown while the appliance is idle, it means the plugin is receiving these specific events from the Home Connect cloud service. This is typically caused by a server-side state mismatch or a delay in the event stream where old status updates are delivered late.

To resolve this, try the following:

1. Start and then manually stop a program using the official Home Connect app or the physical appliance interface to reset the server state.
2. Power cycle the appliance at the mains to force a reconnection and state refresh.
3. Use a third-party HomeKit app such as Eve to inspect technical characteristics like `Active` and `Remaining Time` for more detail than the standard Apple Home app.

This is a transient server-side or firmware issue that cannot be corrected by the plugin itself.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-dad9 -->
Some Bosch dishwasher models appear to re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a connection to the Home Connect cloud after being offline. The plugin maps events from the API directly to HomeKit triggers; therefore, these re-broadcasts are passed through as button presses or notifications. This is a quirk of the appliance firmware or API event handling rather than a defect in the plugin itself.

#### Why is the log filling up with oven `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-c039 -->
These events are generated whenever the Home Connect servers report a change in the appliance's internal temperature. Home Connect appliances, such as ovens, typically remain in a standby state rather than being fully powered off unless disconnected from the mains. In this state, the appliance continues to monitor internal sensors and communicates changes to the Home Connect servers.

The plugin logs all status information reported by the API. There is no configuration option within the plugin to suppress specific status messages. To prevent them from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge **Child Bridge**. This isolates the plugin's output and ensures that high-volume events do not obscure logs from other plugins.

#### Why does the log periodically show `Found X appliances (0 added, 0 removed)`?

<!-- INCLUDES: issue-272-a6d5 -->
This message is generated by the plugin's periodic polling of the Home Connect API to discover any new or removed appliances. This ensures that changes to your Home Connect account are reflected in Homebridge without requiring a manual restart.

There are plans to replace this polling mechanism with a more efficient event-based approach using `PAIRED` and `DEPAIRED` events from the Home Connect event stream. Once this enhancement is implemented, these log messages will only be generated when an appliance is actually added or removed from the account.

#### Why is the dishwasher door control read-only in HomeKit?

<!-- INCLUDES: issue-327-6ad4 -->
The Home Connect API currently restricts door functionality for dishwasher appliances to monitoring-only. Remote control of the door is limited by the API to specific oven and fridge/freezer models, and even then, it is dependent on the specific appliance hardware. For dishwashers, the `Door` service in HomeKit is read-only; it will correctly indicate whether the door is open or closed, but it cannot be used to trigger the door to open. This is a limitation of the Home Connect API rather than the plugin itself.

#### Why does my refrigerator or freezer always show as Open in HomeKit even when it is closed?

<!-- INCLUDES: issue-382-7d17 -->
Some refrigeration appliances, such as certain Thermador models, have been observed to always report the door as `Open`. They correctly trigger door open alarms, but do not generate events for changes to the door status itself. This suggests a firmware limitation or a bug in the Home Connect cloud service.

To troubleshoot and potentially work around this:

1. **Expose individual door services**: Some appliances report a combined status as well as individual statuses for different compartments (e.g. `ChillerLeft`, `Freezer`, `Refrigerator`). Configure the plugin to expose these specific door services, as they may update correctly even if the combined status does not.
2. **Enable debug logging**: Use the **Log Debug as Info** option to see the raw values being returned by the API. This confirms if the plugin is receiving `BSH.Common.EnumType.DoorState.Open` or `Refrigeration.Common.EnumType.Door.States.Open` from the server while the door is physically closed.
3. **Contact Support**: If the raw API values are incorrect, the issue should be reported to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) as it likely requires a firmware fix.

#### Can I use data from the Home Connect status page for automations or scripts?

<!-- INCLUDES: issue-306-65ff -->
No. The [unofficial Home Connect Server Status](https://homeconnect.thouky.co.uk/) page is provided solely for manual diagnostic purposes to help users identify if connectivity issues are platform-wide. There are no plans to provide an API for third-party use or automated scripts. Automated scraping or frequent polling of the status page is unsupported and may result in the requesting IP being blocked.

#### Why do Home Connect appliances disappear or lose their Favourites status in the Home app?

<!-- INCLUDES: issue-52-1e99 -->
The plugin creates HomeKit accessories based on the list of appliances provided by the Home Connect API. These accessories should remain visible in the Home app even when the physical device is switched off or disconnected from Wi-Fi.

If accessories spontaneously disappear, reappear, or lose their HomeKit configuration (e.g. room assignments, custom names, scenes, or automations) it is usually due to one of the following:

1. **Home Connect API Instability**: If the API temporarily fails to report an appliance during a synchronisation check, the plugin may remove the corresponding accessory from HomeKit. When the API later reports the appliance again, the plugin recreates it as a new accessory. Because HomeKit treats this as a brand-new device, all previous configurations are lost.
2. **HomeKit Cache Issues**: Local database corruption within the Apple Home app or Homebridge can lead to inconsistent UI behaviour where devices appear to vanish or move.

To resolve these issues:

- Check the Home Connect API status to rule out cloud service disruptions.
- If the behaviour is persistent, perform a clean reset of the integration. This involves removing the affected accessories (or the entire bridge) from the Home app, stopping Homebridge, and deleting the `persist` and `accessories` cache files before restarting and re-pairing.

## Apple HomeKit

### HomeKit Accessories, Services, and Characteristics

#### Why does the Apple Home app not show the remaining time or detailed status for my appliance?

<!-- INCLUDES: issue-2-4fcb issue-3-a6f3 issue-36-ee06 issue-48-b565 issue-68-c09d issue-114-eae0 issue-124-ba42 issue-225-4543 issue-230-e24b -->
The plugin exposes the `Remaining Duration` characteristic and other status information to HomeKit for all supported appliances, typically on the `Active Program` switch service.

However, the Apple Home app only displays this information for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` services. While a `Valve` service might appear applicable to "wet" appliances like dishwashers or washing machines, it is semantically inappropriate for many other Home Connect types that also report remaining time, such as ovens, dryers, or coffee machines. The maintainer has explicitly decided against using these semantically incorrect service types to force compatibility with the Apple Home app UI, as this would result in a confusing and inaccurate representation of the appliance within the HomeKit ecosystem.

To view the remaining time, or use other characteristics that the Apple Home app hides, you must use a third-party HomeKit application (such as *Eve*, *Home+*, or *Controller for HomeKit*). Look for the **Remaining Duration** characteristic on the Active Program switch service. These applications support the full range of standard HomeKit characteristics and allow them to be used in automations.

#### Why are the power and program switches for my appliance in a random order in HomeKit?

<!-- INCLUDES: issue-7-871f -->
The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services, such as the power `Switch`, various program control `Switch` services, and event `Stateless Programmable Switch` services, individual HomeKit apps determine how to order them.

Although HAP includes a `Service Label Index` characteristic, it is specifically intended for ordering `Stateless Programmable Switch` services and is not officially supported or respected by apps for other service types. Technical attempts to influence the order—such as marking the power switch as a `Primary` service or using `Linked` services to group controls—have proven inconsistent across different applications. In some cases, these changes actually made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as *Eve*, *Home+*, and *Hesperus*, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

#### Why can I not hide certain switches, or why do they remain visible or unresponsive after being disabled?

<!-- INCLUDES: issue-57-124f issue-77-e342 issue-124-45f8 issue-364-a64b -->
The plugin allows for granular control over which services are exposed to HomeKit, but there are some architectural constraints:

1. **Core Services**: The main `Switch` service for the appliance power is fundamental and cannot be disabled.
2. **Optional Services**: Most other features, such as the `Active Program` switch or `Internal Light`, can be individually disabled in the plugin configuration. Note that disabling the `Active Program` switch also removes status indicators (`On`, `Status Active`, `Status Fault`) and the `Remaining Duration` characteristic.
3. **Individual Programs**: The `Switch` services for individual programs can be completely customised with chosen programs and options.
4. **Appliance Exclusion**: Whole appliances can be disabled to prevent them being exposed to HomeKit.

If services remain visible in HomeKit (often appearing as "unresponsive") after you have configured them to be hidden, it is likely due to HomeKit's internal caching and synchronisation mechanisms rather than the plugin itself. When a feature is disabled, the plugin removes the service from the accessory definition, but HomeKit may retain a stale cached version across multiple hubs or iCloud-synced devices. To resolve persistent stale entries, try these steps in order:

- **Check the logs**: Verify the plugin is removing the service. You may see a message such as `Removing obsolete service "Internal Light"` if the service was restored from the Homebridge cache but is now disabled.
- **Restart Homebridge**: This triggers a fresh configuration update to HomeKit.
- **Wait**: Allow several hours for iCloud synchronisation to reconcile the state across all your devices.
- **Reboot the Home Hub**: Restart your primary Apple TV or HomePod.
- **Reset iCloud**: Sign out of iCloud on the Home Hub and sign back in.
- **Remove the bridge**: As a last resort, remove the Homebridge bridge from HomeKit and re-add it.

#### Why is temperature control not supported for fridges, freezers, or ovens?

<!-- INCLUDES: issue-58-7df2 -->
The HomeKit Accessory Protocol (HAP) only defines standard temperature services (`Heater Cooler`, `Temperature Sensor`, and `Thermostat`) for environmental climate control. Using these for appliances introduces significant issues with Siri voice control and HomeKit logic:

- **Siri confusion**: Siri may conflate the appliance's internal temperature with the ambient room temperature.
- **Incorrect voice responses**: Asking "what is the temperature in the kitchen?" might report the fridge's setpoint instead of the room temperature, or incorrectly incorporate it into a reported range.
- **Unintended control**: A command to "set the kitchen to 21 degrees" might inadvertently attempt to adjust the appliance settings.

To maintain the integrity of voice control, this plugin exposes fridge and freezer modes (such as Super, Eco, Vacation, and Fresh modes) as individual `Switch` services instead of temperature controls. The plugin will only adopt new HomeKit services if Apple introduces specific appliance-grade definitions that do not conflict with ambient climate controls.

#### Why is my appliance door appearing as a `Door` service or security device instead of a `Contact Sensor`?

<!-- INCLUDES: issue-303-3c06 issue-350-8ab5 issue-361-065e -->
The plugin uses the `Door` service to represent appliance doors by design, as this is the most semantically accurate HomeKit service for the hardware. While many appliances only provide a read-only door status, the Home Connect API supports `Open Door` and `Partly Open Door` commands for specific high-end models. Mapping these to a `Door` service allows the plugin to expose this control functionality where supported; on other models, it remains a read-only sensor.

Because Apple Home categorises all `Door` services as security-related accessories, you may see the appliance grouped with locks or sensors, and receive automatic notifications when the door state changes. This is standard HomeKit behaviour and cannot be changed by the plugin. If this behaviour is not desired, you have two options:

1. **Disable notifications**: Within the Apple Home app, navigate to **Home Settings** > **Doors** and toggle off notifications for the specific appliance door.
2. **Disable the service**: You can completely hide the `Door` service within the plugin configuration for that appliance.

#### Why does my fridge-freezer only show a single door status for all compartments?

<!-- INCLUDES: issue-43-380f -->
The Home Connect API originally only provided a single combined door status for all appliances. The API was extended in August 2023 to report separate status for each door of refrigeration appliances. When this plugin was subsequently extended to support a HomeKit `Door` service for each physical door, the default configuration was selected to match the previous behaviour, i.e. with only a single `Door` service per appliance. The individual door statuses can be enabled via the plugin's configuration.

#### Why can I not set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-93f5 -->
HomeKit does not currently define services or characteristics with the correct semantics for a general-purpose appliance alarm timer. Mapping this functionality to existing, unrelated HomeKit services or characteristics would result in incorrect behaviour and cause issues when using Siri.

To maintain HomeKit consistency and ensure reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer. This feature will only be considered if Apple introduces suitable HomeKit definitions that match the behaviour of appliance timers.

#### Why do multiple services or programs appear with identical names in the Apple Home app?

<!-- INCLUDES: issue-108-edb7 issue-116-5ab3 issue-196-7bf5 issue-230-fe75 -->
If multiple program switches appear with identical generic names (such as "Dryer"), this is typically caused by the Apple Home app's display logic rather than the plugin itself. To resolve this:

1. Force-quit and restart the Apple Home app to see if the names refresh.
2. If names remain identical, open the settings for an individual switch in the Home app and delete the prefix or appliance name from the name field. This often reveals the unique name (e.g. "Cotton Eco") that was previously hidden.
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

#### Why is hood fan speed controlled using percentages instead of discrete levels?

<!-- INCLUDES: issue-2-aa7e -->
The HomeKit Accessory Protocol (HAP) defines the `Rotation Speed` characteristic as a percentage (0–100%). To maintain compatibility with Siri voice commands such as "low", "medium", and "high", the plugin maps the appliance's discrete speed levels (e.g. stages 1 to 4) to specific percentage values (e.g. 25%, 50%, 75%, and 100%).

Direct control using discrete level numbers is not supported by the HomeKit fan service specification. Using percentages ensures that the fan works correctly with standard HomeKit sliders and provides consistent voice control across all Apple devices.

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

<!-- INCLUDES: issue-2-bdbd issue-84-6da7 issue-362-0e29 -->
The Home Connect API defines appliance lights (such as internal refrigerator lights or hood lighting) as settings that often include more than just simple on/off functionality. These can support `Brightness`, `ColorTemperature`, or `Color` depending on the specific model. The plugin uses the HomeKit `Lightbulb` service to allow for the full range of hardware capabilities to be exposed to HomeKit.

Many models, particularly hoods, have a hardware-enforced minimum brightness of 10%. The Home Connect API reflects this limitation; dragging the brightness slider below this threshold in HomeKit will typically turn the light off entirely rather than dimming it further.

A side effect of the lightbulb mapping is that Siri will include these appliance lights when you issue commands to turn off the lights in a specific room. If you do not want an appliance light to be controlled or grouped with your room lighting, you should disable that specific service in your Homebridge configuration.

#### Why is the colour temperature on my hood inverted?

<!-- INCLUDES: issue-366-0e9c -->
Some hood models (such as the Siemens `LC91KLT60`) do not implement colour temperature control in compliance with the official Home Connect API documentation.

The `Cooking.Hood.Setting.ColorTemperaturePercent` setting is documented as `0%` = **warm light** and `100%` = **cold light**. The plugin follows this mapping to provide granular control in HomeKit. However, certain appliances (such as the Siemens `LC91KLT60`) interpret these values inversely. If your appliance is affected, you will need to reverse the settings in your HomeKit automations and scenes.

### Notifications & Events

#### Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?

<!-- INCLUDES: issue-1-c1c9 issue-2-aadc issue-31-aa32 issue-43-3f35 issue-45-b6c3 issue-56-1910 issue-132-49f7 issue-153-2cda issue-323-9301 -->
Home Connect communicates many appliance states (such as a coffee maker's "Drip tray full", a washing machine's "iDos fill level poor", or a dishwasher's "Salt low" alert) as **transient events** rather than persistent, queryable states. When an event occurs, it triggers an instantaneous "Single Press" on a `Stateless Programmable Switch` service. This mapping allows these events to be used as HomeKit automation triggers.

This design is necessary for several reasons:

1. **API Limitations**: The Home Connect API often does not allow the plugin to poll the current state of these alerts (e.g. after a reboot or reconnection). Because the actual state cannot be reliably determined at startup, using a persistent sensor (like a `Contact Sensor`) could lead to incorrect status displays if a "cleared" event was missed while the plugin was offline.
2. **Inconsistent Reporting**: The API does not consistently report when an event condition clears. While some appliances might send an 'off' status, others simply stop sending the 'present' event with no standard timeout defined.
3. **Protocol Compliance**: The HomeKit Accessory Protocol (HAP) defines sensors like `Contact Sensor` for continuous states. Mapping a momentary event to these services is technically incorrect.

The Apple Home app only displays numeric labels (e.g. "Button 1") for these services. This is a design limitation of the Home app; while the HomeKit framework allows for descriptive labels (visible in third-party apps like *Eve* or *Home+*), Apple's interface defaults to generic numbering. To identify what each button represents, check the **Homebridge logs** during startup. These events can be disabled per-appliance in the plugin configuration if they are not required.

#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-cd94 -->
This is a characteristic of how the Apple Home app handles different types of HomeKit services. Each Home Connect appliance is exposed as a single HomeKit **Accessory**, but that accessory contains multiple **Services** to provide different functionality.

The Apple Home app defaults to grouping most service types onto a single tile, but it typically places `Stateless Programmable Switch` services on a separate second tile. While you can toggle **Show as Separate Tiles** in the accessory settings to split them further, the Home app currently does not provide a way to merge these notification switches into the primary appliance tile.

Note that this is purely a user interface display characteristic. Other HomeKit apps, such as *Eve* or *Home+*, may group these services differently. This grouping also has no effect on Siri voice control, which interacts with the underlying services directly. If you do not use these events for automations, you can disable them in the plugin configuration to prevent the extra tile from appearing.

#### How do I get notifications for events like a program finishing?

<!-- INCLUDES: issue-38-03f3 issue-63-3185 issue-124-6a18 issue-153-2cda -->
The `HomeKit Accessory Protocol (HAP)` does not support arbitrary notifications or a dedicated "program finished" sensor type. HomeKit only allows notifications for a limited set of pre-defined sensor types, such as `Motion Sensor`, `Smoke Sensor`, or `Contact Sensor`. Implementing a workaround by using these existing types would result in a poor user experience; for example, a user would receive a "smoke detected" alert when a dishwasher finishes, which is misleading and technically incorrect.

To receive notifications, you have two main options:

- **Official Home Connect App**: This is the most reliable method for detailed, text-based push notifications.
- **HomeKit Automations**: You can trigger a notification indirectly by having the button event toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) accessory (such as a `Contact Sensor`) which *does* support native alerts.

#### How can I disable HomeKit notifications for door events?

<!-- INCLUDES: issue-43-682b issue-132-6b2c -->
Door notifications for appliances like fridges or freezers are managed by the Apple Home app on a per-device basis. To disable them:

1. Open the Apple **Home** app.
2. Tap the **...** icon at the top of the screen and select **Home Settings**.
3. Navigate to the **Doors** section.
4. Locate the specific appliance accessory and toggle off **Activity Notifications**.

Note that this setting must be configured separately on each iPhone or iPad where you want to silence the notifications. Alternatively, you can use the per-appliance configuration options in the plugin to remove the `Door` service entirely if you do not require its state information in HomeKit.

### Siri

#### How do I control my hood fan speed using Siri?

Siri maps fan speeds to specific percentages:
- **Low** is 25%
- **Medium** is 50%
- **High** is 100%

The plugin maps these percentages to the closest available physical fan settings of your hood. You can use commands like `Hey Siri, set the hood fan to medium` or `Hey Siri, set the hood fan to 100%`. Note that numeric settings like `set fan to 1` are not supported by Siri for HomeKit fan services.

## Compatibility and Integration

### Third-party Platforms and API Limitations

#### Is this plugin compatible with HOOBS?

<!-- INCLUDES: issue-37-a423 issue-67-ddaf -->
This plugin is designed and tested for vanilla [Homebridge](https://github.com/homebridge/homebridge) with [Homebridge Config UI X](https://github.com/homebridge/homebridge-config-ui-x). While it may function on HOOBS, it is not officially supported and users may encounter limitations.

Support policy for HOOBS users:

1. **Contact HOOBS Support**: Your first point of contact should be [HOOBS Support](https://support.hoobs.org/ticket) for platform-specific issues.
2. **Verify on Vanilla Homebridge**: Before [opening an issue](https://github.com/thoukydides/homebridge-homeconnect/issues/new/choose), you must verify that the problem persists on a standard Homebridge installation.
3. **No HOOBS-Specific Fixes**: Bug reports or feature requests specifically for HOOBS compatibility or its configuration interface will **not** be accepted.

#### Will there be a Home Assistant version of this plugin?

<!-- INCLUDES: issue-14-096d -->
No. This plugin is specifically designed for Homebridge to provide HomeKit integration for Home Connect appliances. The maintainer does not use Home Assistant and has no plans to develop or maintain a version for that platform.

For Home Assistant users, there are alternative community-maintained integrations available for Home Connect appliances.

#### Why are features available in the official app or IFTTT missing from this plugin?

<!-- INCLUDES: issue-23-272e issue-67-20e5 issue-94-b8d2 issue-188-d1f4 -->
This plugin is restricted by the capabilities of the public Home Connect API. The official Home Connect app and some official partners like IFTTT often utilise private or internal APIs to provide functionality that is not exposed to independent third-party developers. 

If a specific program, option, or setting is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/), it cannot be supported by this plugin. If you require these features, you should contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) directly to request their addition to the public API.

Direct integration with IFTTT to bridge these gaps has been declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes technical constraints such as increased code complexity, the user burden of manually creating IFTTT applets, and interface clutter in HomeKit. For users requiring IFTTT-specific functionality, such as triggering automations from Hood Favourite buttons, it is recommended to use a dedicated plugin like `homebridge-ifttt` alongside this one.

### Plugin Installation and Configuration

#### Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?

<!-- INCLUDES: issue-53-27e2 -->
This is an error produced by the `npm` package manager rather than a fault within the plugin code. It typically occurs when `npm` attempts to rename or remove a directory during an update but fails because the target directory is not empty, a file is being held open by another process, or there are permission issues.

To resolve this issue:

1. Stop the Homebridge service to ensure no processes are actively using the plugin files.
2. Locate the temporary directory identified in the error log (for example, `/usr/local/lib/node_modules/.homebridge-homeconnect-XXXXXXXX`).
3. Manually delete that temporary directory and the existing `homebridge-homeconnect` directory if necessary.
4. Attempt to install the plugin again using the Homebridge Config UI or the command `npm install -g homebridge-homeconnect@latest`.

This error is often transient and may also be resolved by simply restarting the host system or retrying the installation via the Homebridge Config UI interface.

<!-- EXCLUDED: issue-1-3b47 issue-1-6c10 issue-2-4fcb issue-3-5aac issue-4-579a issue-6-a773 issue-9-8790 issue-10-f724 issue-13-3c36 issue-13-9879 issue-21-fdd3 issue-25-a46c issue-33-75c5 issue-35-302a issue-47-ce58 issue-65-719f issue-67-487c issue-72-dd80 issue-80-403c issue-85-5365 issue-89-4014 issue-93-57c0 issue-94-e57b issue-144-5faf issue-181-6697 issue-194-0961 issue-195-e227 issue-239-6f85 issue-256-069a issue-259-ff85 issue-294-4d50 issue-298-e829 issue-300-cd35 issue-303-3b35 issue-304-5f8b issue-340-77ce issue-340-9a52 issue-351-9e01 issue-360-c5e9 issue-365-e16b issue-375-b67d -->
